import React from "react";
import {
  Text,
  Group,
  Button,
  Table,
  Title,
  Container,
  Paper,
} from "@mantine/core";
import { IconQrcode, IconLink } from "@tabler/icons-react";

const TransferredPage = ({
  warranties,
  formatDate,
  handleGenerateQR,
  handleGenerateURL,
  handleViewWarrantyDetails,
}) => {
  const transferredWarranties = warranties.filter(
    (w) => w.transferStatus === "transferred"
  );

  return (
    <Container size="xl">
      <Paper shadow="xs" p="md">
        <Title order={4} mb="md">
          Transferred NFTs
        </Title>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Serial No</Table.Th>
              <Table.Th>Product Name</Table.Th>
              <Table.Th>Transferred To</Table.Th>
              <Table.Th>Transfer Date</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {transferredWarranties.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text c="dimmed" ta="center" py="xl">
                    No transferred NFTs found.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              transferredWarranties.map((warranty) => (
                <Table.Tr key={warranty.id}>
                  <Table.Td>
                    <Text fw={500}>{warranty.serialNo}</Text>
                  </Table.Td>
                  <Table.Td>{warranty.productName}</Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {warranty.transferredTo?.slice(0, 10)}...
                      {warranty.transferredTo?.slice(-8)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {formatDate(warranty.transferredDate)}
                    </Text>
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
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Container>
  );
};

export default TransferredPage;
