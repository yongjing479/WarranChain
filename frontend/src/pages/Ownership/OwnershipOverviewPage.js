import React from "react";
import {
  Text,
  Group,
  Badge,
  Button,
  Table,
  Title,
  Container,
  Paper,
  Grid,
  Card,
} from "@mantine/core";
import {
  IconQrcode,
  IconLink,
  IconShield,
  IconTransfer,
  IconDownload,
} from "@tabler/icons-react";

const OwnershipOverviewPage = ({
  warranties,
  calculateWarrantyInfo,
  getCountdownText,
  formatDate,
  handleGenerateQR,
  handleGenerateURL,
  handleViewWarrantyDetails,
}) => {
  const ownedWarranties = warranties.filter(
    (w) => w.transferStatus === "owned"
  );
  const receivedWarranties = warranties.filter(
    (w) => w.transferStatus === "received"
  );
  const transferredWarranties = warranties.filter(
    (w) => w.transferStatus === "transferred"
  );

  return (
    <Container size="xl">
      {/* Summary Cards */}
      <Grid mb="lg">
        <Grid.Col span={4}>
          <Card shadow="sm" padding="lg">
            <Group>
              <IconShield size={24} color="#228be6" />
              <div>
                <Text size="lg" fw={600}>
                  Owned
                </Text>
                <Text size="xl" fw={700} c="blue">
                  {ownedWarranties.length}
                </Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card shadow="sm" padding="lg">
            <Group>
              <IconDownload size={24} color="#40c057" />
              <div>
                <Text size="lg" fw={600}>
                  Received
                </Text>
                <Text size="xl" fw={700} c="green">
                  {receivedWarranties.length}
                </Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card shadow="sm" padding="lg">
            <Group>
              <IconTransfer size={24} color="#fd7e14" />
              <div>
                <Text size="lg" fw={600}>
                  Transferred
                </Text>
                <Text size="xl" fw={700} c="orange">
                  {transferredWarranties.length}
                </Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      {/* All Products Table */}
      <Paper shadow="xs" p="md">
        <Title order={4} mb="md">
          All Products Overview
        </Title>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Serial No</Table.Th>
              <Table.Th>Product Name</Table.Th>
              <Table.Th>Ownership Status</Table.Th>
              <Table.Th>Warranty Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {warranties.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text c="dimmed" ta="center" py="xl">
                    No warranties found. Connect your wallet to view your NFTs.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              warranties.map((warranty) => {
                const warrantyInfo = calculateWarrantyInfo(warranty);
                const getOwnershipBadge = () => {
                  if (warranty.transferStatus === "received") {
                    return (
                      <Badge color="green" variant="light">
                        Received
                      </Badge>
                    );
                  } else if (warranty.transferStatus === "transferred") {
                    return (
                      <Badge color="orange" variant="light">
                        Transferred
                      </Badge>
                    );
                  } else if (
                    warranty.transferStatus === "owned" ||
                    !warranty.transferStatus
                  ) {
                    return (
                      <Badge color="blue" variant="light">
                        Owned
                      </Badge>
                    );
                  } else {
                    return (
                      <Badge color="gray" variant="light">
                        Unknown
                      </Badge>
                    );
                  }
                };

                return (
                  <Table.Tr key={warranty.id}>
                    <Table.Td>
                      <Text fw={500}>{warranty.serialNo}</Text>
                    </Table.Td>
                    <Table.Td>{warranty.productName}</Table.Td>
                    <Table.Td>{getOwnershipBadge()}</Table.Td>
                    <Table.Td>
                      <Badge
                        color={
                          warrantyInfo.status === "valid" ? "green" : "red"
                        }
                        variant="light"
                      >
                        {warrantyInfo.status}
                      </Badge>
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
    </Container>
  );
};

export default OwnershipOverviewPage;
