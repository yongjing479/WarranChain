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
