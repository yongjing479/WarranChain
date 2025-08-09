
import { useState, useEffect } from 'react';
import { useSuiClient } from '../SuiClientProvider';
import { useEnoki } from '../components/EnokiContext';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { CONTRACT_CONFIG, CONTRACT_FUNCTIONS } from '../config/contractConfig';
import { normalizeSuiAddress } from '../utils/warrantyUtils';
import axios from 'axios';

export const useWarranties = () => {
  const suiClient = useSuiClient();
  const { isAuthenticated } = useEnoki();
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get wallet connection state from localStorage and authentication
  const zkLoginAddress = localStorage.getItem('zkLoginAddress');
  const isConnected = isAuthenticated && !!zkLoginAddress;
  const currentAccount = zkLoginAddress ? { address: zkLoginAddress } : null;

  console.log("[useWarranties] Contract Package ID:", CONTRACT_CONFIG.PACKAGE_ID);
  console.log("[useWarranties] Module Name:", CONTRACT_CONFIG.MODULE_NAME);
  console.log("[useWarranties] zkLogin address from localStorage:", zkLoginAddress);
  console.log("[useWarranties] Address length:", zkLoginAddress?.length);
  console.log("[useWarranties] Is connected:", isConnected);

  // Stub for signTransaction (replace with real wallet logic)
  const signTransaction = async (tx) => {
    // TODO: Integrate with wallet provider
    // For now, return a mock signature
    return "MOCK_SIGNATURE";
  };

  const refreshWarranties = async () => {
    if (!isConnected || !currentAccount) {
      console.log("[useWarranties] Skipping refresh - not connected or no account");
      setWarranties([]);
      return;
    }

    console.log("[useWarranties] Refreshing warranties for address:", currentAccount.address);
    setLoading(true);
    setError(null);

    try {
      console.log("[useWarranties] Fetching owned objects from Sui network...");
      
      // First try with a proper filter to see all objects
      console.log("[useWarranties] Attempting to fetch all objects for address:", currentAccount.address);
      
      const objects = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        filter: null, // Explicitly set to null to get all objects
        options: { 
          showContent: true, 
          showType: true,
          // showOwner: true  // Commented out to simplify request
        }
      });

      console.log("[useWarranties] Raw objects response:", objects);

      if (objects && objects.data) {
        console.log("[useWarranties] Total objects found:", objects.data.length);
        
        // Filter for warranty NFTs and process them
        const warranties = objects.data
          .filter(obj => {
            // Check if this is a warranty NFT by looking at the type
            const type = obj.data?.type;
            const isWarrantyNFT = type && type.includes('WarrantyNFT');
            console.log("[useWarranties] Object type:", type, "isWarrantyNFT:", isWarrantyNFT);
            return obj.data && obj.data.content && isWarrantyNFT;
          })
          .map(obj => {
            const content = obj.data.content.fields;
            console.log("[useWarranties] Processing object content:", content);
            return {
              id: obj.data.objectId,
              serialNo: content.serial_number || 'Unknown',
              productName: content.product_name || 'Unknown Product',
              manufacturer: content.manufacturer || 'Unknown Manufacturer',
              warrantyPeriodDays: content.warranty_period_days || 0,
              purchaseDate: content.purchase_date || Date.now(),
              owner: content.owner || currentAccount.address,
              status: 'Active'
            };
          });

        console.log("[useWarranties] Processed warranties:", warranties);
        setWarranties(warranties);
      } else {
        console.log("[useWarranties] No warranty data found");
        setWarranties([]);
      }

    } catch (err) {
      console.error("[useWarranties] Error refreshing warranties:", err);
      console.error("[useWarranties] Error details:", {
        message: err.message,
        stack: err.stack,
        cause: err.cause,
        name: err.name
      });
      
      // Provide more specific error messages and prevent infinite loops
      if (err.message?.includes("network") || err.message?.includes("connection")) {
        setError("Network Connection Error - Check internet connection");
      } else if (err.message?.includes("Invalid params")) {
        setError("Smart Contract Error - Invalid parameters");
      } else if (err.message?.includes("not found")) {
        setError("Contract Not Found - Check deployment");
      } else if (err.message?.includes("500")) {
        setError("Backend Server Error - Check backend service");
        console.warn("[useWarranties] Backend server error - stopping retry attempts");
        // Set empty warranties instead of mock data to prevent confusion
        setWarranties([]);
        setLoading(false);
        return; // Exit early to prevent mock data fallback
      } else {
        setError(`Blockchain Error: ${err.message || "Unknown error"}`);
      }
      
      // Only use mock data for non-server errors
      if (!err.message?.includes("500")) {
        console.log("[useWarranties] Setting mock warranty data due to error");
        setWarranties([
          {
            id: "mock-warranty-1",
            serialNo: "MOCK001",
            productName: "Mock iPhone 15",
            manufacturer: "Mock Apple",
            warrantyPeriodDays: 365,
            purchaseDate: Date.now(),
            owner: currentAccount.address,
            status: "Active"
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const mintTestWarranty = async (warrantyData = {}) => {
    console.log("[useWarranties] Attempting to mint test warranty");
    
    if (!isConnected || !currentAccount) {
      const error = 'Wallet not connected or no current account';
      console.error("[useWarranties]", error);
      throw new Error(error);
    }

    console.log("[useWarranties] Using sponsored transaction for address:", currentAccount.address);
    console.log("[useWarranties] Warranty data:", warrantyData);

    try {
      // Get the JWT token from localStorage (stored as google_jwt or id_token)
      const jwtToken = localStorage.getItem('google_jwt') || localStorage.getItem('id_token');
      
      if (!jwtToken) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      console.log("[useWarranties] Using JWT token for authentication");
      
      // Use the backend sponsored transaction endpoint instead of frontend signing
      const response = await axios.post('http://localhost:3001/mint-nft-sponsored', {
        jwt: jwtToken,
        product: warrantyData.productName || 'Test Product',
        manufacturer: warrantyData.manufacturer || 'Test Manufacturer', 
        serialNumber: warrantyData.serialNumber || 'TEST123',
        warrantyPeriod: warrantyData.warrantyPeriodDays || 365,
        buyerEmail: warrantyData.buyerEmail || currentAccount.email || 'test@example.com'
      });

      console.log("[useWarranties] Warranty minted successfully:", response.data);
      await refreshWarranties();
      return response.data.result;
    } catch (error) {
      console.error("[useWarranties] Error minting test warranty:", error);
      throw error;
    }
  };

  const transferWarranty = async (warranty, recipientAddress) => {
    const tx = new TransactionBlock();
    tx.moveCall({
      target: 'warranty_nft::warranty_nft::transfer_warranty',
      arguments: [
        tx.object(warranty.id),
        tx.pure(recipientAddress),
        tx.object('0x6'),
      ],
    });

    const signature = await signTransaction(tx);
    const result = await suiClient.executeTransactionBlock({
      transactionBlock: tx.serialize(),
      signature,
      options: { showEffects: true },
    });

    await refreshWarranties();
    return result;
  };

  const addRepair = async (warranty, repairDescription) => {
    const tx = new TransactionBlock();
    tx.moveCall({
      target: 'warranty_nft::warranty_nft::add_repair_event',
      arguments: [
        tx.object(warranty.id),
        tx.pure(repairDescription),
        tx.object('0x6'),
      ],
    });

    const signature = await signTransaction(tx);
    const result = await suiClient.executeTransactionBlock({
      transactionBlock: tx.serialize(),
      signature,
      options: { showEffects: true },
    });

    await refreshWarranties();
    return result;
  };

  // Mock wallet functions for compatibility
  const connect = async () => {
    // In a real implementation, this would trigger wallet connection
    // For now, just refresh the state
    console.log("[useWarranties] Connect called - checking existing auth state");
  };

  const disconnect = async () => {
    // In a real implementation, this would disconnect the wallet
    // For now, we'll use the logout from EnokiContext
    console.log("[useWarranties] Disconnect called - use logout from EnokiContext instead");
  };

  // Mock addresses for testing
  const mockAddresses = zkLoginAddress ? [zkLoginAddress] : [];

  // Function to switch account (mock for compatibility)
  const switchAccount = (address) => {
    console.log("[useWarranties] Switch account called with:", address);
  };

  useEffect(() => {
    let timeoutId;
    
    console.log("[useWarranties] useEffect triggered - isConnected:", isConnected, "currentAccount:", currentAccount?.address);
    
    if (isConnected && currentAccount) {
      console.log("[useWarranties] Scheduling refreshWarranties call...");
      // Add a small delay to prevent rapid re-execution
      timeoutId = setTimeout(() => {
        refreshWarranties();
      }, 100);
    } else {
      console.log("[useWarranties] Skipping refreshWarranties - not connected or no account");
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentAccount?.address, isConnected]); // Only depend on address string and connection status

  return { 
    warranties, 
    loading, 
    error, 
    mintTestWarranty, 
    transferWarranty, 
    addRepair, 
    refreshWarranties, 
    isConnected, 
    currentAccount,
    connect,
    disconnect,
    mockAddresses,
    switchAccount
  };
};