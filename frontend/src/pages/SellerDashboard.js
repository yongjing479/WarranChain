import React, { useState } from "react";
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Badge,
  Button,
  Table,
  Grid,
  Card,
} from "@mantine/core";
import {
  IconPlus,
  IconQrcode,
  IconLink,
  IconShield,
} from "@tabler/icons-react";
import HeaderComponent from "../components/Header";
import FooterComponent from "../components/Footer";
import SellerSidebar from "../components/Seller/SellerSidebar";
import IssueWarrantyModal from "../components/Seller/IssueWarrantyModal";
import QRCodeModal from "../components/Buyer/QRCodeModal";
import URLModal from "../components/Buyer/URLModal";
import SellerWarrantyDetailsModal from "../components/Seller/SellerWarrantyDetailsModal";
import {
  calculateWarrantyInfo,
  getWarrantyStatusColor,
  getWarrantyStatusText,
  formatDate,
} from "../utils/warrantyUtils";

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [issueModalOpened, setIssueModalOpened] = useState(false);

  // Modal states for QR, URL, and Details
  const [showQRModal, setShowQRModal] = useState(false);
  const [showURLModal, setShowURLModal] = useState(false);
  const [showWarrantyDetailsModal, setShowWarrantyDetailsModal] =
    useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState(null);

  // Form state for issuing warranty
  const [warrantyForm, setWarrantyForm] = useState({
    productName: "",
    productBrand: "",
    productModel: "",
    serialNumber: "",
    buyerWalletAddress: "",
    warrantyPeriodDays: 365,
    purchaseDate: "",
    purchaseLocation: "",
    description: "",
  });

  // Mock data for issued warranties - structured like buyer dashboard
  const [issuedWarranties, setIssuedWarranties] = useState([
    {
      id: 1,
      serialNo: "WR-2024-001",
      productName: "iPhone 15 Pro",
      productBrand: "Apple",
      productModel: "iPhone 15 Pro 256GB",
      purchaseDate: "2024-01-15",
      warrantyPeriod: 365,
      buyerWalletAddress: "0x1234...5678",
      issueDate: "2024-01-15",
      purchaseLocation: "Apple Store SF",
      description: "Latest iPhone with Pro camera system",
      // Add repair history for compatibility with WarrantyDetailsModal
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
      productBrand: "Apple",
      productModel: "MacBook Air M2 512GB",
      purchaseDate: "2024-02-10",
      warrantyPeriod: 365,
      buyerWalletAddress: "0x5678...9012",
      issueDate: "2024-02-10",
      purchaseLocation: "Apple Store NYC",
      description: "Ultra-thin laptop with M2 chip",
      repairHistory: [],
    },
    {
      id: 3,
      serialNo: "WR-2024-003",
      productName: "iPad Pro 12.9",
      productBrand: "Apple",
      productModel: "iPad Pro 12.9 1TB",
      purchaseDate: "2024-01-20",
      warrantyPeriod: 365,
      buyerWalletAddress: "0x9012...3456",
      issueDate: "2024-01-20",
      purchaseLocation: "Best Buy",
      description: "Professional tablet with M2 chip",
      repairHistory: [],
    },
    {
      id: 4,
      serialNo: "WR-2024-004",
      productName: "Samsung Galaxy S24",
      productBrand: "Samsung",
      productModel: "Galaxy S24 Ultra 512GB",
      purchaseDate: "2024-03-05",
      warrantyPeriod: 365,
      buyerWalletAddress: "0x3456...7890",
      issueDate: "2024-03-05",
      purchaseLocation: "Samsung Store",
      description: "Premium Android smartphone",
      repairHistory: [],
    },
  ]);

  const electronicsBrands = [
    { value: "Apple", label: "Apple" },
    { value: "Samsung", label: "Samsung" },
    { value: "Sony", label: "Sony" },
    { value: "LG", label: "LG" },
    { value: "Dell", label: "Dell" },
    { value: "HP", label: "HP" },
    { value: "Lenovo", label: "Lenovo" },
    { value: "Asus", label: "Asus" },
  ];

  // Helper function to format wallet address
  const formatWalletAddress = (address) => {
    if (!address || address.length < 10) return address;

    // Remove any existing formatting
    const cleanAddress = address.replace(/\./g, "");

    // Format as 0x1234...5678 (first 6 chars + ... + last 4 chars)
    if (cleanAddress.startsWith("0x") && cleanAddress.length >= 10) {
      const start = cleanAddress.substring(0, 6); // 0x1234
      const end = cleanAddress.substring(cleanAddress.length - 4); // 5678
      return `${start}...${end}`;
    }

    // If it doesn't start with 0x, add it and format
    if (cleanAddress.length >= 8) {
      const withPrefix = cleanAddress.startsWith("0x")
        ? cleanAddress
        : `0x${cleanAddress}`;
      const start = withPrefix.substring(0, 6);
      const end = withPrefix.substring(withPrefix.length - 4);
      return `${start}...${end}`;
    }

    return address; // Return original if too short to format
  };

  // Handler functions for QR, URL, and Details
  const handleGenerateQR = (warranty) => {
    setSelectedWarranty(warranty);
    setShowQRModal(true);
  };

  const handleGenerateURL = (warranty) => {
    setSelectedWarranty(warranty);
    setShowURLModal(true);
  };

  const handleViewWarrantyDetails = (warranty) => {
    setSelectedWarranty(warranty);
    setShowWarrantyDetailsModal(true);
  };

  const handleIssueWarranty = () => {
    const newWarranty = {
      id: issuedWarranties.length + 1,
      serialNo: `WR-2024-${String(issuedWarranties.length + 1).padStart(
        3,
        "0"
      )}`,
      ...warrantyForm,
      // Format the buyer wallet address consistently
      buyerWalletAddress: formatWalletAddress(warrantyForm.buyerWalletAddress),
      issueDate: new Date().toISOString().split("T")[0],
      warrantyPeriod: warrantyForm.warrantyPeriodDays,
      repairHistory: [], // Initialize empty repair history
    };

    setIssuedWarranties((prev) => [...prev, newWarranty]);
    setIssueModalOpened(false);

    // Reset form
    setWarrantyForm({
      productName: "",
      productBrand: "",
      productModel: "",
      serialNumber: "",
      buyerWalletAddress: "",
      warrantyPeriodDays: 365,
      purchaseDate: "",
      purchaseLocation: "",
      description: "",
    });

    alert("Warranty NFT issued successfully!");
  };

  // Filter warranties by product model
  const getWarrantiesByModel = (modelFilter) => {
    return issuedWarranties.filter((warranty) =>
      warranty.productName.toLowerCase().includes(modelFilter.toLowerCase())
    );
  };

  // Warranty table component - styled EXACTLY like buyer dashboard
  const WarrantyTable = ({ warranties, title }) => (
    <Paper shadow="xs" p="md">
      <Group justify="space-between" mb="md">
        <Title order={4}>{title}</Title>
        <Badge size="lg" variant="light">
          Total: {warranties.length}
        </Badge>
      </Group>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Serial No</Table.Th>
            <Table.Th>Product Name</Table.Th>
            <Table.Th>Brand</Table.Th>
            <Table.Th>Buyer Address</Table.Th>
            <Table.Th>Issue Date</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {warranties.map((warranty) => {
            const warrantyInfo = calculateWarrantyInfo(warranty);
            return (
              <Table.Tr key={warranty.id}>
                <Table.Td>
                  <Text fw={500}>{warranty.serialNo}</Text>
                </Table.Td>
                <Table.Td>{warranty.productName}</Table.Td>
                <Table.Td>
                  <Badge variant="light" color="blue">
                    {warranty.productBrand}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {warranty.buyerWalletAddress}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{formatDate(warranty.issueDate)}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={getWarrantyStatusColor(warrantyInfo.status)}
                    variant="light"
                  >
                    {/* Show only status text without days remaining */}
                    {warrantyInfo.status === "valid"
                      ? "Valid"
                      : warrantyInfo.status === "expired"
                      ? "Expired"
                      : "Unknown"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {/* EXACT same styling as buyer dashboard */}
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
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => handleViewWarrantyDetails(warranty)}
                    >
                      Details
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

  // Dashboard overview
  const renderDashboard = () => (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Dashboard</Title>
          <Text c="dimmed">Manage your electronics warranties</Text>
        </div>
        <Button
          size="lg"
          leftSection={<IconPlus size={18} />}
          onClick={() => setIssueModalOpened(true)}
        >
          Issue New Warranty
        </Button>
      </Group>

      {/* Stats Cards */}
      <Grid mb="xl">
        <Grid.Col span={3}>
          <Card shadow="sm" padding="lg">
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">
                  Total Warranties
                </Text>
                <Text size="xl" fw={700}>
                  {issuedWarranties.length}
                </Text>
              </div>
              <IconShield size={24} color="#228be6" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={3}>
          <Card shadow="sm" padding="lg">
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">
                  Active Warranties
                </Text>
                <Text size="xl" fw={700}>
                  {
                    issuedWarranties.filter((w) => {
                      const info = calculateWarrantyInfo(w);
                      return (
                        info.status === "valid" ||
                        info.status === "expiring-soon"
                      );
                    }).length
                  }
                </Text>
              </div>
              <IconShield size={24} color="#40c057" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={3}>
          <Card shadow="sm" padding="lg">
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">
                  Expired Warranties
                </Text>
                <Text size="xl" fw={700}>
                  {
                    issuedWarranties.filter((w) => {
                      const info = calculateWarrantyInfo(w);
                      return info.status === "expired";
                    }).length
                  }
                </Text>
              </div>
              <IconShield size={24} color="#fa5252" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={3}>
          <Card shadow="sm" padding="lg">
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">
                  Product Brands
                </Text>
                <Text size="xl" fw={700}>
                  {
                    [...new Set(issuedWarranties.map((w) => w.productBrand))]
                      .length
                  }
                </Text>
              </div>
              <IconShield size={24} color="#7c2d12" />
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Recent Warranties */}
      <WarrantyTable
        warranties={issuedWarranties.slice(-5)}
        title="Recent Warranties Issued"
      />
    </Container>
  );

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <SellerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <HeaderComponent
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div style={{ flex: 1, padding: "1rem", overflow: "auto" }}>
          {activeTab === "dashboard" && renderDashboard()}

          {activeTab === "product-models" && (
            <Container size="xl">
              <WarrantyTable
                warranties={issuedWarranties}
                title="All Product Models"
              />
            </Container>
          )}

          {activeTab === "iphone-models" && (
            <Container size="xl">
              <WarrantyTable
                warranties={getWarrantiesByModel("iPhone")}
                title="iPhone Model Warranties"
              />
            </Container>
          )}

          {activeTab === "macbook-models" && (
            <Container size="xl">
              <WarrantyTable
                warranties={getWarrantiesByModel("MacBook")}
                title="MacBook Model Warranties"
              />
            </Container>
          )}

          {activeTab === "ipad-models" && (
            <Container size="xl">
              <WarrantyTable
                warranties={getWarrantiesByModel("iPad")}
                title="iPad Model Warranties"
              />
            </Container>
          )}

          {activeTab === "samsung-models" && (
            <Container size="xl">
              <WarrantyTable
                warranties={getWarrantiesByModel("Samsung")}
                title="Samsung Model Warranties"
              />
            </Container>
          )}
        </div>
        <FooterComponent />
      </div>

      {/* All Modals */}
      <IssueWarrantyModal
        opened={issueModalOpened}
        onClose={() => setIssueModalOpened(false)}
        warrantyForm={warrantyForm}
        setWarrantyForm={setWarrantyForm}
        onIssueWarranty={handleIssueWarranty}
        electronicsBrands={electronicsBrands}
      />

      <QRCodeModal
        opened={showQRModal}
        onClose={() => setShowQRModal(false)}
        selectedWarranty={selectedWarranty}
        onViewDetails={() => {
          setShowQRModal(false);
          handleViewWarrantyDetails(selectedWarranty);
        }}
      />

      <URLModal
        opened={showURLModal}
        onClose={() => setShowURLModal(false)}
        selectedWarranty={selectedWarranty}
        onViewDetails={() => {
          setShowURLModal(false);
          handleViewWarrantyDetails(selectedWarranty);
        }}
      />

      <SellerWarrantyDetailsModal
        opened={showWarrantyDetailsModal}
        onClose={() => setShowWarrantyDetailsModal(false)}
        warranty={selectedWarranty}
      />
    </div>
  );
};

export default SellerDashboard;
