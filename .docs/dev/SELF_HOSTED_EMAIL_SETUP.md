# Self-Hosted Email Setup Guide

## Quick Start: Postfix Relay (Recommended for Beginners)

This is the easiest self-hosted option that still gives you control while using reliable email delivery.

### Step 1: Add Postfix to Docker Compose

Add this to your `docker-compose.yml`:

```yaml
  # SMTP Relay Service (Simple Postfix)
  ps-smtp:
    image: catatnight/postfix:latest
    container_name: ps-smtp
    restart: unless-stopped
    environment:
      - maildomain=yourdomain.com
      # Option A: Relay through Gmail
      - smtp_user=your-email@gmail.com:your-app-password
      - smtp_server=smtp.gmail.com:587
      # Option B: Relay through Outlook
      # - smtp_user=your-email@outlook.com:your-password
      # - smtp_server=smtp-mail.outlook.com:587
    networks:
      - backend-net
    logging: *default-logging
```

### Step 2: Get Gmail App Password (If Using Gmail)

1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate password for "Mail"
5. Use this password in docker-compose.yml

### Step 3: Update Environment Variables

Add to `.env`:

```bash
# SMTP Configuration
SMTP_HOST=ps-smtp
SMTP_PORT=25
SMTP_FROM=contact@yourdomain.com
SMTP_TO=your-email@gmail.com
```

### Step 4: Test SMTP Connection

```bash
# Start the service
docker compose up -d ps-smtp

# Test from your Next.js container
docker exec ps-frontend sh -c 'echo "Test email" | mail -s "Test" your-email@gmail.com'
```

---

## Advanced: Docker Mailserver (Full Mail Server)

For a fully self-hosted solution with complete control.

### Prerequisites

1. **Domain with DNS access**
2. **Static IP address** (recommended)
3. **Ports open**: 25 (SMTP), 587 (SMTP submission), 993 (IMAP), 465 (SMTPS)

### Step 1: Add Docker Mailserver

```yaml
  # Full Mail Server
  ps-mailserver:
    image: docker.io/mailserver/docker-mailserver:latest
    container_name: ps-mailserver
    hostname: mail
    domainname: yourdomain.com
    restart: unless-stopped
    ports:
      - "25:25"    # SMTP
      - "587:587"  # SMTP submission
      - "993:993"  # IMAP
      - "465:465"  # SMTPS
    volumes:
      - mail-data:/var/mail
      - mail-state:/var/mail-state
      - ./mailserver/config:/tmp/docker-mailserver
      - ./mailserver/dms/config:/etc/dms/config:ro
    environment:
      - ENABLE_SPAMASSASSIN=1
      - ENABLE_CLAMAV=1
      - ENABLE_FAIL2BAN=1
      - ONE_DIR=1
      - PERMIT_DOCKER=network
    networks:
      - backend-net
    depends_on:
      - ps-database  # Can use existing PostgreSQL for some features
    logging: *default-logging

volumes:
  mail-data:
    name: ps-mail-data
  mail-state:
    name: ps-mail-state
```

### Step 2: DNS Configuration

#### SPF Record

```
Type: TXT
Name: @
Value: v=spf1 ip4:YOUR_SERVER_IP ~all
```

#### DKIM Record

1. Generate DKIM key in container
2. Add public key to DNS:

```
Type: TXT
Name: default._domainkey
Value: (public key from mailserver)
```

#### DMARC Record

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

#### MX Record (if receiving emails)

```
Type: MX
Name: @
Value: mail.yourdomain.com (priority 10)
```

### Step 3: Create User Account

```bash
# Create user in mailserver
docker exec ps-mailserver setup email add contact@yourdomain.com 'YourPassword'
```

### Step 4: Configure Next.js to Use Mailserver

Update `.env`:

```bash
SMTP_HOST=ps-mailserver
SMTP_PORT=25
SMTP_USER=contact@yourdomain.com
SMTP_PASS=YourPassword
SMTP_FROM=contact@yourdomain.com
SMTP_TO=your-email@yourdomain.com
```

---

## Simple Form-to-Email Service (Lightweight Alternative)

If you want a dedicated service just for forms.

### Create Form Handler Service

**`form-handler/Dockerfile`:**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY ../../package.json .
RUN npm install
COPY ../.. .
CMD ["node", "index.js"]
```

**`form-handler/index.js`:**

```javascript
const express = require("express");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: "Too many submissions, please try again later",
});

// SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "25"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post("/submit", limiter, async (req, res) => {
  const { name, email, message, honeypot } = req.body;

  // Honeypot check
  if (honeypot) {
    return res.status(200).json({ success: true }); // Silent fail
  }

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Send email
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_TO,
      replyTo: email,
      subject: `Contact Form: ${name}`,
      text: `From: ${name} (${email})\n\n${message}`,
      html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.listen(3001, "0.0.0.0");
```

**Add to `docker-compose.yml`:**

```yaml
  ps-form-handler:
    build: ./form-handler
    container_name: ps-form-handler
    restart: unless-stopped
    environment:
      - SMTP_HOST=ps-smtp
      - SMTP_PORT=25
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
      - SMTP_FROM=contact@yourdomain.com
      - SMTP_TO=your-email@gmail.com
    networks:
      - backend-net
    expose:
      - "3001"
    logging: *default-logging
```

---

## Deliverability Best Practices

### 1. Start with Relay (Easier)

- Use Gmail/Outlook SMTP initially
- Reliable delivery
- No DNS configuration needed
- Can switch to full mail server later

### 2. If Using Full Mail Server

- **Warm up IP**: Start with low volume, gradually increase
- **Monitor reputation**: Check Sender Score, blacklists
- **Use dedicated IP**: Better than shared IP
- **Configure properly**: SPF, DKIM, DMARC all set up
- **Monitor bounces**: High bounce rate hurts reputation

### 3. Testing Deliverability

**Tools:**

- [Mail-Tester](https://www.mail-tester.com/) - Test email score
- [MXToolbox](https://mxtoolbox.com/) - Check blacklists
- [Sender Score](https://www.senderscore.org/) - IP reputation

**Test Checklist:**

- [ ] SPF record configured
- [ ] DKIM signature working
- [ ] DMARC policy set
- [ ] Reverse DNS (PTR) configured
- [ ] Not on blacklists
- [ ] Email reaches inbox (not spam)

---

## Troubleshooting

### Emails Not Sending

1. **Check SMTP connection:**

   ```bash
   docker exec ps-frontend telnet ps-smtp 25
   ```

2. **Check mailserver logs:**

   ```bash
   docker compose logs ps-smtp
   docker compose logs ps-mailserver
   ```

3. **Test from command line:**
   ```bash
   docker exec ps-mailserver sendmail -v your-email@gmail.com < /dev/null
   ```

### Emails Going to Spam

1. **Check SPF/DKIM/DMARC:**

   ```bash
   dig TXT yourdomain.com
   dig TXT _dmarc.yourdomain.com
   dig TXT default._domainkey.yourdomain.com
   ```

2. **Test with Mail-Tester:**
   - Send test email
   - Check score (aim for 10/10)

3. **Check IP reputation:**
   - Visit Sender Score website
   - Check MXToolbox blacklists

### Rate Limiting Issues

1. **Check rate limit logs**
2. **Adjust limits in code**
3. **Consider Redis for distributed rate limiting**

---

## Cost Comparison

| Option                   | Monthly Cost | Setup Time | Maintenance |
| ------------------------ | ------------ | ---------- | ----------- |
| **Postfix Relay**        | $0           | 30 min     | Low         |
| **Docker Mailserver**    | $0           | 2-4 hours  | Medium      |
| **Form Handler Service** | $0           | 1-2 hours  | Low         |
| **Resend (managed)**     | $0-20        | 15 min     | None        |

---

## Recommendation for Your Use Case

**For 3-5k emails/month:**

1. **Start with Postfix Relay** (Option 4A)
   - Easiest setup
   - Reliable delivery
   - Free
   - Can upgrade later

2. **Upgrade to Docker Mailserver** (Option 4B) if:
   - You want fully self-hosted
   - You're comfortable with DNS configuration
   - You want to learn email infrastructure
   - You have time for maintenance

3. **Consider Resend** if:
   - You want zero maintenance
   - Deliverability is critical
   - You don't mind $0-20/month
   - You want to focus on other features

---

## Next Steps

1. **Choose your approach** (recommend Postfix Relay to start)
2. **Add SMTP service** to docker-compose.yml
3. **Configure environment variables**
4. **Test SMTP connection**
5. **Implement Server Action** in Next.js
6. **Add rate limiting and security**
7. **Test end-to-end**
8. **Monitor and iterate**
