#[allow(unused_variable)]
module warranty_nft::warranty_seal {
    use sui::vec_set::{Self, VecSet};
    use sui::object;
    use sui::tx_context;
    use sui::transfer;

    public struct Allowlist has key, store {
        id: object::UID,
        addresses: VecSet<address>,
    }

    public entry fun create_allowlist(ctx: &mut tx_context::TxContext) {
        let allowlist = Allowlist {
            id: object::new(ctx),
            addresses: vec_set::empty(),
        };
        transfer::share_object(allowlist);
    }

    public entry fun add_address(allowlist: &mut Allowlist, addr: address) {
        vec_set::insert(&mut allowlist.addresses, addr);
    }

    public entry fun seal_approve_warranty(allowlist: &Allowlist, ident: vector<u8>, ctx: &tx_context::TxContext) {
        let sender = tx_context::sender(ctx);
        assert!(vec_set::contains(&allowlist.addresses, &sender), 1000);
    }
}