// src/App.js
import "./styles/App.css";
import "@mantine/core/styles.css";
import { MantineProvider, createTheme } from "@mantine/core";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import BuyerDashboard from "./pages/BuyerDashboard";
import PublicWarrantyDetails from "./pages/PublicWarrantyDetails";
import LoginPage from "./pages/LoginPage";
import SellerDashboard from "./pages/SellerDashboard";
import AuthCallBack from "./pages/AuthCallBack";
import { EnokiProvider } from "./components/EnokiContext";
import { SuiClientProvider } from "./SuiClientProvider"; 

const theme = createTheme();

function App() {
  return (
    <MantineProvider theme={theme}>
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
          </Router>
        </EnokiProvider>
      </SuiClientProvider>
    </MantineProvider>
  );
}

export default App;
