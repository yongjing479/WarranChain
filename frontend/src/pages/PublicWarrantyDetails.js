import React, { useState, useEffect } from "react";
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Badge,
  Button,
  Grid,
  Card,
  Image,
  Divider,
  Timeline,
  Stack,
  Box,
  ScrollArea,
  Alert,
  LoadingOverlay,
} from "@mantine/core";
import {
  IconCalendar,
  IconTools,
  IconBuilding,
  IconQrcode,
  IconLink,
  IconShare,
  IconDownload,
  IconClock,
  IconCheck,
  IconInfoCircle,
  IconShield,
  IconBrandTwitter,
  IconBrandFacebook,
  IconBrandWhatsapp,
} from "@tabler/icons-react";
import { useParams } from "react-router-dom";

const PublicWarrantyDetails = () => {
  const { warrantyId } = useParams();
  const [loading, setLoading] = useState(true);
  const [warranty, setWarranty] = useState(null);
  const [error, setError] = useState(null);

  // Mock warranty data - this would come from smart contract in real implementation
  const mockWarrantyData = {
    id: warrantyId || "WR-2024-001",
    productName: "iPhone 15 Pro",
    manufacturer: "Apple Inc.",
    serialNumber: "WR-2024-001",
    purchaseDate: "2024-01-15",
    purchaseLocation: "Apple Store - San Francisco",
    warrantyPeriodDays: 365,
    expiryDate: "2025-01-15",
    owner: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
    description: "Digital warranty certificate for authentic product verification and ownership tracking.",
    repairHistory: [
      {
        id: 1,
        date: "2024-03-20",
        issue: "Screen replacement due to crack",
        location: "Apple Store - San Francisco",
        status: "Completed",
        cost: 0,
        technician: "John Smith",
        notes: "Replaced with genuine Apple screen. Warranty covered the repair."
      },
      {
        id: 2,
        date: "2024-06-15",
        issue: "Battery replacement",
        location: "Apple Store - San Francisco",
        status: "Completed",
        cost: 0,
        technician: "Sarah Johnson",
        notes: "Battery health was below 80%. Free replacement under warranty."
      },
      {
        id: 3,
        date: "2024-09-10",
        issue: "Charging port repair",
        location: "Apple Store - San Francisco",
        status: "In Progress",
        cost: 50,
        technician: "Mike Wilson",
        notes: "Port was damaged due to water exposure. Partial coverage under warranty."
      }
    ],
    warrantyStatus: "valid",
    daysLeft: 45
  };

useEffect(() => {
  const fetchWarrantyFromBlockchain = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Initialize Sui client
      const suiClient = new SuiClient({
        url: getFullnodeUrl('devnet'), // or 'testnet', 'mainnet'
      });
      
      // Fetch NFT object from Sui blockchain
      const object = await suiClient.getObject({
        id: warrantyId,
        options: {
          showContent: true,
          showDisplay: true,
          showType: true,
        },
      });
      
      if (!object.data) {
        throw new Error('Warranty NFT not found on blockchain');
      }
      
      // Parse the blockchain data into your warranty format
      const warrantyData = parseBlockchainData(object.data);
      
      setWarranty(warrantyData);
      
    } catch (err) {
      console.error('Error fetching from blockchain:', err);
      setError(err.message || "Failed to load warranty from blockchain.");
    } finally {
      setLoading(false);
    }
  };

  if (warrantyId) {
    fetchWarrantyFromBlockchain();
  } else {
    setError("No warranty ID provided");
    setLoading(false);
  }
}, [warrantyId]);

const calculateDaysLeft = (expiryDate) => {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const timeDiff = expiry.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return Math.max(0, daysDiff);
};

const parseBlockchainData = (blockchainData) => {
  const content = blockchainData.content;
  
  return {
    id: blockchainData.objectId,
    productName: content.fields.product_name || 'Unknown Product',
    manufacturer: content.fields.manufacturer || 'Unknown Manufacturer',
    serialNumber: content.fields.serial_number || blockchainData.objectId,
    purchaseDate: content.fields.purchase_date || new Date().toISOString(),
    purchaseLocation: content.fields.purchase_location || 'Unknown Location',
    warrantyPeriodDays: parseInt(content.fields.warranty_period) || 365,
    expiryDate: content.fields.expiry_date || new Date(Date.now() + 365*24*60*60*1000).toISOString(),
    owner: blockchainData.owner || '0x0000',
    imageUrl: content.fields.image_url || 'https://via.placeholder.com/400',
    description: content.fields.description || 'Digital warranty certificate',
    warrantyStatus: content.fields.status || 'valid',
    daysLeft: calculateDaysLeft(content.fields.expiry_date),
    repairHistory: JSON.parse(content.fields.repair_history || '[]'),
  };
};


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getWarrantyStatusColor = (status) => {
    switch (status) {
      case "valid":
        return "green";
      case "expiring-soon":
        return "orange";
      case "expired":
        return "red";
      default:
        return "gray";
    }
  };

  const getWarrantyStatusText = (status, daysLeft) => {
    switch (status) {
      case "valid":
        return `Valid - ${daysLeft} days remaining`;
      case "expiring-soon":
        return `Expiring soon - ${daysLeft} days left`;
      case "expired":
        return "Expired";
      default:
        return "Unknown";
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this ${warranty.productName} warranty details`;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: `${warranty.productName} Warranty`,
            text: text,
            url: url,
          });
        } else {
          navigator.clipboard.writeText(url);
        }
    }
  };

  const handleDownload = () => {
    console.log("Downloading warranty certificate...");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LoadingOverlay visible={true} />
      </div>
    );
  }

  if (error) {
    return (
      <Container size="lg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Alert icon={<IconInfoCircle size={16} />} title="Error" color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  if (!warranty) {
    return (
      <Container size="lg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Alert icon={<IconInfoCircle size={16} />} title="Not Found" color="blue">
          Warranty not found. Please check the URL and try again.
        </Alert>
      </Container>
    );
  }



  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      {/* Header */}
      <Paper shadow="sm" p="xl" style={{ backgroundColor: "white", marginBottom: "2rem" }}>
        <Container size="lg">
          <Group justify="space-between" align="flex-start">
            <div>
              <Group gap="md" mb="md">
                <IconShield size={32} color="#228be6" />
                <Title order={1} c="blue">WarranChain</Title>
              </Group>
              <Text size="lg" c="dimmed">Digital Warranty Verification</Text>
            </div>
            <Group>
              <Button
                leftSection={<IconShare size={16} />}
                variant="light"
                onClick={() => handleShare()}
              >
                Share
              </Button>
              <Button
                leftSection={<IconDownload size={16} />}
                variant="light"
                onClick={handleDownload}
              >
                Download
              </Button>
            </Group>
          </Group>
        </Container>
      </Paper>

      <Container size="lg">
        {/* Warranty Header */}
        <Paper shadow="xs" p="xl" mb="lg">
          <Group justify="space-between" align="flex-start" mb="md">
            <div>
              <Title order={1} mb="xs">
                {warranty.productName}
              </Title>
              <Text size="lg" c="dimmed" mb="md">
                Warranty Certificate
              </Text>
              <Group gap="md">
                <Badge
                  color={getWarrantyStatusColor(warranty.warrantyStatus)}
                  size="lg"
                  leftSection={<IconClock size={14} />}
                >
                  {getWarrantyStatusText(warranty.warrantyStatus, warranty.daysLeft)}
                </Badge>
                <Badge color="blue" variant="light" leftSection={<IconQrcode size={14} />}>
                  {warranty.serialNumber}
                </Badge>
              </Group>
            </div>
            <Group>
              <Button.Group>
                <Button
                  variant="light"
                  leftSection={<IconBrandTwitter size={16} />}
                  onClick={() => handleShare('twitter')}
                >
                  Twitter
                </Button>
                <Button
                  variant="light"
                  leftSection={<IconBrandFacebook size={16} />}
                  onClick={() => handleShare('facebook')}
                >
                  Facebook
                </Button>
                <Button
                  variant="light"
                  leftSection={<IconBrandWhatsapp size={16} />}
                  onClick={() => handleShare('whatsapp')}
                >
                  WhatsApp
                </Button>
              </Button.Group>
            </Group>
          </Group>
        </Paper>

        <Grid gutter="lg">
          {/* Product Information */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="lg">
              {/* Product Details Card */}
              <Card shadow="xs" p="xl">
                <Title order={3} mb="lg">
                  Product Information
                </Title>
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Stack gap="md">
                      <div>
                        <Text size="sm" c="dimmed" mb={4}>
                          Product Name
                        </Text>
                        <Text fw={500}>{warranty.productName}</Text>
                      </div>
                      <div>
                        <Text size="sm" c="dimmed" mb={4}>
                          Manufacturer
                        </Text>
                        <Text fw={500}>{warranty.manufacturer}</Text>
                      </div>
                      <div>
                        <Text size="sm" c="dimmed" mb={4}>
                          Serial Number
                        </Text>
                        <Text fw={500} style={{ fontFamily: "monospace" }}>
                          {warranty.serialNumber}
                        </Text>
                      </div>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Stack gap="md">
                      <div>
                        <Text size="sm" c="dimmed" mb={4}>
                          Purchase Date
                        </Text>
                        <Text fw={500}>
                          <IconCalendar size={16} style={{ marginRight: "8px", verticalAlign: "middle" }} />
                          {formatDate(warranty.purchaseDate)}
                        </Text>
                      </div>
                      <div>
                        <Text size="sm" c="dimmed" mb={4}>
                          Purchase Location
                        </Text>
                        <Text fw={500}>
                          <IconBuilding size={16} style={{ marginRight: "8px", verticalAlign: "middle" }} />
                          {warranty.purchaseLocation}
                        </Text>
                      </div>
                      <div>
                        <Text size="sm" c="dimmed" mb={4}>
                          Warranty Period
                        </Text>
                        <Text fw={500}>{warranty.warrantyPeriodDays} days</Text>
                      </div>
                    </Stack>
                  </Grid.Col>
                </Grid>
              </Card>

              {/* Warranty Timeline */}
              <Card shadow="xs" p="xl">
                <Title order={3} mb="lg">
                  Warranty Timeline
                </Title>
                <Timeline active={2} bulletSize={24} lineWidth={2}>
                  <Timeline.Item
                    bullet={<IconCheck size={12} />}
                    title="Warranty Purchased"
                    color="green"
                  >
                    <Text size="sm" c="dimmed" mt={4}>
                      {formatDateTime(warranty.purchaseDate)}
                    </Text>
                    <Text size="sm" mt={4}>
                      Warranty activated for {warranty.productName}
                    </Text>
                  </Timeline.Item>
                  <Timeline.Item
                    bullet={<IconClock size={12} />}
                    title="Current Status"
                    color={getWarrantyStatusColor(warranty.warrantyStatus)}
                  >
                    <Text size="sm" c="dimmed" mt={4}>
                      {getWarrantyStatusText(warranty.warrantyStatus, warranty.daysLeft)}
                    </Text>
                  </Timeline.Item>
                  <Timeline.Item
                    bullet={<IconCalendar size={12} />}
                    title="Warranty Expires"
                    color="red"
                  >
                    <Text size="sm" c="dimmed" mt={4}>
                      {formatDateTime(warranty.expiryDate)}
                    </Text>
                  </Timeline.Item>
                </Timeline>
              </Card>

              {/* Repair History */}
              <Card shadow="xs" p="xl">
                <Title order={3} mb="lg">
                  Repair History
                </Title>
                {warranty.repairHistory && warranty.repairHistory.length > 0 ? (
                  <Timeline active={warranty.repairHistory.length} bulletSize={24} lineWidth={2}>
                    {warranty.repairHistory.map((repair, index) => (
                      <Timeline.Item
                        key={repair.id}
                        bullet={<IconTools size={12} />}
                        title={repair.issue}
                        color={repair.status === "Completed" ? "green" : "orange"}
                      >
                        <Text size="sm" c="dimmed" mt={4}>
                          {formatDateTime(repair.date)}
                        </Text>
                        <Text size="sm" mt={4}>
                          <strong>Location:</strong> {repair.location}
                        </Text>
                        <Text size="sm" mt={4}>
                          <strong>Technician:</strong> {repair.technician}
                        </Text>
                        <Text size="sm" mt={4}>
                          <strong>Cost:</strong> ${repair.cost}
                        </Text>
                        <Text size="sm" mt={4}>
                          <strong>Notes:</strong> {repair.notes}
                        </Text>
                        <Badge
                          color={repair.status === "Completed" ? "green" : "orange"}
                          variant="light"
                          mt={8}
                        >
                          {repair.status}
                        </Badge>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  <Alert icon={<IconInfoCircle size={16} />} color="blue">
                    No repair history available for this warranty.
                  </Alert>
                )}
              </Card>
            </Stack>
          </Grid.Col>

          {/* Sidebar */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="lg">
              {/* Product Image */}
              <Card shadow="xs" p="xl">
                <Title order={4} mb="md">
                  Product Image
                </Title>
                <Image
                  src={warranty.imageUrl}
                  alt={warranty.productName}
                  radius="md"
                  style={{ width: "100%" }}
                />
              </Card>

              {/* Warranty Details */}
              <Card shadow="xs" p="xl">
                <Title order={4} mb="md">
                  Warranty Details
                </Title>
                <Stack gap="md">
                  <div>
                    <Text size="sm" c="dimmed" mb={4}>
                      Description
                    </Text>
                    <Text size="sm">{warranty.description}</Text>
                  </div>
                  <Divider />
                  <div>
                    <Text size="sm" c="dimmed" mb={4}>
                      Owner Address
                    </Text>
                    <Text size="sm" style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                      {warranty.owner}
                    </Text>
                  </div>
                  <Divider />
                  <div>
                    <Text size="sm" c="dimmed" mb={4}>
                      NFT ID
                    </Text>
                    <Text size="sm" style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                      {warranty.id}
                    </Text>
                  </div>
                </Stack>
              </Card>

              {/* Verification Status */}
              <Card shadow="xs" p="xl">
                <Title order={4} mb="md">
                  Verification Status
                </Title>
                <Stack gap="md">
                  <Group>
                    <IconCheck size={20} color="green" />
                    <Text size="sm">Warranty verified on blockchain</Text>
                  </Group>
                  <Group>
                    <IconCheck size={20} color="green" />
                    <Text size="sm">NFT ownership confirmed</Text>
                  </Group>
                  <Group>
                    <IconCheck size={20} color="green" />
                    <Text size="sm">Repair history authenticated</Text>
                  </Group>
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>

        {/* Footer */}
        <Paper shadow="xs" p="xl" mt="xl">
          <Text size="sm" c="dimmed" ta="center">
            This warranty certificate is verified on the blockchain and cannot be tampered with.
            For more information, visit <a href="#" style={{ color: "#228be6" }}>WarranChain.com</a>
          </Text>
        </Paper>
      </Container>
    </div>
  );
};

export default PublicWarrantyDetails; 