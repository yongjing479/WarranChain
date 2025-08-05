import React from "react";
import { Modal, Stack, Box, Text, Button } from "@mantine/core";

const QRCodeModal = ({ opened, onClose, selectedWarranty }) => {
  return (
    <Modal opened={opened} onClose={onClose} title="QR Code" size="sm">
      <Stack align="center" gap="md">
        <Box
          style={{
            width: 200,
            height: 200,
            backgroundColor: "#f8f9fa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px dashed #dee2e6",
            borderRadius: 8,
          }}
        >
          <Text c="dimmed" size="sm">
            QR Code Placeholder
          </Text>
        </Box>
        <Text size="sm" c="dimmed" ta="center">
          Serial: {selectedWarranty?.serialNo}
        </Text>
        <Button fullWidth onClick={onClose}>
          Close
        </Button>
      </Stack>
    </Modal>
  );
};

export default QRCodeModal;
