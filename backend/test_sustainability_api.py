#!/usr/bin/env python3
"""
Test script for WarranChain Sustainability Dashboard Backend
Tests all API endpoints to ensure they're working correctly.
"""

import requests
import json
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_URL = "http://localhost:5000"

def test_health_check():
    """Test the health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            logger.info("✅ Health check passed")
            return True
        else:
            logger.error(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"❌ Health check error: {str(e)}")
        return False

def test_sustainability_metrics():
    """Test the sustainability metrics endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/sustainability/metrics")
        if response.status_code == 200:
            data = response.json()
            logger.info("✅ Sustainability metrics endpoint working")
            logger.info(f"   Total transfers: {data.get('total_warranties_transferred', 0)}")
            logger.info(f"   Total repairs: {data.get('total_repair_events', 0)}")
            logger.info(f"   E-waste saved: {data.get('estimated_ewaste_saved', 0)}kg")
            return True
        else:
            logger.error(f"❌ Sustainability metrics failed: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"❌ Sustainability metrics error: {str(e)}")
        return False

def test_user_sustainability_metrics():
    """Test the user sustainability metrics endpoint"""
    try:
        # Test with a dummy address
        test_address = "0x1234567890123456789012345678901234567890"
        response = requests.get(f"{BASE_URL}/api/sustainability/user/{test_address}")
        if response.status_code == 200:
            data = response.json()
            logger.info("✅ User sustainability metrics endpoint working")
            logger.info(f"   User warranties: {data.get('user_warranties_owned', 0)}")
            return True
        else:
            logger.error(f"❌ User sustainability metrics failed: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"❌ User sustainability metrics error: {str(e)}")
        return False

def test_sustainability_trends():
    """Test the sustainability trends endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/sustainability/trends?days=7")
        if response.status_code == 200:
            data = response.json()
            logger.info("✅ Sustainability trends endpoint working")
            return True
        else:
            logger.error(f"❌ Sustainability trends failed: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"❌ Sustainability trends error: {str(e)}")
        return False

def test_seller_sustainability_metrics():
    """Test the seller sustainability metrics endpoint"""
    try:
        # Test with a dummy seller address
        test_seller = "0x9876543210987654321098765432109876543210"
        response = requests.get(f"{BASE_URL}/api/seller/sustainability/{test_seller}")
        if response.status_code == 200:
            data = response.json()
            logger.info("✅ Seller sustainability metrics endpoint working")
            logger.info(f"   Warranties issued: {data.get('warranties_issued', 0)}")
            logger.info(f"   Repair services: {data.get('repair_services_provided', 0)}")
            return True
        else:
            logger.error(f"❌ Seller sustainability metrics failed: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"❌ Seller sustainability metrics error: {str(e)}")
        return False

def test_seller_achievements():
    """Test the seller achievements endpoint"""
    try:
        # Test with a dummy seller address
        test_seller = "0x9876543210987654321098765432109876543210"
        response = requests.get(f"{BASE_URL}/api/seller/achievements/{test_seller}")
        if response.status_code == 200:
            data = response.json()
            logger.info("✅ Seller achievements endpoint working")
            logger.info(f"   Achievements found: {len(data)}")
            return True
        else:
            logger.error(f"❌ Seller achievements failed: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"❌ Seller achievements error: {str(e)}")
        return False

def test_seller_trends():
    """Test the seller trends endpoint"""
    try:
        # Test with a dummy seller address
        test_seller = "0x9876543210987654321098765432109876543210"
        response = requests.get(f"{BASE_URL}/api/seller/trends/{test_seller}?days=7")
        if response.status_code == 200:
            data = response.json()
            logger.info("✅ Seller trends endpoint working")
            return True
        else:
            logger.error(f"❌ Seller trends failed: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"❌ Seller trends error: {str(e)}")
        return False

def test_sustainability_events():
    """Test the sustainability events endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/sustainability/events")
        if response.status_code == 200:
            data = response.json()
            logger.info("✅ Sustainability events endpoint working")
            logger.info(f"   Transfer events: {len(data.get('transfers', []))}")
            logger.info(f"   Repair events: {len(data.get('repairs', []))}")
            logger.info(f"   Mint events: {len(data.get('mints', []))}")
            return True
        else:
            logger.error(f"❌ Sustainability events failed: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"❌ Sustainability events error: {str(e)}")
        return False

def run_all_tests():
    """Run all API tests"""
    logger.info("🚀 Starting WarranChain Sustainability Dashboard API Tests...")
    
    tests = [
        ("Health Check", test_health_check),
        ("Sustainability Metrics", test_sustainability_metrics),
        ("User Sustainability Metrics", test_user_sustainability_metrics),
        ("Sustainability Trends", test_sustainability_trends),
        ("Seller Sustainability Metrics", test_seller_sustainability_metrics),
        ("Seller Achievements", test_seller_achievements),
        ("Seller Trends", test_seller_trends),
        ("Sustainability Events", test_sustainability_events),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        logger.info(f"\n📋 Testing: {test_name}")
        if test_func():
            passed += 1
        time.sleep(0.5)  # Small delay between tests
    
    logger.info(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        logger.info("🎉 All tests passed! The sustainability dashboard backend is working correctly.")
    else:
        logger.error(f"❌ {total - passed} tests failed. Please check the backend configuration.")
    
    return passed == total

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
