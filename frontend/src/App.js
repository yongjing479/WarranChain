import "./styles/App.css";
import "@mantine/core/styles.css";
import { MantineProvider, createTheme } from "@mantine/core";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BuyerDashboard from "./pages/BuyerDashboard.js";
import PublicWarrantyDetails from "./pages/PublicWarrantyDetails.js";

const theme = createTheme({
  // Customize your theme here
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<BuyerDashboard />} />
            <Route path="/verify/:warrantyId" element={<PublicWarrantyDetails />} />
          </Routes>
        </div>
      </Router>
    </MantineProvider>
  );
}

export default App;
