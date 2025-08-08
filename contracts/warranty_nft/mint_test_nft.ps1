$PACKAGE_ID = "0x6d6728889ca99b00e2b98ee5e8491b2aded4d17d474af51d3420a5b5c2763b7f"
$RECIPIENT_ADDRESS = "0x15da713cf950a2905d394a3120ae78c8af4b53a8be72a6a712c5aa56a6ba303d"

Write-Host "🚀 Minting test warranty NFT..."
Write-Host "📦 Package ID: $PACKAGE_ID"
Write-Host "👤 Recipient: $RECIPIENT_ADDRESS"

try {
    # Fixed the argument formatting
    $result = sui client call `
        --package $PACKAGE_ID `
        --module warranty_nft `
        --function mint_warranty `
        --args `
            "Test Product" `
            "Test Manufacturer" `
            "SERIAL123" `
            365 `
            "test@example.com" `
            $RECIPIENT_ADDRESS `
            "vector[]" `
            0x6 `
        --gas-budget 10000000

    Write-Host "✅ SUCCESS: NFT minted successfully!"
    Write-Host "📄 Transaction details:"
    Write-Host $result
    
} catch {
    Write-Host "❌ FAILED: Mint transaction error:"
    Write-Host $_.Exception.Message
    
    Write-Host ""
    Write-Host "💡 Common fixes:"
    Write-Host "- Check gas balance: sui client gas"
    Write-Host "- Update Sui CLI: sui client --version" 
    Write-Host "- Verify package ID is correct"
}

Write-Host ""
Write-Host "🌐 Next: Check your frontend at http://localhost:3000"