#[test_only]
module warranty_nft::test_warranty_functions {
    use warranty_nft::warranty_nft::{Self, WarrantyNFT};
    use sui::test_scenario;
    use sui::clock;
    use std::string;

    #[test]
    fun test_mint_warranty() {
        let seller = @0xA;
        let buyer = @0xB;
        
        let mut scenario = test_scenario::begin(seller);
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
        
        test_scenario::next_tx(&mut scenario, seller);
        {
            warranty_nft::mint_warranty(
                b"iPhone 15 Pro",
                b"Apple Inc.", 
                b"ABC123456789",
                365, // 1 year warranty
                b"buyer@example.com",
                buyer,
                std::option::none(),
                &clock,
                test_scenario::ctx(&mut scenario)
            );
        };

        test_scenario::next_tx(&mut scenario, buyer);
        {
            let nft = test_scenario::take_from_sender<WarrantyNFT>(&scenario);
            let (product_name, manufacturer, serial_number, _, _, _, _, owner, _, _) = 
                warranty_nft::get_warranty_details(&nft);
            
            assert!(product_name == string::utf8(b"iPhone 15 Pro"), 1);
            assert!(manufacturer == string::utf8(b"Apple Inc."), 2);
            assert!(serial_number == string::utf8(b"ABC123456789"), 3);
            assert!(owner == buyer, 4);
            assert!(warranty_nft::is_warranty_valid(&nft, &clock), 5);

            test_scenario::return_to_sender(&scenario, nft);
        };

        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_add_repair_event() {
        let seller = @0xA;
        let buyer = @0xB;
        
        let mut scenario = test_scenario::begin(seller);
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
        
        // First mint a warranty
        test_scenario::next_tx(&mut scenario, seller);
        {
            warranty_nft::mint_warranty(
                b"iPhone 15 Pro",
                b"Apple Inc.",
                b"ABC123456789", 
                365,
                b"buyer@example.com",
                buyer,
                std::option::none(),
                &clock,
                test_scenario::ctx(&mut scenario)
            );
        };

        // Add a repair event
        test_scenario::next_tx(&mut scenario, buyer);
        {
            let nft = test_scenario::take_from_sender<WarrantyNFT>(&scenario);
            
            warranty_nft::add_repair_event(
                nft,
                b"Screen replacement",
                &clock,
                test_scenario::ctx(&mut scenario)
            );
        };

        // Verify the repair event was added
        test_scenario::next_tx(&mut scenario, buyer);
        {
            let nft = test_scenario::take_from_sender<WarrantyNFT>(&scenario);
            let (_, _, _, _, _, _, repair_history, _, _, _) = warranty_nft::get_warranty_details(&nft);
            
            assert!(std::vector::length(&repair_history) == 1, 1);

            test_scenario::return_to_sender(&scenario, nft);
        };

        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }
}
