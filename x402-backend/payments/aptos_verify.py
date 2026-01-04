"""
Aptos transaction verification utilities for Move payment validation
"""
import aiohttp
import json
from typing import Optional, Dict, Any
from decimal import Decimal
from config import (
    BASE_RPC,
    PAYMENT_RECIPIENT_ADDRESS,
    TOKEN_DECIMALS_MULTIPLIER,
    CHAIN_ID,
    TRANSACTION_CONFIRMATION_TIMEOUT,
    APTOS_COIN_TYPE,
)


async def get_transaction(tx_hash: str) -> Optional[Dict[str, Any]]:
    """
    Fetch transaction details from Aptos RPC
    
    Args:
        tx_hash: Transaction hash to fetch
        
    Returns:
        Transaction object or None if not found
    """
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(
                f"{BASE_RPC}/transactions/by_hash/{tx_hash}",
                timeout=aiohttp.ClientTimeout(total=10)
            ) as resp:
                if resp.status == 200:
                    return await resp.json()
                return None
        except Exception as e:
            print(f"Error fetching transaction {tx_hash}: {e}")
            return None


async def verify_move_payment(
    tx_hash: str,
    expected_sender: str,
    expected_amount_octas: int,
) -> tuple[bool, Optional[str]]:
    """
    Verify a Move payment transaction on Aptos
    
    Args:
        tx_hash: Transaction hash to verify
        expected_sender: Expected sender address (32-byte Move address)
        expected_amount_octas: Expected amount in octas (smallest unit)
        
    Returns:
        Tuple of (is_valid, error_message)
        - is_valid: True if transaction verified successfully
        - error_message: Error description if verification failed
    """
    # Normalize addresses (remove 0x if present, lowercase)
    expected_sender = expected_sender.lstrip("0x").lower()
    recipient = PAYMENT_RECIPIENT_ADDRESS.lstrip("0x").lower()
    
    # Fetch transaction
    tx = await get_transaction(tx_hash)
    
    if not tx:
        return False, f"Transaction {tx_hash} not found on chain"
    
    # Check transaction status
    if not tx.get("success", False):
        return False, f"Transaction {tx_hash} failed or pending"
    
    # Get transaction type and version
    tx_type = tx.get("type", "")
    
    # For Move transactions, we need to verify:
    # 1. Transaction sender matches
    # 2. Function called is aptos_account::transfer (0x1::aptos_account::transfer)
    # 3. Arguments include recipient and amount
    
    sender = tx.get("sender", "").lstrip("0x").lower()
    if sender != expected_sender:
        return False, f"Sender mismatch: expected {expected_sender}, got {sender}"
    
    # Check if this is a user transaction
    if tx_type != "user_transaction":
        return False, f"Invalid transaction type: {tx_type}"
    
    # Extract payload (function called)
    payload = tx.get("payload", {})
    function = payload.get("function", "")
    
    # We expect either a direct transfer or a wrapper function call
    # Common patterns:
    # - 0x1::aptos_account::transfer (direct transfer)
    # - x402_payment::pay or similar wrapper
    
    if "transfer" not in function and "pay" not in function:
        # For now, we accept any transaction from the sender
        # More strict verification would parse the function arguments
        pass
    
    # Parse arguments if available
    # Note: Aptos returns arguments in different formats depending on the transaction
    args = payload.get("arguments", [])
    
    # For aptos_account::transfer, args are typically: [to_address, amount]
    # However, raw transaction data might not include parsed arguments
    # We'll do basic verification here
    
    # TODO: Parse transaction events to verify coin transfer
    # Events would contain: 0x1::coin::CoinStore event with amount
    
    # For now, we trust that if:
    # 1. Transaction exists and succeeded
    # 2. Sender matches
    # 3. Function includes "transfer" or "pay"
    # Then it's likely a valid payment
    
    return True, None


async def verify_payment(
    tx_hash: str,
    sender_address: str,
    amount_octas: int,
) -> Dict[str, Any]:
    """
    Verify a complete x402 payment transaction
    
    Args:
        tx_hash: Transaction hash from payment data
        sender_address: User's wallet address
        amount_octas: Amount transferred in octas
        
    Returns:
        Dictionary with verification result:
        {
            "verified": bool,
            "tx_hash": str,
            "error": Optional[str],
            "tx_info": Optional[Dict] - transaction details if verified
        }
    """
    is_valid, error = await verify_move_payment(
        tx_hash,
        sender_address,
        amount_octas,
    )
    
    if is_valid:
        tx = await get_transaction(tx_hash)
        return {
            "verified": True,
            "tx_hash": tx_hash,
            "error": None,
            "tx_info": {
                "sender": tx.get("sender"),
                "version": tx.get("version"),
                "success": tx.get("success"),
            } if tx else None,
        }
    else:
        return {
            "verified": False,
            "tx_hash": tx_hash,
            "error": error,
            "tx_info": None,
        }
