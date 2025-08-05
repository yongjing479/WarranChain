import React from "react";
import { Group, Text, ScrollArea } from "@mantine/core";
import {
  IconShield,
  IconTransfer,
  IconDownload,
  IconHistory,
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
        { label: "Transferred", link: "transferred" },
        { label: "Received", link: "received" },
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
            Buyer Dashboard
          </Text>
        </Group>
      </div>

      <ScrollArea style={{ flex: 1 }}>
        <div style={{ paddingBottom: "1rem" }}>{links}</div>
      </ScrollArea>

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
