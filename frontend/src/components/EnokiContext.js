import React, { createContext, useContext, useState } from "react";
import { EnokiClient } from "@mysten/enoki";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { getZkLoginSignature, jwtToAddress } from "@mysten/sui.js/zklogin";
import { jwtDecode } from "jwt-decode";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

const EnokiContext = createContext();
const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });

export const EnokiProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [userType, setUserType] = useState(null);
  const [signer, setSigner] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

const login = async () => {
  setLoading(true);

  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const provider = "google";
  const network = "testnet";

  // Open popup
  const authWindow = window.open(
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=id_token&scope=openid%20email&redirect_uri=${window.location.origin}/auth/callback&nonce=${Date.now()}`,
    "Login with Google",
    "width=500,height=600"
  );

  // Listen for message from popup
  const jwt = await new Promise((resolve) => {
    function handleMessage(event) {
      if (event.origin === window.location.origin && event.data.idToken) {
        window.removeEventListener("message", handleMessage);
        resolve(event.data.idToken);
      }
    }
    window.addEventListener("message", handleMessage);
  });

    const { sub, aud } = jwtDecode(jwt);
    // Use EnokiClient for zkLogin
    const enoki = new EnokiClient({
    apiKey: process.env.REACT_APP_ENOKI_API_KEY,
    config: { clientId, provider, network },
    });
    // Get zkLogin address from Enoki
    const { addresses } = await enoki.getZkLoginAddresses({
      jwt,
      provider,
      maxEpoch: (await suiClient.getLatestSuiSystemState()).epoch + 2,
    });

    const userAddress = addresses[0];

    // Prepare a minimal signer (for demo, not for production signing)
    const ephemeralKeyPair = new Ed25519Keypair();
    const zkSigner = {
      async signTransactionBlock({ transactionBlock }) {
        const { bytes, signature: userSignature } = await transactionBlock.sign({
          signer: ephemeralKeyPair,
          client: suiClient,
        });

        // Use getZkLoginSignature if needed for zkLogin
        const zkSignature = getZkLoginSignature({
          inputs: {}, // Fill with required ZKP inputs
          maxEpoch: 0, // Fill with correct epoch
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
    setLoading(false);
  };

  const logout = () => {
    setAddress(null);
    setSigner(null);
    setBalance(null);
  };

  const fetchBalance = async (addr) => {
    try {
      const res = await suiClient.getBalance({ owner: addr });
      setBalance(Number(res.totalBalance) / 1e9);
    } catch (err) {
      console.error("Balance fetch failed", err);
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