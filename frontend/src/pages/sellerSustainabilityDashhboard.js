import React from "react";
import {
  Container,
  Title,
  Paper,
  Grid,
  Card,
  Group,
  Text,
} from "@mantine/core";
import {
  IconLeaf,
  IconRefresh,
  IconCheck,
} from "@tabler/icons-react";

const SellerSustainabilityDashboard = ({ issuedWarranties }) => {
  const sustainabilityData = {
    // Business Impact
    warrantiesIssued: issuedWarranties.length,
    totalRevenue: issuedWarranties.length * 25,
    customerRetention: 87, // percentage
    averageWarrantyValue: 25,

    // Environmental Impact
    eWastePrevented: issuedWarranties.length * 15, // kg
    carbonFootprintReduced: issuedWarranties.length * 0.1, // tons CO2

    // Achievements
    achievements: [
      {
        name: "First 10 Warranties",
        earned: issuedWarranties.length >= 10,
        date: "2024-01-15",
        impact: "Started sustainability journey",
      },
      {
        name: "E-waste Hero",
        earned: issuedWarranties.length >= 20,
        date: "2024-02-20",
        impact: "Prevented 300kg+ e-waste",
      },
      {
        name: "Repair Champion",
        earned: issuedWarranties.length >= 50,
        date: "2024-03-15",
        impact: "Issued 50+ warranties",
      },
      {
        name: "Sustainability Pioneer",
        earned: issuedWarranties.length >= 100,
        date: "2024-04-01",
        impact: "Issued 100+ warranties",
      },
    ],
  };

  return (
    <Container size="xl">
      <Title order={2} mb="xl">
        Sustainability Impact Dashboard
      </Title>

      {/* Environmental Impact Cards */}
      <Paper shadow="xs" p="md" mb="xl">
        <Title order={4} mb="md">
          Environmental Impact
        </Title>
        <Grid>
          <Grid.Col span={6}>
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Group>
                <IconLeaf size={24} color="#20c997" />
                <div>
                  <Text size="xs" c="dimmed">
                    E-waste Prevented
                  </Text>
                  <Text size="xl" fw={700}>
                    {sustainabilityData.eWastePrevented}kg
                  </Text>
                  <Text size="xs" c="green">
                    +15kg this month
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={6}>
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Group>
                <IconRefresh size={24} color="#40c057" />
                <div>
                  <Text size="xs" c="dimmed">
                    CO2 Reduced
                  </Text>
                  <Text size="xl" fw={700}>
                    {sustainabilityData.carbonFootprintReduced.toFixed(1)}t
                  </Text>
                  <Text size="xs" c="green">
                    Carbon neutral target
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Achievements */}
      <Paper shadow="xs" p="md">
        <Title order={4} mb="md">
          Sustainability Achievements
        </Title>
        <Grid>
          {sustainabilityData.achievements.map((achievement, index) => (
            <Grid.Col span={3} key={index}>
              <Card shadow="sm" p="md" radius="md" withBorder>
                <Group>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: achievement.earned
                        ? "#40c057"
                        : "#e9ecef",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {achievement.earned ? (
                      <IconCheck size={20} color="white" />
                    ) : (
                      <Text size="sm" fw={600}>
                        0%
                      </Text>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text size="sm" fw={600}>
                      {achievement.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {achievement.impact}
                    </Text>
                    {achievement.earned && (
                      <Text size="xs" c="green">
                        Earned {achievement.date}
                      </Text>
                    )}
                  </div>
                </Group>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default SellerSustainabilityDashboard;
