import requests
import json

# Test login and subscription status
BASE_URL = "http://localhost:5000"

# First login as itay (who has a subscription)
login_data = {
    "email": "itay",
    "password": "123456"
}

try:
    # Login
    login_response = requests.post(f"{BASE_URL}/login", json=login_data)
    print("Login response status:", login_response.status_code)
    print("Login response:", login_response.text)
    
    if login_response.status_code == 200:
        token = login_response.json().get('token')
        print("Token received:", token[:50] + "..." if token else "None")
        
        # Test subscription status endpoint
        headers = {'Authorization': f'Bearer {token}'}
        sub_response = requests.get(f"{BASE_URL}/user/subscription-status", headers=headers)
        print("\nSubscription status response:", sub_response.status_code)
        print("Subscription status data:", json.dumps(sub_response.json(), indent=2) if sub_response.status_code == 200 else sub_response.text)
    
except Exception as e:
    print("Error:", e)
