import React from "react";
import {
  Modal,
  TextInput,
  Select,
  Textarea,
  NumberInput,
  Grid,
  Group,
  Button,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

const IssueWarrantyModal = ({
  opened,
  onClose,
  warrantyForm,
  setWarrantyForm,
  onIssueWarranty,
  electronicsBrands,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Issue New Warranty NFT"
      size="lg"
    >
      <Grid>
        <Grid.Col span={6}>
          <TextInput
            label="Product Name"
            placeholder="e.g., iPhone 15 Pro"
            value={warrantyForm.productName}
            onChange={(e) =>
              setWarrantyForm((prev) => ({
                ...prev,
                productName: e.target.value,
              }))
            }
            required
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <Select
            label="Brand"
            placeholder="Select brand"
            data={electronicsBrands}
            value={warrantyForm.productBrand}
            onChange={(value) =>
              setWarrantyForm((prev) => ({
                ...prev,
                productBrand: value,
              }))
            }
            required
            searchable
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <TextInput
            label="Product Model"
            placeholder="e.g., iPhone 15 Pro 256GB"
            value={warrantyForm.productModel}
            onChange={(e) =>
              setWarrantyForm((prev) => ({
                ...prev,
                productModel: e.target.value,
              }))
            }
            required
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <TextInput
            label="Serial Number"
            placeholder="Enter unique serial number"
            value={warrantyForm.serialNumber}
            onChange={(e) =>
              setWarrantyForm((prev) => ({
                ...prev,
                serialNumber: e.target.value,
              }))
            }
            required
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <TextInput
            label="Buyer Wallet Address"
            placeholder="0x1234567890abcdef1234567890abcdef12345678"
            value={warrantyForm.buyerWalletAddress}
            onChange={(e) =>
              setWarrantyForm((prev) => ({
                ...prev,
                buyerWalletAddress: e.target.value,
              }))
            }
            required
            description="The NFT warranty will be sent to this wallet address"
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <NumberInput
            label="Warranty Period (Days)"
            placeholder="365"
            value={warrantyForm.warrantyPeriodDays}
            onChange={(value) =>
              setWarrantyForm((prev) => ({
                ...prev,
                warrantyPeriodDays: value,
              }))
            }
            min={1}
            max={3650}
            required
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <TextInput
            label="Purchase Date"
            type="date"
            value={warrantyForm.purchaseDate}
            onChange={(e) =>
              setWarrantyForm((prev) => ({
                ...prev,
                purchaseDate: e.target.value,
              }))
            }
            required
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <TextInput
            label="Purchase Location"
            placeholder="e.g., Apple Store San Francisco"
            value={warrantyForm.purchaseLocation}
            onChange={(e) =>
              setWarrantyForm((prev) => ({
                ...prev,
                purchaseLocation: e.target.value,
              }))
            }
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Textarea
            label="Product Description"
            placeholder="Brief description of the product and its features"
            value={warrantyForm.description}
            onChange={(e) =>
              setWarrantyForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            rows={3}
          />
        </Grid.Col>
      </Grid>

      <Group justify="flex-end" mt="xl">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={onIssueWarranty}
          leftSection={<IconPlus size={16} />}
          disabled={
            !warrantyForm.productName || !warrantyForm.buyerWalletAddress
          }
        >
          Issue Warranty NFT
        </Button>
      </Group>
    </Modal>
  );
};

export default IssueWarrantyModal;
