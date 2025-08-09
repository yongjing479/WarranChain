# sustainability.py
"""Service for calculating sustainability metrics in the WarranChain backend.
This module fetches blockchain events to compute metrics like resold warranties,
repair counts, and e-waste saved.
"""
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from pysui.sui.sui_clients import sync_client
from pysui.sui.sui_config import SuiConfig
from pysui.sui.sui_types import SuiString
from config import Config

class SustainabilityService:
    """Service for tracking sustainability metrics from blockchain events"""
    
    def __init__(self):
        # Initialize Sui client with minimal configuration
        try:
            config = SuiConfig.default_config()
            config.rpc_url = Config.SUI_RPC_URL
            self.client = sync_client(config)
        except Exception as e:
            print(f"Warning: Could not initialize Sui client: {e}")
            self.client = None
        self.cache = {}
        self.cache_duration = 300  # 5 minutes cache
    
    def get_sustainability_metrics(self, force_refresh: bool = False) -> Dict:
        """Calculate comprehensive sustainability metrics from blockchain events"""
        cache_key = "sustainability_metrics"
        
        # Return cached data if available and not expired
        if not force_refresh and cache_key in self.cache:
            cache_time, cached_data = self.cache[cache_key]
            if time.time() - cache_time < self.cache_duration:
                return cached_data
        
        metrics = {
            "total_warranties_transferred": 0,
            "total_repair_events": 0,
            "estimated_ewaste_saved": 0,
            "carbon_footprint_reduced": 0,
            "total_warranties_minted": 0,
            "active_warranties": 0,
            "last_updated": datetime.now().isoformat(),
            "event_breakdown": {
                "transfers_this_month": 0,
                "repairs_this_month": 0,
                "mints_this_month": 0
            }
        }
        
        try:
            # Get all warranty-related events
            warranty_events = self._get_warranty_events()
            
            # Calculate metrics from events
            metrics.update(self._calculate_metrics_from_events(warranty_events))
            
            # Cache the results
            self.cache[cache_key] = (time.time(), metrics)
            
        except Exception as e:
            print(f"Sustainability metrics error: {str(e)}")
            # Return cached data if available, otherwise return empty metrics
            if cache_key in self.cache:
                return self.cache[cache_key][1]
        
        return metrics
    
    def _get_warranty_events(self) -> Dict:
        """Fetch all warranty-related events from the blockchain"""
        events = {
            "transfers": [],
            "repairs": [],
            "mints": []
        }
        
        if self.client is None:
            print("Warning: Sui client not initialized, returning empty events")
            return events
        
        try:
            # Get WarrantyTransferred events
            transfer_query = {
                "MoveEventType": f"{Config.NFT_PACKAGE_ID}::warranty_nft::WarrantyTransferred"
            }
            transfer_events = self.client.query_events(query=transfer_query)
            events["transfers"] = transfer_events.data if hasattr(transfer_events, 'data') else []
            
            # Get RepairLogged events
            repair_query = {
                "MoveEventType": f"{Config.NFT_PACKAGE_ID}::warranty_nft::RepairLogged"
            }
            repair_events = self.client.query_events(query=repair_query)
            events["repairs"] = repair_events.data if hasattr(repair_events, 'data') else []
            
            # Get WarrantyMinted events
            mint_query = {
                "MoveEventType": f"{Config.NFT_PACKAGE_ID}::warranty_nft::WarrantyMinted"
            }
            mint_events = self.client.query_events(query=mint_query)
            events["mints"] = mint_events.data if hasattr(mint_events, 'data') else []
            
        except Exception as e:
            print(f"Error fetching events: {str(e)}")
        
        return events
    
    def _calculate_metrics_from_events(self, events: Dict) -> Dict:
        """Calculate sustainability metrics from blockchain events"""
        metrics = {}
        
        # Count total events
        total_transfers = len(events["transfers"])
        total_repairs = len(events["repairs"])
        total_mints = len(events["mints"])
        
        # Calculate monthly breakdown
        current_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        transfers_this_month = 0
        repairs_this_month = 0
        mints_this_month = 0
        
        # Process transfer events
        for event in events["transfers"]:
            if hasattr(event, 'timestamp_ms'):
                event_time = datetime.fromtimestamp(int(event.timestamp_ms) / 1000)
                if event_time >= current_month:
                    transfers_this_month += 1
        
        # Process repair events
        for event in events["repairs"]:
            if hasattr(event, 'timestamp_ms'):
                event_time = datetime.fromtimestamp(int(event.timestamp_ms) / 1000)
                if event_time >= current_month:
                    repairs_this_month += 1
        
        # Process mint events
        for event in events["mints"]:
            if hasattr(event, 'timestamp_ms'):
                event_time = datetime.fromtimestamp(int(event.timestamp_ms) / 1000)
                if event_time >= current_month:
                    mints_this_month += 1
        
        # Calculate e-waste saved (more sophisticated calculation)
        # Each transfer represents a resale, preventing new product purchase
        ewaste_per_transfer = 12  # kg of e-waste prevented per resale
        ewaste_per_repair = 8     # kg of e-waste prevented per repair
        total_ewaste_saved = (total_transfers * ewaste_per_transfer) + (total_repairs * ewaste_per_repair)
        
        # Calculate carbon footprint reduction
        # Each resale saves ~0.5 tons CO2, each repair saves ~0.3 tons CO2
        carbon_per_transfer = 0.5  # tons CO2 saved per resale
        carbon_per_repair = 0.3    # tons CO2 saved per repair
        total_carbon_reduced = (total_transfers * carbon_per_transfer) + (total_repairs * carbon_per_repair)
        
        # Active warranties (minted - transferred)
        active_warranties = max(0, total_mints - total_transfers)
        
        metrics.update({
            "total_warranties_transferred": total_transfers,
            "total_repair_events": total_repairs,
            "estimated_ewaste_saved": total_ewaste_saved,
            "carbon_footprint_reduced": round(total_carbon_reduced, 2),
            "total_warranties_minted": total_mints,
            "active_warranties": active_warranties,
            "event_breakdown": {
                "transfers_this_month": transfers_this_month,
                "repairs_this_month": repairs_this_month,
                "mints_this_month": mints_this_month
            }
        })
        
        return metrics
    
    def get_user_sustainability_metrics(self, user_address: str) -> Dict:
        """Get sustainability metrics for a specific user"""
        try:
            # Get user's warranty NFTs
            user_warranties = self.client.get_objects(
                owner=user_address,
                filter={"Package": Config.NFT_PACKAGE_ID}
            )
            
            user_metrics = {
                "user_warranties_owned": len(user_warranties.data) if hasattr(user_warranties, 'data') else 0,
                "user_repair_events": 0,
                "user_transfers_made": 0,
                "user_ewaste_contribution": 0
            }
            
            # Calculate user-specific metrics
            if hasattr(user_warranties, 'data'):
                for warranty in user_warranties.data:
                    # Get warranty details to count repair events
                    warranty_details = self.client.get_object(warranty.object_id)
                    if hasattr(warranty_details, 'data'):
                        # Parse warranty data to count repair events
                        # This would need to be implemented based on your NFT structure
                        pass
            
            return user_metrics
            
        except Exception as e:
            print(f"Error getting user metrics: {str(e)}")
            return {
                "user_warranties_owned": 0,
                "user_repair_events": 0,
                "user_transfers_made": 0,
                "user_ewaste_contribution": 0
            }
    
    def get_sustainability_trends(self, days: int = 30) -> Dict:
        """Get sustainability trends over the specified number of days"""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            trends = {
                "daily_transfers": [],
                "daily_repairs": [],
                "daily_mints": [],
                "cumulative_ewaste": []
            }
            
            # This would require more sophisticated event querying with date filters
            # For now, return placeholder data
            for i in range(days):
                date = start_date + timedelta(days=i)
                trends["daily_transfers"].append({
                    "date": date.strftime("%Y-%m-%d"),
                    "count": 0  # Would be calculated from actual events
                })
                trends["daily_repairs"].append({
                    "date": date.strftime("%Y-%m-%d"),
                    "count": 0
                })
                trends["daily_mints"].append({
                    "date": date.strftime("%Y-%m-%d"),
                    "count": 0
                })
            
            return trends
            
        except Exception as e:
            print(f"Error getting trends: {str(e)}")
            return {"error": str(e)}

# Global service instance
sustainability_service = SustainabilityService()

def get_sustainability_metrics():
    """Legacy function for backward compatibility"""
    return sustainability_service.get_sustainability_metrics()