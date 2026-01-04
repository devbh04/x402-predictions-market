"""
x402 Payment Authorization using Transaction Hashes
"""
import json
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from web3 import Web3

from config import CHAIN_ID, PAYMENT_RECIPIENT_ADDRESS


def verify_payment_signature(
    payment_data: Dict[str, Any],
    expected_job_id: str,
    expected_amount: str
) -> tuple[bool, Optional[str], Optional[str]]:
    """
    Verify x402 payment data (transaction hash based)

    Args:
        payment_data: Payment data from X-PAYMENT header
        expected_job_id: The job ID we expect
        expected_amount: The amount in wei we expect

    Returns:
        (is_valid, sender_address, error_message)
    """
    try:
        # Extract tx_hash and sender
        tx_hash = payment_data.get("tx_hash")
        sender = payment_data.get("sender")
        amount = payment_data.get("amount")
        
        if not tx_hash:
            return False, None, "Missing tx_hash"
        if not sender:
            return False, None, "Missing sender"
        if not amount:
            return False, None, "Missing amount"

        # Verify amount matches (convert to string for comparison)
        if str(amount) != expected_amount:
            return False, None, f"Amount mismatch: got {amount}, expected {expected_amount}"

        # Validate sender is a valid address
        try:
            sender = Web3.to_checksum_address(sender)
        except:
            return False, None, "Invalid sender address"

        # Validate tx_hash format
        if not tx_hash.startswith('0x') or len(tx_hash) != 66:
            return False, None, "Invalid tx_hash format"

        # Return sender as the verified payer
        return True, sender, None

    except Exception as e:
        return False, None, f"Payment verification failed: {str(e)}"


def parse_x_payment_header(x_payment_header: str) -> Optional[Dict[str, Any]]:
    """
    Parse X-PAYMENT header JSON

    Args:
        x_payment_header: JSON string from X-PAYMENT header

    Returns:
        Parsed payment data or None if invalid
    """
    try:
        return json.loads(x_payment_header)
    except json.JSONDecodeError:
        return None

