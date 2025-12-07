# Contact Form Submission Options

## Requirements

- ✅ Secure submission of visitor information
- ✅ Email notification to you
- ✅ Metrics tracking (submissions, success rate, etc.)
- ✅ Rate limiting (prevent spam/abuse)
- ✅ Privacy features (GDPR compliance, data handling)

---

## Option 4: Self-Hosted SMTP + Server Actions (Homelab-Friendly) ⭐

### Architecture

```
Client Component (ContactPageClient)
  ↓ submits form
Server Action (app/actions/contact.ts)
  ↓ validates & rate limits
  ↓ connects to SMTP server
Self-Hosted SMTP Server (Docker)
  ↓ sends email via your mail server
  ↓ delivers to your inbox
Matomo Analytics
  ↓ tracks submission event
```

### Implementation

**Components:**

- Next.js Server Action for form handling
- Self-hosted SMTP server (Postfix, Docker Mailserver, or simple relay)
- Rate limiting (in-memory or Redis)
- Database storage (optional, in Directus or PostgreSQL)

**Files to Create:**

- `app/actions/contact.ts` - Server Action
- `lib/smtp.ts` - SMTP client wrapper
- `lib/rate-limit.ts` - Rate limiting utility
- `docker-compose.yml` - Add SMTP service (if using Docker)

### Self-Hosted SMTP Options

#### Option 4A: Simple Postfix Relay (Easiest)

**What it is:**

- Minimal Postfix container that relays emails
- Uses your existing mail server or external SMTP relay
- Perfect for low-volume transactional emails

**Setup:**

```yaml
# Add to docker-compose.yml
ps-smtp:
  image: catatnight/postfix:latest
  container_name: ps-smtp
  environment:
    - maildomain=yourdomain.com
    - smtp_user=your-email@gmail.com:your-password
    - smtp_server=smtp.gmail.com:587
  networks:
    - backend-net
```

**Pros:**

- ✅ Very simple setup
- ✅ Can relay through Gmail/Outlook SMTP
- ✅ No mail server maintenance
- ✅ Works with existing email accounts

**Cons:**

- ⚠️ Still uses external SMTP (Gmail, etc.)
- ⚠️ Not fully self-hosted (relies on external service)

#### Option 4B: Docker Mailserver (Full Mail Server)

**What it is:**

- Complete mail server in Docker
- Includes Postfix (SMTP), Dovecot (IMAP), Rspamd (spam filter)
- Full control over email delivery

**Setup:**

```yaml
# Add to docker-compose.yml
ps-mailserver:
  image: docker.io/mailserver/docker-mailserver:latest
  container_name: ps-mailserver
  hostname: mail
  domainname: yourdomain.com
  volumes:
    - mail-data:/var/mail
    - mail-state:/var/mail-state
    - ./mailserver/config:/tmp/docker-mailserver
  environment:
    - ENABLE_SPAMASSASSIN=1
    - ENABLE_CLAMAV=1
    - ENABLE_FAIL2BAN=1
  networks:
    - backend-net
```

**Pros:**

- ✅ Fully self-hosted
- ✅ Complete control
- ✅ Can send/receive emails
- ✅ No external dependencies
- ✅ Free (just server resources)

**Cons:**

- ⚠️ More complex setup
- ⚠️ Requires DNS configuration (MX, SPF, DKIM, DMARC)
- ⚠️ Deliverability challenges (can be marked as spam)
- ⚠️ Ongoing maintenance required

#### Option 4C: Simple Form-to-Email Service (Lightweight)

**What it is:**

- Lightweight service that accepts form submissions
- Sends emails via SMTP
- Examples: Hugo-Contact, Form2Mail, custom Node.js service

**Setup:**

```yaml
# Custom form-to-email service
ps-form-handler:
  build: ./form-handler
  container_name: ps-form-handler
  environment:
    - SMTP_HOST=ps-smtp
    - SMTP_PORT=25
    - SMTP_USER=contact@yourdomain.com
    - SMTP_PASS=${SMTP_PASSWORD}
    - RECIPIENT_EMAIL=your-email@gmail.com
  networks:
    - backend-net
```

**Pros:**

- ✅ Very lightweight
- ✅ Purpose-built for forms
- ✅ Easy to customize
- ✅ Can add features (webhooks, storage)

**Cons:**

- ⚠️ Need to build/maintain service
- ⚠️ Still need SMTP server

#### Option 4D: Use Existing Mail Server (If You Have One)

**What it is:**

- If you already run a mail server (Mail-in-a-Box, etc.)
- Just connect to it via SMTP
- No additional setup needed

**Pros:**

- ✅ No additional infrastructure
- ✅ Uses existing setup
- ✅ Free (already running)

**Cons:**

- ⚠️ Only if you already have mail server
- ⚠️ Need to ensure it can handle transactional emails

### Security Features

1. **Rate Limiting**
   - Per IP: 3 submissions per hour
   - Per email: 2 submissions per day
   - In-memory or Redis cache
   - Returns 429 on limit exceeded

2. **Input Validation**
   - Server-side validation (Zod schema)
   - Sanitize HTML in message field
   - Email format validation
   - Max length limits

3. **Spam Protection**
   - Honeypot field (hidden, bots fill it)
   - Content filtering
   - IP-based blocking (optional)

4. **Privacy**
   - No PII stored in logs
   - IP address anonymization
   - Auto-delete submissions after 90 days (optional)
   - Data stored on your infrastructure

### Email Deliverability Considerations

**Important for Self-Hosted:**

1. **SPF Record**: Authorize your server to send emails

   ```
   TXT @ "v=spf1 ip4:YOUR_SERVER_IP include:_spf.google.com ~all"
   ```

2. **DKIM**: Sign emails to prove authenticity
   - Docker Mailserver generates keys automatically
   - Add public key to DNS

3. **DMARC**: Policy for email authentication

   ```
   TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"
   ```

4. **Reverse DNS**: PTR record pointing to your domain
   - Helps with deliverability
   - Some providers require this

5. **IP Reputation**:
   - New IPs may have lower deliverability
   - Warm up IP gradually
   - Monitor bounce rates

### Metrics Tracking

- **Matomo Events**: Track form submissions, success/failure
- **Database**: Store submission metadata (optional, in Directus)
- **SMTP Logs**: Check mail server logs for delivery status
- **Custom Dashboard**: View in admin panel

### Notification Method

- **Primary**: Email via your self-hosted SMTP server
- **Format**: Plain text or HTML email
- **Reply-To**: Set to visitor's email (for easy replies)
- **Optional**: Store in database for admin viewing

### Recommended Approach: Option 4A (Postfix Relay)

**For your use case (3-5k emails/month):**

1. **Use Postfix Relay** with Gmail/Outlook SMTP
   - Simple setup
   - Reliable delivery
   - No mail server maintenance
   - Free (uses your existing email account)

2. **Or use Docker Mailserver** if you want fully self-hosted
   - More setup work
   - Full control
   - Need to configure DNS properly
   - Risk of deliverability issues

### Pros

- ✅ **Completely free** (just server resources)
- ✅ **Full control** over data and infrastructure
- ✅ **Privacy-focused** (all data on your server)
- ✅ **No external dependencies** (if using full mail server)
- ✅ **Homelab-friendly** (fits your self-hosted philosophy)
- ✅ **Scalable** (can handle more volume if needed)
- ✅ **Learning opportunity** (understand email infrastructure)

### Cons

- ⚠️ **Setup complexity** (especially full mail server)
- ⚠️ **Deliverability challenges** (can be marked as spam)
- ⚠️ **DNS configuration** required (SPF, DKIM, DMARC)
- ⚠️ **Maintenance** (monitor logs, update software)
- ⚠️ **IP reputation** (new IPs may have issues)
- ⚠️ **Time investment** (initial setup and troubleshooting)

### Implementation Complexity: **Medium-High**

### Estimated Cost

- **Postfix Relay**: $0 (uses existing email account)
- **Docker Mailserver**: $0 (just server resources)
- **DNS**: $0 (already have domain)
- **Total: $0/month** ✅

### Deliverability Tips

1. **Start with relay** (Gmail/Outlook SMTP) for reliability
2. **Gradually move to full mail server** if desired
3. **Monitor bounce rates** and spam complaints
4. **Warm up IP** if using new mail server
5. **Use dedicated IP** if possible (better reputation)
6. **Monitor blacklists** (check if your IP is listed)

---

## Option 1: Next.js Server Actions + Email Service (Recommended)

### Architecture

```
Client Component (ContactPageClient)
  ↓ submits form
Server Action (app/actions/contact.ts)
  ↓ validates & rate limits
  ↓ stores in database (optional)
Email Service (Resend/SendGrid)
  ↓ sends email
  ↓ sends notification
Matomo Analytics
  ↓ tracks submission event
```

### Implementation

**Components:**

- Next.js Server Action for form handling
- Email service (Resend, SendGrid, or SMTP)
- Rate limiting (Redis or in-memory store)
- Database storage (PostgreSQL via Directus or separate table)
- Matomo event tracking

**Files to Create:**

- `app/actions/contact.ts` - Server Action
- `lib/email.ts` - Email service wrapper
- `lib/rate-limit.ts` - Rate limiting utility
- `lib/contact-storage.ts` - Database storage (optional)

### Security Features

1. **Rate Limiting**
   - Per IP: 3 submissions per hour
   - Per email: 2 submissions per day
   - Uses Redis or in-memory cache
   - Returns 429 status on limit exceeded

2. **Input Validation**
   - Server-side validation (Zod schema)
   - Sanitize HTML in message field
   - Email format validation
   - Max length limits (name: 100, email: 255, message: 5000)

3. **Spam Protection**
   - Honeypot field (hidden, bots fill it)
   - reCAPTCHA v3 (optional, invisible)
   - Content filtering (basic keyword detection)

4. **Privacy**
   - No PII stored in logs
   - GDPR-compliant data handling
   - Auto-delete submissions after 90 days (optional)
   - IP address anonymization

### Metrics Tracking

- **Matomo Events**: Track form submissions, success/failure
- **Database**: Store submission metadata (timestamp, IP hash, status)
- **Email Service**: Delivery status, bounce tracking
- **Custom Dashboard**: View in admin panel or Directus

### Notification Method

- **Primary**: Email via Resend/SendGrid to your inbox
- **Format**: HTML email with submission details
- **Reply-To**: Set to visitor's email (for easy replies)
- **Optional**: Slack/Discord webhook notification

### Email Service Options

**Resend** (Recommended)

- Modern, developer-friendly
- Free tier: 3,000 emails/month
- Great API, TypeScript support
- $20/month for 50k emails

**SendGrid**

- Established, reliable
- Free tier: 100 emails/day
- More features, slightly more complex
- $19.95/month for 50k emails

**SMTP (Self-hosted)**

- Use your own mail server
- Full control, no external dependencies
- More complex setup
- Requires mail server maintenance

### Pros

- ✅ Full control over implementation
- ✅ Leverages Next.js Server Actions (modern pattern)
- ✅ Can integrate with existing Directus/PostgreSQL
- ✅ Customizable rate limiting and validation
- ✅ No external form service dependencies
- ✅ Data stored on your infrastructure
- ✅ Can add custom features easily

### Cons

- ⚠️ More implementation work
- ⚠️ Need to manage email service account
- ⚠️ Rate limiting requires Redis or similar
- ⚠️ Need to handle email deliverability

### Implementation Complexity: **Medium**

### Estimated Cost

- Email Service: $0-20/month (depending on volume)
- Redis (if needed): $0 (in-memory) or $5-10/month (managed)
- **Total: $0-30/month**

---

## Option 2: Third-Party Form Service (Easiest)

### Architecture

```
Client Component (ContactPageClient)
  ↓ submits to third-party API
Third-Party Service (Formspree/FormSubmit)
  ↓ handles validation, rate limiting, storage
  ↓ sends email
  ↓ sends webhook (optional)
Matomo Analytics
  ↓ tracks submission event
```

### Implementation

**Components:**

- Form service API endpoint
- Webhook handler (optional, for metrics)
- Matomo event tracking

**Files to Create:**

- Update `ContactPageClient.tsx` to submit to service
- `app/api/webhooks/formspree/route.ts` (optional, for webhooks)

### Service Options

#### Formspree (Recommended for Third-Party)

**Features:**

- Built-in spam protection (Akismet)
- Rate limiting included
- Email notifications
- Webhook support
- Submission storage (optional)
- Analytics dashboard

**Pricing:**

- Free: 50 submissions/month
- Pro: $10/month (1,000 submissions)
- Business: $40/month (10,000 submissions)

**Setup:**

```typescript
// Simple fetch to Formspree endpoint
const response = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(formData),
});
```

#### FormSubmit

**Features:**

- Free, no account needed
- Simple email forwarding
- Basic spam protection
- No storage/analytics

**Pricing:**

- Free (unlimited)

**Setup:**

```typescript
// Submit directly to email
const response = await fetch("https://formsubmit.co/YOUR_EMAIL", {
  method: "POST",
  body: formData,
});
```

#### Web3Forms

**Features:**

- Free tier available
- Built-in spam protection
- Email notifications
- Webhook support
- Simple API

**Pricing:**

- Free: 250 submissions/month
- Pro: $5/month (2,500 submissions)

### Security Features

1. **Rate Limiting**
   - Handled by service provider
   - Usually per IP and per form
   - Configurable limits

2. **Spam Protection**
   - Built-in (varies by service)
   - Formspree uses Akismet
   - reCAPTCHA options available

3. **Privacy**
   - GDPR compliance (check provider)
   - Data retention policies
   - IP anonymization options

### Metrics Tracking

- **Service Dashboard**: Built-in analytics (Formspree)
- **Webhooks**: Send to your server for custom tracking
- **Matomo Events**: Track form submissions client-side
- **Email Service**: Delivery status from provider

### Notification Method

- **Primary**: Email via service provider
- **Format**: Configurable email templates
- **Webhook**: Optional notification to your server
- **Dashboard**: View submissions in service dashboard

### Pros

- ✅ Easiest to implement (minimal code)
- ✅ No server-side code needed
- ✅ Built-in spam protection
- ✅ Rate limiting handled
- ✅ Email delivery managed
- ✅ Some services offer free tiers
- ✅ Analytics dashboard included

### Cons

- ⚠️ Less control over implementation
- ⚠️ External dependency
- ⚠️ Data stored on third-party servers
- ⚠️ Potential cost at scale
- ⚠️ Limited customization
- ⚠️ Privacy concerns (data on external service)

### Implementation Complexity: **Low**

### Estimated Cost

- Formspree: $0-40/month
- FormSubmit: $0/month
- Web3Forms: $0-5/month
- **Total: $0-40/month**

---

## Option 3: Directus Integration + Email Service

### Architecture

```
Client Component (ContactPageClient)
  ↓ submits form
Next.js API Route (app/api/contact/route.ts)
  ↓ validates & rate limits
  ↓ stores in Directus
Directus (PostgreSQL)
  ↓ stores submission
  ↓ triggers webhook/flow
Email Service (Resend/SendGrid)
  ↓ sends email notification
Matomo Analytics
  ↓ tracks submission event
```

### Implementation

**Components:**

- Next.js API Route (`app/api/contact/route.ts`)
- Directus collection for submissions
- Directus Flow (automation) for email sending
- Rate limiting middleware
- Matomo event tracking

**Files to Create:**

- `app/api/contact/route.ts` - API endpoint
- `lib/rate-limit.ts` - Rate limiting
- Directus collection schema (via admin UI)
- Directus Flow configuration

### Security Features

1. **Rate Limiting**
   - Per IP: Store in Directus or Redis
   - Per email: Query Directus for recent submissions
   - Configurable limits via Directus settings

2. **Input Validation**
   - Server-side validation (Zod)
   - Directus schema validation
   - Sanitize before storage

3. **Spam Protection**
   - Honeypot field
   - Content filtering
   - Directus can integrate with spam services

4. **Privacy**
   - Data stored in your PostgreSQL (via Directus)
   - Full control over data retention
   - GDPR-compliant handling
   - Auto-archive/delete via Directus flows

### Metrics Tracking

- **Directus Dashboard**: View all submissions
- **Directus Analytics**: Built-in query analytics
- **Matomo Events**: Track form submissions
- **Custom Reports**: Query Directus API for metrics
- **Email Service**: Delivery tracking

### Notification Method

- **Primary**: Directus Flow triggers email via Resend/SendGrid
- **Alternative**: Directus webhook to external service
- **Format**: Configurable email templates in Directus
- **Admin Panel**: View submissions in Directus admin UI

### Directus Setup

1. **Create Collection**: `contact_submissions`
   - Fields: `name`, `email`, `message`, `ip_hash`, `created_at`, `status`
2. **Create Flow**:
   - Trigger: On create (contact_submissions)
   - Action: Send email via email service
   - Action: Update Matomo (optional)

3. **Permissions**:
   - Public: Create only
   - Admin: Read/Update/Delete

### Pros

- ✅ Leverages existing Directus infrastructure
- ✅ All data in your PostgreSQL database
- ✅ Admin UI for viewing submissions
- ✅ Directus Flows for automation
- ✅ Can build custom admin features
- ✅ Full control over data
- ✅ Integrates with existing stack

### Cons

- ⚠️ More complex setup
- ⚠️ Need to configure Directus flows
- ⚠️ Still need email service
- ⚠️ Rate limiting requires custom implementation
- ⚠️ More moving parts

### Implementation Complexity: **Medium-High**

### Estimated Cost

- Email Service: $0-20/month
- Directus: Already running (no additional cost)
- PostgreSQL: Already running (no additional cost)
- **Total: $0-20/month**

---

## Comparison Matrix

| Feature                 | Option 1: Server Actions | Option 2: Third-Party | Option 3: Directus     | Option 4: Self-Hosted     |
| ----------------------- | ------------------------ | --------------------- | ---------------------- | ------------------------- |
| **Implementation Time** | Medium (2-3 days)        | Low (1-2 hours)       | Medium-High (3-4 days) | Medium-High (2-5 days)    |
| **Control**             | High                     | Low                   | High                   | **Very High**             |
| **Cost**                | $0-30/month              | $0-40/month           | $0-20/month            | **$0/month** ✅           |
| **Data Storage**        | Your infrastructure      | Third-party           | Your infrastructure    | **Your infrastructure**   |
| **Rate Limiting**       | Custom (need Redis)      | Built-in              | Custom                 | Custom                    |
| **Spam Protection**     | Custom/Add-on            | Built-in              | Custom/Add-on          | Custom/Add-on             |
| **Metrics**             | Custom + Matomo          | Service dashboard     | Directus + Matomo      | Custom + Matomo           |
| **Email Delivery**      | Your service             | Service handles       | Your service           | **Your server**           |
| **Privacy/GDPR**        | Full control             | Depends on provider   | Full control           | **Full control**          |
| **Scalability**         | High                     | Medium                | High                   | High                      |
| **Maintenance**         | Medium                   | Low                   | Medium                 | **High**                  |
| **Integration**         | Easy                     | Easy                  | Easy                   | Easy                      |
| **Self-Hosted**         | Partial                  | No                    | Partial                | **Yes** ✅                |
| **Deliverability**      | High                     | High                  | High                   | **Medium** (needs config) |

---

## Recommendation

### For Your Setup: **Option 4 (Self-Hosted SMTP + Server Actions)** ⭐

**Why:**

1. ✅ **Completely free** - No monthly costs, just server resources
2. ✅ **Fully self-hosted** - Matches your homelab philosophy perfectly
3. ✅ **Full control** - Complete ownership of data and infrastructure
4. ✅ **Privacy-focused** - All data stays on your server
5. ✅ **Scalable** - Can handle your volume (3-5k/month) easily
6. ✅ **Learning opportunity** - Understand email infrastructure
7. ✅ **Integrates with existing stack** - Uses your Docker setup

**Recommended Sub-Option: 4A (Postfix Relay)**

- Start with simple Postfix relay using Gmail/Outlook SMTP
- Reliable delivery without mail server complexity
- Can upgrade to full mail server later if desired
- Zero cost, minimal setup

**Alternative: Option 1 (Server Actions + Resend)**

- If you want easier setup and guaranteed deliverability
- Resend free tier (3,000 emails/month) covers your needs
- Still self-hosted for data, just email delivery external
- Can switch to self-hosted SMTP later

**Implementation Priority:**

1. Start with Resend (easiest email service)
2. Use in-memory rate limiting initially (upgrade to Redis if needed)
3. Store submissions in Directus (optional, for admin viewing)
4. Add Matomo event tracking
5. Implement honeypot spam protection

---

## Implementation Plan (Option 4 - Self-Hosted)

### Phase 1: Basic SMTP Setup

1. Choose SMTP option (recommend Postfix Relay to start)
2. Add SMTP service to `docker-compose.yml`
3. Configure SMTP credentials in `.env`
4. Test SMTP connection from server

### Phase 2: Server Action Implementation

1. Create Server Action (`app/actions/contact.ts`)
2. Create SMTP client wrapper (`lib/smtp.ts`)
3. Create email template
4. Update `ContactPageClient.tsx` to use Server Action
5. Add basic validation

### Phase 3: Security & Rate Limiting

1. Implement rate limiting (in-memory or Redis)
2. Add honeypot field
3. Add input sanitization
4. Add IP-based rate limiting

### Phase 4: Metrics & Storage

1. Add Matomo event tracking
2. Store submissions in Directus (optional)
3. Create admin view for submissions
4. Add analytics dashboard

### Phase 5: DNS Configuration (If Using Full Mail Server)

1. Configure SPF record
2. Set up DKIM signing
3. Configure DMARC policy
4. Set up reverse DNS (PTR record)
5. Test deliverability

### Phase 6: Monitoring & Maintenance

1. Set up email delivery monitoring
2. Monitor bounce rates
3. Check spam blacklists
4. Set up alerts for failures

---

## Implementation Plan (Option 1 - If You Prefer Managed Email)

### Phase 1: Basic Setup

1. Create Server Action (`app/actions/contact.ts`)
2. Set up Resend account and API key
3. Create email template
4. Update `ContactPageClient.tsx` to use Server Action
5. Add basic validation

### Phase 2: Security & Rate Limiting

1. Implement rate limiting (in-memory or Redis)
2. Add honeypot field
3. Add input sanitization
4. Add IP-based rate limiting

### Phase 3: Metrics & Storage

1. Add Matomo event tracking
2. Store submissions in Directus (optional)
3. Create admin view for submissions
4. Add analytics dashboard

### Phase 4: Advanced Features

1. Add reCAPTCHA v3 (if needed)
2. Add auto-archive/delete for old submissions
3. Add email templates
4. Add Slack/Discord notifications (optional)

---

## Security Checklist (All Options)

- [ ] Server-side validation (never trust client)
- [ ] Rate limiting (per IP and per email)
- [ ] Input sanitization (prevent XSS)
- [ ] Spam protection (honeypot, reCAPTCHA, or service)
- [ ] HTTPS only (enforce in production)
- [ ] CORS configuration (if using API route)
- [ ] Error handling (don't leak sensitive info)
- [ ] Logging (audit trail, no PII in logs)
- [ ] Privacy policy (GDPR compliance)
- [ ] Data retention policy (auto-delete old data)

---

## Privacy Considerations

1. **Data Minimization**: Only collect necessary fields
2. **Consent**: Consider adding consent checkbox
3. **Retention**: Auto-delete submissions after 90 days
4. **Access**: Allow users to request their data
5. **Anonymization**: Hash IP addresses, don't store raw IPs
6. **Encryption**: Encrypt sensitive data at rest
7. **GDPR**: Right to deletion, data portability

---

## Next Steps

1. **Choose an option** based on your priorities
2. **Set up email service** (Resend recommended)
3. **Implement basic submission** (test end-to-end)
4. **Add security features** (rate limiting, validation)
5. **Add metrics tracking** (Matomo events)
6. **Test thoroughly** (spam, rate limits, edge cases)
7. **Deploy and monitor** (watch for issues)

---

## Questions to Consider

1. **Volume**: How many submissions do you expect? (affects cost)
2. **Storage**: Do you want to store submissions? (for admin viewing)
3. **Notifications**: Email only, or also Slack/Discord?
4. **Admin UI**: Need to view submissions in admin panel?
5. **Budget**: Willing to pay for email service?
6. **Maintenance**: Prefer managed service or self-hosted?
