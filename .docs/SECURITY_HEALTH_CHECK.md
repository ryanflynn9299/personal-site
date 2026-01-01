# Health Check Endpoint Security

## Overview

The health check endpoint (`/api/health`) is designed to be **internal-only** and cannot be accessed by external parties. It implements multiple security layers to prevent abuse and information disclosure.

## Security Features

### 1. IP Address Validation

The endpoint only accepts requests from private/internal IP addresses:

- **Private IPv4 Ranges:**
  - `127.0.0.0/8` - Localhost
  - `10.0.0.0/8` - Private Class A
  - `172.16.0.0/12` - Private Class B (includes Docker networks)
  - `192.168.0.0/16` - Private Class C

- **Private IPv6 Ranges:**
  - `::1` - IPv6 localhost
  - `fc00::/7` - IPv6 private range
  - IPv6-mapped IPv4 addresses

### 2. Header Validation

- Validates `X-Forwarded-For`, `X-Real-IP`, and `CF-Connecting-IP` headers
- Prevents header injection attacks by validating IP format
- Limits IP string length to prevent DoS attacks
- Handles multiple proxy headers securely

### 3. Rate Limiting

- **60 requests per minute per IP**
- In-memory rate limiting (cleans up old entries automatically)
- Returns `429 Too Many Requests` when limit exceeded
- Includes `Retry-After` header

### 4. Information Disclosure Prevention

The endpoint returns minimal information:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**What is NOT disclosed:**

- Version numbers
- Uptime information
- Internal service details
- System information
- Database status
- Error details (generic errors only)

### 5. Error Handling

- External requests return `404 Not Found` (not `403 Forbidden`) to avoid information disclosure
- Internal errors return generic `500 Internal Server Error` without details
- All errors include security headers

### 6. Security Headers

All responses include:

- `Cache-Control: no-store, no-cache, must-revalidate, private`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-RateLimit-Limit` and `X-RateLimit-Window` headers

### 7. HTTP Method Restrictions

Only `GET` requests are allowed. Other methods (`POST`, `PUT`, `DELETE`, `PATCH`) return `405 Method Not Allowed`.

### 8. Search Engine Blocking

The endpoint is blocked in `robots.txt`:

```
disallow: ["/admin/", "/dashboard/", "/api/"]
```

## Attack Vector Mitigation

### Header Injection Attacks

- **Mitigation**: Strict IP format validation, length limits, regex validation
- **Protection**: Only allows valid IP characters, rejects malformed input

### IP Spoofing

- **Mitigation**: Validates IP is in private range, doesn't trust Host header alone
- **Protection**: Even if Host header suggests internal, validates actual IP

### Rate Limit Bypass

- **Mitigation**: Per-IP rate limiting with automatic cleanup
- **Protection**: 60 requests/minute limit, automatic entry expiration

### Information Disclosure

- **Mitigation**: Minimal response, generic errors, no version numbers
- **Protection**: Returns 404 for external requests (not 403), no stack traces

### DoS Attacks

- **Mitigation**: Rate limiting, lightweight endpoint, no expensive operations
- **Protection**: Fast response time, no database queries, no external API calls

### Host Header Spoofing

- **Mitigation**: IP validation is primary check, Host header is supplementary
- **Protection**: Even if Host header is spoofed, IP must be private

## Docker Integration

The health check is used by Docker Compose:

```yaml
healthcheck:
  test:
    [
      "CMD",
      "node",
      "-e",
      "require('http').get('http://localhost:3000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))",
    ]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 30s
```

The health check runs from **inside the container** using `localhost:3000`, which ensures:

- Request comes from internal network (localhost)
- No external access possible
- Works even if external access is blocked

## Edge Cases Handled

### 1. Docker Network Communication

- Containers communicating without proxy headers are allowed if Host suggests internal
- Only in production/Docker environments (not in development)

### 2. IPv6 Support

- Handles IPv6 addresses including mapped IPv4
- Validates IPv6 private ranges

### 3. Multiple Proxy Headers

- Takes first IP from `X-Forwarded-For` chain
- Handles comma-separated IP lists correctly

### 4. Missing Headers

- Falls back to permissive mode only in controlled environments
- Defaults to deny in development

### 5. Port Numbers in IPs

- Strips port numbers from IP addresses
- Validates IP format before checking ranges

### 6. IPv6 Bracket Notation

- Handles `[::1]` format correctly
- Strips brackets before validation

## Testing Security

To verify the endpoint is secure:

1. **External Access Test:**

   ```bash
   # From external network (should return 404)
   curl https://your-domain.com/api/health
   ```

2. **Internal Access Test:**

   ```bash
   # From Docker container (should return 200)
   docker exec ps-frontend wget -qO- http://localhost:3000/api/health
   ```

3. **Rate Limit Test:**
   ```bash
   # Make 61 requests quickly (should get 429 after 60)
   for i in {1..61}; do curl http://localhost:3000/api/health; done
   ```

## Monitoring Recommendations

For a home server, consider:

1. **Log Failed Access Attempts**
   - Monitor 404 responses from `/api/health`
   - Could indicate reconnaissance attempts

2. **Monitor Rate Limit Hits**
   - Track 429 responses
   - Could indicate automated attacks

3. **Alert on Unusual Patterns**
   - Multiple failed attempts from same IP
   - Rapid requests from multiple IPs

## Additional Hardening (Optional)

If you need even more security:

1. **Add Authentication Token:**

   ```typescript
   const token = request.headers.get("x-health-token");
   if (token !== process.env.HEALTH_CHECK_TOKEN) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }
   ```

2. **Use Redis for Rate Limiting:**
   - More robust than in-memory
   - Works across multiple instances

3. **Add Request Logging:**
   - Log all access attempts (without sensitive data)
   - Helps identify attack patterns

4. **IP Whitelist:**
   - Maintain explicit list of allowed IPs
   - More restrictive than private range check

## Files

- **Endpoint**: `app/api/health/route.ts`
- **IP Validation**: `lib/ip-validation.ts`
- **Docker Config**: `docker-compose.yml` (healthcheck section)
- **Robots**: `app/robots.ts` (blocks `/api/`)

## Summary

The health check endpoint is designed with defense-in-depth principles:

1. ✅ **IP Validation** - Only private IPs allowed
2. ✅ **Rate Limiting** - Prevents abuse
3. ✅ **Minimal Information** - No sensitive data
4. ✅ **Error Handling** - Generic errors, no information leakage
5. ✅ **Security Headers** - Multiple protective headers
6. ✅ **Method Restrictions** - Only GET allowed
7. ✅ **Search Engine Blocking** - robots.txt exclusion

The endpoint is safe for use in a home server environment and protects against common attack vectors while remaining functional for Docker health checks.
