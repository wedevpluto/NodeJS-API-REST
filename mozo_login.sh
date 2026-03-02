#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mozo@restaurant.com","password":"Mozo123!"}' \
  | jq -r '.access_token')

echo "Token MOZO: $TOKEN"
echo $TOKEN | xclip -selection clipboard
echo "Token copiado al portapapeles!"
echo $TOKEN > .mozo_token
