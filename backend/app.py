from flask import Flask, request, jsonify
from flask_cors import CORS
from services.chatbot import ChatService
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

if __name__ == "__main__":
    logger.info("Starting Flask server...")
    app.run(host='0.0.0.0', port=5000, debug=True)