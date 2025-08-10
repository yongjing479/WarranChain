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
    SUI_RPC_URL = os.getenv("SUI_RPC_URL", "https://fullnode.testnet.sui.io:443")
    
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
    
    # Supabase Configuration (server-side)
    SUPABASE_URL = os.getenv("SUPABASE_URL", "https://azkcdpratrgjijtmsujb.supabase.co")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6a2NkcHJhdHJnamlqdG1zdWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2Njc3MjAsImV4cCI6MjA3MDI0MzcyMH0.1kH21xU0hMqnK6pzDR-tLfVlghw-3GJf7hlb84USxbE")

    # App Configuration
    DEBUG = os.getenv("DEBUG", "False") == "True"
    
    # Chatbot Configuration
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "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")

