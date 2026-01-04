"""
Configuration for x402 Payment System on Movement Bedrock Testnet
"""
import os
from decimal import Decimal
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Network Configuration - Movement Bedrock Testnet (Aptos-compatible)
BASE_RPC = os.getenv("BASE_RPC", "https://testnet.movementnetwork.xyz/v1")
CHAIN_ID = 250  # Movement Bedrock Testnet

# Token Configuration - MOVE (8 decimals)
TOKEN_DECIMALS = 8
TOKEN_DECIMALS_MULTIPLIER = 10 ** TOKEN_DECIMALS  # 100,000,000
APTOS_COIN_TYPE = "0x1::aptos_coin::AptosCoin"

# Payment Configuration
PAYMENT_TIMEOUT_SECONDS = int(os.getenv("PAYMENT_TIMEOUT", "300"))  # 5 minutes default
PAYMENT_RECIPIENT_ADDRESS = os.getenv(
    "RECIPIENT_ADDRESS",
    "0x1c3aee2b139c069bac975c7f87c4dce8143285f1ec7df2889f5ae1c08ae1ba53"
)

# Pricing in MOVE tokens (octas)
PRICING = {
    "market_data": 100000,      # 0.001 MOVE
    "charts": 200000,           # 0.002 MOVE
    "sentiment": 300000,        # 0.003 MOVE
    "orderbook": 150000,        # 0.0015 MOVE
    "calculator": 100000,       # 0.001 MOVE
    "activity": 150000,         # 0.0015 MOVE
    "social_post": 500000,      # 0.005 MOVE
    "social_view": 200000,      # 0.002 MOVE
    "social_comment": 100000,   # 0.001 MOVE
}

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8990"))
CORS_ORIGINS = ["*"]  # For development; restrict in production

# Job Configuration
MAX_PING_COUNT = 10
PING_TIMEOUT = 5  # seconds per ping

# Aptos transaction confirmation timeout
TRANSACTION_CONFIRMATION_TIMEOUT = 30  # seconds
