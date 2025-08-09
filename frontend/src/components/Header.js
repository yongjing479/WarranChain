import React from "react";
import {
  Box,
  Group,
  ActionIcon,
  TextInput,
  Avatar,
  Menu,
  Text,
  Divider
} from "@mantine/core";
import { IconSearch, IconBell, IconLogout, IconUser, IconSettings } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useEnoki } from "./EnokiContext";

const Header = ({ searchQuery, setSearchQuery }) => {
  const { logout, userType } = useEnoki();
  const navigate = useNavigate();

  // Get wallet address from localStorage
  const walletAddress = localStorage.getItem('zkLoginAddress');
  const displayAddress = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'No wallet';

  const handleLogout = async () => {
    try {
      logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSettings = () => {
    if (userType === "seller") {
      navigate("/seller-dashboard");
      // You can add logic to switch to settings tab here
    } else {
      navigate("/buyer-dashboard");
      // You can add logic to switch to settings tab here
    }
  };
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

            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Avatar
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                  size="md"
                  radius="xl"
                  style={{ cursor: "pointer" }}
                />
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item
                  leftSection={<IconUser size={14} />}
                >
                  <div>
                    <Text size="sm" fw={500}>
                      {userType === "seller" ? "Seller Account" : "Buyer Account"}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {displayAddress}
                    </Text>
                  </div>
                </Menu.Item>
                
                <Menu.Item
                  leftSection={<IconSettings size={14} />}
                  onClick={handleSettings}
                >
                  Settings
                </Menu.Item>

                <Divider />

                <Menu.Item
                  leftSection={<IconLogout size={14} />}
                  onClick={handleLogout}
                  color="red"
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </div>
    </Box>
  );
};

export default Header;
