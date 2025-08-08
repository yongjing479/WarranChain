import React, { useState } from "react";
import { useZkLogin } from "./components/ZkLoginProvider";

const SellerForm = () => {
  const { issueWarranty, loading, error } = useZkLogin();
  const [formData, setFormData] = useState({
    product: "",
    serialNumber: "",
    purchaseDate: "",
    warrantyPeriod: "",
    buyerAddress: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await issueWarranty({
      ...formData,
      purchaseDate: Math.floor(new Date(formData.purchaseDate).getTime() / 1000),
      warrantyPeriod: Number(formData.warrantyPeriod),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {loading && <div>Loading...</div>}
      <input
        type="text"
        value={formData.product}
        onChange={(e) => setFormData({ ...formData, product: e.target.value })}
        placeholder="Product Name"
      />
      <input
        type="text"
        value={formData.serialNumber}
        onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
        placeholder="Serial Number"
      />
      <input
        type="date"
        value={formData.purchaseDate}
        onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
      />
      <input
        type="number"
        value={formData.warrantyPeriod}
        onChange={(e) => setFormData({ ...formData, warrantyPeriod: e.target.value })}
        placeholder="Warranty Period (days)"
      />
      <input
        type="text"
        value={formData.buyerAddress}
        onChange={(e) => setFormData({ ...formData, buyerAddress: e.target.value })}
        placeholder="Buyer Sui Address"
      />
      <button type="submit" disabled={loading}>Issue Warranty</button>
    </form>
  );
};

export default SellerForm;