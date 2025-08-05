import React, { useState } from "react";
import {
  Text,
  useMantineTheme,
  Group,
  ActionIcon,
  TextInput,
  Avatar,
  Badge,
  Button,
  Table,
  Modal,
  Title,
  Stack,
  Box,
  Container,
  Paper,
} from "@mantine/core";
import {
  IconSearch,
  IconBell,
  IconLogout,
  IconQrcode,
  IconLink,
  IconShield,
  IconTransfer,
  IconTools,
} from "@tabler/icons-react";

const BuyerDashboard = () => {
  const theme = useMantineTheme();
  const [activeTab, setActiveTab] = useState("warranty-list");
  const [searchQuery, setSearchQuery] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [showURLModal, setShowURLModal] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState(null);

  // Updated Mock data for warranties with realistic structure
  const [warranties] = useState([
    {
      id: 1,
      serialNo: "WR-2024-001",
      productName: "iPhone 15 Pro",
      purchaseDate: "2024-01-15",
      warrantyPeriod: 365, 
      repairHistory: [
        {
          id: 1,
          date: "2024-03-20",
          issue: "Screen replacement",
          status: "Completed",
          cost: 0,
        },
      ],
    },
    {
      id: 2,
      serialNo: "WR-2024-002",
      productName: "MacBook Air M2",
      purchaseDate: "2024-06-15",
      warrantyPeriod: 730, 
      repairHistory: [],
    },
    {
      id: 3,
      serialNo: "WR-2023-003",
      productName: "Samsung Galaxy S24",
      purchaseDate: "2023-12-01",
      warrantyPeriod: 365, 
      repairHistory: [
        {
          id: 1,
          date: "2024-02-10",
          issue: "Battery replacement",
          status: "Completed",
          cost: 0,
        },
        {
          id: 2,
          date: "2024-05-15",
          issue: "Charging port repair",
          status: "In Progress",
          cost: 50,
        },
      ],
    },
    {
      id: 4,
      serialNo: "WR-2024-004",
      productName: "Dell XPS 13",
      purchaseDate: "2024-09-20",
      warrantyPeriod: 1095, 
      repairHistory: [],
    },
  ]);

  const calculateWarrantyInfo = (warranty) => {
    const purchaseDate = new Date(warranty.purchaseDate);
    const expiryDate = new Date(purchaseDate);
    expiryDate.setDate(purchaseDate.getDate() + warranty.warrantyPeriod);

    const now = new Date();
    const timeDiff = expiryDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return {
      daysLeft,
      status: daysLeft > 0 ? "valid" : "expired",
      expiryDate: expiryDate.toISOString().split("T")[0],
    };
  };

  const filteredWarranties = warranties.filter(
    (warranty) =>
      warranty.serialNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warranty.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate countdown timer
  const getCountdownText = (daysLeft) => {
    if (daysLeft < 0) {
      return "Expired";
    } else if (daysLeft === 0) {
      return "Expires today";
    } else if (daysLeft === 1) {
      return "Expires tomorrow";
    } else {
      return `${daysLeft} days left`;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle QR code generation
  const handleGenerateQR = (warranty) => {
    setSelectedWarranty(warranty);
    setShowQRModal(true);
  };

  // Handle URL generation
  const handleGenerateURL = (warranty) => {
    setSelectedWarranty(warranty);
    setShowURLModal(true);
  };

  // Navigation data
  const navData = [
    { link: "warranty-list", label: "Warranty List", icon: IconShield },
    { link: "transfer-nft", label: "Transfer NFT", icon: IconTransfer },
  ];

  // Header component
  const HeaderComponent = () => (
    <Box
      style={{
        height: 70,
        padding: "1rem",
        borderBottom: `1px solid ${theme.colors.gray[3]}`,
        backgroundColor: theme.white,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
        <Group justify="space-between" style={{ flex: 1 }}>
          <Title order={3} c="blue">
            WarrantyChain
          </Title>

          <Group gap="md">
            <TextInput
              placeholder="Search serial number or product name..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
              style={{ width: 300 }}
            />

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

            <ActionIcon
              variant="subtle"
              color="red"
              size="lg"
              aria-label="Logout"
            >
              <IconLogout size={20} />
            </ActionIcon>
          </Group>
        </Group>
      </div>
    </Box>
  );

  const CustomNavbar = () => {
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
            color:
              activeTab === item.link
                ? theme.colors.blue[6]
                : theme.colors.gray[7],
            backgroundColor:
              activeTab === item.link ? theme.colors.blue[0] : "transparent",
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
          backgroundColor: theme.white,
          borderRight: `1px solid ${theme.colors.gray[3]}`,
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
            borderTop: `1px solid ${theme.colors.gray[3]}`,
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

  // Warranty list table
  const WarrantyListTable = () => (
    <Paper shadow="xs" p="md">
      <Title order={4} mb="md">
        Warranty List
      </Title>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Serial No</Table.Th>
            <Table.Th>Product Name</Table.Th>
            <Table.Th>Purchase Date</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Countdown</Table.Th>
            <Table.Th>Repairs</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filteredWarranties.map((warranty) => {
            const warrantyInfo = calculateWarrantyInfo(warranty);
            return (
              <Table.Tr key={warranty.id}>
                <Table.Td>
                  <Text fw={500}>{warranty.serialNo}</Text>
                </Table.Td>
                <Table.Td>{warranty.productName}</Table.Td>
                <Table.Td>
                  <Text size="sm">{formatDate(warranty.purchaseDate)}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={warrantyInfo.status === "valid" ? "green" : "red"}
                    variant="light"
                  >
                    {warrantyInfo.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text
                    c={
                      warrantyInfo.daysLeft < 0
                        ? "red"
                        : warrantyInfo.daysLeft < 30
                        ? "orange"
                        : "green"
                    }
                    fw={500}
                  >
                    {getCountdownText(warrantyInfo.daysLeft)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Badge
                      color={
                        warranty.repairHistory.length > 0 ? "blue" : "gray"
                      }
                      variant="light"
                      leftSection={<IconTools size={12} />}
                    >
                      {warranty.repairHistory.length}
                    </Badge>
                    {warranty.repairHistory.length > 0 && (
                      <Text size="xs" c="dimmed">
                        Last:{" "}
                        {formatDate(
                          warranty.repairHistory[
                            warranty.repairHistory.length - 1
                          ].date
                        )}
                      </Text>
                    )}
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button
                      size="xs"
                      leftSection={<IconQrcode size={14} />}
                      variant="light"
                      onClick={() => handleGenerateQR(warranty)}
                    >
                      QR
                    </Button>
                    <Button
                      size="xs"
                      leftSection={<IconLink size={14} />}
                      variant="light"
                      onClick={() => handleGenerateURL(warranty)}
                    >
                      URL
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Paper>
  );

  // QR Code Modal
  const QRCodeModal = () => (
    <Modal
      opened={showQRModal}
      onClose={() => setShowQRModal(false)}
      title="QR Code"
      size="sm"
    >
      <Stack align="center" gap="md">
        <Box
          style={{
            width: 200,
            height: 200,
            backgroundColor: "#f8f9fa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px dashed #dee2e6",
            borderRadius: 8,
          }}
        >
          <Text c="dimmed" size="sm">
            QR Code Placeholder
          </Text>
        </Box>
        <Text size="sm" c="dimmed" ta="center">
          Serial: {selectedWarranty?.serialNo}
        </Text>
        <Button fullWidth onClick={() => setShowQRModal(false)}>
          Close
        </Button>
      </Stack>
    </Modal>
  );

  // URL Modal
  const URLModal = () => (
    <Modal
      opened={showURLModal}
      onClose={() => setShowURLModal(false)}
      title="Warranty URL"
      size="md"
    >
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
        <Button fullWidth onClick={() => setShowURLModal(false)}>
          Close
        </Button>
      </Stack>
    </Modal>
  );

  // Footer component
  const FooterComponent = () => (
    <Box
      style={{
        height: 60,
        padding: "1rem",
        borderTop: `1px solid ${theme.colors.gray[3]}`,
        backgroundColor: theme.white,
      }}
    >
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          © 2024 WarrantyChain. All rights reserved.
        </Text>
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            Powered by Blockchain Technology
          </Text>
        </Group>
      </Group>
    </Box>
  );

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Custom Navbar */}
      <CustomNavbar />

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <HeaderComponent />

        {/* Main Content Area */}
        <div style={{ flex: 1, padding: "1rem", overflow: "auto" }}>
          <Container size="xl">
            {activeTab === "warranty-list" && <WarrantyListTable />}
            {activeTab === "transfer-nft" && <WarrantyListTable />}
          </Container>
        </div>

        {/* Footer */}
        <FooterComponent />
      </div>

      {/* Modals */}
      <QRCodeModal />
      <URLModal />
    </div>
  );
};

export default BuyerDashboard;
