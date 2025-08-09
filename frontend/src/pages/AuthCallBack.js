import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEnoki } from "../components/EnokiContext";

const AuthCallBack = () => {
  const navigate = useNavigate();
  const { enokiClient, handleAuthSuccess, userType } = useEnoki();
  const [status, setStatus] = useState("Processing authentication...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("[AuthCallback] Starting callback processing...");
        
        // Extract id_token from URL hash
        const hash = window.location.hash;
        console.log("[AuthCallback] URL hash:", hash);
        
        const params = new URLSearchParams(hash.replace('#', ''));
        const idToken = params.get('id_token');
        const error = params.get('error');

        if (error) {
          console.error("[AuthCallback] OAuth error:", error);
          setStatus(`Authentication error: ${error}`);
          return;
        }

        if (!idToken) {
          console.error("[AuthCallback] No id_token found in URL hash");
          setStatus("Authentication failed: No token received");
          return;
        }

        console.log("[AuthCallback] JWT token found, length:", idToken.length);
        setStatus("Creating wallet...");

        // Check if this is a popup callback (has opener) or redirect callback
        if (window.opener) {
          console.log("[AuthCallback] Popup flow: sending token to parent window");
          window.opener.postMessage({ id_token: idToken }, window.location.origin);
          window.close();
          return;
        }

        // Redirect flow: create wallet directly here
        console.log("[AuthCallback] Redirect flow: creating wallet...");
        
        // Store JWT first
        localStorage.setItem('google_jwt', idToken);
        localStorage.setItem('id_token', idToken); // Keep for compatibility
        console.log("[AuthCallback] Stored JWT in localStorage");

        // Extract email from JWT for wallet creation
        const jwtPayload = JSON.parse(atob(idToken.split('.')[1]));
        const userEmail = jwtPayload.email;
        console.log("[AuthCallback] Extracted email from JWT:", userEmail);

        // Create wallet using backend API (since frontend EnokiClient doesn't have createZkLogin)
        console.log("[AuthCallback] Creating wallet via backend API...");
        const walletResponse = await fetch("http://localhost:3001/get-address-from-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userEmail }),
        }).catch(fetchError => {
          console.error("[AuthCallback] Fetch error:", fetchError);
          throw new Error(`Network error: ${fetchError.message}`);
        });

        console.log("[AuthCallback] Wallet response status:", walletResponse.status);
        console.log("[AuthCallback] Wallet response ok:", walletResponse.ok);
        console.log("[AuthCallback] Wallet response status:", walletResponse);

        if (!walletResponse.ok) {
          const errorText = await walletResponse.text();
          console.error("[AuthCallback] Error response:", errorText);
          throw new Error(`Failed to create wallet: ${walletResponse.status} ${errorText}`);
        }

        const walletData = await walletResponse.json();
        const walletAddress = walletData.address;
        
        console.log("[AuthCallback] Wallet created successfully:", walletAddress);
        
        // Store wallet address
        localStorage.setItem('zkLoginAddress', walletAddress);
        console.log("[AuthCallback] Stored wallet address:", walletAddress);

        // Store user type if available
        const savedUserType = localStorage.getItem('pendingUserType') || userType;
        if (savedUserType) {
          localStorage.setItem('userType', savedUserType);
          localStorage.removeItem('pendingUserType'); // Clean up
        }

        // Update context state
        if (handleAuthSuccess) {
          handleAuthSuccess(idToken, walletAddress);
        }

        setStatus("Authentication successful! Redirecting...");
        
        // Navigate to appropriate dashboard
        const targetRoute = savedUserType === "seller" ? "/seller-dashboard" : "/buyer-dashboard";
        console.log("[AuthCallback] Redirecting to:", targetRoute);
        
        setTimeout(() => {
          navigate(targetRoute);
        }, 1000);

      } catch (error) {
        console.error("[AuthCallback] Error during callback processing:", error);
        setStatus(`Authentication failed: ${error.message}`);
      }
    };

    handleCallback();
  }, [navigate, enokiClient, handleAuthSuccess, userType]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <div style={{ marginBottom: '2rem' }}>
        <img
          src="/WarranChain_Logo_latest.png"
          alt="WarranChain logo"
          style={{ maxWidth: '200px', height: 'auto' }}
        />
      </div>
      <h2>Authentication</h2>
      <p>{status}</p>
      <div style={{ marginTop: '2rem' }}>
        🔄 Please wait while we set up your account...
      </div>
    </div>
  );
};

export default AuthCallBack;