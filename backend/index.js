import "dotenv/config";
import express from "express";
import { EnokiClient } from "@mysten/enoki";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log("ENOKI_API_KEY:", process.env.ENOKI_API_KEY ? "Loaded" : "Not Loaded");
const enoki = new EnokiClient({ apiKey: process.env.ENOKI_API_KEY });
const suiClient = new SuiClient({ url: process.env.SUI_RPC_URL });

const PACKAGE_ID = "0x49c585f34173bb5b4f529d1830a6803e6a51905a743bff0b0b2e9773313d819c";

// // Get user salt
app.post("/get-salt", async (req, res) => {
  const { jwt } = req.body;
  if (!jwt) {
    return res.status(400).json({ error: "Missing jwt in request body" });
  }
  try {
    // Mock response
    const saltResponse = { data: { salt: "1234567890" } };
    res.json({ salt: saltResponse.data.salt });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch salt: " + error.message });
  }
});

// Map email to wallet address
app.post("/get-address-from-email", async (req, res) => {
  const { email } = req.body;
  try {
    const wallet = await enoki.createZkLoginWallet({ email });
    res.json({ address: wallet.address });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Sign transaction with zkLogin
app.post("/sign-transaction", async (req, res) => {
  const { jwt, salt, txBytes, ephemeralPublicKey, maxEpoch } = req.body;
  try {
    const proofResponse = await axios.post("https://prover.api.mystenlabs.com/v1", {
      jwt,
      salt,
      extendedEphemeralPublicKey: ephemeralPublicKey,
      maxEpoch,
    });
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

// Sponsor and sign transaction for NFT minting
app.post("/mint-nft-sponsored", async (req, res) => {
  const { jwt, product, manufacturer, serialNumber, warrantyPeriod, buyerEmail } = req.body;
  
  try {
    // Validate inputs
    if (!product || !manufacturer || !serialNumber || !buyerEmail || !warrantyPeriod) {
      return res.status(400).json({ error: "Missing required fields" });
    }

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
        tx.object('0x6'), // clock object
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
    const { epoch } = await suiClient.getLatestSuiSystemState();
    res.json({ epoch: Number(epoch) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log("Server running on port 3001"));