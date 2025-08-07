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
} from "@mantine/core";
import {
  IconQrcode,
  IconLink,
  IconTransfer,
  IconTools,
} from "@tabler/icons-react";

const NFTTransferPage = ({
  warranties,
  calculateWarrantyInfo,
  getCountdownText,
  formatDate,
  handleGenerateQR,
  handleGenerateURL,
  handleTransferNFT,
}) => {
  // Filter warranties to show both owned and received NFTs (can be transferred)
  const transferableWarranties = warranties.filter(
    (w) => w.transferStatus === "owned" || w.transferStatus === "received"
  );

  return (
    <Container size="xl">
      <Paper shadow="xs" p="md">
        <Title order={4} mb="md">
          Transfer NFT - Available Products
        </Title>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Serial No</Table.Th>
              <Table.Th>Product Name</Table.Th>
              <Table.Th>Ownership Status</Table.Th>
              <Table.Th>Warranty Status</Table.Th>
              <Table.Th>Repairs</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {transferableWarranties.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text c="dimmed" ta="center" py="xl">
                    No products available for transfer.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              transferableWarranties.map((warranty) => {
                const warrantyInfo = calculateWarrantyInfo(warranty);

                const getOwnershipBadge = () => {
                  if (warranty.transferStatus === "received") {
                    return (
                      <Badge color="green" variant="light">
                        Received
                      </Badge>
                    );
                  } else if (warranty.transferStatus === "owned") {
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
                        {getCountdownText(warrantyInfo.daysLeft)}
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
                          leftSection={<IconTransfer size={14} />}
                          variant="filled"
                          color="blue"
                          onClick={() => handleTransferNFT(warranty)}
                        >
                          Transfer
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

export default NFTTransferPage;
