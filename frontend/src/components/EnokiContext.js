import React, { createContext, useContext, useState } from "react";
import { EnokiClient } from "@mysten/enoki";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { getZkLoginSignature, jwtToAddress } from "@mysten/sui.js/zklogin";
import { jwtDecode } from "jwt-decode";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import axios from "axios";

// Define context interface for better type safety
// @typedef {{ login: (provider: string) => Promise<void>, logout: () => void, address: string | null, userType: "buyer" | "seller" | null, setUserType: (type: "buyer" | "seller") => void, signer: any | null, balance: number | null, loading: boolean, isAuthenticated: boolean }} EnokiContextType
const EnokiContext = createContext();

const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });

export const EnokiProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [userType, setUserType] = useState(null);
  const [signer, setSigner] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  // Validate environment variables
  if (!process.env.REACT_APP_GOOGLE_CLIENT_ID || !process.env.REACT_APP_ENOKI_API_KEY) {
    throw new Error("Missing required environment variables: REACT_APP_GOOGLE_CLIENT_ID or REACT_APP_ENOKI_API_KEY");
  }

  const login = async (provider = "google") => {
    setLoading(true);
    try {
      const clientId = process.env[`REACT_APP_${provider.toUpperCase()}_CLIENT_ID`];
      if (!clientId) throw new Error(`Client ID for ${provider} not configured`);
      const network = "testnet";
      const authUrl = provider === "google"
        ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=id_token&scope=openid%20email&redirect_uri=${window.location.origin}/auth/callback&nonce=${Date.now()}`
        : `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email&redirect_uri=${window.location.origin}/auth/callback`;

      // Open popup
      const authWindow = window.open(authUrl, "Login with " + provider, "width=500,height=600");
      if (!authWindow) throw new Error("Popup blocked. Please allow popups and try again.");

      // Listen for message from popup
      const jwt = await new Promise((resolve, reject) => {
        function handleMessage(event) {
          if (event.origin !== window.location.origin) return;
          if (event.data.idToken) {
            window.removeEventListener("message", handleMessage);
            resolve(event.data.idToken);
          } else if (event.data.error) {
            window.removeEventListener("message", handleMessage);
            reject(new Error(event.data.error));
          }
        }
        window.addEventListener("message", handleMessage);
        // Timeout after 2 minutes
        setTimeout(() => reject(new Error("Authentication timed out")), 120000);
      });

      const { sub } = jwtDecode(jwt);
      const enoki = new EnokiClient({
        apiKey: process.env.REACT_APP_ENOKI_API_KEY,
        config: { clientId, provider, network },
      });

      // Fetch salt from backend
      const saltResponse = await axios.post("http://localhost:3001/get-salt", { jwt });
      const salt = saltResponse.data.salt;
      if (!salt) throw new Error("Invalid salt received from backend");

      // Get zkLogin address
      const latestEpoch = await fetchLatestEpoch();
      const { addresses } = await enoki.getZkLoginAddresses({
        jwt,
        provider,
        maxEpoch: latestEpoch + 2,
      });
      const userAddress = addresses[0];
      if (!userAddress) throw new Error("Failed to derive zkLogin address");

      // Persist ephemeral keypair in sessionStorage using Base64
    let ephemeralKeyPair;
    const storedKey = sessionStorage.getItem("ephemeralKeyPair");
    if (!storedKey) {
    ephemeralKeyPair = Ed25519Keypair.generate();
    const secretKeyBytes = ephemeralKeyPair.getSecretKey();
    const secretKeyBase64 = btoa(String.fromCharCode(...secretKeyBytes));
    sessionStorage.setItem("ephemeralKeyPair", secretKeyBase64);
    } else {
    try {
        const binaryString = atob(storedKey);
        const secretKeyBytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));
        ephemeralKeyPair = Ed25519Keypair.fromSecretKey(secretKeyBytes);
    } catch (e) {
        console.error("Failed to parse stored ephemeral keypair:", e.message);
        ephemeralKeyPair = Ed25519Keypair.generate();
        const secretKeyBytes = ephemeralKeyPair.getSecretKey();
        const secretKeyBase64 = btoa(String.fromCharCode(...secretKeyBytes));
        sessionStorage.setItem("ephemeralKeyPair", secretKeyBase64);
    }
    }

      // Create zkLogin signer
      const zkSigner = {
        async signTransactionBlock({ transactionBlock }) {
          const { bytes, signature: userSignature } = await transactionBlock.sign({
            signer: ephemeralKeyPair,
            client: suiClient,
          });

          // Fetch ZKP proof with retry logic
          let proofResponse;
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              proofResponse = await axios.post("https://prover.api.mystenlabs.com/v1", {
                jwt,
                salt,
                extendedEphemeralPublicKey: ephemeralKeyPair.getPublicKey().toSuiAddress(),
                maxEpoch: latestEpoch + 2,
              });
              break;
            } catch (error) {
              console.error(`ZKP proof fetch attempt ${attempt} failed:`, error.message);
              if (attempt === 3) throw new Error("Failed to fetch ZKP proof after retries");
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
            }
          }

          const zkSignature = getZkLoginSignature({
            inputs: {
              proof: proofResponse.data,
              salt,
              jwt,
            },
            maxEpoch: latestEpoch + 2,
            userSignature,
          });

          return {
            transactionBlockBytes: bytes,
            signature: zkSignature,
          };
        },
      };

      setAddress(userAddress);
      setSigner(zkSigner);
      fetchBalance(userAddress);
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAddress(null);
    setSigner(null);
    setBalance(null);
    setUserType(null);
    sessionStorage.removeItem("ephemeralKeyPair");
  };

  const fetchBalance = async (addr) => {
    try {
      const res = await suiClient.getBalance({ owner: addr });
      setBalance(Number(res.totalBalance) / 1e9);
    } catch (err) {
      console.error("Balance fetch failed:", err.message);
      setBalance(0); // Fallback to avoid UI blocking
    }
  };

  const fetchLatestEpoch = async () => {
    try {
      const response = await axios.get("http://localhost:3001/latest-epoch");
      const epoch = Number(response.data.epoch);
      if (isNaN(epoch)) throw new Error("Invalid epoch received");
      return epoch;
    } catch (error) {
      console.error("Failed to fetch latest epoch:", error.message);
      throw new Error("Failed to fetch latest epoch");
    }
  };

  return (
    <EnokiContext.Provider
      value={{
        login,
        logout,
        address,
        userType,
        setUserType,
        signer,
        balance,
        loading,
        isAuthenticated: !!address,
      }}
    >
      {children}
    </EnokiContext.Provider>
  );
};

export const useEnoki = () => {
  const ctx = useContext(EnokiContext);
  if (!ctx) throw new Error("useEnoki must be used inside EnokiProvider");
  return ctx;
};