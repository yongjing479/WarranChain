import React, { createContext, useContext, useState } from 'react';
import { suiClient } from '../services/suiService';

const MockWalletContext = createContext(null);

// Mock wallet addresses for testing
const MOCK_ADDRESSES = [
  '0x15da713cf950a2905d394a3120ae78c8af4b53a8be72a6a712c5aa56a6ba303d',
  '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
];

export const MockWalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true); // Start connected for testing
  const [currentAccount, setCurrentAccount] = useState({
    address: MOCK_ADDRESSES[0]
  });
  const [isLoading, setIsLoading] = useState(false);

  const connect = async () => {
    setIsLoading(true);
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsConnected(true);
    setCurrentAccount({ address: MOCK_ADDRESSES[0] });
    setIsLoading(false);
  };

  const disconnect = () => {
    setIsConnected(false);
    setCurrentAccount(null);
  };

  const signAndExecuteTransactionBlock = async ({ transactionBlock }) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    try {
      console.log('Executing transaction block:', transactionBlock);
      
      // Mock wallet limitation: Cannot submit real transactions without private keys
      console.warn('⚠️  MOCK WALLET LIMITATION:');
      console.warn('   This mock wallet simulates transactions but does not submit to blockchain');
      console.warn('   To see real NFTs, use one of these methods:');
      console.warn('   1. Run: .\\mint_test_nft.ps1 in PowerShell');
      console.warn('   2. Use a real wallet extension');
      console.warn('   3. Wait for your teammate\'s ZK login integration');
      
      const mockResult = {
        digest: 'mock_transaction_digest_' + Date.now(),
        effects: {
          status: { status: 'success' },
          created: [],
          mutated: [],
          deleted: []
        },
        __isMockTransaction: true
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return mockResult;
    } catch (error) {
      console.error('Transaction execution failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getBalance = async () => {
    if (!isConnected) return '0';
    
    try {
      const balance = await suiClient.getBalance({
        owner: currentAccount.address
      });
      return balance.totalBalance;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  };

  const switchAccount = (accountIndex) => {
    if (accountIndex < MOCK_ADDRESSES.length) {
      setCurrentAccount({ address: MOCK_ADDRESSES[accountIndex] });
    }
  };

  const value = {
    // Connection state
    isConnected,
    isLoading,
    currentAccount,
    
    // Wallet methods
    connect,
    disconnect,
    signAndExecuteTransactionBlock,
    getBalance,
    
    // Mock-specific methods (remove when integrating real wallet)
    switchAccount,
    mockAddresses: MOCK_ADDRESSES
  };

  return (
    <MockWalletContext.Provider value={value}>
      {children}
    </MockWalletContext.Provider>
  );
};

export const useMockWallet = () => {
  const context = useContext(MockWalletContext);
  if (!context) {
    throw new Error('useMockWallet must be used within a MockWalletProvider');
  }
  return context;
};
