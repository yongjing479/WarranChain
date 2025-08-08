import React from "react";
import {
  Modal,
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
  ScrollArea,
  Paper,
} from "@mantine/core";
import {
  IconCalendar,
  IconBuilding,
  IconQrcode,
  IconLink,
  IconShare,
  IconDownload,
  IconClock,
  IconCheck,
} from "@tabler/icons-react";
import {
  calculateWarrantyInfo,
  getWarrantyStatusColor,
  getWarrantyStatusText,
  formatDate,
  formatDateTime,
} from "../../utils/warrantyUtils";

const SellerWarrantyDetailsModal = ({ opened, onClose, warranty }) => {
  if (!warranty) return null;

  // Use the same calculation as the table
  const warrantyInfo = calculateWarrantyInfo(warranty);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${warranty.productName} Warranty`,
        text: `Check out this ${warranty.productName} warranty details`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleDownload = () => {
    console.log("Downloading warranty certificate...");
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="90%"
      title={<Title order={3}>Warranty Details</Title>}
      styles={{
        body: { padding: 0 },
        header: { padding: "1rem 1.5rem", borderBottom: "1px solid #dee2e6" },
      }}
    >
      <ScrollArea h="80vh">
        <div style={{ padding: "1.5rem" }}>
          {/* Header Section */}
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
                    color={getWarrantyStatusColor(warrantyInfo.status)}
                    size="lg"
                    leftSection={<IconClock size={14} />}
                  >
                    {getWarrantyStatusText(
                      warrantyInfo.status,
                      warrantyInfo.daysLeft
                    )}
                  </Badge>
                  <Badge
                    color="blue"
                    variant="light"
                    leftSection={<IconQrcode size={14} />}
                  >
                    {warranty.serialNo}
                  </Badge>
                </Group>
              </div>
              <Group>
                <Button
                  leftSection={<IconShare size={16} />}
                  variant="light"
                  onClick={handleShare}
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
                            Brand
                          </Text>
                          <Text fw={500}>{warranty.productBrand}</Text>
                        </div>
                        <div>
                          <Text size="sm" c="dimmed" mb={4}>
                            Serial Number
                          </Text>
                          <Text fw={500} style={{ fontFamily: "monospace" }}>
                            {warranty.serialNo}
                          </Text>
                        </div>
                      </Stack>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Stack gap="md">
                        <div>
                          <Text size="sm" c="dimmed" mb={4}>
                            Issue Date
                          </Text>
                          <Text fw={500}>
                            <IconCalendar
                              size={16}
                              style={{
                                marginRight: "8px",
                                verticalAlign: "middle",
                              }}
                            />
                            {formatDate(warranty.issueDate)}
                          </Text>
                        </div>
                        <div>
                          <Text size="sm" c="dimmed" mb={4}>
                            Purchase Location
                          </Text>
                          <Text fw={500}>
                            <IconBuilding
                              size={16}
                              style={{
                                marginRight: "8px",
                                verticalAlign: "middle",
                              }}
                            />
                            {warranty.purchaseLocation}
                          </Text>
                        </div>
                        <div>
                          <Text size="sm" c="dimmed" mb={4}>
                            Warranty Period
                          </Text>
                          <Text fw={500}>{warranty.warrantyPeriod} days</Text>
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
                      title="Warranty Issued"
                      color="green"
                    >
                      <Text size="sm" c="dimmed" mt={4}>
                        {formatDateTime(warranty.issueDate)}
                      </Text>
                      <Text size="sm" mt={4}>
                        Warranty issued for {warranty.productName}
                      </Text>
                    </Timeline.Item>
                    <Timeline.Item
                      bullet={<IconClock size={12} />}
                      title="Current Status"
                      color={getWarrantyStatusColor(warrantyInfo.status)}
                    >
                      <Text size="sm" c="dimmed" mt={4}>
                        {getWarrantyStatusText(
                          warrantyInfo.status,
                          warrantyInfo.daysLeft
                        )}
                      </Text>
                    </Timeline.Item>
                    <Timeline.Item
                      bullet={<IconCalendar size={12} />}
                      title="Warranty Expires"
                      color="red"
                    >
                      <Text size="sm" c="dimmed" mt={4}>
                        {formatDateTime(warrantyInfo.expiryDate)}
                      </Text>
                    </Timeline.Item>
                  </Timeline>
                </Card>

                {/* Product Description - Only if exists */}
                {warranty.description && (
                  <Card shadow="xs" p="xl">
                    <Title order={3} mb="lg">
                      Product Description
                    </Title>
                    <Text size="sm" style={{ lineHeight: 1.6 }}>
                      {warranty.description}
                    </Text>
                  </Card>
                )}
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
                    src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400"
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
                      <Text size="sm">
                        Digital warranty certificate for authentic product
                        verification and ownership tracking.
                      </Text>
                    </div>
                    <Divider />
                    <div>
                      <Text size="sm" c="dimmed" mb={4}>
                        Buyer Address
                      </Text>
                      <Text
                        size="sm"
                        style={{
                          fontFamily: "monospace",
                          wordBreak: "break-all",
                        }}
                      >
                        {warranty.buyerWalletAddress}
                      </Text>
                    </div>
                    <Divider />
                    <div>
                      <Text size="sm" c="dimmed" mb={4}>
                        Warranty ID
                      </Text>
                      <Text
                        size="sm"
                        style={{
                          fontFamily: "monospace",
                          wordBreak: "break-all",
                        }}
                      >
                        {warranty.serialNo}
                      </Text>
                    </div>
                  </Stack>
                </Card>

                {/* Quick Actions */}
                <Card shadow="xs" p="xl">
                  <Title order={4} mb="md">
                    Seller Actions
                  </Title>
                  <Stack gap="sm">
                    <Button
                      fullWidth
                      leftSection={<IconQrcode size={16} />}
                      variant="light"
                    >
                      Generate QR Code
                    </Button>
                    <Button
                      fullWidth
                      leftSection={<IconLink size={16} />}
                      variant="light"
                    >
                      Generate Share Link
                    </Button>
                    <Button
                      fullWidth
                      leftSection={<IconDownload size={16} />}
                      variant="light"
                    >
                      Download Certificate
                    </Button>
                  </Stack>
                </Card>
              </Stack>
            </Grid.Col>
          </Grid>
        </div>
      </ScrollArea>
    </Modal>
  );
};

export default SellerWarrantyDetailsModal;
