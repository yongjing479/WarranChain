import React from "react";
import {
  Box,
  Group,
  Text,
  UnstyledButton,
  ActionIcon,
  Collapse,
  Image,
} from "@mantine/core";
import {
  IconShield,
  IconDevices,
  IconPhone,
  IconDeviceDesktop,
  IconDeviceTablet,
  IconLogout,
  IconChevronDown,
  IconChevronRight,
  IconSettings,
  IconLeaf,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useEnoki } from "../EnokiContext";

const SellerSidebar = ({ activeTab, setActiveTab }) => {
  const { logout } = useEnoki();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = React.useState({
    "product-models": true,
    "business-metrics": false,
  });

  const handleLogout = async () => {
    try {
      logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const sidebarData = [
    {
      label: "Dashboard",
      icon: IconShield,
      link: "dashboard",
    },
    {
      label: "Product Categories",
      icon: IconDevices,
      link: "product-categories",
      hasChildren: true,
      children: [
        {
          label: "Phones & Gadgets",
          link: "phones-gadgets",
        },
        {
          label: "Refrigerators",
          link: "refrigerators",
        },
        {
          label: "Air Conditioners",
          link: "air-conditioners",
        },
        {
          label: "Fans & Cooling",
          link: "fans-cooling",
        },
        {
          label: "Televisions",
          link: "televisions",
        },
        {
          label: "Washing Machines",
          link: "washing-machines",
        },
        {
          label: "Kitchen Appliances",
          link: "kitchen-appliances",
        },
      ],
    },
    {
      label: "Sustainable Impact",
      icon: IconLeaf,
      link: "sustainability",
      hasChildren: false,
    },
    {
      label: "Settings",
      icon: IconSettings,
      link: "settings",
    },
  ];

  const toggleExpanded = (link) => {
    setExpandedItems((prev) => ({
      ...prev,
      [link]: !prev[link],
    }));
  };

  const renderNavItem = (item) => (
    <Box key={item.link}>
      <UnstyledButton
        onClick={() => {
          if (item.hasChildren) {
            toggleExpanded(item.link);
          } else {
            setActiveTab(item.link);
          }
        }}
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
        <Group justify="space-between">
          <Group>
            <item.icon size={20} />
            <Text size="md">{item.label}</Text>
          </Group>
          {item.hasChildren &&
            (expandedItems[item.link] ? (
              <IconChevronDown size={16} />
            ) : (
              <IconChevronRight size={16} />
            ))}
        </Group>
      </UnstyledButton>

      {/* Render children with smooth scroll animation */}
      {item.children && (
        <Collapse
          in={expandedItems[item.link]}
          transitionDuration={300}
          transitionTimingFunction="ease"
        >
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
                  marginBottom: "4px",
                }}
              >
                <Text size="sm" style={{ paddingLeft: "8px" }}>
                  {child.label}
                </Text>
              </UnstyledButton>
            ))}
          </Box>
        </Collapse>
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
        <Image
          src="/WarranChain_Logo_latest.png"
          alt="WarranChain"
          width={350}
          height={70}
          fit="contain"
        />
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
        onClick={handleLogout}
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
