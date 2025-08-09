import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEnoki } from "../components/EnokiContext";

const LoginPage = () => {
  const { login, isAuthenticated, loading, setUserType, userType, completeAuthentication, logout } = useEnoki();
  const navigate = useNavigate();
  const [selectedUserType, setSelectedUserType] = useState("buyer");
  const [error, setError] = useState(null);
  const [needsUserType, setNeedsUserType] = useState(false);

  // Check if user needs to select user type
  useEffect(() => {
    const token = localStorage.getItem('google_jwt') || localStorage.getItem('id_token');
    const address = localStorage.getItem('zkLoginAddress');
    const savedUserType = localStorage.getItem('userType');
    
    if (token && address && !savedUserType && !userType) {
      console.log("[LoginPage] User has token and address but no user type - needs to complete auth");
      setNeedsUserType(true);
    }
  }, [userType]);

  if (loading) return <div>Loading...</div>;
  
  if (isAuthenticated && userType) {
    navigate(userType === "seller" ? "/seller-dashboard" : "/buyer-dashboard");
    return null;
  }

  const handleLogin = async (provider) => {
    if (!selectedUserType) {
      setError("Please select a user type (Buyer or Seller)");
      return;
    }
    try {
      setError(null);
      
      // Store the selected user type temporarily
      localStorage.setItem('pendingUserType', selectedUserType);
      setUserType(selectedUserType);
      
      // Initiate OAuth login
      await login(provider);
      // Navigation will happen after successful auth
    } catch (err) {
      setError(`Login failed: ${err.message}`);
    }
  };

  const handleCompleteAuth = async () => {
    if (!selectedUserType) {
      setError("Please select a user type (Buyer or Seller)");
      return;
    }
    
    try {
      setError(null);
      await completeAuthentication(selectedUserType);
      navigate(selectedUserType === "seller" ? "/seller-dashboard" : "/buyer-dashboard");
    } catch (err) {
      setError(err.message || "Failed to complete authentication");
      console.error("Complete authentication error:", err);
    }
  };

  const handleStartOver = () => {
    logout();
    setNeedsUserType(false);
    setError(null);
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <img
          src="/WarranChain_Logo_latest.png"
          alt="WarranChain logo"
          style={{ maxWidth: '200px', height: 'auto' }}
        />
      </div>
      
      <h1>Welcome to WarranChain</h1>
      
      {needsUserType ? (
        <>
          <p>We found your Google account, but you need to select your account type to continue.</p>
          
          {error && (
            <div style={{ color: 'red', marginBottom: '1rem', padding: '1rem', border: '1px solid red', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong>I am a:</strong>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="radio"
                  name="userType"
                  value="buyer"
                  checked={selectedUserType === "buyer"}
                  onChange={(e) => setSelectedUserType(e.target.value)}
                />
                Buyer
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="radio"
                  name="userType"
                  value="seller"
                  checked={selectedUserType === "seller"}
                  onChange={(e) => setSelectedUserType(e.target.value)}
                />
                Seller
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={handleCompleteAuth}
              style={{
                backgroundColor: '#4285f4',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Complete Setup
            </button>
            
            <button
              onClick={handleStartOver}
              style={{
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Start Over
            </button>
          </div>
        </>
      ) : (
        <>
          <p>Sign in with Google to access your dashboard</p>

          {error && (
            <div style={{ color: 'red', marginBottom: '1rem', padding: '1rem', border: '1px solid red', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong>I am a:</strong>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="radio"
                  name="userType"
                  value="buyer"
                  checked={selectedUserType === "buyer"}
                  onChange={(e) => setSelectedUserType(e.target.value)}
                />
                Buyer
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="radio"
                  name="userType"
                  value="seller"
                  checked={selectedUserType === "seller"}
                  onChange={(e) => setSelectedUserType(e.target.value)}
                />
                Seller
              </label>
            </div>
          </div>

          <button
            onClick={() => handleLogin('google')}
            style={{
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 auto',
              marginBottom: '1rem'
            }}
          >
            🔑 Sign in with Google
          </button>

          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </>
      )}
    </div>
  );
};

export default LoginPage;