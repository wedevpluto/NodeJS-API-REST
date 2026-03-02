#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agus2@test.com","password":"123456"}' \
  | jq -r '.access_token' | tr -d '\n')

export TOKEN
echo $TOKEN | xclip -selection clipboard
echo "Token obtenido y copiado: $TOKEN"