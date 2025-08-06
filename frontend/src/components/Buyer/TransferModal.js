import React, { useState } from "react";
import { Modal, Stack, Text, TextInput, Button, Alert, Group, Badge } from "@mantine/core";
import { IconAlertCircle, IconWallet, IconTransfer } from "@tabler/icons-react";

const TransferModal = ({ opened, onClose, selectedWarranty, onTransfer }) => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState("");

  // SUI address validation function
  const validateSUIAddress = (address) => {
    // Check if address starts with 0x
    if (!address.startsWith("0x")) {
      return "SUI address must start with '0x'";
    }

    // Check length (0x + 64 hex characters = 66 total)
    if (address.length !== 66) {
      return "SUI address must be exactly 66 characters (including 0x prefix)";
    }

    // Check if all characters after 0x are valid hex
    const hexPart = address.slice(2); // Remove "0x"
    const hexRegex = /^[0-9a-fA-F]{64}$/;
    if (!hexRegex.test(hexPart)) {
      return "SUI address contains invalid characters. Only 0-9, a-f, A-F are allowed";
    }

    return null; // Valid address
  };

  const handleTransfer = async () => {
    if (!recipientAddress.trim()) {
      setError("Please enter a wallet address");
      return;
    }

    // Validate SUI address
    const validationError = validateSUIAddress(recipientAddress);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsTransferring(true);
    setError("");

    try {
      // Call the transfer function
      await onTransfer(selectedWarranty, recipientAddress);
      onClose();
      setRecipientAddress("");
    } catch (err) {
      setError("Transfer failed. Please try again.");
    } finally {
      setIsTransferring(false);
    }
  };

  const handleClose = () => {
    setRecipientAddress("");
    setError("");
    setIsTransferring(false);
    onClose();
  };

  return (
    <Modal 
      opened={opened} 
      onClose={handleClose} 
      title="Transfer NFT Ownership" 
      size="md"
    >
      <Stack gap="md">
        {/* Warranty Info */}
        <Alert icon={<IconAlertCircle size={16} />} color="blue">
          <Text size="sm">
            You are about to transfer ownership of <strong>{selectedWarranty?.productName}</strong> 
            (Serial: {selectedWarranty?.serialNo})
          </Text>
        </Alert>

        {/* Recipient Address Input */}
        <TextInput
          label="Recipient SUI Wallet Address"
          placeholder="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
          value={recipientAddress}
          onChange={(event) => setRecipientAddress(event.currentTarget.value)}
          leftSection={<IconWallet size={16} />}
          error={error}
          required
          description="Enter the recipient's SUI wallet address (66 characters including 0x)"
        />

        {/* Transfer Details */}
        <Group gap="xs">
          <Text size="sm" c="dimmed">Transfer Details:</Text>
          <Badge color="blue" variant="light">
            NFT Transfer
          </Badge>
        </Group>

        <Text size="xs" c="dimmed">
          • This action cannot be undone
          <br />
          • The recipient will become the new owner
          <br />
          • Warranty benefits will transfer to the new owner
          <br />
          • SUI address format: 0x + 64 hex characters
        </Text>

        {/* Action Buttons */}
        <Group justify="flex-end" gap="sm">
          <Button variant="light" onClick={handleClose} disabled={isTransferring}>
            Cancel
          </Button>
          <Button 
            color="red" 
            leftSection={<IconTransfer size={16} />}
            onClick={handleTransfer}
            loading={isTransferring}
            disabled={!recipientAddress.trim()}
          >
            {isTransferring ? "Transferring..." : "Confirm Transfer"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default TransferModal;