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
} from "@mantine/core";
import {
  IconQrcode,
  IconLink,
  IconCheck,
  IconTools,
} from "@tabler/icons-react";
import FooterComponent from "../components/Footer";
import HeaderComponent from "../components/Header";
import CustomNavbar from "../components/Buyer/Sidebar";
import QRCodeModal from "../components/Buyer/QRCodeModal";
import URLModal from "../components/Buyer/URLModal";
import TransferModal from "../components/Buyer/TransferModal";
import NFTTransferPage from "./Ownership/NFTTransferPage";
import OwnershipOverviewPage from "./Ownership/OwnershipOverviewPage";
import TransferredPage from "./Ownership/TransferredPage";
import ReceivedPage from "./Ownership/ReceivedPage";
import WarrantyDetailsModal from "../components/Buyer/WarrantyDetailsModal";
import {
  calculateWarrantyInfo,
  getWarrantyStatusColor,
  getWarrantyStatusText,
  getCountdownText,
  formatDate,
} from "../utils/warrantyUtils";

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

  // Updated Mock data for warranties with realistic structure and transfer status
  const [warranties, setWarranties] = useState([
    {
      id: 1,
      serialNo: "WR-2024-001",
      productName: "iPhone 15 Pro",
      purchaseDate: "2024-01-15",
      warrantyPeriod: 365,
      transferStatus: "owned",
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
      transferStatus: "transferred",
      transferredTo:
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      transferredDate: "2024-12-01",
      repairHistory: [],
    },
    {
      id: 3,
      serialNo: "WR-2023-003",
      productName: "Samsung Galaxy S24",
      purchaseDate: "2023-12-01",
      warrantyPeriod: 365,
      transferStatus: "received",
      transferredFrom:
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      transferredDate: "2024-11-15",
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
      productName: "iPad Pro 12.9",
      purchaseDate: "2024-09-20",
      warrantyPeriod: 1095,
      transferStatus: "owned",
      repairHistory: [],
    },
  ]);

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
    // This is where you'll integrate with SUI wallet
    // For now, we'll simulate the transfer
    console.log(
      "Transferring NFT:",
      warranty.serialNo,
      "to:",
      recipientAddress
    );

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update warranty transfer status in state
    setWarranties((prevWarranties) =>
      prevWarranties.map((w) =>
        w.id === warranty.id
          ? {
              ...w,
              transferStatus: "transferred",
              transferredTo: recipientAddress,
              transferredDate: new Date().toISOString().split("T")[0],
            }
          : w
      )
    );

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

    // Remove notification after 5 seconds
    setTimeout(() => setTransferNotification(null), 5000);
  };

  // Handle viewing warranty details
  const handleViewWarrantyDetails = (warranty) => {
    setSelectedWarrantyForDetails(warranty);
    setShowWarrantyDetailsModal(true);
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
          })}
        </Table.Tbody>
      </Table>
    </Paper>
  );

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <CustomNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
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
    </div>
  );
};

export default BuyerDashboard;
