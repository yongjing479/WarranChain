import React from "react";
import { Group, Text } from "@mantine/core";
import { IconShield, IconTransfer } from "@tabler/icons-react";

const CustomNavbar = ({ activeTab, setActiveTab }) => {
  const navData = [
    { link: "warranty-list", label: "Warranty List", icon: IconShield },
    { link: "transfer-nft", label: "Transfer NFT", icon: IconTransfer },
  ];

  const links = navData.map((item) => {
    const Icon = item.icon;
    return (
      <button
        key={item.label}
        onClick={() => setActiveTab(item.link)}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 16px",
          textDecoration: "none",
          color: activeTab === item.link ? "#228be6" : "#495057",
          backgroundColor: activeTab === item.link ? "#e7f5ff" : "transparent",
          borderRadius: "8px",
          marginBottom: "4px",
          fontWeight: activeTab === item.link ? 600 : 400,
          transition: "all 0.2s ease",
          border: "none",
          cursor: "pointer",
          width: "100%",
          textAlign: "left",
        }}
      >
        <Icon size={20} style={{ marginRight: "12px" }} />
        <span>{item.label}</span>
      </button>
    );
  });

  return (
    <nav
      style={{
        width: 300,
        height: "100vh",
        backgroundColor: "white",
        borderRight: "1px solid #dee2e6",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1 }}>
        <Group justify="space-between" style={{ marginBottom: "2rem" }}>
          <Text size="lg" fw={700} c="blue">
            Buyer Dashboard
          </Text>
        </Group>
        {links}
      </div>

      <div
        style={{
          borderTop: "1px solid #dee2e6",
          paddingTop: "1rem",
        }}
      >
        <Text size="sm" c="dimmed" ta="center">
          WarrantyChain v1.0
        </Text>
      </div>
    </nav>
  );
};

export default CustomNavbar;
