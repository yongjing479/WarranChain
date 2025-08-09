# config.py
"""Configuration settings for the WarranChain backend.
This module loads environment variables and sets up configuration constants
for the application, including Sui RPC URL, NFT package ID, Firebase credentials,
and debug mode.
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Sui Configuration
    SUI_RPC_URL = os.getenv("SUI_RPC_URL", "https://fullnode.devnet.sui.io:443")
    
    # Contract Configuration (matching frontend contractConfig.js)
    NFT_PACKAGE_ID = os.getenv("NFT_PACKAGE_ID", "0x4ec65b90d688d71fd9b02a25b7a55bc22834b3fff953568aed46066a9fff07bd")
    MODULE_NAME = "warranty_nft"
    PUBLISHER = os.getenv("PUBLISHER", "0x4290b769f1ed2d52615f0cfc2a63276d2ab480b0664e93caf7d61025a4245024")
    
    # Event types for sustainability tracking
    EVENT_TYPES = {
        "WARRANTY_MINTED": f"{NFT_PACKAGE_ID}::{MODULE_NAME}::WarrantyMinted",
        "WARRANTY_TRANSFERRED": f"{NFT_PACKAGE_ID}::{MODULE_NAME}::WarrantyTransferred",
        "REPAIR_LOGGED": f"{NFT_PACKAGE_ID}::{MODULE_NAME}::RepairLogged"
    }
    
    # Firebase Configuration
    FIREBASE_CRED_PATH = os.getenv("FIREBASE_CRED_PATH", "firebase-creds.json")
    
    # App Configuration
    DEBUG = os.getenv("DEBUG", "False") == "True"
    
    # Chatbot Configuration
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "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")