# websocket_service.py
"""WebSocket service for real-time sustainability event tracking.
This module provides WebSocket connections to track blockchain events in real-time
and notify connected clients about sustainability metrics updates.
"""
import asyncio
import json
import logging
import websockets
from datetime import datetime
from typing import Dict, List, Set
from pysui.sui.sui_clients import sync_client
from pysui.sui.sui_config import SuiConfig
from config import Config

logger = logging.getLogger(__name__)

class WebSocketService:
    """Service for managing WebSocket connections and real-time event tracking"""
    
    def __init__(self):
        self.clients: Set[websockets.WebSocketServerProtocol] = set()
        self.sui_client = sync_client(SuiConfig.default_config(Config.SUI_RPC_URL))
        self.event_subscriptions = {}
        self.is_running = False
    
    async def register(self, websocket: websockets.WebSocketServerProtocol):
        """Register a new WebSocket client"""
        self.clients.add(websocket)
        logger.info(f"Client connected. Total clients: {len(self.clients)}")
        
        # Send initial sustainability metrics
        try:
            from services.sustainability import sustainability_service
            metrics = sustainability_service.get_sustainability_metrics()
            await websocket.send(json.dumps({
                "type": "initial_metrics",
                "data": metrics,
                "timestamp": datetime.now().isoformat()
            }))
        except Exception as e:
            logger.error(f"Error sending initial metrics: {str(e)}")
    
    async def unregister(self, websocket: websockets.WebSocketServerProtocol):
        """Unregister a WebSocket client"""
        self.clients.remove(websocket)
        logger.info(f"Client disconnected. Total clients: {len(self.clients)}")
    
    async def broadcast(self, message: Dict):
        """Broadcast a message to all connected clients"""
        if not self.clients:
            return
        
        message_str = json.dumps(message)
        disconnected_clients = set()
        
        for client in self.clients:
            try:
                await client.send(message_str)
            except websockets.exceptions.ConnectionClosed:
                disconnected_clients.add(client)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {str(e)}")
                disconnected_clients.add(client)
        
        # Remove disconnected clients
        for client in disconnected_clients:
            await self.unregister(client)
    
    async def broadcast_sustainability_update(self, metrics: Dict):
        """Broadcast sustainability metrics update to all clients"""
        message = {
            "type": "sustainability_update",
            "data": metrics,
            "timestamp": datetime.now().isoformat()
        }
        await self.broadcast(message)
    
    async def broadcast_event(self, event_type: str, event_data: Dict):
        """Broadcast a specific blockchain event to all clients"""
        message = {
            "type": "blockchain_event",
            "event_type": event_type,
            "data": event_data,
            "timestamp": datetime.now().isoformat()
        }
        await self.broadcast(message)
    
    async def start_event_monitoring(self):
        """Start monitoring blockchain events in real-time"""
        self.is_running = True
        logger.info("Starting blockchain event monitoring...")
        
        while self.is_running:
            try:
                # Monitor for new warranty events
                await self._check_for_new_events()
                
                # Wait before next check
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"Error in event monitoring: {str(e)}")
                await asyncio.sleep(60)  # Wait longer on error
    
    async def _check_for_new_events(self):
        """Check for new blockchain events and broadcast updates"""
        try:
            # Get recent events
            from services.sustainability import sustainability_service
            
            # Get events from the last 5 minutes
            recent_events = self._get_recent_events()
            
            if recent_events:
                # Update sustainability metrics
                metrics = sustainability_service.get_sustainability_metrics(force_refresh=True)
                
                # Broadcast updates
                await self.broadcast_sustainability_update(metrics)
                
                # Broadcast individual events
                for event in recent_events:
                    await self.broadcast_event(event["type"], event["data"])
                    
        except Exception as e:
            logger.error(f"Error checking for new events: {str(e)}")
    
    def _get_recent_events(self) -> List[Dict]:
        """Get recent blockchain events (last 5 minutes)"""
        events = []
        try:
            # This would need to be implemented based on your specific event structure
            # For now, return empty list
            pass
        except Exception as e:
            logger.error(f"Error getting recent events: {str(e)}")
        
        return events
    
    async def handle_client_message(self, websocket: websockets.WebSocketServerProtocol, message: str):
        """Handle incoming messages from WebSocket clients"""
        try:
            data = json.loads(message)
            message_type = data.get("type")
            
            if message_type == "subscribe_events":
                # Client wants to subscribe to specific events
                event_types = data.get("events", [])
                await self._subscribe_to_events(websocket, event_types)
                
            elif message_type == "get_metrics":
                # Client requests current metrics
                from services.sustainability import sustainability_service
                metrics = sustainability_service.get_sustainability_metrics()
                await websocket.send(json.dumps({
                    "type": "metrics_response",
                    "data": metrics,
                    "timestamp": datetime.now().isoformat()
                }))
                
            elif message_type == "ping":
                # Respond to ping
                await websocket.send(json.dumps({
                    "type": "pong",
                    "timestamp": datetime.now().isoformat()
                }))
                
        except json.JSONDecodeError:
            logger.error("Invalid JSON message received")
        except Exception as e:
            logger.error(f"Error handling client message: {str(e)}")
    
    async def _subscribe_to_events(self, websocket: websockets.WebSocketServerProtocol, event_types: List[str]):
        """Subscribe a client to specific event types"""
        # Store subscription preferences for this client
        # This could be implemented with a more sophisticated subscription system
        await websocket.send(json.dumps({
            "type": "subscription_confirmed",
            "events": event_types,
            "timestamp": datetime.now().isoformat()
        }))
    
    def stop(self):
        """Stop the WebSocket service"""
        self.is_running = False
        logger.info("WebSocket service stopped")

# Global WebSocket service instance
websocket_service = WebSocketService()

async def websocket_handler(websocket, path):
    """Main WebSocket handler function"""
    await websocket_service.register(websocket)
    
    try:
        async for message in websocket:
            await websocket_service.handle_client_message(websocket, message)
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        await websocket_service.unregister(websocket)

def start_websocket_server(host: str = "localhost", port: int = 8765):
    """Start the WebSocket server"""
    import asyncio
    
    async def main():
        # Start event monitoring in background
        asyncio.create_task(websocket_service.start_event_monitoring())
        
        # Start WebSocket server
        async with websockets.serve(websocket_handler, host, port):
            logger.info(f"WebSocket server started on ws://{host}:{port}")
            await asyncio.Future()  # Run forever
    
    asyncio.run(main())

if __name__ == "__main__":
    start_websocket_server()
