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
import { IconQrcode, IconLink } from "@tabler/icons-react";

const ReceivedPage = ({
  warranties,
  calculateWarrantyInfo,
  getCountdownText,
  formatDate,
  handleGenerateQR,
  handleGenerateURL,
}) => {
  const receivedWarranties = warranties.filter(
    (w) => w.transferStatus === "received"
  );

  return (
    <Container size="xl">
      <Paper shadow="xs" p="md">
        <Title order={4} mb="md">
          Received NFTs
        </Title>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Serial No</Table.Th>
              <Table.Th>Product Name</Table.Th>
              <Table.Th>Received From</Table.Th>
              <Table.Th>Receive Date</Table.Th>
              <Table.Th>Warranty Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {receivedWarranties.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text c="dimmed" ta="center" py="xl">
                    No received NFTs found.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              receivedWarranties.map((warranty) => {
                const warrantyInfo = calculateWarrantyInfo(warranty);
                return (
                  <Table.Tr key={warranty.id}>
                    <Table.Td>
                      <Text fw={500}>{warranty.serialNo}</Text>
                    </Table.Td>
                    <Table.Td>{warranty.productName}</Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {warranty.transferredFrom?.slice(0, 10)}...
                        {warranty.transferredFrom?.slice(-8)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {formatDate(warranty.transferredDate)}
                      </Text>
                    </Table.Td>
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

export default ReceivedPage;
