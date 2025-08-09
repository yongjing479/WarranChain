import "./styles/App.css";
import "@mantine/core/styles.css";
import '@mantine/notifications/styles.css';
import { MantineProvider } from "@mantine/core";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BuyerDashboard from "./pages/BuyerDashboard.js";
import SellerDashboard from "./pages/SellerDashboard.js";
import LoginPage from "./pages/LoginPage";
import AuthCallBack from "./pages/AuthCallBack";
import { EnokiProvider } from "./components/EnokiContext";
import { SuiClientProvider } from "./SuiClientProvider"; 
import { getFullnodeUrl } from "@mysten/sui.js/client";

// Configure Sui network
const networkConfig = {
  testnet: { url: getFullnodeUrl("testnet") },
};

const App = () => {
  return (
    <EnokiProvider>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <MantineProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/auth/callback" element={<AuthCallBack />} />
              <Route path="/seller-dashboard" element={<SellerDashboard />} />
              <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
            </Routes>
          </Router>
        </MantineProvider>
      </SuiClientProvider>
    </EnokiProvider>
  );
};

export default App;