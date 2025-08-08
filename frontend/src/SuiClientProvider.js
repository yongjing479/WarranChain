import { createContext, useContext, useEffect, useState } from "react";
import { SuiClient } from "@mysten/sui.js/client";

const SuiClientContext = createContext(null);

export const SuiClientProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const network = process.env.REACT_APP_SUI_NETWORK || "testnet";

  useEffect(() => {
    const initializeClient = async () => {
      const suiClient = new SuiClient({ url: `https://fullnode.${network}.sui.io:443` });
      try {
        // Health check
        await suiClient.getLatestSuiSystemState();
        setClient(suiClient);
      } catch (error) {
        console.error("Failed to connect to Sui node:", error);
        // Fallback to another RPC node if available
      }
    };
    initializeClient();
  }, [network]);

  return <SuiClientContext.Provider value={client}>{children}</SuiClientContext.Provider>;
};

export const useSuiClient = () => {
  const client = useContext(SuiClientContext);
  if (!client) throw new Error("SuiClient not provided");
  return client;
};