// Utility functions for warranty calculations

export const calculateWarrantyInfo = (warranty) => {
  const purchaseDate = new Date(warranty.purchaseDate);
  const expiryDate = new Date(purchaseDate);
  expiryDate.setDate(purchaseDate.getDate() + warranty.warrantyPeriod);

  const now = new Date();
  const timeDiff = expiryDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

  let status;
  if (daysLeft < 0) {
    status = "expired";
  } else if (daysLeft <= 30) {
    status = "expiring-soon";
  } else {
    status = "valid";
  }

  return {
    daysLeft,
    status,
    expiryDate: expiryDate.toISOString().split("T")[0],
  };
};

export const getWarrantyStatusColor = (status) => {
  switch (status) {
    case "valid":
      return "green";
    case "expiring-soon":
      return "orange";
    case "expired":
      return "red";
    default:
      return "gray";
  }
};

export const getWarrantyStatusText = (status, daysLeft) => {
  switch (status) {
    case "valid":
      return `Valid - ${daysLeft} days remaining`;
    case "expiring-soon":
      return `Expiring soon - ${daysLeft} days left`;
    case "expired":
      return "Expired";
    default:
      return "Unknown";
  }
};

export const getCountdownText = (daysLeft) => {
  if (daysLeft < 0) {
    return "Expired";
  } else if (daysLeft === 0) {
    return "Expires today";
  } else if (daysLeft === 1) {
    return "Expires tomorrow";
  } else {
    return `${daysLeft} days left`;
  }
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Normalize Sui address to 66 characters (0x + 64 hex chars)
export const normalizeSuiAddress = (address) => {
  if (!address) return address;
  
  // If it's already the correct length, return as is
  if (address.length === 66 && address.startsWith('0x')) {
    return address;
  }
  
  // Remove 0x prefix if present
  let cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
  
  // Pad to 64 characters with leading zeros
  const paddedAddress = cleanAddress.padStart(64, '0');
  
  // Add 0x prefix back
  return '0x' + paddedAddress;
};

// Format address for display (shortened version)
export const formatSuiAddressForDisplay = (address) => {
  if (!address) return 'Unknown Address';
  
  // Normalize first to ensure we have the full address
  const fullAddress = normalizeSuiAddress(address);
  
  // Return shortened format for display
  if (fullAddress.length >= 10) {
    return `${fullAddress.slice(0, 6)}...${fullAddress.slice(-4)}`;
  }
  
  return fullAddress;
};
