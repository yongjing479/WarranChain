import React from "react";
import { Box, Group, Text } from "@mantine/core";

const Footer = () => {
  return (
    <Box
      style={{
        height: 60,
        padding: "1rem",
        borderTop: "1px solid #dee2e6",
        backgroundColor: "white",
      }}
    >
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          © 2025 WarranChain. All rights reserved.
        </Text>
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            Powered by Blockchain Team
          </Text>
        </Group>
      </Group>
    </Box>
  );
};

export default Footer;
