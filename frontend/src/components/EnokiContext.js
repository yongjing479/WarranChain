import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { EnokiClient } from '@mysten/enoki';

const EnokiContext = createContext(null);

export const EnokiProvider = ({ children }) => {
  // State for authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Start with loading to check existing auth
  const [userType, setUserType] = useState(null);

  // Initialize EnokiClient with your API key
  const enokiClient = useMemo(() => new EnokiClient({
    apiKey: process.env.REACT_APP_ENOKI_API_KEY, // Obtain from Mysten Labs
  }), []);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      const token = localStorage.getItem('google_jwt') || localStorage.getItem('id_token');
      const address = localStorage.getItem('zkLoginAddress');
      const savedUserType = localStorage.getItem('userType');
      
      console.log("[EnokiContext] Checking existing auth:", { 
        hasToken: !!token, 
        hasAddress: !!address, 
        userType: savedUserType 
      });
      
      // If we have a token but no address, try to create the wallet
      if (token && !address) {
        console.log("[EnokiContext] Found incomplete auth state - creating wallet...");
        try {
          // Extract email from JWT
          const jwtPayload = JSON.parse(atob(token.split('.')[1]));
          const userEmail = jwtPayload.email;
          
          // Create wallet using backend API
          const walletResponse = await fetch("http://localhost:3001/get-address-from-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: userEmail }),
          });
          console.log("[EnokiContext] Wallet response :", walletResponse);
          if (walletResponse.ok) {
            const walletData = await walletResponse.json();
            const walletAddress = walletData.address;
            
            console.log("[EnokiContext] Wallet created successfully:", walletAddress);
            localStorage.setItem('zkLoginAddress', walletAddress);
            
            setIsAuthenticated(true);
            if (savedUserType) {
              setUserType(savedUserType);
            }
          } else {
            console.error("[EnokiContext] Failed to create wallet:", walletResponse.status);
          }
        } catch (error) {
          console.error("[EnokiContext] Error creating wallet:", error);
        }
      } else if (token && address) {
        setIsAuthenticated(true);
        if (savedUserType) {
          setUserType(savedUserType);
        }
      }
      setLoading(false);
    };

    checkExistingAuth();
  }, []);

  // Login function
  const login = async (provider) => {
    setLoading(true);
    try {
      console.log("[EnokiContext] Starting login with provider:", provider);
      console.log("[EnokiContext] Current userType:", userType);
      
      // Store the user type for the callback to use
      if (userType) {
        localStorage.setItem('pendingUserType', userType);
        console.log("[EnokiContext] Stored pending userType:", userType);
      }
      
      // Generate OAuth URL for Google login (keeping your existing logic)
      if (provider === 'google') {
        const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
        const REDIRECT_URL = 'http://localhost:3000/auth/callback';
        
        const nonce = Array.from(window.crypto.getRandomValues(new Uint8Array(20)))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&response_type=id_token&redirect_uri=${encodeURIComponent(REDIRECT_URL)}&scope=openid%20email&nonce=${nonce}`;

        console.log("[EnokiContext] Redirecting to OAuth URL");
        // Redirect to OAuth provider
        window.location.href = authUrl;
      } else {
        throw new Error(`Provider ${provider} not implemented yet`);
      }
    } catch (error) {
      console.error("[EnokiContext] Login failed:", error);
      setLoading(false);
      throw error;
    }
  };

  // Handle successful authentication (called after OAuth callback)
  const handleAuthSuccess = (token, address) => {
    console.log("[EnokiContext] Authentication successful");
    setIsAuthenticated(true);
    setLoading(false);
    localStorage.setItem('google_jwt', token);
    localStorage.setItem('zkLoginAddress', address);
    if (userType) {
      localStorage.setItem('userType', userType);
    }
  };

  // Add fetchSalt method here
  const fetchSalt = async (jwt, address) => {
    console.log("[fetchSalt] Starting request with:", { jwt: jwt ? "PRESENT" : "MISSING", address });
    
    try {
      const response = await fetch("http://localhost:3001/get-salt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jwt, address }),
      });
      
      console.log("[fetchSalt] Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[fetchSalt] Request failed:", response.status, errorText);
        throw new Error(`Failed to fetch salt: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log("[fetchSalt] Success! Received salt:", data.salt ? "PRESENT" : "MISSING");
      return data.salt;
    } catch (error) {
      console.error("[fetchSalt] Error:", error);
      throw error;
    }
  };

  // Test connection function
  const testConnection = async () => {
    console.log("[frontend] Testing backend connection...");
    try {
      const response = await fetch("http://localhost:3001/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "frontend-backend connection" }),
      });
      const data = await response.json();
      console.log("[frontend] Backend response:", data);
      return data;
    } catch (error) {
      console.error("[frontend] Connection test failed:", error);
      throw error;
    }
  };

  // Test salt fetch with mock data
  const testSaltFetch = async () => {
    console.log("[testSaltFetch] Testing salt fetch with mock JWT...");
    
    // Mock JWT for testing (this won't work for real auth, but will test the flow)
    const mockJWT = "mock-jwt-token";
    const mockAddress = "0x1234567890abcdef";
    
    try {
      const salt = await fetchSalt(mockJWT, mockAddress);
      console.log("[testSaltFetch] Success! Got salt:", salt);
      return salt;
    } catch (error) {
      console.error("[testSaltFetch] Failed:", error);
      throw error;
    }
  };

  // Test salt fetch with real stored JWT (after login)
  const testRealSaltFetch = async () => {
    console.log("[testRealSaltFetch] Testing salt fetch with real stored JWT...");
    
    // Try to get real JWT from multiple possible storage locations
    const storedJWT = localStorage.getItem('google_jwt') || 
                      localStorage.getItem('id_token') || 
                      sessionStorage.getItem('google_jwt') ||
                      sessionStorage.getItem('id_token');
    const storedAddress = localStorage.getItem('zkLoginAddress');
    
    console.log("[testRealSaltFetch] Checking all JWT storage locations:");
    console.log("- localStorage.google_jwt:", localStorage.getItem('google_jwt') ? "FOUND" : "NOT FOUND");
    console.log("- localStorage.id_token:", localStorage.getItem('id_token') ? "FOUND" : "NOT FOUND");
    console.log("- sessionStorage.google_jwt:", sessionStorage.getItem('google_jwt') ? "FOUND" : "NOT FOUND");
    console.log("- sessionStorage.id_token:", sessionStorage.getItem('id_token') ? "FOUND" : "NOT FOUND");
    
    if (!storedJWT) {
      throw new Error("No JWT found in any storage location. Please login first with Google.");
    }
    
    if (!storedAddress) {
      throw new Error("No wallet address found. Please complete login flow first.");
    }
    
    console.log("[testRealSaltFetch] Using stored JWT (first 20 chars):", storedJWT.substring(0, 20) + "...");
    console.log("[testRealSaltFetch] JWT length:", storedJWT.length);
    console.log("[testRealSaltFetch] Using stored address:", storedAddress);
    
    // Log the exact request body being sent
    const requestBody = { jwt: storedJWT, address: storedAddress };
    console.log("[testRealSaltFetch] Request body being sent:", {
      jwt: requestBody.jwt ? "PRESENT (" + requestBody.jwt.length + " chars)" : "MISSING",
      address: requestBody.address || "MISSING"
    });
    
    try {
      const salt = await fetchSalt(storedJWT, storedAddress);
      console.log("[testRealSaltFetch] Success! Got real salt:", salt);
      return salt;
    } catch (error) {
      console.error("[testRealSaltFetch] Failed:", error);
      throw error;
    }
  };

  // Complete authentication when user type is missing
  const completeAuthentication = async (selectedUserType) => {
    console.log("[completeAuthentication] Completing auth with user type:", selectedUserType);
    
    const token = localStorage.getItem('google_jwt') || localStorage.getItem('id_token');
    const address = localStorage.getItem('zkLoginAddress');
    
    if (!token) {
      throw new Error("No authentication token found. Please login again.");
    }
    
    if (!address) {
      throw new Error("No wallet address found. Please complete authentication.");
    }
    
    // Store user type
    localStorage.setItem('userType', selectedUserType);
    setUserType(selectedUserType);
    setIsAuthenticated(true);
    
    console.log("[completeAuthentication] Authentication completed successfully");
    return { token, address, userType: selectedUserType };
  };

  // Logout function
  const logout = () => {
    console.log("[EnokiContext] Logging out...");
    localStorage.removeItem('google_jwt');
    localStorage.removeItem('id_token');
    localStorage.removeItem('zkLoginAddress');
    localStorage.removeItem('userType');
    localStorage.removeItem('pendingUserType');
    setIsAuthenticated(false);
    setUserType(null);
    setLoading(false);
  };

  return (
    <EnokiContext.Provider value={{ 
      enokiClient, 
      fetchSalt, 
      testConnection, 
      testSaltFetch, 
      testRealSaltFetch,
      completeAuthentication,
      logout,
      login,
      isAuthenticated,
      loading,
      setUserType,
      userType,
      handleAuthSuccess
    }}>
      {children}
    </EnokiContext.Provider>
  );
};

export const useEnoki = () => {
  const context = useContext(EnokiContext);
  if (!context) {
    throw new Error('useEnoki must be used within an EnokiProvider');
  }
  return context;
};