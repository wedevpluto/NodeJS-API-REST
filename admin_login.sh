#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@restaurant.com","password":"Admin123!"}' \
  | jq -r '.access_token')

echo "Token ADMIN: $TOKEN"
echo $TOKEN | xclip -selection clipboard
echo "Token copiado al portapapeles!"
echo $TOKEN > .admin_token
