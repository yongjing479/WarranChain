import React from "react";
import {
  Box,
  Group,
  ActionIcon,
  TextInput,
  Avatar
} from "@mantine/core";
import { IconSearch, IconBell} from "@tabler/icons-react";

const Header = ({ searchQuery, setSearchQuery }) => {
  return (
    <Box
      style={{
        height: 70,
        padding: "1rem",
        borderBottom: "1px solid #dee2e6",
        backgroundColor: "white",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
        <Group justify="space-between" style={{ flex: 1 }}>
          <TextInput
              placeholder="Search serial number or product name..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
              style={{ width: 300 }}
            />

          <Group gap="lg">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              aria-label="Notifications"
            >
              <IconBell size={20} />
            </ActionIcon>

            <Avatar
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
              size="md"
              radius="xl"
            />
          </Group>
        </Group>
      </div>
    </Box>
  );
};

export default Header;
