import React, { useEffect, useRef } from "react";
import { Modal, Stack, Box, Text, Button, Group, Alert } from "@mantine/core";
import { IconEye, IconDownload, IconInfoCircle } from "@tabler/icons-react";
import QRCode from "qrcode";

const QRCodeModal = ({ opened, onClose, selectedWarranty, onViewDetails }) => {
  const canvasRef = useRef(null);
  const publicWarrantyUrl = `${window.location.origin}/verify/${selectedWarranty?.serialNo}`;

  // Generate QR code when modal opens or warranty changes
  useEffect(() => {
    if (opened && selectedWarranty) {
      // Add a small delay to ensure canvas is mounted
      const timer = setTimeout(() => {
        if (canvasRef.current) {
          generateQRCode();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [opened, selectedWarranty]);

  const generateQRCode = async () => {
    try {
      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      await QRCode.toCanvas(canvas, publicWarrantyUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000", // Black dots
          light: "#FFFFFF", // White background
        },
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const downloadQRCode = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement("a");
      link.download = `warranty-qr-${selectedWarranty?.serialNo}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="QR Code" size="sm">
      <Stack align="center" gap="md">
        {/* QR Code Canvas */}
        <Box
          style={{
            padding: "10px",
            backgroundColor: "white",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            style={{
              display: "block",
              maxWidth: "100%",
              height: "auto",
            }}
          />
        </Box>

        {/* Warranty Info */}
        <div style={{ textAlign: "center" }}>
          <Text fw={500} size="sm">
            {selectedWarranty?.productName}
          </Text>
          <Text size="sm" c="dimmed">
            Serial: {selectedWarranty?.serialNo}
          </Text>
        </div>

        {/* Info Alert */}
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="How to use"
          color="blue"
          variant="light"
          style={{ width: "100%" }}
        >
          <Text size="xs">
            Scan this QR code with any smartphone camera or QR scanner to view
            warranty details instantly.
          </Text>
        </Alert>

        {/* Action Buttons */}
        <Group gap="sm" w="100%">
          <Button
            flex={1}
            leftSection={<IconEye size={16} />}
            variant="light"
            onClick={() => window.open(publicWarrantyUrl, "_blank")}
          >
            Preview
          </Button>
          <Button
            flex={1}
            leftSection={<IconDownload size={16} />}
            variant="light"
            color="green"
            onClick={downloadQRCode}
          >
            Download
          </Button>
        </Group>

        <Button fullWidth onClick={onClose} variant="filled">
          Close
        </Button>
      </Stack>
    </Modal>
  );
};

export default QRCodeModal;
