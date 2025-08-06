import React from "react";
import { Modal, Stack, Text, TextInput, Button, Tooltip, Group } from "@mantine/core";
import { IconCheck, IconCopy, IconEye } from "@tabler/icons-react";
import { useClipboard } from "@mantine/hooks";

const URLModal = ({ opened, onClose, selectedWarranty }) => {
  const clipboard = useClipboard({ timeout: 2000 });
  const warrantyURL = `${window.location.origin}/verify/${selectedWarranty?.serialNo}`;

  return (
    <Modal opened={opened} onClose={onClose} title="Warranty URL" size="md">
      <Stack gap="md">
        <Text size="sm">Share this URL to verify warranty status:</Text>

        <TextInput
          value={warrantyURL}
          readOnly
          rightSection={
            <Tooltip
              label="Link copied!"
              opened={clipboard.copied}
              withArrow
              position="bottom"
              offset={5}
              transitionProps={{ duration: 100, transition: "slide-down" }}
            >
              <Button
                onClick={() => clipboard.copy(warrantyURL)}
                variant="light"
                color={clipboard.copied ? "green" : ""}
                size="xs"
                radius="md"
                rightSection={
                  clipboard.copied ? (
                    <IconCheck size={16} stroke={1.5} />
                  ) : (
                    <IconCopy size={16} stroke={1.5} />
                  )
                }
                styles={{ section: { marginLeft: 6 } }}
              >
                Copy
              </Button>
            </Tooltip>
          }
          rightSectionWidth={90}
        />

        <Group gap="sm">
          <Button
            fullWidth
            leftSection={<IconEye size={16} />}
            variant="light"
            onClick={() => window.open(warrantyURL, '_blank')}
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

export default URLModal;
