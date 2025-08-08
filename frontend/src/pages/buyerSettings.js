import React from "react";
import {
  Container,
  Title,
  Paper,
  Grid,
  TextInput,
  Select,
} from "@mantine/core";

const BuyerSettings = () => {
  return (
    <Container size="xl">
      <Title order={2} mb="xl">
        Settings
      </Title>

      <Paper shadow="xs" p="md" mb="xl">
        <Title order={4} mb="md">
          Personal Profile
        </Title>
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Full Name"
              placeholder="Your Full Name"
              defaultValue="John Doe"
              mb="md"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Email Address"
              placeholder="your.email@example.com"
              defaultValue="john.doe@example.com"
              mb="md"
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput
              label="Wallet Address"
              placeholder="Your Wallet Address"
              defaultValue="0x1234...5678"
              mb="md"
              disabled
            />
          </Grid.Col>
        </Grid>
      </Paper>

      <Paper shadow="xs" p="md" mb="xl">
        <Title order={4} mb="md">
          Notification Settings
        </Title>
        <Grid>
          <Grid.Col span={6}>
            <Select
              label="Warranty Expiry Notifications"
              data={[
                { value: "30", label: "30 days before" },
                { value: "14", label: "14 days before" },
                { value: "7", label: "7 days before" },
                { value: "1", label: "1 day before" },
              ]}
              defaultValue="7"
              mb="md"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Repair Reminder Frequency"
              data={[
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
                { value: "quarterly", label: "Quarterly" },
                { value: "never", label: "Never" },
              ]}
              defaultValue="monthly"
              mb="md"
            />
          </Grid.Col>
        </Grid>
      </Paper>
    </Container>
  );
};

export default BuyerSettings;
