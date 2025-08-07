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
import {
  calculateWarrantyInfo,
  getWarrantyStatusColor,
  formatDate,
} from "../utils/warrantyUtils";
import renderSettings from "./SellerSettings";

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
      productName: "Samsung Refrigerator",
      productBrand: "Samsung",
      productModel: "RF28T5001SR/AA",
      purchaseDate: "2024-01-15",
      warrantyPeriod: 365,
      buyerWalletAddress: "0x1234...5678",
      issueDate: "2024-01-15",
      purchaseLocation: "Best Buy SF",
      description: "French Door Refrigerator with FlexZone",
      repairHistory: [
        {
          id: 1,
          date: "2024-03-20",
          issue: "Ice maker repair",
          status: "Completed",
          cost: 0,
        },
      ],
    },
    {
      id: 2,
      serialNo: "WR-2024-002",
      productName: "LG Air Conditioner",
      productBrand: "LG",
      productModel: "LP1419IVSM",
      purchaseDate: "2024-02-10",
      warrantyPeriod: 365,
      buyerWalletAddress: "0x5678...9012",
      issueDate: "2024-02-10",
      purchaseLocation: "Home Depot NYC",
      description: "14,000 BTU Smart Wi-Fi Air Conditioner",
      repairHistory: [],
    },
    {
      id: 3,
      serialNo: "WR-2024-003",
      productName: "Dyson Fan",
      productBrand: "Dyson",
      productModel: "AM07",
      purchaseDate: "2024-03-05",
      warrantyPeriod: 365,
      buyerWalletAddress: "0x9012...3456",
      issueDate: "2024-03-05",
      purchaseLocation: "Target LA",
      description: "Air Multiplier Tower Fan",
      repairHistory: [],
    },
    {
      id: 4,
      serialNo: "WR-2024-004",
      productName: "Sony TV",
      productBrand: "Sony",
      productModel: "XBR-65A9G",
      purchaseDate: "2024-01-20",
      warrantyPeriod: 365,
      buyerWalletAddress: "0x3456...7890",
      issueDate: "2024-01-20",
      purchaseLocation: "Best Buy Chicago",
      description: "65-inch 4K OLED TV",
      repairHistory: [],
    },
    {
      id: 5,
      serialNo: "WR-2024-005",
      productName: "Whirlpool Washing Machine",
      productBrand: "Whirlpool",
      productModel: "WTW8127LC",
      purchaseDate: "2024-02-25",
      warrantyPeriod: 365,
      buyerWalletAddress: "0x7890...1234",
      issueDate: "2024-02-25",
      purchaseLocation: "Lowe's Miami",
      description: "Top Load Washer with Load & Go",
      repairHistory: [],
    },
    {
      id: 6,
      serialNo: "WR-2024-006",
      productName: "KitchenAid Mixer",
      productBrand: "KitchenAid",
      productModel: "KSM150PSER",
      purchaseDate: "2024-03-10",
      warrantyPeriod: 365,
      buyerWalletAddress: "0x2345...6789",
      issueDate: "2024-03-10",
      purchaseLocation: "Williams-Sonoma Seattle",
      description: "Professional 600 Series Stand Mixer",
      repairHistory: [],
    },
    {
      id: 7,
      serialNo: "WR-2024-007",
      productName: "iPhone 15 Pro",
      productBrand: "Apple",
      productModel: "iPhone 15 Pro 256GB",
      purchaseDate: "2024-01-15",
      warrantyPeriod: 365,
      buyerWalletAddress: "0x1234...5678",
      issueDate: "2024-01-15",
      purchaseLocation: "Apple Store SF",
      description: "Latest iPhone with Pro camera system",
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
      id: 8,
      serialNo: "WR-2024-008",
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
  ]);

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

    setIssuedWarranties((prev) => [newWarranty, ...prev]); // Add to top instead of bottom
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
        </div>
        <Button
          size="lg"
          leftSection={<IconPlus size={18} />}
          onClick={() => setIssueModalOpened(true)}
        >
          Issue New Warranty
        </Button>
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
          {activeTab === "settings" && renderSettings()}

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
