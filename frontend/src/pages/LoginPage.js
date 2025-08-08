import React, { useState } from "react";
import { Container, Paper, Title, Text, Button, Group, Radio, LoadingOverlay, Notification } from "@mantine/core";
import { IconBrandGoogle, IconBrandGithub } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useEnoki } from "../components/EnokiContext";

const LoginPage = () => {
  const { login, isAuthenticated, loading, setUserType } = useEnoki();
  const navigate = useNavigate();
  const [userType, setLocalUserType] = useState("buyer");
  const [error, setError] = useState(null);

  if (loading) return <LoadingOverlay visible={true} overlayBlur={2} />;
  if (isAuthenticated) {
    navigate(userType === "seller" ? "/seller" : "/buyer");
    return null;
  }

  const handleLogin = async (provider) => {
    if (!userType) {
      setError("Please select a user type (Buyer or Seller)");
      return;
    }
    try {
      setError(null);
      setUserType(userType);
      await login(provider);
      navigate(userType === "seller" ? "/seller" : "/buyer");
    } catch (err) {
      setError(`Login failed: ${err.message}`);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" p="xl" radius="md">
        <Title ta="center" mb="md">WarranChain Login</Title>
        <Text ta="center" c="dimmed" mb="xl">
          Sign in with Google or GitHub to access your dashboard
        </Text>
        {error && (
          <Notification color="red" title="Error" onClose={() => setError(null)} mb="md">
            {error}
          </Notification>
        )}
        <Group justify="center" mb="md">
          <Radio.Group
            value={userType}
            onChange={setLocalUserType}
            name="userType"
            label="I am a:"
            required
          >
            <Radio value="buyer" label="Buyer" />
            <Radio value="seller" label="Seller" />
          </Radio.Group>
        </Group>
        <Group justify="center">
          <Button
            leftSection={<IconBrandGoogle size={16} />}
            size="lg"
            onClick={() => handleLogin("google")}
          >
            Sign in with Google
          </Button>
          <Button
            leftSection={<IconBrandGithub size={16} />}
            size="lg"
            onClick={() => handleLogin("github")}
          >
            Sign in with GitHub
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default LoginPage;