import React, { useState } from "react";
import { Container, Paper, Title, Text, Button, Group, Radio } from "@mantine/core";
import { IconBrandGoogle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useEnoki } from "../components/EnokiContext";

const LoginPage = () => {
  const { login, isAuthenticated, isLoading, setUserType } = useEnoki();
  const navigate = useNavigate();
  const [userType, setLocalUserType] = useState("buyer");

  if (isLoading) return <div>Loading...</div>;
  if (isAuthenticated) {
    navigate(userType === "seller" ? "/seller" : "/buyer");
    return null;
  }

  const handleLogin = async () => {
    setUserType(userType); // Save user type in context
    await login();
    navigate(userType === "seller" ? "/seller" : "/buyer");
  };

  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" p="xl" radius="md">
        <Title ta="center" mb="md">WarranChain Login</Title>
        <Text ta="center" c="dimmed" mb="xl">
          Sign in with Google to access your dashboard
        </Text>
        <Group justify="center" mb="md">
          <Radio.Group
            value={userType}
            onChange={setLocalUserType}
            name="userType"
            label="I am a:"
          >
            <Radio value="buyer" label="Buyer" />
            <Radio value="seller" label="Seller" />
          </Radio.Group>
        </Group>
        <Group justify="center">
          <Button
            leftSection={<IconBrandGoogle size={16} />}
            size="lg"
            onClick={handleLogin}
          >
            Sign in with Google
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default LoginPage;