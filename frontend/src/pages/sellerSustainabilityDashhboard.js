import React from "react";
import { Container, Title, Paper, Grid, Card, Group, Text } from "@mantine/core";
import {
    IconShield,
    IconReportMoney,
    IconUsers,
    IconBuildingStore,
    IconLeaf,
    IconRefresh,
    IconTools,
    IconCheck,
} from "@tabler/icons-react";
 
 const renderSustainabilityDashboard = ({issuedWarranties}) => {
    const sustainabilityData = {
      // Business Impact
      warrantiesIssued: issuedWarranties.length,
      totalRevenue: issuedWarranties.length * 25,
      customerRetention: 87, // percentage
      averageWarrantyValue: 25,

      // Environmental Impact
      eWastePrevented: 450, // kg
      carbonFootprintReduced: 2.3, // tons CO2
      energySaved: 1200, // kWh
      materialsRecycled: 85, // percentage

      // Monthly Trends
      monthlyTrends: [
        { month: "Jan", warranties: 12, revenue: 300, impact: 45 },
        { month: "Feb", warranties: 18, revenue: 450, impact: 67 },
        { month: "Mar", warranties: 15, revenue: 375, impact: 56 },
        { month: "Apr", warranties: 22, revenue: 550, impact: 82 },
        { month: "May", warranties: 25, revenue: 625, impact: 93 },
        { month: "Jun", warranties: 28, revenue: 700, impact: 105 },
      ],

      // Achievements
      achievements: [
        {
          name: "First 10 Warranties",
          earned: true,
          date: "2024-01-15",
          impact: "Started sustainability journey",
        },
        {
          name: "E-waste Hero",
          earned: true,
          date: "2024-02-20",
          impact: "Prevented 100kg e-waste",
        },
        {
          name: "Sustainable Seller",
          earned: true,
          date: "2024-03-15",
          impact: "Enabled product life extension through warranties",
        },
        {
          name: "Carbon Neutral",
          earned: false,
          progress: 75,
          impact: "Offset 2.5 tons CO2",
        },
        {
          name: "Community Leader",
          earned: false,
          progress: 60,
          impact: "Support 10 local communities",
        },
        {
          name: "Sustainability Pioneer",
          earned: false,
          progress: 45,
          impact: "Achieve 95% SDG goals",
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
            <Grid.Col span={3}>
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
            <Grid.Col span={3}>
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Group>
                  <IconRefresh size={24} color="#40c057" />
                  <div>
                    <Text size="xs" c="dimmed">
                      CO2 Reduced
                    </Text>
                    <Text size="xl" fw={700}>
                      {sustainabilityData.carbonFootprintReduced}t
                    </Text>
                    <Text size="xs" c="green">
                      Carbon neutral target
                    </Text>
                  </div>
                </Group>
              </Card>
            </Grid.Col>
            <Grid.Col span={3}>
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Group>
                  <IconShield size={24} color="#228be6" />
                  <div>
                    <Text size="xs" c="dimmed">
                      Energy Saved
                    </Text>
                    <Text size="xl" fw={700}>
                      {sustainabilityData.energySaved}kWh
                    </Text>
                    <Text size="xs" c="blue">
                      Equivalent to 10 homes
                    </Text>
                  </div>
                </Group>
              </Card>
            </Grid.Col>
            <Grid.Col span={3}>
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Group>
                  <IconTools size={24} color="#fd7e14" />
                  <div>
                    <Text size="xs" c="dimmed">
                      Materials Recycled
                    </Text>
                    <Text size="xl" fw={700}>
                      {sustainabilityData.materialsRecycled}%
                    </Text>
                    <Text size="xs" c="green">
                      Circular economy
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
              <Grid.Col span={4} key={index}>
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
                          {achievement.progress}%
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

export default renderSustainabilityDashboard;