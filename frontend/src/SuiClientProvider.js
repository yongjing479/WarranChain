import { createContext, useContext } from "react";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";

const SuiClientContext = createContext(null);

// Custom SuiClient that uses our backend proxy to avoid CORS issues
class ProxySuiClient {
  constructor(backendUrl) {
    this.backendUrl = backendUrl;
    this.network = process.env.REACT_APP_SUI_NETWORK || "testnet";
    console.log("[ProxySuiClient] Initialized with backend:", backendUrl);
  }

  async getOwnedObjects(params) {
    console.log("[ProxySuiClient] getOwnedObjects called with:", params);
    
    try {
      const response = await fetch(`${this.backendUrl}/get-owned-objects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("[ProxySuiClient] getOwnedObjects response:", data);
      return data;
    } catch (error) {
      console.error("[ProxySuiClient] getOwnedObjects error:", error);
      throw error;
    }
  }

  // Proxy other methods through the generic RPC proxy
  async rpcCall(method, params) {
    try {
      const response = await fetch(`${this.backendUrl}/sui-rpc-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method,
          params
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || 'RPC Error');
      }
      
      return data.result;
    } catch (error) {
      console.error("[ProxySuiClient] RPC call error:", error);
      throw error;
    }
  }
}

export const SuiClientProvider = ({ children }) => {
  const network = process.env.REACT_APP_SUI_NETWORK || "testnet";
  const suiUrl = getFullnodeUrl(network);
  
  console.log("[SuiClientProvider] Network:", network);
  console.log("[SuiClientProvider] Sui URL:", suiUrl);
  
  // Use proxy client for CORS-free communication
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
  const suiClient = new ProxySuiClient(backendUrl);

  return (
    <SuiClientContext.Provider value={suiClient}>
      {children}
    </SuiClientContext.Provider>
  );
};

export const useSuiClient = () => {
  const client = useContext(SuiClientContext);
  if (!client) throw new Error("SuiClient not provided");
  return client;
};