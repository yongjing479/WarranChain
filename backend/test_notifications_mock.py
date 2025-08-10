import os
import sys
import time

# Stub apscheduler so importing the notifications module works even if the
# dependency isn't installed in this environment.
try:
    import apscheduler  # type: ignore
except Exception:
    import types

    apscheduler = types.ModuleType("apscheduler")
    schedulers = types.ModuleType("apscheduler.schedulers")
    background = types.ModuleType("apscheduler.schedulers.background")

    class _DummyScheduler:
        def __init__(self):
            self.running = False

        def add_job(self, *_args, **_kwargs):
            return None

        def start(self):
            self.running = True

    background.BackgroundScheduler = _DummyScheduler  # type: ignore[attr-defined]
    schedulers.background = background  # type: ignore[attr-defined]
    apscheduler.schedulers = schedulers  # type: ignore[attr-defined]
    sys.modules["apscheduler"] = apscheduler
    sys.modules["apscheduler.schedulers"] = schedulers
    sys.modules["apscheduler.schedulers.background"] = background

# Ensure the scheduler in notifications won't auto-start
os.environ.setdefault("FLASK_ENV", "development")
os.environ.setdefault("DEBUG", "True")

from unittest.mock import patch

import backend.services.notifications as notifications


def test_expiring_warranty_notification():
    """
    Mock test: simulate one NFT expiring soon and assert that
    - a push notification would be attempted, and
    - an in-app notification would be created.
    """
    soon_ms = int(time.time() * 1000) + 60 * 60 * 1000  # 1 hour from now
    mock_due = [
        {
            "nft_id": "nft_123",
            "owner_address": "0xabc",
            "product_name": "Phone",
            "expiry_date_ms": soon_ms,
        }
    ]

    with (
        patch(
            "backend.services.notifications._fetch_warranties_due_within_days",
            return_value=mock_due,
        ) as mock_fetch,
        patch(
            "backend.services.notifications._get_push_token_for_wallet",
            return_value="player_123",
        ) as mock_get_token,
        patch(
            "backend.services.notifications.send_notification",
            return_value=True,
        ) as mock_send,
        patch(
            "backend.services.notifications.create_in_app_notification",
            return_value=True,
        ) as mock_in_app,
    ):
        attempted = notifications.check_expiring_warranties(days=7)

        assert attempted == 1, "Expected one notification attempt"
        assert mock_fetch.called, "Should fetch due warranties"
        assert mock_get_token.called, "Should look up push token"
        assert mock_send.called, "Should attempt to send push notification"
        assert mock_in_app.called, "Should create in-app notification"

        # Verify push payload semantics
        args, kwargs = mock_send.call_args
        token_arg, title_arg, body_arg = args
        assert token_arg == "player_123"
        assert title_arg == "Warranty Expiring Soon!"
        assert body_arg == "Your warranty for Phone expires in 1 day(s)."

    print("✅ test_expiring_warranty_notification passed")


def test_no_push_token_still_creates_in_app():
    """
    If the owner has no push token, no push is attempted, but in-app is stored.
    """
    soon_ms = int(time.time() * 1000) + 30 * 60 * 1000  # 30 minutes from now
    mock_due = [
        {
            "nft_id": "nft_456",
            "owner_address": "0xdef",
            "product_name": "Laptop",
            "expiry_date_ms": soon_ms,
        }
    ]

    with (
        patch(
            "backend.services.notifications._fetch_warranties_due_within_days",
            return_value=mock_due,
        ),
        patch(
            "backend.services.notifications._get_push_token_for_wallet",
            return_value=None,
        ),
        patch(
            "backend.services.notifications.send_notification",
            return_value=True,
        ) as mock_send,
        patch(
            "backend.services.notifications.create_in_app_notification",
            return_value=True,
        ) as mock_in_app,
    ):
        attempted = notifications.check_expiring_warranties(days=3)

        assert attempted == 0, "No push attempt should be counted without token"
        assert not mock_send.called, "Push should not be attempted without token"
        assert mock_in_app.called, "In-app notification should still be created"

    print("✅ test_no_push_token_still_creates_in_app passed")


if __name__ == "__main__":
    # Run the tests directly without requiring pytest
    test_expiring_warranty_notification()
    test_no_push_token_still_creates_in_app()
    print("All mock notification tests passed.")


