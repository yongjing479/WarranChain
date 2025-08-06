import React from "react";
import { Modal, Stack, Box, Text, Button, Group } from "@mantine/core";
import { IconEye, IconQrcode } from "@tabler/icons-react";

const QRCodeModal = ({ opened, onClose, selectedWarranty, onViewDetails }) => {
  const publicWarrantyUrl = `${window.location.origin}/verify/${selectedWarranty?.serialNo}`;

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
        <Text size="xs" c="dimmed" ta="center">
          Scan this QR code to view warranty details
        </Text>

        <Group gap="sm" w="100%">
          <Button
            fullWidth
            leftSection={<IconEye size={16} />}
            variant="light"
            onClick={() => window.open(publicWarrantyUrl, "_blank")}
          >
            View Public Page
          </Button>
          <Button fullWidth onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default QRCodeModal;
