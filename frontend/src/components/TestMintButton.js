import React, { useState } from 'react';
import { Button, Modal, Stack, TextInput, Group, Text, Notification } from '@mantine/core';
import { mintTestWarranty } from '../services/suiService';
import { IconPlus, IconCheck, IconX } from '@tabler/icons-react';

const TestMintButton = ({ onMintSuccess }) => {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const [formData, setFormData] = useState({
    productName: 'iPhone 15 Pro',
    manufacturer: 'Apple',
    serialNumber: 'TEST-' + Date.now(),
    warrantyPeriodDays: 365,
    buyerEmail: 'test@example.com'
  });

  const handleMint = async () => {
    if (!isConnected) {
      setNotification({
        type: 'error',
        message: 'Please connect your wallet first'
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating mint transaction with data:', formData);
      console.log('Recipient address:', currentAccount.address);
      
      // Create mint transaction
      const txb = await mintTestWarranty(formData, currentAccount.address);
      
      console.log('Transaction block created:', txb);
      
      // Execute transaction (this will be simulated with mock wallet)
      const result = await signAndExecuteTransactionBlock({
        transactionBlock: txb
      });

      console.log('Test NFT minted:', result);
      
      if (result.__isMockTransaction) {
        setNotification({
          type: 'info',
          message: `Mock NFT "${formData.productName}" simulated. Use PowerShell script or real wallet to create actual NFTs.`
        });
      } else {
        setNotification({
          type: 'success',
          message: `Test NFT "${formData.productName}" minted successfully!`
        });
      }
      
      setOpened(false);
      if (onMintSuccess) onMintSuccess();
      
    } catch (error) {
      console.error('Mint failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        formData,
        currentAccount: currentAccount.address
      });
      
      setNotification({
        type: 'error',
        message: error.message || 'Failed to mint test NFT'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        leftSection={<IconPlus size={16} />}
        variant="light"
        color="green"
        onClick={() => setOpened(true)}
        disabled={!isConnected}
      >
        Mint Test NFT
      </Button>

      <Modal 
        opened={opened} 
        onClose={() => setOpened(false)} 
        title="Mint Test Warranty NFT"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            This will create a test warranty NFT on the blockchain for testing purposes.
          </Text>
          
          <TextInput
            label="Product Name"
            value={formData.productName}
            onChange={(e) => setFormData({...formData, productName: e.target.value})}
          />
          
          <TextInput
            label="Manufacturer"
            value={formData.manufacturer}
            onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
          />
          
          <TextInput
            label="Serial Number"
            value={formData.serialNumber}
            onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
          />
          
          <TextInput
            label="Warranty Period (Days)"
            type="number"
            value={formData.warrantyPeriodDays}
            onChange={(e) => setFormData({...formData, warrantyPeriodDays: parseInt(e.target.value)})}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={() => setOpened(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleMint} 
              loading={loading}
              color="green"
            >
              Mint Test NFT
            </Button>
          </Group>
        </Stack>
      </Modal>

      {notification && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1001 }}>
          <Notification
            icon={notification.type === 'success' ? <IconCheck size={16} /> : <IconX size={16} />}
            color={notification.type === 'success' ? 'green' : 'red'}
            onClose={() => setNotification(null)}
          >
            {notification.message}
          </Notification>
        </div>
      )}
    </>
  );
};

export default TestMintButton;
