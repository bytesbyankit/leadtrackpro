#!/bin/bash
PORT=4000
URL="http://localhost:$PORT/api/leads"

echo "Checking health..."
curl -s http://localhost:$PORT/health | grep OK > /dev/null
if [ $? -ne 0 ]; then
  echo "Server is not running on port $PORT"
  exit 1
fi

echo "Testing POST /api/leads with valid data..."
RESPONSE=$(curl -s -X POST $URL \
  -H "Content-Type: application/json" \
  -D - \
  -d '{
    "businessName": "Test Business",
    "phone": "1234567890",
    "callStatus": "Called",
    "leadStatus": "Interested",
    "city": "Sample City",
    "interestLevel": "High",
    "dealStage": "Lead Found"
  }')

if echo "$RESPONSE" | grep "21" > /dev/null; then
  echo "✅ Valid POST successful"
else
  echo "❌ Valid POST failed"
  echo "$RESPONSE"
  exit 1
fi

echo "Testing POST /api/leads with invalid data (missing phone)..."
INVALID_RESPONSE=$(curl -s -X POST $URL \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Incomplete Business",
    "callStatus": "Called",
    "leadStatus": "Interested"
  }')

if echo "$INVALID_RESPONSE" | grep "errors" > /dev/null; then
  echo "✅ Invalid POST rejected as expected"
else
  echo "❌ Error: Invalid POST was incorrectly accepted"
  echo "$INVALID_RESPONSE"
  exit 1
fi

echo "Testing GET /api/leads..."
GET_RESPONSE=$(curl -s $URL)
if echo "$GET_RESPONSE" | grep "Test Business" > /dev/null; then
  echo "✅ GET leads successful"
else
  echo "❌ GET leads failed"
  echo "$GET_RESPONSE"
  exit 1
fi

echo "ALL TESTS PASSED"
