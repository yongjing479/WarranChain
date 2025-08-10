"""Supabase + OneSignal notification service.

This module stores web push tokens in Supabase and sends notifications via
OneSignal for warranty-related events, such as expiring warranties.
"""

import os
import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

import requests
from apscheduler.schedulers.background import BackgroundScheduler
from config import Config

try:
    from supabase import create_client
except Exception:  # pragma: no cover - package may not be installed in some envs
    create_client = None

ONESIGNAL_API_URL = "https://onesignal.com/api/v1/notifications"

def _get_supabase_client():
    if not create_client:
        return None
    if not Config.SUPABASE_URL or not Config.SUPABASE_SERVICE_KEY:
        return None
    return create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_KEY)


def register_token(wallet_address: str, push_token: str, provider: str = "onesignal") -> bool:
    """Upsert push token in Supabase table `push_tokens`.

    Expected table schema (recommendation):
      - wallet_address: text (pk or unique)
      - push_token: text
      - provider: text
      - created_at: timestamptz default now()
      - updated_at: timestamptz default now() (with trigger or app-managed)
    """
    sb = _get_supabase_client()
    if not sb:
        print("Supabase not configured; cannot register push token.")
        return False
    try:
        # Upsert by wallet_address
        payload = {"wallet_address": wallet_address, "push_token": push_token, "provider": provider}
        sb.table("push_tokens").upsert(payload, on_conflict="wallet_address").execute()
        return True
    except Exception as exc:
        print(f"register_token failed: {exc}")
        return False


def _send_onesignal_notification(token: str, title: str, body: str) -> bool:
    if not Config.ONESIGNAL_APP_ID or not Config.ONESIGNAL_API_KEY:
        print("OneSignal not configured; skipping push send.")
        return False
    try:
        # Send to specific external user id or token via include_player_ids
        # Here we assume push_token is a OneSignal player_id
        headers = {
            "Authorization": f"Basic {Config.ONESIGNAL_API_KEY}",
            "Content-Type": "application/json",
        }
        data = {
            "app_id": Config.ONESIGNAL_APP_ID,
            "include_player_ids": [token],
            "headings": {"en": title},
            "contents": {"en": body},
        }
        resp = requests.post(ONESIGNAL_API_URL, json=data, headers=headers, timeout=15)
        if resp.status_code >= 200 and resp.status_code < 300:
            return True
        print(f"OneSignal send failed: {resp.status_code} {resp.text}")
        return False
    except Exception as exc:
        print(f"_send_onesignal_notification error: {exc}")
        return False


def send_notification(push_token: str, title: str, body: str) -> bool:
    return _send_onesignal_notification(push_token, title, body)


def create_in_app_notification(wallet_address: str, title: str, body: str, metadata: Optional[Dict[str, Any]] = None) -> bool:
    """Insert an in-app notification row into Supabase `notifications` table.

    Recommended schema:
      - id: uuid default uuid_generate_v4()
      - wallet_address: text
      - title: text
      - body: text
      - metadata: jsonb nullable
      - is_read: boolean default false
      - created_at: timestamptz default now()
    """
    sb = _get_supabase_client()
    if not sb:
        return False
    try:
        payload = {
            "wallet_address": wallet_address,
            "title": title,
            "body": body,
            "metadata": metadata or {},
            "is_read": False,
        }
        sb.table("notifications").insert(payload).execute()
        return True
    except Exception as exc:
        print(f"create_in_app_notification failed: {exc}")
        return False

def _fetch_warranties_due_within_days(days: int = 7) -> List[Dict[str, Any]]:
    """Fetch NFTs from Supabase `warranty_nfts` table due within the given days.

    Expected table schema (recommendation):
      - id: uuid
      - nft_id: text
      - owner_address: text
      - product_name: text
      - expiry_date_ms: bigint (ms since epoch)
    """
    sb = _get_supabase_client()
    if not sb:
        return []
    try:
        now_ms = int(time.time() * 1000)
        threshold_ms = now_ms + days * 86400000
        # Supabase query: expiry_date_ms between now and threshold
        resp = (
            sb.table("warranty_nfts")
              .select("nft_id, owner_address, product_name, expiry_date_ms")
              .lte("expiry_date_ms", threshold_ms)
              .gte("expiry_date_ms", now_ms)
              .execute()
        )
        return resp.data or []
    except Exception as exc:
        print(f"_fetch_warranties_due_within_days failed: {exc}")
        return []


def _get_push_token_for_wallet(wallet_address: str) -> Optional[str]:
    sb = _get_supabase_client()
    if not sb:
        return None
    try:
        resp = sb.table("push_tokens").select("push_token").eq("wallet_address", wallet_address).limit(1).execute()
        if resp.data:
            return resp.data[0].get("push_token")
        return None
    except Exception as exc:
        print(f"_get_push_token_for_wallet failed: {exc}")
        return None


def check_expiring_warranties(days: int = 7) -> int:
    """Check for warranties expiring within `days` and notify owners.

    Returns number of notifications attempted.
    """
    notifications_attempted = 0
    try:
        due_nfts = _fetch_warranties_due_within_days(days)
        for nft in due_nfts:
            owner = nft.get("owner_address") or ""
            product = nft.get("product_name") or "your product"
            expiry_ms = int(nft.get("expiry_date_ms") or 0)
            if not owner or not expiry_ms:
                continue
            token = _get_push_token_for_wallet(owner)
            if not token:
                continue
            ms_left = max(0, expiry_ms - int(time.time() * 1000))
            days_left = max(1, int(ms_left / 86400000))
            title = "Warranty Expiring Soon!"
            body = f"Your warranty for {product} expires in {days_left} day(s)."
            sent = False
            if token:
                if send_notification(token, title, body):
                    sent = True
            # Always store an in-app notification regardless of push delivery
            create_in_app_notification(owner, title, body, metadata={"nft_id": nft.get("nft_id"), "expiry_ms": expiry_ms})
            if sent:
                notifications_attempted += 1
    except Exception as exc:
        print(f"check_expiring_warranties error: {exc}")
    return notifications_attempted


# Schedule daily check at 9 AM server time
scheduler = BackgroundScheduler()

# Avoid double scheduling under Flask debug reloader
should_start_scheduler = (
    os.getenv("WERKZEUG_RUN_MAIN") == "true"  # true on the reloader child process
    or os.getenv("FLASK_ENV") == "production"
    or not getattr(Config, "DEBUG", False)
)

if should_start_scheduler and not scheduler.running:
    scheduler.add_job(check_expiring_warranties, "cron", hour=9)
    scheduler.start()