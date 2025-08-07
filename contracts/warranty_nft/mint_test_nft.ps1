# Mint a test warranty NFT using Sui CLI
# This handles the Option types correctly

$PACKAGE_ID = "0x6d6728889ca99b00e2b98ee5e8491b2aded4d17d474af51d3420a5b5c2763b7f"
$RECIPIENT_ADDRESS = "0x15da713cf950a2905d394a3120ae78c8af4b53a8be72a6a712c5aa56a6ba303d"

Write-Host "Minting test warranty NFT..."
Write-Host "Package ID: $PACKAGE_ID"
Write-Host "Recipient: $RECIPIENT_ADDRESS"

try {
    $result = sui client call `
        --package $PACKAGE_ID `
        --module warranty_nft `
        --function mint_warranty `
        --args `
            "b'Test Product'" `
            "b'Test Manufacturer'" `
            "b'SERIAL123'" `
            365 `
            "b'test@example.com'" `
            $RECIPIENT_ADDRESS `
            "some(b'https://example.com/image.png')" `
            0x6 `
        --gas-budget 10000000

    Write-Host "✅ Mint transaction completed!"
    Write-Host $result
} catch {
    Write-Host "❌ Mint transaction failed:"
    Write-Host $_.Exception.Message
}
