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
import PushTokenRegistrar from "./components/PushTokenRegistrar";
import { SuiClientProvider } from "./SuiClientProvider"; 
import { getFullnodeUrl } from "@mysten/sui.js/client";

// Configure Sui network
const networkConfig = {
  testnet: { url: getFullnodeUrl("testnet") },
};

const App = () => {
  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <MockWalletProvider>
        <SuiClientProvider>
          <EnokiProvider>
            <Router>
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/buyer" element={<BuyerDashboard />} />
                <Route path="/auth/callback" element={<AuthCallBack />} />
                <Route path="/seller" element={<SellerDashboard />} />
                <Route path="/verify/:warrantyId" element={<PublicWarrantyDetails />} />
              </Routes>
              <PushTokenRegistrar />
            </Router>
          </EnokiProvider>
        </SuiClientProvider>
      </MockWalletProvider>
    </MantineProvider>

  );
};

export default App;