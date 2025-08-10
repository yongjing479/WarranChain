import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { EnokiClient } from "@mysten/enoki";
import { SuiClient } from "@mysten/sui.js/client";
import { Transaction } from '@mysten/sui/transactions';
import { toB64 } from '@mysten/sui/utils';
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import NodeCache from "node-cache";
import Joi from "joi";
import crypto from "crypto";


const app = express();
const cache = new NodeCache({ stdTTL: 60 }); // Cache for 1 minute

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("ENOKI_API_KEY:", process.env.ENOKI_API_KEY ? "Loaded" : "Not Loaded");
const enoki = new EnokiClient({ 
  apiKey: process.env.ENOKI_API_KEY,
  network: "testnet"
});
const suiClient = new SuiClient({ url: process.env.SUI_RPC_URL || "https://fullnode.testnet.sui.io:443" });

const PACKAGE_ID = "0xddf9437133e37cdc9278a3ffaf625eb54ff0cba8dc60797f8a84a0e09596f49d";

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
  const { email, jwt } = req.body;
  const schema = Joi.object({ 
    email: Joi.string().email().required(),
    jwt: Joi.string().optional() // JWT is optional for this endpoint
  });
  const { error: validationError } = schema.validate({ email, jwt });
  if (validationError) return res.status(400).json({ error: validationError.message });

  try {
    if (jwt) {
      // If JWT is provided, use proper zkLogin address resolution
      console.log("[get-address-from-email] Using zkLogin address resolution with JWT");
      const zkLoginAddresses = await enoki.getZkLoginAddresses({
        jwt: jwt
      });
      
      if (zkLoginAddresses && zkLoginAddresses.addresses && zkLoginAddresses.addresses.length > 0) {
        const address = zkLoginAddresses.addresses[0].address;
        console.log("[get-address-from-email] Found zkLogin address:", address);
        res.json({ address });
        return;
      }
    }
    
    // Fallback: Generate deterministic address for development/testing
    console.warn("[SECURITY WARNING] Using deterministic address generation as fallback!");
    const hash = crypto.createHash('sha256').update(email).digest('hex');
    const addressBytes = hash.slice(0, 64); // Use 64 hex chars for proper Sui address
    const address = `0x${addressBytes}`;
    
    console.log("[get-address-from-email] Generated fallback address:", address, "for email:", email);
    res.json({ 
      address,
      warning: "This is a fallback address. Provide JWT for real zkLogin address."
    });
  } catch (error) {
    console.error("[get-address-from-email] Error:", error);
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

app.post('/mint-nft-sponsored', async (req, res) => {
  console.log('[mint-nft-sponsored] Request body:', req.body);

  // Validate inputs
  const schema = Joi.object({
    jwt: Joi.string().required(),
    product: Joi.string().required(),
    manufacturer: Joi.string().required(),
    serialNumber: Joi.string().required(),
    warrantyPeriod: Joi.number().integer().min(1).required(),
    buyerEmail: Joi.string().email().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    console.log('[mint-nft-sponsored] Validation error:', error.message);
    return res.status(400).json({ error: error.message });
  }

  const { jwt, product, manufacturer, serialNumber, warrantyPeriod, buyerEmail } = req.body;

  try {
    // 1. Get recipient address via zkLogin
    console.log('[mint-nft-sponsored] Fetching zkLogin addresses...');
    const zkLogin = await enoki.getZkLoginAddresses({ jwt });
    const walletAddress = zkLogin?.addresses?.[0]?.address;
    if (!walletAddress) throw new Error('No zkLogin address found');

    console.log('[mint-nft-sponsored] walletAddress:', walletAddress);

    // 2. Check if the wallet has sufficient balance for gas
    try {
      const balance = await suiClient.getBalance({
        owner: walletAddress,
        coinType: '0x2::sui::SUI'
      });
      console.log('[mint-nft-sponsored] Wallet balance:', balance.totalBalance, 'MIST');
      
      if (parseInt(balance.totalBalance) < 1000000) { // Less than 0.001 SUI
        console.warn('[mint-nft-sponsored] Low balance detected. Sponsored transaction is essential.');
      }
    } catch (balanceError) {
      console.warn('[mint-nft-sponsored] Could not check balance:', balanceError.message);
    }

    // 3. Build transaction kind bytes (without gas payment for sponsored transactions)
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::warranty_nft::mint_warranty`,
      arguments: [
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(product))),                    // product_name as vector<u8>
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(manufacturer))),               // manufacturer as vector<u8>
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(serialNumber))),               // serial_number as vector<u8>
        tx.pure.u64(String(warrantyPeriod)),                                                    // warranty_period_days as u64
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(buyerEmail))),                // buyer_email as vector<u8>
        tx.pure.address(walletAddress),                                                         // recipient as address
        tx.object('0x6'),                                                                       // clock object
      ],
    });
    tx.setSender(walletAddress);

    console.log('[mint-nft-sponsored] Building transaction kind bytes...');
    
    // For sponsored transactions, we only need the transaction kind, not full transaction with gas
    let kindBytes, kindB64;
    try {
      kindBytes = await tx.build({ client: suiClient, onlyTransactionKind: true });
      kindB64 = toB64(kindBytes);
      console.log('[mint-nft-sponsored] Built transaction kind bytes length:', kindBytes.length);
    } catch (buildError) {
      console.error('[mint-nft-sponsored] Failed to build transaction kind:', buildError);
      
      // If building transaction kind fails due to gas issues, try a different approach
      if (buildError.message?.includes('No valid gas coins found')) {
        console.log('[mint-nft-sponsored] Building minimal transaction for sponsored execution...');
        
        // Create a very basic transaction structure
        const minimalTx = new Transaction();
        minimalTx.moveCall({
          target: `${PACKAGE_ID}::warranty_nft::mint_warranty`,
          arguments: [
            minimalTx.pure.vector('u8', Array.from(new TextEncoder().encode(product))),
            minimalTx.pure.vector('u8', Array.from(new TextEncoder().encode(manufacturer))),
            minimalTx.pure.vector('u8', Array.from(new TextEncoder().encode(serialNumber))),
            minimalTx.pure.u64(String(warrantyPeriod)),
            minimalTx.pure.vector('u8', Array.from(new TextEncoder().encode(buyerEmail))),
            minimalTx.pure.address(walletAddress),
            minimalTx.object('0x6'),
          ],
        });
        minimalTx.setSender(walletAddress);
        
        try {
          kindBytes = await minimalTx.build({ client: suiClient, onlyTransactionKind: true });
          kindB64 = toB64(kindBytes);
          console.log('[mint-nft-sponsored] Built minimal transaction kind bytes length:', kindBytes.length);
        } catch (minimalError) {
          throw new Error(`Failed to build transaction even with minimal approach: ${minimalError.message}`);
        }
      } else {
        throw buildError;
      }
    }

    // 4. Create sponsored transaction with improved error handling
    console.log('[mint-nft-sponsored] Creating sponsored transaction...');
    console.log('[mint-nft-sponsored] Package ID:', PACKAGE_ID);
    console.log('[mint-nft-sponsored] Target function:', `${PACKAGE_ID}::warranty_nft::mint_warranty`);
    console.log('[mint-nft-sponsored] Sender address:', walletAddress);
    
    try {
      // First try with move call target restrictions
      const sponsored = await enoki.createSponsoredTransaction({
        transactionKindBytes: kindB64,
        sender: walletAddress,
        allowedMoveCallTargets: [`${PACKAGE_ID}::warranty_nft::mint_warranty`],
        allowedAddresses: [walletAddress],
      });
      
      console.log('[mint-nft-sponsored] Sponsored transaction created successfully');
      console.log('[mint-nft-sponsored] Sponsored transaction digest:', sponsored.digest);
      
      // 4. Execute sponsored transaction
      console.log('[mint-nft-sponsored] Executing sponsored transaction...');
      const result = await enoki.executeSponsoredTransaction({
        transaction: sponsored.transaction,
      });

      console.log('[mint-nft-sponsored] Success:', result);
      return res.json({
        success: true,
        digest: result.digest,
        effects: result.effects,
        walletAddress,
      });
      
    } catch (sponsorError) {
      console.error('[mint-nft-sponsored] Sponsored transaction error:', sponsorError.message);
      console.error('[mint-nft-sponsored] Full error details:', sponsorError);
      
      // If package is not found or move call target is not allowed, try without restrictions
      if (sponsorError.code === 'dry_run_failed' || 
          sponsorError.code === 'invalid_transaction' || 
          sponsorError.message?.includes('DependentPackageNotFound') ||
          sponsorError.message?.includes('not part of an allow-listed move call target')) {
        console.log('[mint-nft-sponsored] Package not found in Enoki or move call not allow-listed. Trying without restrictions...');
        
        try {
          const sponsoredUnrestricted = await enoki.createSponsoredTransaction({
            transactionKindBytes: kindB64,
            sender: walletAddress,
            // No move call target restrictions
          });
          
          const resultUnrestricted = await enoki.executeSponsoredTransaction({
            transaction: sponsoredUnrestricted.transaction,
          });
          
          console.log('[mint-nft-sponsored] Unrestricted approach succeeded!');
          return res.json({
            success: true,
            digest: resultUnrestricted.digest,
            effects: resultUnrestricted.effects,
            walletAddress,
            note: 'Used unrestricted sponsored transaction due to package detection issue'
          });
          
        } catch (unrestrictedError) {
          console.error('[mint-nft-sponsored] Unrestricted approach failed:', unrestrictedError);
          
          // Final fallback: provide transaction bytes for manual execution
          console.log('[mint-nft-sponsored] All sponsored approaches failed. Providing transaction for manual execution...');
          const fullTx = new Transaction();
          fullTx.moveCall({
            target: `${PACKAGE_ID}::warranty_nft::mint_warranty`,
            arguments: [
              fullTx.pure.vector('u8', Array.from(new TextEncoder().encode(product))),
              fullTx.pure.vector('u8', Array.from(new TextEncoder().encode(manufacturer))),
              fullTx.pure.vector('u8', Array.from(new TextEncoder().encode(serialNumber))),
              fullTx.pure.u64(String(warrantyPeriod)),
              fullTx.pure.vector('u8', Array.from(new TextEncoder().encode(buyerEmail))),
              fullTx.pure.address(walletAddress),
              fullTx.object('0x6'),
            ],
          });
          fullTx.setSender(walletAddress);
          fullTx.setGasBudget(10000000);
          
          const fallbackTxBytes = await fullTx.build({ client: suiClient });
          const fallbackTxB64 = toB64(fallbackTxBytes);
          
          return res.json({
            success: false,
            error: 'Sponsored transaction not supported for this package',
            fallback: {
              transactionBytes: fallbackTxB64,
              note: 'Please execute this transaction manually with your wallet',
              packageId: PACKAGE_ID,
              targetFunction: `${PACKAGE_ID}::warranty_nft::mint_warranty`
            },
            walletAddress,
          });
        }
      }
      
      throw sponsorError;
    }

  } catch (err) {
    console.error('[mint-nft-sponsored] Error:', err);
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// Alternative endpoint: Build transaction for user to sign (like your sample code)
app.post('/mint-nft-prepare', async (req, res) => {
  console.log('[mint-nft-prepare] Request body:', req.body);

  // Validate inputs
  const schema = Joi.object({
    jwt: Joi.string().required(),
    product: Joi.string().required(),
    manufacturer: Joi.string().required(),
    serialNumber: Joi.string().required(),
    warrantyPeriod: Joi.number().integer().min(1).required(),
    buyerEmail: Joi.string().email().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    console.log('[mint-nft-prepare] Validation error:', error.message);
    return res.status(400).json({ error: error.message });
  }

  const { jwt, product, manufacturer, serialNumber, warrantyPeriod, buyerEmail } = req.body;

  try {
    // 1. Get recipient address via zkLogin
    console.log('[mint-nft-prepare] Fetching zkLogin addresses...');
    const zkLogin = await enoki.getZkLoginAddresses({ jwt });
    const walletAddress = zkLogin?.addresses?.[0]?.address;
    if (!walletAddress) throw new Error('No zkLogin address found');

    console.log('[mint-nft-prepare] walletAddress:', walletAddress);

    // 2. Build transaction (similar to your sample code pattern)
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::warranty_nft::mint_warranty`,
      arguments: [
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(product))),      // product_name as vector<u8>
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(manufacturer))), // manufacturer as vector<u8>
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(serialNumber))), // serial_number as vector<u8>
        tx.pure.u64(String(warrantyPeriod)),                                      // warranty_period_days as u64
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(buyerEmail))),   // buyer_email as vector<u8>
        tx.pure.address(walletAddress),                                           // recipient as address
        tx.object('0x6'),                                                         // clock object
      ],
    });
    
    // Set gas budget like in your sample code
    tx.setGasBudget(10000000); // 0.01 SUI
    tx.setSender(walletAddress);

    console.log('[mint-nft-prepare] Building transaction bytes...');
    const txBytes = await tx.build({ client: suiClient });
    const txBytesB64 = toB64(txBytes);

    console.log('[mint-nft-prepare] Transaction prepared successfully');
    return res.json({
      success: true,
      transactionBytes: txBytesB64,
      walletAddress,
      targetFunction: `${PACKAGE_ID}::warranty_nft::mint_warranty`,
      note: 'Transaction ready for user signature. User pays gas fees.'
    });

  } catch (err) {
    console.error('[mint-nft-prepare] Error:', err);
    return res.status(500).json({ error: err.message, stack: err.stack });
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

// Check wallet balance endpoint
app.post("/check-wallet-balance", async (req, res) => {
  const { address } = req.body;
  const schema = Joi.object({ address: Joi.string().required() });
  const { error: validationError } = schema.validate({ address });
  if (validationError) return res.status(400).json({ error: validationError.message });

  console.log("[check-wallet-balance] Checking balance for address:", address);

  try {
    // Get SUI balance
    const balance = await suiClient.getBalance({
      owner: address,
      coinType: '0x2::sui::SUI'
    });
    
    console.log("[check-wallet-balance] Raw balance response:", balance);
    
    // Convert from MIST to SUI
    const balanceInSui = parseFloat(balance.totalBalance) / 1000000000;
    
    // Get gas coins
    const gasCoins = await suiClient.getCoins({
      owner: address,
      coinType: '0x2::sui::SUI'
    });
    
    console.log("[check-wallet-balance] Gas coins count:", gasCoins.data?.length || 0);
    
    const result = {
      address: address,
      totalBalance: balance.totalBalance,
      balanceInSui: balanceInSui,
      coinObjectCount: balance.coinObjectCount,
      gasCoins: gasCoins.data?.length || 0,
      hasGasCoins: (gasCoins.data?.length || 0) > 0,
      canPayGas: parseInt(balance.totalBalance) >= 1000000 // 0.001 SUI minimum
    };
    
    console.log("[check-wallet-balance] Balance result:", result);
    res.json(result);
    
  } catch (error) {
    console.error("[check-wallet-balance] Error:", error.message);
    res.status(500).json({ 
      error: "Failed to check wallet balance", 
      details: error.message
    });
  }
});

// Sui RPC Proxy endpoint to handle CORS issues
app.post("/sui-rpc-proxy", async (req, res) => {
  try {
    console.log("[sui-rpc-proxy] Received request:", req.body.method);
    
    const response = await axios.post(
      process.env.SUI_RPC_URL || "https://fullnode.testnet.sui.io:443",
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );
    
    console.log("[sui-rpc-proxy] Response status:", response.status);
    res.json(response.data);
  } catch (error) {
    console.error("[sui-rpc-proxy] Error:", error.message);
    res.status(500).json({ 
      error: "RPC proxy error", 
      details: error.message,
      code: error.code 
    });
  }
});

// Get owned objects proxy (specific endpoint for warranties)
app.post("/get-owned-objects", async (req, res) => {
  const { owner, filter, options } = req.body;
  
  console.log("[get-owned-objects] Request for owner:", owner);
  console.log("[get-owned-objects] Filter:", JSON.stringify(filter, null, 2));
  console.log("[get-owned-objects] Options:", JSON.stringify(options, null, 2));
  
  try {
    // Test with minimal parameters first
    console.log("[get-owned-objects] Attempting minimal call...");
    console.log("[get-owned-objects] Original owner address:", owner);
    
    // Normalize Sui address to 66 characters (0x + 64 hex chars)
    let normalizedOwner = owner;
    if (owner.startsWith('0x')) {
      // Remove 0x prefix, pad to 64 chars, then add 0x back
      const withoutPrefix = owner.slice(2);
      const paddedAddress = withoutPrefix.padStart(64, '0');
      normalizedOwner = '0x' + paddedAddress;
    }
    
    console.log("[get-owned-objects] Normalized owner address:", normalizedOwner);
    console.log("[get-owned-objects] Address length:", normalizedOwner.length);
    
    // Start with the simplest possible call
    const objects = await suiClient.getOwnedObjects({
      owner: normalizedOwner
    });
    
    console.log("[get-owned-objects] Found", objects.data?.length || 0, "objects");
    res.json(objects);
  } catch (error) {
    console.error("[get-owned-objects] Error:", error.message);
    console.error("[get-owned-objects] Full error:", error);
    res.status(500).json({ 
      error: "Failed to get owned objects", 
      details: error.message,
      stack: error.stack
    });
  }
});

// Get SUI balance for an address
app.post("/get-balance", async (req, res) => {
  const { address } = req.body;
  const schema = Joi.object({ address: Joi.string().required() });
  const { error: validationError } = schema.validate({ address });
  if (validationError) return res.status(400).json({ error: validationError.message });

  console.log("[get-balance] Checking balance for address:", address);

  try {
    // Normalize Sui address to 66 characters (0x + 64 hex chars)
    let normalizedAddress = address;
    if (address.startsWith('0x')) {
      const withoutPrefix = address.slice(2);
      const paddedAddress = withoutPrefix.padStart(64, '0');
      normalizedAddress = '0x' + paddedAddress;
    }
    
    console.log("[get-balance] Normalized address:", normalizedAddress);
    
    // Get SUI balance
    const balance = await suiClient.getBalance({
      owner: normalizedAddress,
      coinType: '0x2::sui::SUI' // Standard SUI coin type
    });
    
    console.log("[get-balance] Raw balance response:", balance);
    
    // Convert from MIST (smallest unit) to SUI for display
    const balanceInSui = parseFloat(balance.totalBalance) / 1000000000; // 1 SUI = 1,000,000,000 MIST
    
    const result = {
      address: normalizedAddress,
      originalAddress: address,
      totalBalance: balance.totalBalance, // Raw balance in MIST
      balanceInSui: balanceInSui, // Human-readable balance in SUI
      coinObjectCount: balance.coinObjectCount,
      coinType: '0x2::sui::SUI'
    };
    
    console.log("[get-balance] Balance result:", result);
    res.json(result);
    
  } catch (error) {
    console.error("[get-balance] Error:", error.message);
    console.error("[get-balance] Full error:", error);
    res.status(500).json({ 
      error: "Failed to get balance", 
      details: error.message,
      stack: error.stack
    });
  }
});

// Get all coin balances for an address (including other coin types)
app.post("/get-all-balances", async (req, res) => {
  const { address } = req.body;
  const schema = Joi.object({ address: Joi.string().required() });
  const { error: validationError } = schema.validate({ address });
  if (validationError) return res.status(400).json({ error: validationError.message });

  console.log("[get-all-balances] Checking all balances for address:", address);

  try {
    // Normalize Sui address to 66 characters (0x + 64 hex chars)
    let normalizedAddress = address;
    if (address.startsWith('0x')) {
      const withoutPrefix = address.slice(2);
      const paddedAddress = withoutPrefix.padStart(64, '0');
      normalizedAddress = '0x' + paddedAddress;
    }
    
    console.log("[get-all-balances] Normalized address:", normalizedAddress);
    
    // Get all coin balances
    const allBalances = await suiClient.getAllBalances({
      owner: normalizedAddress
    });
    
    console.log("[get-all-balances] Raw balances response:", allBalances);
    
    // Process and format the balances
    const formattedBalances = allBalances.map(balance => {
      let balanceInReadableFormat = balance.totalBalance;
      let unit = 'raw';
      
      // Convert SUI balance to readable format
      if (balance.coinType === '0x2::sui::SUI') {
        balanceInReadableFormat = parseFloat(balance.totalBalance) / 1000000000;
        unit = 'SUI';
      }
      
      return {
        coinType: balance.coinType,
        totalBalance: balance.totalBalance, // Raw balance
        balanceFormatted: balanceInReadableFormat, // Human-readable balance
        unit: unit,
        coinObjectCount: balance.coinObjectCount
      };
    });
    
    const result = {
      address: normalizedAddress,
      originalAddress: address,
      balances: formattedBalances
    };
    
    console.log("[get-all-balances] Formatted result:", result);
    res.json(result);
    
  } catch (error) {
    console.error("[get-all-balances] Error:", error.message);
    console.error("[get-all-balances] Full error:", error);
    res.status(500).json({ 
      error: "Failed to get all balances", 
      details: error.message,
      stack: error.stack
    });
  }
});

// Centralized error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(3001, () => console.log("Server running on port 3001"));