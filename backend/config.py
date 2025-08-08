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
    NFT_PACKAGE_ID = os.getenv("NFT_PACKAGE_ID", "0xYOUR_PACKAGE_ID") # Define later
    WARRANTY_TYPE = f"{NFT_PACKAGE_ID}::warranty::WarrantyNFT"
    
    # Firebase Configuration
    FIREBASE_CRED_PATH = os.getenv("FIREBASE_CRED_PATH", "firebase-creds.json")
    
    # App Configuration
    DEBUG = os.getenv("DEBUG", "False") == "True"