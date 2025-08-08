// Sui Network and Contract Configuration
export const NETWORK_CONFIG = {
  devnet: {
    fullnode: 'https://fullnode.devnet.sui.io:443',
    websocket: 'wss://fullnode.devnet.sui.io:443',
    faucet: 'https://faucet.devnet.sui.io/gas'
  },
  testnet: {
    fullnode: 'https://fullnode.testnet.sui.io:443',
    websocket: 'wss://fullnode.testnet.sui.io:443',
    faucet: 'https://faucet.testnet.sui.io/gas'
  },
  mainnet: {
    fullnode: 'https://fullnode.mainnet.sui.io:443',
    websocket: 'wss://fullnode.mainnet.sui.io:443'
  }
};

// Current network (change to 'testnet' or 'mainnet' as needed)
export const CURRENT_NETWORK = 'devnet';

// Your deployed contract information
export const CONTRACT_CONFIG = {
  PACKAGE_ID: '0x6d6728889ca99b00e2b98ee5e8491b2aded4d17d474af51d3420a5b5c2763b7f',
  MODULE_NAME: 'warranty_nft',
  PUBLISHER: '0x15da713cf950a2905d394a3120ae78c8af4b53a8be72a6a712c5aa56a6ba303d'
};

// Contract function names (from your Move contract)
export const CONTRACT_FUNCTIONS = {
  MINT_WARRANTY: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::mint_warranty`,
  TRANSFER_WARRANTY: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::transfer_warranty`,
  ADD_REPAIR_EVENT: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::add_repair_event`,
  GET_WARRANTY_DETAILS: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::get_warranty_details`,
  IS_WARRANTY_VALID: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::is_warranty_valid`,
  GET_WARRANTY_STATUS: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::get_warranty_status`
};

// Event types
export const EVENT_TYPES = {
  WARRANTY_MINTED: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::WarrantyMinted`,
  WARRANTY_TRANSFERRED: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::WarrantyTransferred`,
  REPAIR_LOGGED: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::RepairLogged`
};
