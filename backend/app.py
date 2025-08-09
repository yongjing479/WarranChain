from flask import Flask, request, jsonify
from flask_cors import CORS
from services.chatbot import ChatService
from services.sustainability import sustainability_service
from services.seller_sustainability import seller_sustainability_service
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

@app.route('/chat', methods=['POST'])
def chat_handler():
    try:
        data = request.json
        if not data:
            logger.error("No JSON data received")
            return jsonify({"error": "No JSON data provided"}), 400
        
        messages = data.get('messages', [])
        
        if not messages:
            logger.error("No messages provided")
            return jsonify({"error": "No messages provided"}), 400
        
        logger.info(f"Received chat request with {len(messages)} messages")
        
        # Log the first message for debugging
        if messages:
            logger.info(f"First message: {messages[0].get('content', 'No content')[:100]}...")
        
        ai_response = ChatService.get_chat_response(messages)
        logger.info(f"Chatbot response: {ai_response[:100]}...")
        
        return jsonify({"response": ai_response})
        
    except Exception as e:
        logger.error(f"Error in chat_handler: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "service": "chatbot"})

# Sustainability Dashboard Endpoints
@app.route('/api/sustainability/metrics', methods=['GET'])
def get_sustainability_metrics():
    """Get overall sustainability metrics"""
    try:
        force_refresh = request.args.get('refresh', 'false').lower() == 'true'
        metrics = sustainability_service.get_sustainability_metrics(force_refresh=force_refresh)
        return jsonify(metrics)
    except Exception as e:
        logger.error(f"Error getting sustainability metrics: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/sustainability/user/<user_address>', methods=['GET'])
def get_user_sustainability_metrics(user_address):
    """Get sustainability metrics for a specific user"""
    try:
        metrics = sustainability_service.get_user_sustainability_metrics(user_address)
        return jsonify(metrics)
    except Exception as e:
        logger.error(f"Error getting user sustainability metrics: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/sustainability/trends', methods=['GET'])
def get_sustainability_trends():
    """Get sustainability trends over time"""
    try:
        days = int(request.args.get('days', 30))
        trends = sustainability_service.get_sustainability_trends(days)
        return jsonify(trends)
    except Exception as e:
        logger.error(f"Error getting sustainability trends: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/sustainability/events', methods=['GET'])
def get_sustainability_events():
    """Get raw sustainability events from blockchain"""
    try:
        events = sustainability_service._get_warranty_events()
        return jsonify(events)
    except Exception as e:
        logger.error(f"Error getting sustainability events: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Seller Sustainability Dashboard Endpoints
@app.route('/api/seller/sustainability/<seller_address>', methods=['GET'])
def get_seller_sustainability_metrics(seller_address):
    """Get sustainability metrics for a specific seller"""
    try:
        force_refresh = request.args.get('refresh', 'false').lower() == 'true'
        metrics = seller_sustainability_service.get_seller_sustainability_metrics(
            seller_address, force_refresh=force_refresh
        )
        return jsonify(metrics)
    except Exception as e:
        logger.error(f"Error getting seller sustainability metrics: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/seller/achievements/<seller_address>', methods=['GET'])
def get_seller_achievements(seller_address):
    """Get achievements for a specific seller"""
    try:
        achievements = seller_sustainability_service.get_seller_achievements(seller_address)
        return jsonify(achievements)
    except Exception as e:
        logger.error(f"Error getting seller achievements: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/seller/trends/<seller_address>', methods=['GET'])
def get_seller_trends(seller_address):
    """Get sustainability trends for a specific seller"""
    try:
        days = int(request.args.get('days', 30))
        trends = seller_sustainability_service.get_seller_trends(seller_address, days)
        return jsonify(trends)
    except Exception as e:
        logger.error(f"Error getting seller trends: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    logger.info("Starting Flask server...")
    app.run(host='0.0.0.0', port=5000, debug=True)