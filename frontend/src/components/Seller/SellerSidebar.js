import React from "react";
import { Box, Group, Text, UnstyledButton, ActionIcon } from "@mantine/core";
import {
  IconPlus,
  IconShield,
  IconDevices,
  IconPhone,
  IconDeviceDesktop,
  IconDeviceTablet,
  IconLogout,
} from "@tabler/icons-react";

const SellerSidebar = ({ activeTab, setActiveTab }) => {
  const sidebarData = [
    {
      label: "Dashboard",
      icon: IconShield,
      link: "dashboard",
    },
    {
      label: "Product Models",
      icon: IconDevices,
      link: "product-models",
      children: [
        {
          label: "iPhone Models",
          icon: IconPhone,
          link: "iphone-models",
        },
        {
          label: "MacBook Models",
          icon: IconDeviceDesktop,
          link: "macbook-models",
        },
        {
          label: "iPad Models",
          icon: IconDeviceTablet,
          link: "ipad-models",
        },
        {
          label: "Samsung Models",
          icon: IconPhone,
          link: "samsung-models",
        },
      ],
    },
  ];

  const renderNavItem = (item) => (
    <Box key={item.link}>
      <UnstyledButton
        onClick={() => setActiveTab(item.link)}
        style={{
          display: "block",
          width: "100%",
          padding: "12px 16px",
          borderRadius: "8px",
          backgroundColor: activeTab === item.link ? "#e7f5ff" : "transparent",
          color: activeTab === item.link ? "#228be6" : "#495057",
          fontWeight: activeTab === item.link ? 600 : 400,
        }}
      >
        <Group>
          <item.icon size={20} />
          <Text size="sm">{item.label}</Text>
        </Group>
      </UnstyledButton>

      {/* Render children if exists */}
      {item.children && (
        <Box ml="md" mt="xs">
          {item.children.map((child) => (
            <UnstyledButton
              key={child.link}
              onClick={() => setActiveTab(child.link)}
              style={{
                display: "block",
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                backgroundColor:
                  activeTab === child.link ? "#e7f5ff" : "transparent",
                color: activeTab === child.link ? "#228be6" : "#6c757d",
                fontSize: "14px",
                marginBottom: "4px",
              }}
            >
              <Group gap="sm">
                <child.icon size={16} />
                <Text size="xs">{child.label}</Text>
              </Group>
            </UnstyledButton>
          ))}
        </Box>
      )}
    </Box>
  );

  return (
    <Box
      style={{
        width: "300px",
        height: "100vh",
        backgroundColor: "#f8f9fa",
        borderRight: "1px solid #dee2e6",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Group mb="xl">
        <IconShield size={28} color="#228be6" />
        <Text size="xl" fw={700} c="#228be6">
          WarranChain
        </Text>
      </Group>

      <Box style={{ flex: 1 }}>{sidebarData.map(renderNavItem)}</Box>

      {/* Logout Button */}
      <div
        style={{
          marginTop: "1rem",
          marginBottom: "1rem",
          padding: "0.5rem 0.75rem",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          cursor: "pointer",
          color: "red",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#fff5f5")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
      >
        <ActionIcon
          variant="transparent"
          color="red"
          size="lg"
          aria-label="Logout"
        >
          <IconLogout size={20} />
        </ActionIcon>
        <Text size="md" fw={500}>
          Logout
        </Text>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid #dee2e6",
          paddingTop: "1.5rem",
        }}
      >
        <Text size="sm" c="dimmed" ta="center">
          WarranChain v1.0
        </Text>
      </div>
    </Box>
  );
};

export default SellerSidebar;
