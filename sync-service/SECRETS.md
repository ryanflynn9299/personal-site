# Generating Secrets for Sync Service

This guide explains how to generate secure secrets for the sync service webhook and admin token.

## Required Secrets

1. **`WEBHOOK_SECRET`** - Used to verify GitHub webhook signatures (webhook mode only)
2. **`SYNC_ADMIN_TOKEN`** - Used to authenticate pause/resume API calls (webhook mode only)

## Method 1: Using OpenSSL (Recommended)

### Generate WEBHOOK_SECRET

```bash
# Generate a 32-byte (256-bit) random hex string
openssl rand -hex 32
```

**Example output:**
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### Generate SYNC_ADMIN_TOKEN

```bash
# Generate a 32-byte random hex string
openssl rand -hex 32
```

**Example output:**
```
9876543210fedcba0987654321fedcba0987654321fedcba0987654321fedcba
```

**Note:** Use different values for each secret - don't reuse the same token.

## Method 2: Using /dev/urandom

### Generate WEBHOOK_SECRET

```bash
# Generate 32 random bytes and convert to hex
head -c 32 /dev/urandom | xxd -p -c 32
```

### Generate SYNC_ADMIN_TOKEN

```bash
# Generate 32 random bytes and convert to hex
head -c 32 /dev/urandom | xxd -p -c 32
```

## Method 3: Using Python

```bash
# Generate WEBHOOK_SECRET
python3 -c "import secrets; print(secrets.token_hex(32))"

# Generate SYNC_ADMIN_TOKEN
python3 -c "import secrets; print(secrets.token_hex(32))"
```

## Method 4: Using Node.js

```bash
# Generate WEBHOOK_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate SYNC_ADMIN_TOKEN
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Method 5: Online Generator (Less Secure)

If you don't have command-line access, you can use:
- https://randomkeygen.com/ (use "CodeIgniter Encryption Keys" - 256-bit)
- https://www.lastpass.com/features/password-generator (set to 64 characters, hex)

**⚠️ Warning:** Only use online generators if you trust the service. Command-line methods are more secure.

## Quick Setup Script

Save this as `generate-secrets.sh`:

```bash
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
```

Make it executable and run:
```bash
chmod +x generate-secrets.sh
./generate-secrets.sh
```

## Adding to .env File

Once you have your secrets, add them to your `.env` file:

```bash
# Webhook configuration (only needed for webhook mode)
WEBHOOK_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
SYNC_ADMIN_TOKEN=9876543210fedcba0987654321fedcba0987654321fedcba0987654321fedcba
```

## Security Best Practices

### 1. **Length and Entropy**
- Use at least 32 bytes (64 hex characters) for strong security
- The examples above generate 256-bit secrets, which is cryptographically secure

### 2. **Uniqueness**
- **Never reuse secrets** - generate a unique value for each secret
- Use different secrets for different environments (dev/staging/prod)

### 3. **Storage**
- ✅ Store in `.env` file (already in `.gitignore`)
- ✅ Use environment variables in production
- ❌ Never commit secrets to git
- ❌ Don't share secrets in chat/email

### 4. **Rotation**
- Rotate secrets periodically (every 6-12 months)
- Rotate immediately if you suspect a compromise
- When rotating, update both `.env` and GitHub webhook settings simultaneously

### 5. **Access Control**
- Limit who can view `.env` file
- Use file permissions: `chmod 600 .env`
- Consider using a secrets manager for production (HashiCorp Vault, AWS Secrets Manager, etc.)

## For GitHub Webhook Setup

When configuring the webhook in GitHub:

1. Go to your repository → Settings → Webhooks → Add webhook
2. **Payload URL**: `https://your-server.com/webhook/deploy` (or your Tailscale IP)
3. **Content type**: `application/json`
4. **Secret**: Paste your `WEBHOOK_SECRET` value here
5. **Events**: Select "Just the push event" or "Let me select individual events" → check "Pushes"

GitHub will use this secret to sign all webhook payloads, and your server will verify the signature matches.

## Verification

After setting up, verify secrets are working:

### Test Webhook Secret (webhook mode)
```bash
# Check if webhook server is running
curl http://localhost:8080/health

# Test with invalid secret (should fail)
curl -X POST http://localhost:8080/webhook/deploy \
  -H "X-Hub-Signature-256: sha256=invalid" \
  -d '{}'
# Should return 401 Unauthorized
```

### Test Admin Token (webhook mode)
```bash
# Test pause endpoint
curl -X POST http://localhost:8080/pause \
  -H "Authorization: Bearer $SYNC_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Test"}'

# Should return: {"status": "paused", "reason": "Test"}
```

## Troubleshooting

### Secret Not Working

1. **Check format**: Ensure no extra spaces/newlines
2. **Check length**: Should be 64 hex characters (32 bytes)
3. **Verify in container**: 
   ```bash
   docker exec ps-sync env | grep -E "WEBHOOK_SECRET|SYNC_ADMIN_TOKEN"
   ```

### Webhook Verification Failing

1. **GitHub secret must match** `WEBHOOK_SECRET` in `.env`
2. **Check signature format**: GitHub sends `sha256=...` prefix
3. **Verify payload**: Ensure you're sending the raw request body

### Admin Token Not Working

1. **Check Authorization header**: Must be `Bearer <token>`
2. **Verify token matches**: Compare with `.env` file
3. **Check container environment**: Token must be passed to container

## Example .env Configuration

```bash
# Sync Service Configuration
GITHUB_REPO=your-username/personal-site
SYNC_MODE=poll  # or 'webhook' for webhook mode
POLL_INTERVAL=300

# Webhook Secrets (only needed if SYNC_MODE=webhook)
WEBHOOK_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
SYNC_ADMIN_TOKEN=9876543210fedcba0987654321fedcba0987654321fedcba0987654321fedcba
```

## Notes

- **Polling mode** doesn't require these secrets (only webhook mode does)
- You can set them anyway for future use
- Secrets are only used when `SYNC_MODE=webhook`
- In polling mode, the service only makes outbound API calls (no secrets needed)

