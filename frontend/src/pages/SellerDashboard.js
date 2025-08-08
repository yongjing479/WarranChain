import { useEnoki } from "../components/EnokiContext";
import { useNavigate } from "react-router-dom";

const SellerDashboard = () => {
  const { address, balance, logout } = useEnoki();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      <p>Welcome {typeof address === "object" ? JSON.stringify(address) : address}</p>
      <p>Balance: {balance} SUI</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};


export default SellerDashboard;