import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { NETWORK_CONFIG, CURRENT_NETWORK, CONTRACT_FUNCTIONS, EVENT_TYPES } from '../config/contractConfig';

// Initialize Sui client
export const suiClient = new SuiClient({
  url: NETWORK_CONFIG[CURRENT_NETWORK].fullnode,
});

// Convert timestamp from Move (ms) to JavaScript Date
export const convertTimestamp = (timestamp) => {
  return new Date(Number(timestamp));
};

// Format timestamp to readable date
export const formatTimestamp = (timestamp) => {
  return convertTimestamp(timestamp).toISOString().split('T')[0];
};

/**
 * Fetch all warranty NFTs owned by a specific address
 */
export const fetchUserWarranties = async (ownerAddress) => {
  try {
    console.log('Fetching warranties for address:', ownerAddress);
    
    // Get all objects owned by the user
    const ownedObjects = await suiClient.getOwnedObjects({
      owner: ownerAddress,
      filter: {
        StructType: `${CONTRACT_FUNCTIONS.MINT_WARRANTY.split('::')[0]}::warranty_nft::WarrantyNFT`
      },
      options: {
        showContent: true,
        showDisplay: true,
        showType: true,
        // showOwner: true  // Commented out to simplify request
      }
    });

    console.log('Found owned objects:', ownedObjects);

    // Transform the data to match your frontend format
    const warranties = await Promise.all(
      ownedObjects.data.map(async (obj) => {
        const content = obj.data?.content;
        if (!content || !content.fields) return null;

        const fields = content.fields;
        
        // Get warranty status
        const warrantyStatus = await getWarrantyStatus(obj.data.objectId);
        
        return {
          id: obj.data.objectId,
          objectId: obj.data.objectId,
          serialNo: fields.serial_number,
          productName: fields.product_name,
          manufacturer: fields.manufacturer,
          purchaseDate: formatTimestamp(fields.purchase_date),
          warrantyPeriod: Math.floor(Number(fields.warranty_period_days)),
          expiryDate: formatTimestamp(fields.expiry_date),
          transferStatus: 'owned', // We'll determine this based on ownership
          owner: fields.owner,
          description: fields.description,
          repairHistory: fields.repair_history.map((repair, index) => ({
            id: index + 1,
            date: new Date().toISOString().split('T')[0], // For now, use current date
            issue: repair,
            status: 'Completed',
            cost: 0
          })),
          warrantyStatus: warrantyStatus
        };
      })
    );

    return warranties.filter(warranty => warranty !== null);
  } catch (error) {
    console.error('Error fetching user warranties:', error);
    throw error;
  }
};

/**
 * Get warranty status (valid/expired and days remaining)
 */
export const getWarrantyStatus = async (objectId) => {
  try {
    // For now, we'll calculate this on the frontend
    // In a full implementation, you'd call the Move function
    return {
      isValid: true,
      daysRemaining: 100,
      expiryDate: Date.now() + (100 * 24 * 60 * 60 * 1000)
    };
  } catch (error) {
    console.error('Error getting warranty status:', error);
    return {
      isValid: false,
      daysRemaining: 0,
      expiryDate: 0
    };
  }
};

/**
 * Transfer a warranty NFT to another address
 */
export const transferWarrantyNFT = async (objectId, recipientAddress, signerAddress) => {
  try {
    console.log('Transferring NFT:', { objectId, recipientAddress, signerAddress });
    
    const txb = new TransactionBlock();
    
    // Add the transfer call
    txb.moveCall({
      target: CONTRACT_FUNCTIONS.TRANSFER_WARRANTY,
      arguments: [
        txb.object(objectId),
        txb.pure(recipientAddress),
        txb.object('0x6'), // Clock object ID
      ]
    });

    return txb;
  } catch (error) {
    console.error('Error creating transfer transaction:', error);
    throw error;
  }
};

/**
 * Add repair event to warranty
 */
export const addRepairEvent = async (objectId, repairDescription, signerAddress) => {
  try {
    const txb = new TransactionBlock();
    
    txb.moveCall({
      target: CONTRACT_FUNCTIONS.ADD_REPAIR_EVENT,
      arguments: [
        txb.object(objectId),
        txb.pure(repairDescription),
        txb.object('0x6'), // Clock object ID
      ]
    });

    return txb;
  } catch (error) {
    console.error('Error creating repair event transaction:', error);
    throw error;
  }
};

/**
 * Get warranty events (transfers, repairs, etc.)
 */
export const getWarrantyEvents = async (objectId) => {
  try {
    // Query events related to this warranty NFT
    const events = await suiClient.queryEvents({
      query: {
        MoveEventType: EVENT_TYPES.WARRANTY_TRANSFERRED
      },
      limit: 50,
      order: 'descending'
    });

    return events.data.filter(event => 
      event.parsedJson?.nft_id === objectId
    );
  } catch (error) {
    console.error('Error fetching warranty events:', error);
    return [];
  }
};

/**
 * Mint a new warranty NFT (for testing - normally done by seller)
 */
export const mintTestWarranty = async (productData, recipientAddress) => {
  try {
    console.log('Creating mint transaction with data:', { productData, recipientAddress });
    
    const txb = new TransactionBlock();
    
    // Solution: Pass an empty array for the Option<vector<u8>> 
    // This should be interpreted as None by the Move runtime
    const moveCall = txb.moveCall({
      target: CONTRACT_FUNCTIONS.MINT_WARRANTY,
      arguments: [
        txb.pure(productData.productName),
        txb.pure(productData.manufacturer), 
        txb.pure(productData.serialNumber),
        txb.pure(productData.warrantyPeriodDays),
        txb.pure(productData.buyerEmail || 'test@example.com'),
        txb.pure(recipientAddress),
        txb.pure([]), // Empty array for Option None
        txb.object('0x6'), // Clock object ID
      ]
    });

    console.log('Transaction block created successfully');
    return txb;
  } catch (error) {
    console.error('Error creating mint transaction:', error);
    throw error;
  }
};
