import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { EnokiClient } from "@mysten/enoki";
import { SuiClient } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import NodeCache from "node-cache";
import Joi from "joi";
import crypto from "crypto";


const app = express();
const cache = new NodeCache({ stdTTL: 60 }); // Cache for 1 minute

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("ENOKI_API_KEY:", process.env.ENOKI_API_KEY ? "Loaded" : "Not Loaded");
const enoki = new EnokiClient({ apiKey: process.env.ENOKI_API_KEY });
const suiClient = new SuiClient({ url: process.env.SUI_RPC_URL || "https://fullnode.testnet.sui.io:443" });

const PACKAGE_ID = "0x49c585f34173bb5b4f529d1830a6803e6a51905a743bff0b0b2e9773313d819c";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// JWT validation middleware
const client = jwksClient({ jwksUri: "https://www.googleapis.com/oauth2/v3/certs" });
const verifyJwt = async (jwtToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      jwtToken,
      (header, callback) => {
        client.getSigningKey(header.kid, (err, key) => {
          const signingKey = key.getPublicKey();
          callback(null, signingKey);
        });
      },
      { issuer: "https://accounts.google.com", audience: process.env.REACT_APP_GOOGLE_CLIENT_ID },
      (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      }
    );
  });
};

const authMiddleware = async (req, res, next) => {
  const { jwt } = req.body;
  if (!jwt) return res.status(401).json({ error: "JWT required" });
  try {
    req.user = await verifyJwt(jwt);
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid JWT" });
  }
};

// secure salt storage (replace with real database/vault)
app.post("/get-salt", authMiddleware, async (req, res) => {
  const { sub } = req.user;
  let address = req.body.address;
  if (typeof address === "object" && address.address) {
    address = address.address; // Extract string if object sent
  }
  console.log("Received request to get salt for sub:", sub, "and address:", address, "and req.body",req.body);
  try {
    let { data, error } = await supabase
      .from("usersalts")
      .select("salt")
      .eq("sub", sub)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Supabase select error:", error);
      return res.status(500).json({ error: error.message });
    }

    let salt = data?.salt;

    if (!salt) {
      salt = crypto.randomBytes(12).toString("base64");
      const { error: insertError } = await supabase
        .from("usersalts")
        .insert([{ sub, salt, address }]);
      if (insertError) {
        console.error("Supabase insert error:", insertError);
        return res.status(500).json({ error: insertError.message });
      }
    }

    res.json({ salt });
  } catch (error) {
    console.error("Failed to fetch salt:", error);
    res.status(500).json({ error: "Failed to fetch salt: " + error.message });
  }
});

app.post("/get-address-from-email", async (req, res) => {
  const { email } = req.body;
  const schema = Joi.object({ email: Joi.string().email().required() });
  const { error: validationError } = schema.validate({ email });
  if (validationError) return res.status(400).json({ error: validationError.message });

  try {
    const wallet = await enoki.createZkLoginWallet({ email });
    res.json({ address: wallet.address });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/sign-transaction", authMiddleware, async (req, res) => {
  const { jwt, salt, txBytes, ephemeralPublicKey, maxEpoch } = req.body;
  const schema = Joi.object({
    jwt: Joi.string().required(),
    salt: Joi.string().required(),
    txBytes: Joi.string().required(),
    ephemeralPublicKey: Joi.string().required(),
    maxEpoch: Joi.number().integer().required(),
  });
  const { error: validationError } = schema.validate(req.body);
  if (validationError) return res.status(400).json({ error: validationError.message });

  try {
    let proofResponse;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        proofResponse = await axios.post("https://prover.api.mystenlabs.com/v1", {
          jwt,
          salt,
          extendedEphemeralPublicKey: ephemeralPublicKey,
          maxEpoch,
        });
        break;
      } catch (error) {
        if (attempt === 3) throw new Error("Failed to fetch ZKP proof after retries");
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    const signature = await enoki.signTransaction({
      jwt,
      salt,
      transactionBlock: txBytes,
      proof: proofResponse.data,
    });
    res.json({ signature, proof: proofResponse.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/mint-nft-sponsored", authMiddleware, async (req, res) => {
  const { jwt, product, manufacturer, serialNumber, warrantyPeriod, buyerEmail } = req.body;
  const schema = Joi.object({
    jwt: Joi.string().required(),
    product: Joi.string().required(),
    manufacturer: Joi.string().required(),
    serialNumber: Joi.string().required(),
    warrantyPeriod: Joi.number().integer().min(1).required(),
    buyerEmail: Joi.string().email().required(),
  });
  const { error: validationError } = schema.validate(req.body);
  if (validationError) return res.status(400).json({ error: validationError.message });

  try {
    const wallet = await enoki.createZkLoginWallet({ email: buyerEmail });
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::warranty_nft::mint_warranty`,
      arguments: [
        tx.pure(Array.from(new TextEncoder().encode(product))),
        tx.pure(Array.from(new TextEncoder().encode(manufacturer))),
        tx.pure(Array.from(new TextEncoder().encode(serialNumber))),
        tx.pure(parseInt(warrantyPeriod)),
        tx.pure(Array.from(new TextEncoder().encode(buyerEmail))),
        tx.pure(wallet.address),
        tx.pure(null), // image_url
        tx.object("0x6"), // clock object
      ],
    });

    const sponsoredTx = await enoki.sponsorAndSignTransaction({
      transactionBlock: tx,
      sender: wallet.address,
      network: "testnet",
    });

    const result = await suiClient.executeTransactionBlock({
      transactionBlock: sponsoredTx.transactionBlock,
      signature: sponsoredTx.signature,
      options: { showEffects: true },
    });

    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/latest-epoch", async (req, res) => {
  try {
    let epoch = cache.get("latestEpoch");
    if (!epoch) {
      const { epoch: latestEpoch } = await suiClient.getLatestSuiSystemState();
      epoch = Number(latestEpoch);
      cache.set("latestEpoch", epoch);
    }
    res.json({ epoch });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Centralized error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(3001, () => console.log("Server running on port 3001"));