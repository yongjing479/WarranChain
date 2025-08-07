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
  IconShield,
  IconTools,
  IconLeaf,
  IconRefresh,
  IconCheck,
} from "@tabler/icons-react";

const BuyerSustainabilityDashboard = ({ warranties }) => {
  // Enhanced buyer-focused sustainability calculations
  const calculateSustainabilityImpact = () => {
    if (warranties.length === 0) {
      return {
        warrantiesOwned: 0,
        repairEvents: 0,
        eWastePrevented: 0,
        carbonFootprintReduced: 0,
      };
    }

    // Calculate based on actual warranty data
    const totalRepairEvents = warranties.reduce(
      (total, w) => total + w.repairHistory.length,
      0
    );

    // E-waste calculation based on product types and repair history
    const eWastePerWarranty = 12; // kg per warranty (more realistic)
    const repairBonus = totalRepairEvents * 3; // 3kg bonus per repair (repair vs replace)
    const eWastePrevented = warranties.length * eWastePerWarranty + repairBonus;

    // Carbon footprint calculation
    const carbonPerWarranty = 0.8; // tons CO2 per warranty
    const repairCarbonBonus = totalRepairEvents * 0.2; // 0.2 tons per repair
    const carbonFootprintReduced =
      warranties.length * carbonPerWarranty + repairCarbonBonus;

    return {
      warrantiesOwned: warranties.length,
      repairEvents: totalRepairEvents,
      eWastePrevented: Math.round(eWastePrevented),
      carbonFootprintReduced: Math.round(carbonFootprintReduced * 10) / 10,
    };
  };

  const sustainabilityData = calculateSustainabilityImpact();

  // Personal Achievements with dynamic logic
  const achievements = [
    {
      name: "First Warranty",
      earned: sustainabilityData.warrantiesOwned > 0,
      date: "2024-01-15",
      impact: "Started sustainable journey",
    },
    {
      name: "Repair Advocate",
      earned: sustainabilityData.repairEvents >= 3,
      date: "2024-02-20",
      impact: `Used repair services ${sustainabilityData.repairEvents} times`,
    },
    {
      name: "E-waste Warrior",
      earned: sustainabilityData.eWastePrevented >= 75,
      date: "2024-03-15",
      impact: `Prevented ${sustainabilityData.eWastePrevented}kg e-waste`,
    },
    {
      name: "Warranty Collector",
      earned: sustainabilityData.warrantiesOwned >= 5,
      date: "2024-04-01",
      impact: `Own ${sustainabilityData.warrantiesOwned} warranties`,
    },
    {
      name: "Carbon Crusher",
      earned: sustainabilityData.carbonFootprintReduced >= 5,
      date: "2024-05-01",
      impact: `Reduced ${sustainabilityData.carbonFootprintReduced}t CO2`,
    },
  ];

  return (
    <Container size="xl">
      <Title order={2} mb="xl">
        Personal Sustainability Impact
      </Title>

      {/* Core Impact Cards */}
      <Paper shadow="xs" p="md" mb="xl">
        <Title order={4} mb="md">
          Warranty Impact
        </Title>
        <Grid>
          <Grid.Col span={3}>
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Group>
                <IconShield size={24} color="#228be6" />
                <div>
                  <Text size="xs" c="dimmed">
                    Warranties Owned
                  </Text>
                  <Text size="xl" fw={700}>
                    {sustainabilityData.warrantiesOwned}
                  </Text>
                  <Text size="xs" c="green">
                    Protecting your investments
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
                    Repair Events
                  </Text>
                  <Text size="xl" fw={700}>
                    {sustainabilityData.repairEvents}
                  </Text>
                  <Text size="xs" c="blue">
                    Repair over replace
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>
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
                    Through warranty protection
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
                    Carbon footprint offset
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
          Personal Achievements
        </Title>
        <Grid>
          {achievements.map((achievement, index) => (
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

export default BuyerSustainabilityDashboard;
