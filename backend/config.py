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
    NFT_PACKAGE_ID = os.getenv("NFT_PACKAGE_ID", "0x6d6728889ca99b00e2b98ee5e8491b2aded4d17d474af51d3420a5b5c2763b7f")
    MODULE_NAME = "warranty_nft"
    PUBLISHER = os.getenv("PUBLISHER", "0x15da713cf950a2905d394a3120ae78c8af4b53a8be72a6a712c5aa56a6ba303d")
    
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