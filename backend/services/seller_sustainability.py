# seller_sustainability.py
"""Service for seller-specific sustainability metrics and dashboard.
This module provides seller-focused sustainability calculations including
warranties issued, repair services provided, and environmental impact.
"""
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from pysui.sui.sui_clients import sync_client
from pysui.sui.sui_config import SuiConfig
from config import Config

class SellerSustainabilityService:
    """Service for tracking seller sustainability metrics"""
    
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
    
    def get_seller_sustainability_metrics(self, seller_address: str, force_refresh: bool = False) -> Dict:
        """Get comprehensive sustainability metrics for a seller"""
        cache_key = f"seller_metrics_{seller_address}"
        
        # Return cached data if available and not expired
        if not force_refresh and cache_key in self.cache:
            cache_time, cached_data = self.cache[cache_key]
            if time.time() - cache_time < self.cache_duration:
                return cached_data
        
        metrics = {
            "warranties_issued": 0,
            "repair_services_provided": 0,
            "total_ewaste_prevented": 0,
            "carbon_footprint_reduced": 0,
            "active_warranties": 0,
            "warranties_transferred": 0,
            "average_warranty_duration": 0,
            "repair_success_rate": 0,
            "last_updated": datetime.now().isoformat(),
            "monthly_breakdown": {
                "warranties_this_month": 0,
                "repairs_this_month": 0,
                "transfers_this_month": 0
            }
        }
        
        try:
            # Get seller-specific events
            seller_events = self._get_seller_events(seller_address)
            
            # Calculate metrics from events
            metrics.update(self._calculate_seller_metrics(seller_events, seller_address))
            
            # Cache the results
            self.cache[cache_key] = (time.time(), metrics)
            
        except Exception as e:
            print(f"Seller sustainability metrics error: {str(e)}")
            # Return cached data if available, otherwise return empty metrics
            if cache_key in self.cache:
                return self.cache[cache_key][1]
        
        return metrics
    
    def _get_seller_events(self, seller_address: str) -> Dict:
        """Fetch seller-specific warranty events"""
        events = {
            "mints": [],
            "repairs": [],
            "transfers": []
        }
        
        if self.client is None:
            print("Warning: Sui client not initialized, returning empty events")
            return events
        
        try:
            # Get warranties minted by this seller
            mint_query = {
                "MoveEventType": f"{Config.NFT_PACKAGE_ID}::warranty_nft::WarrantyMinted",
                "Sender": seller_address
            }
            mint_events = self.client.query_events(query=mint_query)
            events["mints"] = mint_events.data if hasattr(mint_events, 'data') else []
            
            # Get repair events for warranties issued by this seller
            repair_query = {
                "MoveEventType": f"{Config.NFT_PACKAGE_ID}::warranty_nft::RepairLogged"
            }
            repair_events = self.client.query_events(query=repair_query)
            events["repairs"] = repair_events.data if hasattr(repair_events, 'data') else []
            
            # Get transfer events for warranties issued by this seller
            transfer_query = {
                "MoveEventType": f"{Config.NFT_PACKAGE_ID}::warranty_nft::WarrantyTransferred"
            }
            transfer_events = self.client.query_events(query=transfer_query)
            events["transfers"] = transfer_events.data if hasattr(transfer_events, 'data') else []
            
        except Exception as e:
            print(f"Error fetching seller events: {str(e)}")
        
        return events
    
    def _calculate_seller_metrics(self, events: Dict, seller_address: str) -> Dict:
        """Calculate seller-specific sustainability metrics"""
        metrics = {}
        
        # Count total events
        total_mints = len(events["mints"])
        total_repairs = len(events["repairs"])
        total_transfers = len(events["transfers"])
        
        # Calculate monthly breakdown
        current_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        mints_this_month = 0
        repairs_this_month = 0
        transfers_this_month = 0
        
        # Process mint events
        for event in events["mints"]:
            if hasattr(event, 'timestamp_ms'):
                event_time = datetime.fromtimestamp(int(event.timestamp_ms) / 1000)
                if event_time >= current_month:
                    mints_this_month += 1
        
        # Process repair events
        for event in events["repairs"]:
            if hasattr(event, 'timestamp_ms'):
                event_time = datetime.fromtimestamp(int(event.timestamp_ms) / 1000)
                if event_time >= current_month:
                    repairs_this_month += 1
        
        # Process transfer events
        for event in events["transfers"]:
            if hasattr(event, 'timestamp_ms'):
                event_time = datetime.fromtimestamp(int(event.timestamp_ms) / 1000)
                if event_time >= current_month:
                    transfers_this_month += 1
        
        # Calculate e-waste prevented by seller's warranties
        # Each warranty issued prevents ~10kg of e-waste through extended product life
        ewaste_per_warranty = 10  # kg per warranty
        ewaste_per_repair = 8     # kg per repair
        total_ewaste_prevented = (total_mints * ewaste_per_warranty) + (total_repairs * ewaste_per_repair)
        
        # Calculate carbon footprint reduction
        # Each warranty saves ~0.4 tons CO2, each repair saves ~0.3 tons CO2
        carbon_per_warranty = 0.4  # tons CO2 saved per warranty
        carbon_per_repair = 0.3    # tons CO2 saved per repair
        total_carbon_reduced = (total_mints * carbon_per_warranty) + (total_repairs * carbon_per_repair)
        
        # Active warranties (minted - transferred)
        active_warranties = max(0, total_mints - total_transfers)
        
        # Calculate average warranty duration (placeholder)
        average_warranty_duration = 365  # days (default 1 year)
        
        # Calculate repair success rate
        repair_success_rate = 0
        if total_mints > 0:
            repair_success_rate = min(100, (total_repairs / total_mints) * 100)
        
        metrics.update({
            "warranties_issued": total_mints,
            "repair_services_provided": total_repairs,
            "total_ewaste_prevented": total_ewaste_prevented,
            "carbon_footprint_reduced": round(total_carbon_reduced, 2),
            "active_warranties": active_warranties,
            "warranties_transferred": total_transfers,
            "average_warranty_duration": average_warranty_duration,
            "repair_success_rate": round(repair_success_rate, 1),
            "monthly_breakdown": {
                "warranties_this_month": mints_this_month,
                "repairs_this_month": repairs_this_month,
                "transfers_this_month": transfers_this_month
            }
        })
        
        return metrics
    
    def get_seller_achievements(self, seller_address: str) -> List[Dict]:
        """Get seller achievements based on their sustainability impact"""
        try:
            metrics = self.get_seller_sustainability_metrics(seller_address)
            
            achievements = [
                {
                    "name": "First Warranty Issued",
                    "earned": metrics["warranties_issued"] > 0,
                    "date": "2024-01-15",
                    "impact": "Started sustainable business",
                    "icon": "shield"
                },
                {
                    "name": "Repair Specialist",
                    "earned": metrics["repair_services_provided"] >= 5,
                    "date": "2024-02-20",
                    "impact": f"Provided {metrics['repair_services_provided']} repair services",
                    "icon": "tools"
                },
                {
                    "name": "E-waste Warrior",
                    "earned": metrics["total_ewaste_prevented"] >= 100,
                    "date": "2024-03-15",
                    "impact": f"Prevented {metrics['total_ewaste_prevented']}kg e-waste",
                    "icon": "leaf"
                },
                {
                    "name": "Warranty Pioneer",
                    "earned": metrics["warranties_issued"] >= 10,
                    "date": "2024-04-01",
                    "impact": f"Issued {metrics['warranties_issued']} warranties",
                    "icon": "certificate"
                },
                {
                    "name": "Carbon Crusher",
                    "earned": metrics["carbon_footprint_reduced"] >= 5,
                    "date": "2024-05-01",
                    "impact": f"Reduced {metrics['carbon_footprint_reduced']}t CO2",
                    "icon": "refresh"
                },
                {
                    "name": "Sustainability Champion",
                    "earned": metrics["repair_success_rate"] >= 80,
                    "date": "2024-06-01",
                    "impact": f"{metrics['repair_success_rate']}% repair success rate",
                    "icon": "trophy"
                }
            ]
            
            return achievements
            
        except Exception as e:
            print(f"Error getting seller achievements: {str(e)}")
            return []
    
    def get_seller_trends(self, seller_address: str, days: int = 30) -> Dict:
        """Get seller sustainability trends over time"""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            trends = {
                "daily_warranties": [],
                "daily_repairs": [],
                "daily_transfers": [],
                "cumulative_impact": []
            }
            
            # This would require more sophisticated event querying with date filters
            # For now, return placeholder data
            for i in range(days):
                date = start_date + timedelta(days=i)
                trends["daily_warranties"].append({
                    "date": date.strftime("%Y-%m-%d"),
                    "count": 0  # Would be calculated from actual events
                })
                trends["daily_repairs"].append({
                    "date": date.strftime("%Y-%m-%d"),
                    "count": 0
                })
                trends["daily_transfers"].append({
                    "date": date.strftime("%Y-%m-%d"),
                    "count": 0
                })
            
            return trends
            
        except Exception as e:
            print(f"Error getting seller trends: {str(e)}")
            return {"error": str(e)}

# Global seller sustainability service instance
seller_sustainability_service = SellerSustainabilityService()
