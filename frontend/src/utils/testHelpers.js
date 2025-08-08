// Test helpers for blockchain integration testing

export const SAMPLE_WARRANTY_DATA = {
  productName: "iPhone 15 Pro",
  productBrand: "Apple",
  productModel: "iPhone 15 Pro 256GB",
  serialNumber: "TEST-" + Date.now().toString().slice(-6),
  buyerWalletAddress: "0x15da713cf950a2905d394a3120ae78c8af4b53a8be72a6a712c5aa56a6ba303d",
  warrantyPeriodDays: 365,
  purchaseDate: new Date().toISOString().split('T')[0],
  purchaseLocation: "Apple Store TRX",
  description: "Latest iPhone with Pro camera system - Testing blockchain integration"
};

export const MORE_SAMPLE_DATA = [
  {
    productName: "MacBook Air M2",
    productBrand: "Apple", 
    productModel: "MacBook Air M2 512GB",
    serialNumber: "MBA-" + Date.now().toString().slice(-6),
    buyerWalletAddress: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    warrantyPeriodDays: 730,
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseLocation: "Apple Store NYC",
    description: "Ultra-thin laptop with M2 chip"
  },
  {
    productName: "Samsung Galaxy S24",
    productBrand: "Samsung",
    productModel: "Galaxy S24 Ultra 1TB", 
    serialNumber: "SGS-" + Date.now().toString().slice(-6),
    buyerWalletAddress: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    warrantyPeriodDays: 365,
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseLocation: "Samsung Store KL",
    description: "Flagship Android phone with S Pen"
  }
];

// Helper function to fill form automatically (for testing)
export const fillFormWithSampleData = (setWarrantyForm, dataIndex = 0) => {
  const sampleData = dataIndex === 0 ? SAMPLE_WARRANTY_DATA : MORE_SAMPLE_DATA[dataIndex - 1];
  setWarrantyForm(sampleData);
};

// Test the entire blockchain flow
export const runFullBlockchainTest = async (mintFunction) => {
  console.log('🧪 STARTING FULL BLOCKCHAIN TEST');
  console.log('=====================================');
  
  try {
    console.log('📝 Step 1: Preparing sample warranty data...');
    const testData = { ...SAMPLE_WARRANTY_DATA };
    console.log('Sample Data:', testData);
    
    console.log('🔗 Step 2: Creating blockchain transaction...');
    const result = await mintFunction(testData);
    
    console.log('✅ Step 3: Transaction completed!');
    console.log('Result:', result);
    
    console.log('🎉 BLOCKCHAIN TEST COMPLETED SUCCESSFULLY!');
    console.log('==========================================');
    
    return result;
  } catch (error) {
    console.error('❌ BLOCKCHAIN TEST FAILED:', error);
    throw error;
  }
};

// Console helper for debugging
export const logBlockchainState = (warranties, account) => {
  console.log('🔍 CURRENT BLOCKCHAIN STATE:');
  console.log('============================');
  console.log('Connected Account:', account?.address);
  console.log('Total Warranties:', warranties.length);
  console.log('Warranties:', warranties);
  console.log('============================');
};
