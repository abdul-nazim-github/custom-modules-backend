#!/bin/bash
echo "Testing password reset email..."
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "YOUR_EMAIL_HERE"}'
echo ""
echo "Check your email inbox!"
