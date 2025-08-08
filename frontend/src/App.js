import "./styles/App.css";
import "@mantine/core/styles.css";
import '@mantine/notifications/styles.css';
import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from '@mantine/notifications';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BuyerDashboard from "./pages/BuyerDashboard.js";
import SellerDashboard from "./pages/SellerDashboard.js";
import PublicWarrantyDetails from "./pages/PublicWarrantyDetails.js";
import { MockWalletProvider } from "./contexts/MockWalletContext.js";

const theme = createTheme({
  // Customize your theme here
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <MockWalletProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<BuyerDashboard />} />
              <Route path="/seller" element={<SellerDashboard />} />
              <Route
                path="/verify/:warrantyId"
                element={<PublicWarrantyDetails />}
              />
            </Routes>
          </div>
        </Router>
      </MockWalletProvider>
    </MantineProvider>
  );
}

export default App;