import React from "react";
import { Container, Title, Paper, Grid, TextInput, Select } from "@mantine/core";

const sellerSettings = () => {
    return (
      <Container size="xl">
        <Title order={2} mb="xl">
          Settings
        </Title>

        <Paper shadow="xs" p="md" mb="xl">
          <Title order={4} mb="md">
            Business Profile
          </Title>
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Business Name"
                placeholder="Your Business Name"
                defaultValue="WarranChain Electronics"
                mb="md"
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Business Email"
                placeholder="contact@yourbusiness.com"
                defaultValue="contact@warranchain.com"
                mb="md"
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                label="Business Address"
                placeholder="Your Business Address"
                defaultValue="123 Electronics Street, Tech City, TC 12345"
                mb="md"
              />
            </Grid.Col>
          </Grid>
        </Paper>

        <Paper shadow="xs" p="md" mb="xl">
          <Title order={4} mb="md">
            Warranty Settings
          </Title>
          <Grid>
            <Grid.Col span={6}>
              <Select
                label="Default Warranty Period"
                data={[
                  { value: "90", label: "90 Days" },
                  { value: "180", label: "180 Days" },
                  { value: "365", label: "1 Year" },
                  { value: "730", label: "2 Years" },
                ]}
                defaultValue="365"
                mb="md"
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Default Warranty Price"
                placeholder="25"
                defaultValue="25"
                mb="md"
              />
            </Grid.Col>
          </Grid>
        </Paper>
      </Container>
    );
  };

  export default sellerSettings;