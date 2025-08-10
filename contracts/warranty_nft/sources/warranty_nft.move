module warranty_nft::warranty_nft {
    use sui::object::UID;
    use std::string::String;
    use sui::clock::Clock;
    use sui::display;
    use sui::package;
    use std::vector;
    use sui::url::{Self, Url};

    /// Warranty NFT struct with repair history and enhanced metadata
    public struct WarrantyNFT has key, store {
        id: UID,
        product_name: String,
        manufacturer: String,
        serial_number: String,
        purchase_date: u64,
        warranty_period_days: u64,
        expiry_date: u64,
        repair_history: vector<String>,
        owner: address,
        description: String,
    }

    /// One-time witness for creating display object
    public struct WARRANTY_NFT has drop {}

    /// Event emitted when a warranty NFT is created
    public struct WarrantyMinted has copy, drop {
        nft_id: object::ID,
        product_name: String,
        manufacturer: String,
        serial_number: String,
        owner: address,
        expiry_date: u64,
    }

    /// Event emitted when a warranty NFT is transferred
    public struct WarrantyTransferred has copy, drop {
        nft_id: object::ID,
        from: address,
        to: address,
        timestamp: u64,
    }

    /// Event emitted when repair is logged
    public struct RepairLogged has copy, drop {
        nft_id: object::ID,
        repair_description: String,
        repair_date: u64,
        logged_by: address,
    }

    /// Error codes
    const E_NOT_OWNER: u64 = 1;
    const E_WARRANTY_EXPIRED: u64 = 2;
    const E_INVALID_REPAIR_DESCRIPTION: u64 = 3;
    const E_EMPTY_PRODUCT_NAME: u64 = 4;
    const E_EMPTY_SERIAL_NUMBER: u64 = 5;

    /// Initialize display object for NFTs (called once on publish)
    fun init(otw: WARRANTY_NFT, ctx: &mut sui::tx_context::TxContext) {
        let keys = vector[
            std::string::utf8(b"name"),
            std::string::utf8(b"description"),
            std::string::utf8(b"external_url"),
            std::string::utf8(b"project_url"),
            std::string::utf8(b"creator"),
        ];

        let values = vector[
            std::string::utf8(b"{product_name} Warranty"),
            std::string::utf8(b"Digital warranty NFT for {product_name} (S/N: {serial_number}). Manufacturer: {manufacturer}. Valid until {expiry_date}."),
            std::string::utf8(b"https://warranty-nft.app/warranty/{id}"),
            std::string::utf8(b"https://warranty-nft.app"),
            std::string::utf8(b"Warranty NFT Platform"),
        ];

        let publisher = package::claim(otw, ctx);
        let mut display = display::new_with_fields<WarrantyNFT>(
            &publisher, keys, values, ctx
        );
        display::update_version(&mut display);

        sui::transfer::public_transfer(publisher, sui::tx_context::sender(ctx));
        sui::transfer::public_transfer(display, sui::tx_context::sender(ctx));
    }

    /// Create a new warranty NFT (mint_warranty function as specified)
    public entry fun mint_warranty(
        product_name: vector<u8>,
        manufacturer: vector<u8>,
        serial_number: vector<u8>,
        warranty_period_days: u64,
        buyer_email: vector<u8>, // For future zkLogin integration
        recipient: address,
        clock: &Clock,
        ctx: &mut sui::tx_context::TxContext
    ) {
        // Validation
        assert!(!std::vector::is_empty(&product_name), E_EMPTY_PRODUCT_NAME);
        assert!(!std::vector::is_empty(&serial_number), E_EMPTY_SERIAL_NUMBER);

        let purchase_timestamp = sui::clock::timestamp_ms(clock);
        let expiry_timestamp = purchase_timestamp + (warranty_period_days * 24 * 60 * 60 * 1000);
        
        let description = std::string::utf8(b"Digital warranty certificate for authentic product verification and ownership tracking.");

        let nft = WarrantyNFT {
            id: sui::object::new(ctx),
            product_name: std::string::utf8(product_name),
            manufacturer: std::string::utf8(manufacturer),
            serial_number: std::string::utf8(serial_number),
            purchase_date: purchase_timestamp,
            warranty_period_days,
            expiry_date: expiry_timestamp,
            repair_history: std::vector::empty(),
            owner: recipient,
            description,
        };

        let nft_id = sui::object::id(&nft);

        sui::event::emit(WarrantyMinted {
            nft_id,
            product_name: nft.product_name,
            manufacturer: nft.manufacturer,
            serial_number: nft.serial_number,
            owner: recipient,
            expiry_date: expiry_timestamp,
        });

        sui::transfer::transfer(nft, recipient);
    }

    /// Simple mint function for testing without Option types
    public entry fun mint_warranty_simple(
        product_name: vector<u8>,
        manufacturer: vector<u8>,
        serial_number: vector<u8>,
        warranty_period_days: u64,
        recipient: address,
        clock: &Clock,
        ctx: &mut sui::tx_context::TxContext
    ) {
        // Validation
        assert!(!std::vector::is_empty(&product_name), E_EMPTY_PRODUCT_NAME);
        assert!(!std::vector::is_empty(&serial_number), E_EMPTY_SERIAL_NUMBER);

        let purchase_timestamp = sui::clock::timestamp_ms(clock);
        let expiry_timestamp = purchase_timestamp + (warranty_period_days * 24 * 60 * 60 * 1000);

        let description = std::string::utf8(b"Digital warranty certificate for authentic product verification and ownership tracking.");

        let nft = WarrantyNFT {
            id: sui::object::new(ctx),
            product_name: std::string::utf8(product_name),
            manufacturer: std::string::utf8(manufacturer),
            serial_number: std::string::utf8(serial_number),
            purchase_date: purchase_timestamp,
            warranty_period_days,
            expiry_date: expiry_timestamp,
            repair_history: std::vector::empty(),
            owner: recipient,
            description,
        };

        let nft_id = sui::object::id(&nft);

        sui::event::emit(WarrantyMinted {
            nft_id,
            product_name: nft.product_name,
            manufacturer: nft.manufacturer,
            serial_number: nft.serial_number,
            owner: recipient,
            expiry_date: expiry_timestamp,
        });

        sui::transfer::transfer(nft, recipient);
    }

    /// Transfer warranty NFT to a new owner
    public entry fun transfer_warranty(
        mut nft: WarrantyNFT,
        new_owner: address,
        clock: &Clock,
        ctx: &mut sui::tx_context::TxContext
    ) {
        let current_owner = sui::tx_context::sender(ctx);
        assert!(nft.owner == current_owner, E_NOT_OWNER);

        let nft_id = sui::object::id(&nft);
        let timestamp = sui::clock::timestamp_ms(clock);

        sui::event::emit(WarrantyTransferred {
            nft_id,
            from: current_owner,
            to: new_owner,
            timestamp,
        });

        // Update the owner field
        nft.owner = new_owner;
        sui::transfer::transfer(nft, new_owner);
    }

    /// Add repair event to warranty history (for repair centers)
    public entry fun add_repair_event(
        mut nft: WarrantyNFT,
        repair_description: vector<u8>,
        clock: &Clock,
        ctx: &mut sui::tx_context::TxContext
    ) {
        // Only owner or contract deployer can add repair events
        let sender = sui::tx_context::sender(ctx);
        assert!(nft.owner == sender, E_NOT_OWNER);
        assert!(!std::vector::is_empty(&repair_description), E_INVALID_REPAIR_DESCRIPTION);

        let repair_str = std::string::utf8(repair_description);
        let repair_date = sui::clock::timestamp_ms(clock);
        let nft_id = sui::object::id(&nft);
        let owner = nft.owner; // Store owner before moving nft

        // Add repair to history
        std::vector::push_back(&mut nft.repair_history, repair_str);

        sui::event::emit(RepairLogged {
            nft_id,
            repair_description: repair_str,
            repair_date,
            logged_by: sender,
        });

        sui::transfer::transfer(nft, owner);
    }

    /// Check if warranty is still valid
    public fun is_warranty_valid(nft: &WarrantyNFT, clock: &Clock): bool {
        let current_time = sui::clock::timestamp_ms(clock);
        current_time <= nft.expiry_date
    }

    /// Get complete warranty details (enhanced for frontend)
    public fun get_warranty_details(nft: &WarrantyNFT): (
        String, // product_name
        String, // manufacturer
        String, // serial_number
        u64,    // purchase_date
        u64,    // warranty_period_days
        u64,    // expiry_date
        vector<String>, // repair_history
        address, // owner
        String   // description
    ) {
        (
            nft.product_name,
            nft.manufacturer,
            nft.serial_number,
            nft.purchase_date,
            nft.warranty_period_days,
            nft.expiry_date,
            nft.repair_history,
            nft.owner,
            nft.description
        )
    }

    /// Get warranty expiry date
    public fun get_warranty_expiry(nft: &WarrantyNFT): u64 {
        nft.expiry_date
    }

    /// Get repair history
    public fun get_repair_history(nft: &WarrantyNFT): vector<String> {
        nft.repair_history
    }

    /// Get warranty status (for QR verification)
    public fun get_warranty_status(nft: &WarrantyNFT, clock: &Clock): (bool, u64, u64) {
        let current_time = sui::clock::timestamp_ms(clock);
        let is_valid = current_time <= nft.expiry_date;
        let days_remaining = if (is_valid) {
            (nft.expiry_date - current_time) / (24 * 60 * 60 * 1000)
        } else {
            0
        };
        (is_valid, days_remaining, nft.expiry_date)
    }

    /// Check if warranty expires soon (for notifications - 7 days)
    public fun is_expiring_soon(nft: &WarrantyNFT, clock: &Clock): bool {
        let current_time = sui::clock::timestamp_ms(clock);
        let seven_days_ms = 7 * 24 * 60 * 60 * 1000;
        (nft.expiry_date > current_time) && (nft.expiry_date - current_time <= seven_days_ms)
    }
}