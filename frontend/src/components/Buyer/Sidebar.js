import React from "react";
import { Group, Text, ScrollArea, ActionIcon } from "@mantine/core";
import {
  IconShield,
  IconTransfer,
  IconLogout,
} from "@tabler/icons-react";
import { LinksGroup } from "./LinksGroup";

const CustomNavbar = ({ activeTab, setActiveTab }) => {
  const mockdata = [
    {
      label: "Warranty List",
      icon: IconShield,
      link: "warranty-list",
    },
    {
      label: "Product Ownership",
      icon: IconTransfer,
      initiallyOpened: true,
      links: [
        { label: "Overview", link: "ownership-overview" },
        { label: "Transfer NFT", link: "transfer-nft" },
        { label: "Transferred NFTs", link: "transferred" },
        { label: "Received NFTs", link: "received" },
      ],
    },
  ];

  const links = mockdata.map((item) => (
    <LinksGroup
      {...item}
      key={item.label}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  ));

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
      <div className="header" style={{ marginBottom: "2rem" }}>
        <Group justify="space-between">
          <Text size="lg" fw={700} c="blue">
            WarranChain
          </Text>
        </Group>
      </div>

      <ScrollArea style={{ flex: 1 }}>
        <div style={{ paddingBottom: "1rem" }}>{links}</div>
      </ScrollArea>

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
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fff5f5")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        <ActionIcon variant="transparent" color="red" size="lg" aria-label="Logout">
          <IconLogout size={20} />
        </ActionIcon>
        <Text size="md" fw={500}>
          Logout
        </Text>
      </div>

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
    </nav>
  );
};

export default CustomNavbar;
