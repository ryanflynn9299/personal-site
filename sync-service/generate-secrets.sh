#!/bin/bash

echo "Generating secrets for sync service..."
echo ""
echo "WEBHOOK_SECRET:"
openssl rand -hex 32
echo ""
echo "SYNC_ADMIN_TOKEN:"
openssl rand -hex 32
echo ""
echo "✅ Add these to your .env file"
