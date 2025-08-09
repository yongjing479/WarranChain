import React, { useState } from "react";
import { Container, Paper, Title, Text, Button, Group, LoadingOverlay, Notification } from "@mantine/core";
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
    <div className="login-page">
      <div className="page-logo" aria-hidden="true">
        <img
          src="/WarranChain_Logo_latest.png"
          alt="WarranChain logo"
          className="page-logo-img"
        />
      </div>
      <Container fluid py="xl" className="login-container">
        <Paper shadow="xl" p="xl" radius="xl" className="login-card">
          <div className="login-grid">
            <div className="left-panel">
              <div className="form-block">
                <Title mb="xs">Welcome back</Title>
                <Text c="dimmed" mb="md" className="subtitle-text">
                  Sign in with Google or GitHub to access your dashboard
                </Text>

                {error && (
                  <Notification color="red" title="Error" onClose={() => setError(null)} mb="md">
                    {error}
                  </Notification>
                )}

                <div className="user-type-group" role="radiogroup" aria-label="I am a:">
                  <div className="user-type-legend">I am a:</div>
                  <div className="user-type-options">
                    <label className="radio-option">
                      <input
                        className="radio-input"
                        type="radio"
                        name="userType"
                        value="buyer"
                        checked={userType === "buyer"}
                        onChange={(e) => setLocalUserType(e.target.value)}
                        required
                      />
                      <span className="radio-control" aria-hidden="true"></span>
                      <span className="radio-text">Buyer</span>
                    </label>
                    <label className="radio-option">
                      <input
                        className="radio-input"
                        type="radio"
                        name="userType"
                        value="seller"
                        checked={userType === "seller"}
                        onChange={(e) => setLocalUserType(e.target.value)}
                      />
                      <span className="radio-control" aria-hidden="true"></span>
                      <span className="radio-text">Seller</span>
                    </label>
                  </div>
                </div>

                <div className="auth-buttons">
                  <Button
                    leftSection={<IconBrandGoogle size={16} />}
                    size="md"
                    className="auth-button"
                    fullWidth
                    onClick={() => handleLogin("google")}
                  >
                    Sign in with Google
                  </Button>
                  <Button
                    leftSection={<IconBrandGithub size={16} />}
                    size="md"
                    className="auth-button"
                    fullWidth
                    onClick={() => handleLogin("github")}
                  >
                    Sign in with GitHub
                  </Button>
                </div>
              </div>
            </div>
            <div className="right-panel">
              <div className="login-illustration">
                <div className="illustration-blob" aria-hidden="true"></div>
                <img src="/login_page.png" alt="Welcome illustration" className="illustration-image" />
              </div>
            </div>
          </div>
        </Paper>
      </Container>
    </div>
  );
};

export default LoginPage;