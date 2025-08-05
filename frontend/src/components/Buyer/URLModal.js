import React from "react";
import { Modal, Stack, Text, TextInput, Button } from "@mantine/core";

const URLModal = ({ opened, onClose, selectedWarranty }) => {
  return (
    <Modal opened={opened} onClose={onClose} title="Warranty URL" size="md">
      <Stack gap="md">
        <Text size="sm">Share this URL to verify warranty status:</Text>
        <TextInput
          value={`https://warrantychain.com/verify/${selectedWarranty?.serialNo}`}
          readOnly
          rightSection={
            <Button size="xs" variant="light">
              Copy
            </Button>
          }
        />
        <Button fullWidth onClick={onClose}>
          Close
        </Button>
      </Stack>
    </Modal>
  );
};

export default URLModal;
