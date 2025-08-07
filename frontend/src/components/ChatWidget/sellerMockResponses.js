// Pre-defined responses for seller-specific questions
export const sellerResponses = {
  "how to issue": {
    text: "To issue a new warranty: 1) Click 'Issue New Warranty' button, 2) Fill in product details (name, brand, model), 3) Enter buyer's wallet address, 4) Set warranty period, 5) Click 'Issue Warranty' to create the NFT.",
    quickActions: ["What details are required?", "How to find buyer address?"],
  },
  "warranty details": {
    text: "Warranty details include: product name, brand, model, serial number, buyer address, purchase date, warranty period, and description. You can view all details in the warranty table or click 'Details' button.",
    quickActions: ["How to edit warranty?", "What is serial number?"],
  },
  "buyer address": {
    text: "Buyer wallet address is the recipient's blockchain wallet where the warranty NFT will be sent. Make sure to get the correct address from your customer before issuing the warranty.",
    quickActions: ["How to verify address?", "What if address is wrong?"],
  },
  "warranty period": {
    text: "Warranty period is the number of days the warranty is valid. Common periods: 365 days (1 year), 730 days (2 years), or custom duration. Set this based on your product warranty policy.",
    quickActions: ["Standard warranty periods", "How to calculate period?"],
  },
  "product brands": {
    text: "Supported brands include: Apple, Samsung, Sony, LG, Dell, HP, Lenovo, Asus, and more. You can select from the dropdown or add custom brands when issuing warranties.",
    quickActions: ["How to add new brand?", "Popular brands"],
  },
  "warranty status": {
    text: "Warranty status shows: 'Valid' (active warranty), 'Expired' (past warranty period), or 'Expiring Soon' (within 30 days). Monitor status to track warranty lifecycle.",
    quickActions: ["How to check expiry?", "What happens when expired?"],
  },
  "qr codes": {
    text: "QR codes are generated for each warranty you issue. Customers can scan these codes to view warranty details. Click the 'QR' button next to any warranty to generate a shareable QR code.",
    quickActions: ["How QR codes work", "Where to find QR codes"],
  },
  "url sharing": {
    text: "URL sharing creates a direct link to warranty details. Click the 'URL' button next to any warranty to generate a shareable link that customers can use to view warranty information.",
    quickActions: ["How URLs work", "Benefits of URL sharing"],
  },
  "dashboard stats": {
    text: "Dashboard shows: Total warranties issued, Active warranties, Expired warranties, and Product brands count. These stats help you track your warranty business performance.",
    quickActions: ["How to improve stats?", "Understanding metrics"],
  },
  "product models": {
    text: "Product models help organize warranties by device type. Use tabs like 'iPhone Models', 'MacBook Models', 'iPad Models', 'Samsung Models' to filter and manage specific product categories.",
    quickActions: ["How to add new model?", "Model organization"],
  },
  "help": {
    text: "I can help you with: issuing warranties, managing warranty details, understanding buyer addresses, warranty periods, product brands, warranty status, QR codes, URL sharing, dashboard stats, and product models. Just ask!",
    quickActions: ["How to use system", "Navigation help"],
  },
}; 