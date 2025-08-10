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
  Select,
  Center,
  Loader,
} from "@mantine/core";
import {
  IconPlus,
  IconQrcode,
  IconLink,
  IconShield,
  IconSortAscending,
  IconSortDescending,
  IconReportMoney,
  IconUsers,
  IconBuildingStore,
} from "@tabler/icons-react";
import HeaderComponent from "../components/Header";
import FooterComponent from "../components/Footer";
import SellerSidebar from "../components/Seller/SellerSidebar";
import IssueWarrantyModal from "../components/Seller/IssueWarrantyModal";
import QRCodeModal from "../components/Buyer/QRCodeModal";
import URLModal from "../components/Buyer/URLModal";
import SellerWarrantyDetailsModal from "../components/Seller/SellerWarrantyDetailsModal";
import SellerChatWidget from "../components/Seller/SellerChatWidget";
import SellerSustainabilityDashboard from "./sellerSustainabilityDashhboard";
// ✅ FIX: Import SellerSettings as a component, not a function
import SellerSettings from "./SellerSettings";
import {
  calculateWarrantyInfo,
  getWarrantyStatusColor,
  formatDate,
} from "../utils/warrantyUtils";
// ❌ REMOVE: This line causes the problem
// import renderSettings from "./SellerSettings";
import { useWarranties } from "../hooks/useWarranties";
import { SAMPLE_WARRANTY_DATA, fillFormWithSampleData } from "../utils/testHelpers";

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [issueModalOpened, setIssueModalOpened] = useState(false);

  // Blockchain integration
  const {
    warranties,
    loading,
    error,
    mintTestWarranty,
    isConnected,
    currentAccount,
  } = useWarranties();

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

  // Use blockchain data instead of mock data
  const issuedWarranties = warranties;

  // Electronics brands for the form
  const electronicsBrands = [
    { value: "Samsung", label: "Samsung" },
    { value: "LG", label: "LG" },
    { value: "Sony", label: "Sony" },
    { value: "Panasonic", label: "Panasonic" },
    { value: "Sharp", label: "Sharp" },
    { value: "Toshiba", label: "Toshiba" },
    { value: "Hisense", label: "Hisense" },
    { value: "Vizio", label: "Vizio" },
    { value: "Whirlpool", label: "Whirlpool" },
    { value: "Maytag", label: "Maytag" },
    { value: "KitchenAid", label: "KitchenAid" },
    { value: "Bosch", label: "Bosch" },
    { value: "GE", label: "GE" },
    { value: "Frigidaire", label: "Frigidaire" },
    { value: "Electrolux", label: "Electrolux" },
    { value: "Dyson", label: "Dyson" },
    { value: "Honeywell", label: "Honeywell" },
    { value: "Lasko", label: "Lasko" },
    { value: "Vornado", label: "Vornado" },
    { value: "Apple", label: "Apple" },
    { value: "Dell", label: "Dell" },
    { value: "HP", label: "HP" },
    { value: "Lenovo", label: "Lenovo" },
    { value: "ASUS", label: "ASUS" },
    { value: "Acer", label: "Acer" },
    { value: "MSI", label: "MSI" },
    { value: "Razer", label: "Razer" },
    { value: "Cuisinart", label: "Cuisinart" },
    { value: "Breville", label: "Breville" },
    { value: "Ninja", label: "Ninja" },
    { value: "Instant Pot", label: "Instant Pot" },
    { value: "Vitamix", label: "Vitamix" },
    { value: "Blendtec", label: "Blendtec" },
    { value: "Hamilton Beach", label: "Hamilton Beach" },
    { value: "Oster", label: "Oster" },
    { value: "Sunbeam", label: "Sunbeam" },
    { value: "Black+Decker", label: "Black+Decker" },
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

  const handleIssueWarranty = async () => {
    try {
      if (!isConnected || !currentAccount) {
        alert("Please connect your wallet first!");
        return;
      }

      // Create warranty using blockchain service
      await mintTestWarranty({
        productName: warrantyForm.productName,
        manufacturer: warrantyForm.productBrand,
        serialNumber: warrantyForm.serialNumber,
        warrantyPeriodDays: warrantyForm.warrantyPeriodDays,
        buyerEmail: "", // Empty for now, will be used for ZK login
        recipient: warrantyForm.buyerWalletAddress,
      });

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

      alert(`✅ SUCCESS! Mock Warranty NFT Transaction Created!

📝 WHAT HAPPENED:
• Transaction built for Sui blockchain
• Mock wallet simulated the process
• Console shows transaction details

🔍 NEXT STEPS FOR FULL TESTING:
1. Check browser console for transaction logs
2. Visit buyer dashboard to see if data syncs
3. When ZK login is ready, this becomes real blockchain transaction

⚠️ CURRENT LIMITATION: Using mock wallet - no real NFT created yet`);
    } catch (error) {
      console.error("Error issuing warranty:", error);
      alert(`❌ Error issuing warranty: ${error.message}

🔧 TIP: Check browser console for detailed error logs`);
    }
  };

  // Filter warranties by product model
  const getWarrantiesByModel = (modelFilter) => {
    return issuedWarranties.filter((warranty) =>
      warranty.productName.toLowerCase().includes(modelFilter.toLowerCase())
    );
  };

  // Get recent warranties with better category representation
  const getRecentWarranties = () => {
    // Get the first 8 warranties (newest since we add to top)
    const recentWarranties = issuedWarranties.slice(0, 8);

    // If we have enough warranties, return them
    if (recentWarranties.length >= 6) {
      return recentWarranties;
    }

    // Otherwise return all warranties (for demo purposes)
    return issuedWarranties;
  };

  // Warranty table component - styled EXACTLY like buyer dashboard
  const WarrantyTable = ({ warranties, title }) => {
    const [sortBy, setSortBy] = useState("issueDate");
    const [sortOrder, setSortOrder] = useState("desc");

    const handleSort = (field) => {
      if (sortBy === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortBy(field);
        setSortOrder("desc");
      }
    };

    // Filter warranties based on header search query
    const filteredWarranties = warranties.filter((warranty) => {
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();
      return (
        warranty.serialNo.toLowerCase().includes(query) ||
        warranty.productName.toLowerCase().includes(query)
      );
    });

    const sortedWarranties = [...filteredWarranties].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle date sorting
      if (sortBy === "issueDate") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle string sorting
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return (
      <Paper shadow="xs" p="md">
        <Group justify="space-between" mb="md">
          <Group>
            <Title order={4}>{title}</Title>
            <Badge size="lg" variant="light">
              Total: {filteredWarranties.length}
            </Badge>
          </Group>
          <Group>
            <Select
              size="sm"
              value={sortBy}
              onChange={setSortBy}
              data={[
                { value: "issueDate", label: "Issue Date" },
                { value: "productName", label: "Product Name" },
                { value: "productBrand", label: "Brand" },
                { value: "serialNo", label: "Serial No" },
              ]}
              style={{ width: 140 }}
            />
            <Button
              size="sm"
              variant="light"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              leftSection={
                sortOrder === "asc" ? (
                  <IconSortAscending size={14} />
                ) : (
                  <IconSortDescending size={14} />
                )
              }
            >
              {sortOrder === "asc" ? "Newest First" : "Oldest First"}
            </Button>
          </Group>
        </Group>

        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th
                style={{ cursor: "pointer", userSelect: "none" }}
                onClick={() => handleSort("serialNo")}
              >
                <Group gap="xs">
                  Serial No
                  {sortBy === "serialNo" && (
                    <Badge size="xs" variant="light">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </Badge>
                  )}
                </Group>
              </Table.Th>
              <Table.Th
                style={{ cursor: "pointer", userSelect: "none" }}
                onClick={() => handleSort("productName")}
              >
                <Group gap="xs">
                  Product Name
                  {sortBy === "productName" && (
                    <Badge size="xs" variant="light">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </Badge>
                  )}
                </Group>
              </Table.Th>
              <Table.Th
                style={{ cursor: "pointer", userSelect: "none" }}
                onClick={() => handleSort("productBrand")}
              >
                <Group gap="xs">
                  Brand
                  {sortBy === "productBrand" && (
                    <Badge size="xs" variant="light">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </Badge>
                  )}
                </Group>
              </Table.Th>
              <Table.Th>Buyer Address</Table.Th>
              <Table.Th
                style={{ cursor: "pointer", userSelect: "none" }}
                onClick={() => handleSort("issueDate")}
              >
                <Group gap="xs">
                  Issue Date
                  {sortBy === "issueDate" && (
                    <Badge size="xs" variant="light">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </Badge>
                  )}
                </Group>
              </Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sortedWarranties.map((warranty) => {
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

        {/* No results message */}
        {sortedWarranties.length === 0 && (
          <Center py="xl">
            <Text c="dimmed" size="lg">
              {searchQuery
                ? "No warranties found matching your search."
                : "No warranties available."}
            </Text>
          </Center>
        )}
      </Paper>
    );
  };

  // Dashboard overview
  const renderDashboard = () => (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Dashboard</Title>
          <Text c="dimmed">
            Manage your warranty business and track performance
          </Text>
          {/* Wallet Status Indicator */}
          <Group mt="sm">
            <Badge 
              color={isConnected ? "green" : "red"} 
              variant="light"
              size="lg"
            >
              {isConnected 
                ? `🔗 Mock Wallet Connected: ${currentAccount?.address?.slice(0, 6)}...${currentAccount?.address?.slice(-4)}`
                : "❌ Wallet Disconnected"
              }
            </Badge>
          </Group>
        </div>
        <Group>
          <Button
            variant="light"
            color="orange"
            onClick={() => fillFormWithSampleData(setWarrantyForm)}
          >
            🧪 Fill Test Data
          </Button>
          <Button
            size="lg"
            leftSection={<IconPlus size={18} />}
            onClick={() => setIssueModalOpened(true)}
            disabled={!isConnected}
          >
            Issue New Warranty
          </Button>
        </Group>
      </Group>

      {/* Seller-specific Stats Cards */}
      <Grid mb="xl">
        <Grid.Col span={3}>
          <Card shadow="sm" padding="lg">
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">
                  Total Warranties Issued
                </Text>
                <Text size="xl" fw={700}>
                  {issuedWarranties.length}
                </Text>
                <Text size="xs" c="green" fw={500}>
                  +12% this month
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
                  Revenue Generated
                </Text>
                <Text size="xl" fw={700}>
                  ${(issuedWarranties.length * 25).toLocaleString()}
                </Text>
                <Text size="xs" c="green" fw={500}>
                  +8% vs last month
                </Text>
              </div>
              <IconReportMoney size={24} color="#40c057" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={3}>
          <Card shadow="sm" padding="lg">
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">
                  Active Customers
                </Text>
                <Text size="xl" fw={700}>
                  {
                    [
                      ...new Set(
                        issuedWarranties.map((w) => w.buyerWalletAddress)
                      ),
                    ].length
                  }
                </Text>
                <Text size="xs" c="blue" fw={500}>
                  +5 new this week
                </Text>
              </div>
              <IconUsers size={24} color="#fd7e14" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={3}>
          <Card shadow="sm" padding="lg">
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">
                  Top Product Brand
                </Text>
                <Text size="xl" fw={700}>
                  {(() => {
                    const brandCounts = {};
                    issuedWarranties.forEach((w) => {
                      brandCounts[w.productBrand] =
                        (brandCounts[w.productBrand] || 0) + 1;
                    });
                    const topBrand = Object.entries(brandCounts).sort(
                      (a, b) => b[1] - a[1]
                    )[0];
                    return topBrand ? topBrand[0] : "N/A";
                  })()}
                </Text>
                <Text size="xs" c="dimmed" fw={500}>
                  Most popular
                </Text>
              </div>
              <IconBuildingStore size={24} color="#7c2d12" />
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Recent Warranties */}
      <WarrantyTable
        warranties={getRecentWarranties()}
        title="Recent Warranties Issued"
      />
    </Container>
  );

  // Handle loading and error states
  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh" }}>
        <SellerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <HeaderComponent
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <Center style={{ flex: 1 }}>
            <Loader size="lg" />
            <Text ml="md">Loading warranties from blockchain...</Text>
          </Center>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", height: "100vh" }}>
        <SellerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <HeaderComponent
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <Center style={{ flex: 1 }}>
            <Paper p="xl" withBorder>
              <Text color="red" size="lg" mb="md">
                ⚠️ Blockchain Connection Error
              </Text>
              <Text mb="md">{error}</Text>
              <Text size="sm" color="dimmed">
                Note: Using mock wallet. Real blockchain data will show when ZK login is integrated.
              </Text>
            </Paper>
          </Center>
        </div>
      </div>
    );
  }

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
          {activeTab === "sustainability" && (
            <SellerSustainabilityDashboard
              issuedWarranties={issuedWarranties}
            />
          )}
          {/* ✅ FIX: Use SellerSettings as a component, not a function */}
          {activeTab === "settings" && <SellerSettings />}

          {activeTab === "product-categories" && (
            <Container size="xl">
              <WarrantyTable
                warranties={issuedWarranties}
                title="All Product Categories"
              />
            </Container>
          )}

          {activeTab === "phones-gadgets" && (
            <Container size="xl">
              <WarrantyTable
                warranties={getWarrantiesByModel("iPhone")}
                title="Phones & Gadgets Warranties"
              />
            </Container>
          )}

          {activeTab === "refrigerators" && (
            <Container size="xl">
              <WarrantyTable
                warranties={getWarrantiesByModel("Refrigerator")}
                title="Refrigerator Warranties"
              />
            </Container>
          )}

          {activeTab === "air-conditioners" && (
            <Container size="xl">
              <WarrantyTable
                warranties={getWarrantiesByModel("Air Conditioner")}
                title="Air Conditioner Warranties"
              />
            </Container>
          )}

          {activeTab === "fans-cooling" && (
            <Container size="xl">
              <WarrantyTable
                warranties={getWarrantiesByModel("Fan")}
                title="Fans & Cooling Warranties"
              />
            </Container>
          )}

          {activeTab === "televisions" && (
            <Container size="xl">
              <WarrantyTable
                warranties={getWarrantiesByModel("TV")}
                title="Television Warranties"
              />
            </Container>
          )}

          {activeTab === "washing-machines" && (
            <Container size="xl">
              <WarrantyTable
                warranties={getWarrantiesByModel("Washing Machine")}
                title="Washing Machine Warranties"
              />
            </Container>
          )}

          {activeTab === "kitchen-appliances" && (
            <Container size="xl">
              <WarrantyTable
                warranties={getWarrantiesByModel("KitchenAid")}
                title="Kitchen Appliance Warranties"
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

      {/* Seller Chat Widget */}
      <SellerChatWidget />
    </div>
  );
};

export default SellerDashboard;