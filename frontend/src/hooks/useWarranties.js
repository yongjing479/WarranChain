import { useState, useEffect } from 'react';
import { fetchUserWarranties, transferWarrantyNFT, addRepairEvent, mintTestWarranty } from '../services/suiService';
import { useMockWallet } from '../contexts/MockWalletContext';

export const useWarranties = () => {
  const { currentAccount, isConnected, signAndExecuteTransactionBlock } = useMockWallet();
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch warranties when wallet connects or account changes
  useEffect(() => {
    if (isConnected && currentAccount?.address) {
      loadWarranties();
    } else {
      setWarranties([]);
    }
  }, [isConnected, currentAccount?.address]);

  const loadWarranties = async () => {
    if (!currentAccount?.address) return;

    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading warranties for:', currentAccount.address);
      const userWarranties = await fetchUserWarranties(currentAccount.address);
      console.log('Loaded warranties:', userWarranties);
      
      // If no real warranties found, use mock data for development
      if (userWarranties.length === 0) {
        console.log('🧪 No blockchain warranties found. Using mock data for testing UI functionality');
        setWarranties(getMockWarranties());
      } else {
        setWarranties(userWarranties);
      }
    } catch (err) {
      console.error('Error loading warranties:', err);
      setError(err.message);
      // For testing: Use mock data to show UI functionality
      console.log('🧪 Using mock data due to blockchain error');
      setWarranties(getMockWarranties());
    } finally {
      setLoading(false);
    }
  };

  const transferWarranty = async (warranty, recipientAddress) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      
      // Create transfer transaction
      const txb = await transferWarrantyNFT(
        warranty.objectId || warranty.id, 
        recipientAddress, 
        currentAccount.address
      );

      // Execute transaction
      const result = await signAndExecuteTransactionBlock({
        transactionBlock: txb
      });

      console.log('Transfer successful:', result);

      // Update local state
      setWarranties(prevWarranties =>
        prevWarranties.map(w =>
          w.id === warranty.id
            ? {
                ...w,
                transferStatus: 'transferred',
                transferredTo: recipientAddress,
                transferredDate: new Date().toISOString().split('T')[0]
              }
            : w
        )
      );

      return result;
    } catch (error) {
      console.error('Transfer failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addRepair = async (warranty, repairDescription) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      
      // Create repair transaction
      const txb = await addRepairEvent(
        warranty.objectId || warranty.id,
        repairDescription,
        currentAccount.address
      );

      // Execute transaction
      const result = await signAndExecuteTransactionBlock({
        transactionBlock: txb
      });

      console.log('Repair event added:', result);

      // Update local state
      const newRepair = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        issue: repairDescription,
        status: 'Completed',
        cost: 0
      };

      setWarranties(prevWarranties =>
        prevWarranties.map(w =>
          w.id === warranty.id
            ? {
                ...w,
                repairHistory: [...w.repairHistory, newRepair]
              }
            : w
        )
      );

      return result;
    } catch (error) {
      console.error('Add repair failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshWarranties = () => {
    loadWarranties();
  };

  // Mint new warranty NFT
  const mintWarranty = async (warrantyData) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      console.log('🏭 Minting warranty with data:', warrantyData);
      
      // Create mint transaction
      const txb = await mintTestWarranty(warrantyData, warrantyData.recipient);
      
      console.log('📋 Transaction block created:', txb);
      
      // Execute transaction through mock wallet
      const result = await signAndExecuteTransactionBlock({ 
        transactionBlock: txb 
      });
      
      console.log('✅ Mint transaction result:', result);
      
      // Refresh warranties to show the new one (in real scenario)
      await loadWarranties();
      
      return result;
    } catch (error) {
      console.error('❌ Mint warranty failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    warranties,
    loading,
    error,
    transferWarranty,
    addRepair,
    refreshWarranties,
    mintTestWarranty: mintWarranty, // Expose mint function
    // Status helpers
    isConnected,
    currentAccount
  };
};

// Mock data fallback (same as your original data)
const getMockWarranties = () => [
  {
    id: 1,
    objectId: 'mock_object_1',
    serialNo: "WR-2024-001",
    productName: "iPhone 15 Pro",
    manufacturer: "Apple",
    purchaseDate: "2024-01-15",
    warrantyPeriod: 365,
    transferStatus: "owned",
    repairHistory: [
      {
        id: 1,
        date: "2024-03-20",
        issue: "Screen replacement",
        status: "Completed",
        cost: 0,
      },
    ],
  },
  {
    id: 2,
    objectId: 'mock_object_2',
    serialNo: "WR-2024-002",
    productName: "MacBook Air M2",
    manufacturer: "Apple",
    purchaseDate: "2024-06-15",
    warrantyPeriod: 425,
    transferStatus: "transferred",
    transferredTo: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    transferredDate: "2024-12-01",
    repairHistory: [],
  },
  {
    id: 3,
    objectId: 'mock_object_3',
    serialNo: "WR-2023-003",
    productName: "Samsung Galaxy S24",
    manufacturer: "Samsung",
    purchaseDate: "2023-12-01",
    warrantyPeriod: 365,
    transferStatus: "received",
    transferredFrom: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    transferredDate: "2024-11-15",
    repairHistory: [
      {
        id: 1,
        date: "2024-02-10",
        issue: "Battery replacement",
        status: "Completed",
        cost: 0,
      },
      {
        id: 2,
        date: "2024-05-15",
        issue: "Charging port repair",
        status: "In Progress",
        cost: 50,
      },
    ],
  },
  {
    id: 4,
    objectId: 'mock_object_4',
    serialNo: "WR-2024-004",
    productName: "iPad Pro 12.9",
    manufacturer: "Apple",
    purchaseDate: "2024-09-20",
    warrantyPeriod: 1095,
    transferStatus: "owned",
    repairHistory: [],
  },
];
