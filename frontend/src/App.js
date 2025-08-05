import "./styles/App.css";
import "@mantine/core/styles.css";
import { MantineProvider, createTheme } from "@mantine/core";
import BuyerDashboard from "./pages/BuyerDashboard.js";

const theme = createTheme({
  // Customize your theme here
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <div className="App">
        <BuyerDashboard />
      </div>
    </MantineProvider>
  );
}

export default App;
