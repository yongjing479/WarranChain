# chatbot.py
"""Chatbot service for WarranChain backend.
This module handles interactions with the OpenRouter API to provide chatbot responses.
"""
import os
import requests
import json
from config import Config

class ChatService:
    SYSTEM_PROMPT = """You are a warranty assistant for a blockchain-based warranty system. 
    Warranties are issued as NFTs on Sui blockchain. Help users with:
    - Transferring warranties/NFTs
    - Checking warranty validity
    - QR code verification
    - Repair history
    - Sustainability features
    - General NFT/warranty questions

    Key features:
    1. Warranties are transferable NFTs
    2. QR codes for verification
    3. Expiry notifications
    4. Repair history tracking
    5. Sustainability dashboard

    Always respond concisely and helpfully.
    """

    @staticmethod
    def get_chat_response(messages):
        headers = {
            "Authorization": f"Bearer {Config.OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Prepend system prompt to messages
        formatted_messages = [{"role": "system", "content": ChatService.SYSTEM_PROMPT}]
        formatted_messages += [{"role": msg["role"], "content": msg["content"]} for msg in messages]

        payload = {
            "model": "deepseek/deepseek-r1-0528:free",
            "messages": formatted_messages,
            "temperature": 0.3,
            "max_tokens": 500
        }

        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                data=json.dumps(payload)
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"API Error: {str(e)}")
            return "I'm having trouble connecting to the warranty service. Please try again later."