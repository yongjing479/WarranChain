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
import FooterComponent from "../components/Footer";
import HeaderComponent from "../components/Header";
import CustomNavbar from "../components/Buyer/Sidebar";
import QRCodeModal from "../components/Buyer/QRCodeModal";
import URLModal from "../components/Buyer/URLModal";

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

  // Filter warranties based on search query
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

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <CustomNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

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
      <QRCodeModal
        opened={showQRModal}
        onClose={() => setShowQRModal(false)}
        selectedWarranty={selectedWarranty}
      />
      <URLModal
        opened={showURLModal}
        onClose={() => setShowURLModal(false)}
        selectedWarranty={selectedWarranty}
      />
    </div>
  );
};

export default BuyerDashboard;
