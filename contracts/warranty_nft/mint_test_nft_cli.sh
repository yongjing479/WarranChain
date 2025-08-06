#!/bin/bash

# Mint a test warranty NFT using Sui CLI
# This handles the Option types correctly

PACKAGE_ID="0x49c585f34173bb5b4f529d1830a6803e6a51905a743bff0b0b2e9773313d819c"
RECIPIENT_ADDRESS="0x15da713cf950a2905d394a3120ae78c8af4b53a8be72a6a712c5aa56a6ba303d"

sui client call \
  --package $PACKAGE_ID \
  --module warranty_nft \
  --function mint_warranty \
  --args \
    "Test Product" \
    "Test Manufacturer" \
    "SERIAL123" \
    365 \
    "test@example.com" \
    $RECIPIENT_ADDRESS \
    "vector[]" \
    0x6 \
  --gas-budget 10000000
