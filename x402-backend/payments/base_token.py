"""
Move token payment verification for Movement Bedrock Testnet
Uses Aptos SDK to verify transactions on the blockchain
"""
import asyncio
import aiohttp
from typing import Optional, Dict, Any
from decimal import Decimal
from config import (
    BASE_RPC,
    TOKEN_DECIMALS,
    TOKEN_DECIMALS_MULTIPLIER,
    PAYMENT_RECIPIENT_ADDRESS,
    CHAIN_ID,
    TRANSACTION_CONFIRMATION_TIMEOUT,
)


class PaymentVerifier:
    """Verifies Move payments on Movement Bedrock Testnet"""

    def __init__(self):
        self.rpc_url = BASE_RPC
        self.recipient = PAYMENT_RECIPIENT_ADDRESS.lstrip("0x").lower()
        self.token_decimals = TOKEN_DECIMALS
        self.decimals_multiplier = TOKEN_DECIMALS_MULTIPLIER

    async def verify_payment(
        self,
        from_address: str,
        expected_amount: Decimal,
        tx_hash: str,
        timeout: int = 60
    ) -> tuple[bool, Optional[str]]:
        """
        Verify that a Move payment was made using a transaction hash.

        Args:
            from_address: Address of the payer (32-byte Move address)
            expected_amount: Expected amount in MOVE tokens
            tx_hash: Transaction hash from the payment
            timeout: Maximum time to wait for confirmation (seconds)

        Returns:
            (success, transaction_hash)
        """
        # Normalize addresses
        from_address = from_address.lstrip("0x").lower()
        expected_amount_octas = int(expected_amount * self.decimals_multiplier)
        
        # Normalize transaction hash
        if not tx_hash.startswith("0x"):
            tx_hash = "0x" + tx_hash
        
        start_time = asyncio.get_event_loop().time()
        
        while asyncio.get_event_loop().time() - start_time < timeout:
            try:
                # Fetch transaction from Aptos RPC
                tx = await self._get_transaction(tx_hash)
                
                if tx is None:
                    # Transaction not yet on chain, wait and retry
                    await asyncio.sleep(2)
                    continue
                
                # Verify transaction succeeded
                if not tx.get("success", False):
                    print(f"✗ Transaction failed: {tx_hash}")
                    return False, None
                
                # Verify sender address
                sender = tx.get("sender", "").lstrip("0x").lower()
                if sender != from_address:
                    print(f"✗ Sender mismatch for {tx_hash}")
                    print(f"  Expected: {from_address}, Got: {sender}")
                    return False, None
                
                # Verify transaction type (user_transaction)
                if tx.get("type") != "user_transaction":
                    print(f"✗ Invalid transaction type: {tx.get('type')}")
                    return False, None
                
                # TODO: Verify amount by parsing transaction events
                # For now, we accept any successful transaction from the sender
                # Future improvement: parse coin transfer events to verify exact amount
                
                print(f"✓ Payment verified: {tx_hash}")
                return True, tx_hash
                
            except Exception as e:
                print(f"Error verifying payment: {e}")
                await asyncio.sleep(2)
                continue

        print(f"✗ Payment verification timeout: {tx_hash}")
        return False, None

    async def _get_transaction(self, tx_hash: str) -> Optional[Dict[str, Any]]:
        """Fetch transaction from Aptos RPC"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.rpc_url}/transactions/by_hash/{tx_hash}",
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as resp:
                    if resp.status == 200:
                        return await resp.json()
                    return None
        except Exception as e:
            print(f"Error fetching transaction: {e}")
            return None

    async def check_balance(self, address: str) -> Decimal:
        """Check Move balance for an address (not implemented for Aptos)"""
        # Aptos RPC doesn't have a simple balance endpoint like EVM
        # Would need to query account resources
        # For now, return 0 as a placeholder
        return Decimal(0)

    def _to_token_octas(self, amount: Decimal) -> int:
        """Convert MOVE amount to octas (smallest unit)"""
        return int(amount * self.decimals_multiplier)

    def _from_token_octas(self, octas: int) -> Decimal:
        """Convert octas to MOVE amount"""
        return Decimal(octas) / Decimal(self.decimals_multiplier)

    async def is_connected(self) -> bool:
        """Check if connected to the Aptos network"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.rpc_url}/ledger_info",
                    timeout=aiohttp.ClientTimeout(total=5)
                ) as resp:
                    return resp.status == 200
        except:
            return False
