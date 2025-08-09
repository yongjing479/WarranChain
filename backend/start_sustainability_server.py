#!/usr/bin/env python3
"""
Startup script for WarranChain Sustainability Dashboard Backend
Runs both the Flask API server and WebSocket server for real-time updates.
"""

import asyncio
import threading
import time
import logging
from flask import Flask
from services.websocket_service import start_websocket_server
from app import app

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def start_flask_server():
    """Start the Flask API server in a separate thread"""
    try:
        logger.info("Starting Flask API server on http://localhost:5000")
        app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)
    except Exception as e:
        logger.error(f"Error starting Flask server: {str(e)}")

def start_websocket_server_wrapper():
    """Start the WebSocket server in a separate thread"""
    try:
        logger.info("Starting WebSocket server on ws://localhost:8765")
        asyncio.run(start_websocket_server())
    except Exception as e:
        logger.error(f"Error starting WebSocket server: {str(e)}")

def main():
    """Main function to start both servers"""
    logger.info("Starting WarranChain Sustainability Dashboard Backend...")
    
    # Start Flask server in a separate thread
    flask_thread = threading.Thread(target=start_flask_server, daemon=True)
    flask_thread.start()
    
    # Give Flask server time to start
    time.sleep(2)
    
    # Start WebSocket server in a separate thread
    websocket_thread = threading.Thread(target=start_websocket_server_wrapper, daemon=True)
    websocket_thread.start()
    
    logger.info("Both servers started successfully!")
    logger.info("API Server: http://localhost:5000")
    logger.info("WebSocket Server: ws://localhost:8765")
    logger.info("Press Ctrl+C to stop both servers")
    
    try:
        # Keep the main thread alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Shutting down servers...")
        # The daemon threads will automatically terminate when main thread exits

if __name__ == "__main__":
    main()
