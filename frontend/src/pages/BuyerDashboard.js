import React, { useState } from "react";
import {
  Text,
  Group,
  Badge,
  Button,
  Table,
  Title,
  Paper,
  Notification,
  Loader,
  Center,
  Grid,
  Card,
} from "@mantine/core";
import {
  IconQrcode,
  IconLink,
  IconTools,
  IconWallet,
  IconShield,
  IconReportMoney,
  IconCheck,
} from "@tabler/icons-react";
import FooterComponent from "../components/Footer";
import HeaderComponent from "../components/Header";
import BuyerSidebar from "../components/Buyer/Sidebar";
import QRCodeModal from "../components/Buyer/QRCodeModal";
import URLModal from "../components/Buyer/URLModal";
import TransferModal from "../components/Buyer/TransferModal";
import NFTTransferPage from "./Ownership/NFTTransferPage";
import OwnershipOverviewPage from "./Ownership/OwnershipOverviewPage";
import TransferredPage from "./Ownership/TransferredPage";
import ReceivedPage from "./Ownership/ReceivedPage";
import WarrantyDetailsModal from "../components/Buyer/WarrantyDetailsModal";
import BuyerSustainabilityDashboard from "./buyerSustainabilityDashboard";
import BuyerSettings from "./buyerSettings";
import {
  calculateWarrantyInfo,
  getWarrantyStatusColor,
  getWarrantyStatusText,
  getCountdownText,
  formatDate,
} from "../utils/warrantyUtils";

import { useWarranties } from "../hooks/useWarranties";
import ChatWidget from "../components/Buyer/BuyerChatWidget";

const BuyerDashboard = () => {
  const [activeTab, setActiveTab] = useState("ownership-overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [showURLModal, setShowURLModal] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferNotification, setTransferNotification] = useState(null);
  const [showWarrantyDetailsModal, setShowWarrantyDetailsModal] =
    useState(false);
  const [selectedWarrantyForDetails, setSelectedWarrantyForDetails] =
    useState(null);

  // Use the real blockchain data instead of mock data
  const {
    warranties,
    loading,
    error,
    transferWarranty,
    addRepair,
    refreshWarranties,
    isConnected,
    currentAccount,
    connect,
    disconnect,
    mockAddresses,
    switchAccount,
  } = useWarranties();

  // Filter warranties based on search query
  const filteredWarranties = warranties.filter(
    (warranty) =>
      warranty.serialNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warranty.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  // Handle transfer initiation
  const handleTransferNFT = (warranty) => {
    setSelectedWarranty(warranty);
    setShowTransferModal(true);
  };

  // Handle actual transfer
  const handleTransfer = async (warranty, recipientAddress) => {
    if (!isConnected) {
      setTransferNotification({
        type: "error",
        title: "Wallet Not Connected",
        message: "Please connect your wallet to transfer NFTs.",
      });
      return;
    }

    try {
      console.log(
        "Transferring NFT:",
        warranty.serialNo,
        "to:",
        recipientAddress
      );

      // Use the real blockchain transfer function
      await transferWarranty(warranty, recipientAddress);

      // Show success notification
      setTransferNotification({
        type: "success",
        title: "Transfer Successful",
        message: `NFT for ${
          warranty.productName
        } has been transferred to ${recipientAddress.slice(
          0,
          10
        )}...${recipientAddress.slice(-8)}`,
      });

      // Refresh warranties to get updated state
      refreshWarranties();
    } catch (error) {
      console.error("Transfer failed:", error);
      setTransferNotification({
        type: "error",
        title: "Transfer Failed",
        message: error.message || "Failed to transfer NFT. Please try again.",
      });
    }

    // Remove notification after 5 seconds
    setTimeout(() => setTransferNotification(null), 5000);
  };

  // Handle viewing warranty details
  const handleViewWarrantyDetails = (warranty) => {
    setSelectedWarrantyForDetails(warranty);
    setShowWarrantyDetailsModal(true);
  };

  // Warranty list table
  const WarrantyListTable = () => {
    // Show loading state
    if (loading) {
      return (
        <Paper shadow="xs" p="md">
          <Center>
            <Loader size="lg" />
            <Text ml="md">Loading warranties...</Text>
          </Center>
        </Paper>
      );
    }

    // Show error state
    if (error) {
      return (
        <Paper shadow="xs" p="md">
          <Center>
            <Text c="red">Error loading warranties: {error}</Text>
            <Button ml="md" onClick={refreshWarranties}>
              Retry
            </Button>
          </Center>
        </Paper>
      );
    }

    // Show wallet connection prompt
    if (!isConnected) {
      return (
        <Paper shadow="xs" p="md">
          <Center>
            <div style={{ textAlign: "center" }}>
              <IconWallet size={48} color="gray" />
              <Text mt="md" size="lg">
                Connect Your Wallet
              </Text>
              <Text c="dimmed" mb="md">
                Connect your wallet to view your warranty NFTs
              </Text>
              <Button onClick={connect}>Connect Wallet</Button>
            </div>
          </Center>
        </Paper>
      );
    }

    return (
      <Paper shadow="xs" p="md">
        <Group justify="space-between" mb="md">
          <Title order={2}>Dashboard</Title>
          <Group>
            <Text size="sm" c="dimmed">
              Connected: {currentAccount?.address?.slice(0, 6)}...
              {currentAccount?.address?.slice(-4)}
            </Text>
            <Button
              size="xs"
              variant="light"
              onClick={refreshWarranties}
              loading={loading}
            >
              Refresh
            </Button>
            <Button size="xs" variant="light" onClick={disconnect}>
              Disconnect
            </Button>
          </Group>
        </Group>

        {/* Buyer-specific Stats Cards */}
        <Grid mb="xl">
          <Grid.Col span={3}>
            <Card shadow="sm" padding="lg">
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed">
                    Total Warranties Owned
                  </Text>
                  <Text size="xl" fw={700}>
                    {warranties.length}
                  </Text>
                  <Text size="xs" c="green" fw={500}>
                    +2 this month
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
                      warranties.filter((w) => {
                        const info = calculateWarrantyInfo(w);
                        return info.status === "valid";
                      }).length
                    }
                  </Text>
                  <Text size="xs" c="blue" fw={500}>
                    {warranties.filter((w) => {
                      const info = calculateWarrantyInfo(w);
                      return info.status === "valid";
                    }).length > 0
                      ? "Valid"
                      : "Expired"}
                  </Text>
                </div>
                <IconCheck size={24} color="#40c057" />
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={3}>
            <Card shadow="sm" padding="lg">
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed">
                    Total Repairs
                  </Text>
                  <Text size="xl" fw={700}>
                    {warranties.reduce(
                      (total, w) => total + w.repairHistory.length,
                      0
                    )}
                  </Text>
                  <Text size="xs" c="orange" fw={500}>
                    Last:{" "}
                    {(() => {
                      const allRepairs = warranties.flatMap(
                        (w) => w.repairHistory
                      );
                      if (allRepairs.length === 0) return "None";
                      const lastRepair = allRepairs.sort(
                        (a, b) => new Date(b.date) - new Date(a.date)
                      )[0];
                      return formatDate(lastRepair.date);
                    })()}
                  </Text>
                </div>
                <IconTools size={24} color="#fd7e14" />
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={3}>
            <Card shadow="sm" padding="lg">
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed">
                    Money Saved
                  </Text>
                  <Text size="xl" fw={700}>
                    $
                    {warranties
                      .reduce(
                        (total, w) =>
                          total +
                          w.repairHistory.reduce(
                            (repairTotal, repair) =>
                              repairTotal + (repair.cost || 0),
                            0
                          ),
                        0
                      )
                      .toLocaleString()}
                  </Text>
                  <Text size="xs" c="green" fw={500}>
                    Through warranty coverage
                  </Text>
                </div>
                <IconReportMoney size={24} color="#40c057" />
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        <Title order={4} mb="md">
          Warranty List ({filteredWarranties.length})
        </Title>

        {/* Mock account switcher for testing */}
        <Group mb="md">
          <Text size="sm">Test accounts:</Text>
          {mockAddresses.map((address, index) => (
            <Button
              key={address}
              size="xs"
              variant={currentAccount?.address === address ? "filled" : "light"}
              onClick={() => switchAccount(index)}
            >
              Account {index + 1}
            </Button>
          ))}
        </Group>

        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Serial No</Table.Th>
              <Table.Th>Product Name</Table.Th>
              <Table.Th>Purchase Date</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Repairs</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredWarranties.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text c="dimmed" ta="center" py="xl">
                    {searchQuery
                      ? "No warranties match your search."
                      : "No warranties found. Connect your wallet to view your NFTs."}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              filteredWarranties.map((warranty) => {
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
                        color={getWarrantyStatusColor(warrantyInfo.status)}
                        variant="light"
                      >
                        {getWarrantyStatusText(
                          warrantyInfo.status,
                          warrantyInfo.daysLeft
                        )}
                      </Badge>
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
              })
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    );
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <BuyerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <HeaderComponent
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <div style={{ flex: 1, padding: "1rem", overflow: "auto" }}>
          {activeTab === "warranty-list" && <WarrantyListTable />}
          {activeTab === "ownership-overview" && (
            <OwnershipOverviewPage
              warranties={filteredWarranties}
              calculateWarrantyInfo={calculateWarrantyInfo}
              getCountdownText={getCountdownText}
              formatDate={formatDate}
              handleGenerateQR={handleGenerateQR}
              handleGenerateURL={handleGenerateURL}
              handleViewWarrantyDetails={handleViewWarrantyDetails}
            />
          )}
          {activeTab === "transfer-nft" && (
            <NFTTransferPage
              warranties={warranties}
              calculateWarrantyInfo={calculateWarrantyInfo}
              getCountdownText={getCountdownText}
              getWarrantyStatusText={getWarrantyStatusText}
              formatDate={formatDate}
              handleGenerateQR={handleGenerateQR}
              handleGenerateURL={handleGenerateURL}
              handleTransferNFT={handleTransferNFT}
            />
          )}
          {activeTab === "transferred" && (
            <TransferredPage
              warranties={filteredWarranties}
              calculateWarrantyInfo={calculateWarrantyInfo}
              getCountdownText={getCountdownText}
              formatDate={formatDate}
              handleGenerateQR={handleGenerateQR}
              handleGenerateURL={handleGenerateURL}
              handleViewWarrantyDetails={handleViewWarrantyDetails}
            />
          )}
          {activeTab === "received" && (
            <ReceivedPage
              warranties={filteredWarranties}
              calculateWarrantyInfo={calculateWarrantyInfo}
              getCountdownText={getCountdownText}
              formatDate={formatDate}
              handleGenerateQR={handleGenerateQR}
              handleGenerateURL={handleGenerateURL}
              handleViewWarrantyDetails={handleViewWarrantyDetails}
            />
          )}
          {activeTab === "sustainability" && (
            <BuyerSustainabilityDashboard warranties={warranties} />
          )}
          {activeTab === "settings" && <BuyerSettings />}
        </div>
        <FooterComponent />
      </div>

      {/* Existing modals */}
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
      <TransferModal
        opened={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        selectedWarranty={selectedWarranty}
        onTransfer={handleTransfer}
      />

      {/* New Warranty Details Modal */}
      <WarrantyDetailsModal
        opened={showWarrantyDetailsModal}
        onClose={() => setShowWarrantyDetailsModal(false)}
        warranty={selectedWarrantyForDetails}
      />

      {transferNotification && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 1000,
          }}
        >
          <Notification
            icon={<IconCheck size={16} />}
            color="green"
            title={transferNotification.title}
            onClose={() => setTransferNotification(null)}
          >
            {transferNotification.message}
          </Notification>
        </div>
      )}
      <ChatWidget />
    </div>
  );
};

export default BuyerDashboard;
