#!/bin/bash

# Mint Test Warranty NFTs Script
# Run this in your contracts/warranty_nft directory

echo "🚀 Minting test warranty NFTs..."

# Set your package ID
PACKAGE_ID="0x6d6728889ca99b00e2b98ee5e8491b2aded4d17d474af51d3420a5b5c2763b7f"

# Test recipient address (your publisher address - matches mock wallet)
RECIPIENT="0x15da713cf950a2905d394a3120ae78c8af4b53a8be72a6a712c5aa56a6ba303d"

echo "📱 Minting iPhone 15 Pro..."
sui client call \
  --package $PACKAGE_ID \
  --module warranty_nft \
  --function mint_warranty \
  --args "iPhone 15 Pro" "Apple" "IP15-2024-001" 365 "test@example.com" $RECIPIENT "vector[]" 0x6 \
  --gas-budget 20000000

echo "💻 Minting MacBook Air M2..."
sui client call \
  --package $PACKAGE_ID \
  --module warranty_nft \
  --function mint_warranty \
  --args "MacBook Air M2" "Apple" "MBA-2024-002" 730 "test@example.com" $RECIPIENT "vector[]" 0x6 \
  --gas-budget 20000000

echo "📱 Minting Samsung Galaxy S24..."
sui client call \
  --package $PACKAGE_ID \
  --module warranty_nft \
  --function mint_warranty \
  --args "Samsung Galaxy S24" "Samsung" "SGS-2024-003" 365 "test@example.com" $RECIPIENT "vector[]" 0x6 \
  --gas-budget 20000000

echo "📱 Minting iPad Pro 12.9..."
sui client call \
  --package $PACKAGE_ID \
  --module warranty_nft \
  --function mint_warranty \
  --args "iPad Pro 12.9" "Apple" "IPD-2024-004" 1095 "test@example.com" $RECIPIENT "vector[]" 0x6 \
  --gas-budget 20000000

echo "✅ Test NFTs minted! Refresh your frontend to see them."
