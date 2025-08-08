import { createContext, useContext } from "react";
import { SuiClient } from "@mysten/sui.js/client";

const SuiClientContext = createContext(null);

export const SuiClientProvider = ({ children }) => {
  const network = process.env.REACT_APP_SUI_NETWORK || "testnet";
  const client = new SuiClient({ url: `https://fullnode.${network}.sui.io:443` });
  return <SuiClientContext.Provider value={client}>{children}</SuiClientContext.Provider>;
};

export const useSuiClient = () => {
  const client = useContext(SuiClientContext);
  if (!client) throw new Error("SuiClient not provided");
  return client;
};