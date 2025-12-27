# Twilio SMS Notifications for CI/CD

**Last Updated:** 2025  
**Purpose:** Configure Twilio to send SMS notifications when CI workflows fail  
**Location:** `.github/workflows/ci.yml`

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Twilio Account Setup](#twilio-account-setup)
4. [Get Your Twilio Credentials](#get-your-twilio-credentials)
5. [Verify Recipient Phone Number](#verify-recipient-phone-number)
6. [A2P 10DLC Registration (US/Canada)](#a2p-10dlc-registration-uscanada)
7. [Configure GitHub Secrets](#configure-github-secrets)
8. [Add Notification Job to CI Workflow](#add-notification-job-to-ci-workflow)
9. [Testing Your Setup](#testing-your-setup)
10. [Cost Considerations](#cost-considerations)
11. [Troubleshooting](#troubleshooting)
12. [Security Best Practices](#security-best-practices)
13. [Quick Checklist](#quick-checklist)

---

## Overview

This guide explains how to configure Twilio SMS notifications for GitHub Actions CI workflows. When your CI pipeline fails, you'll receive an SMS text message with details about the failure.

**Use Cases:**

- Get immediate notifications when production builds fail
- Stay informed about CI status without checking GitHub
- Receive alerts on critical branch failures (`main`/`master`)

**Requirements:**

- Twilio account (free trial available)
- Twilio phone number
- GitHub repository with Actions enabled

---

## Prerequisites

Before starting, ensure you have:

- ✅ A Twilio account (sign up at https://www.twilio.com/try-twilio)
- ✅ A phone number you want to receive SMS notifications on
- ✅ Access to your GitHub repository settings
- ✅ Admin access to your GitHub repository (to add secrets)

---

## Twilio Account Setup

### Step 1: Create Twilio Account

1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free account
3. Verify your email address
4. Complete phone number verification

### Step 2: Purchase a Phone Number

1. Log into Twilio Console: https://console.twilio.com
2. Navigate to **Phone Numbers** → **Buy a number**
3. Select your country/region
4. Choose a number with SMS capabilities
5. Complete the purchase (free trial includes $15.50 credit)

**Note:** Trial accounts can only send SMS to verified phone numbers. Paid accounts can send to any number.

---

## Get Your Twilio Credentials

You'll need these credentials from your Twilio Console:

### 1. Account SID

**Location:** Dashboard → Account Info → Account SID

- Format: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- Example: `AC1234567890abcdef1234567890abcdef`
- This is your unique account identifier

### 2. Auth Token

**Location:** Dashboard → Account Info → Auth Token

- Click the eye icon to reveal the token
- Format: Long alphanumeric string
- **⚠️ Keep this secret** - treat it like a password
- You can regenerate it if needed (old tokens will stop working)

### 3. Phone Number

**Location:** Phone Numbers → Manage → Active numbers

- Copy the phone number in E.164 format
- Format: `+1234567890` (includes country code and `+`)
- Example: `+15551234567`
- This is the number that will send SMS messages

---

## Verify Recipient Phone Number

### For Trial Accounts

Trial accounts can only send SMS to verified phone numbers:

1. Go to **Phone Numbers** → **Manage** → **Verified Caller IDs**
2. Click **Add a new number**
3. Enter your phone number (the one you want to receive notifications)
4. Choose verification method:
   - **SMS**: Receive a verification code via text
   - **Phone Call**: Receive a verification code via automated call
5. Enter the verification code
6. Number is now verified ✅

**Note:** You can verify up to 10 numbers on a trial account.

### For Paid Accounts

- ✅ Can send to any US/Canadian number without verification
- ⚠️ International numbers may require verification depending on country
- ⚠️ Some countries have regulatory requirements

---

## A2P 10DLC Registration (US/Canada)

**What is A2P 10DLC?**

- Application-to-Person 10-Digit Long Code messaging
- Required for sending SMS to US/Canadian numbers (as of 2021)
- Ensures better deliverability and compliance

### When Do You Need This?

- ✅ **Required**: Sending to US/Canadian numbers on a paid account
- ⚠️ **Not Required**: Using trial account with verified numbers
- ⚠️ **Not Required**: Personal/hobby projects (can use trial number)

### Registration Process

1. **Go to Twilio Console** → **Messaging** → **Regulatory Compliance** → **A2P 10DLC**

2. **Register Your Brand** (Company/Individual):
   - Company name or your name
   - Business type (Individual, Sole Proprietor, LLC, etc.)
   - Tax ID (if applicable)
   - Business address
   - **Approval time**: Usually instant for individuals, 1-3 days for businesses

3. **Register a Campaign**:
   - Campaign name: "CI/CD Notifications" or "GitHub Actions Alerts"
   - Use case: Select "Notifications" or "Alerts"
   - Message sample: "CI Failed: [repo] - [branch] - View: [link]"
   - **Approval time**: 1-3 business days

4. **Wait for Approval**:
   - You'll receive email notifications about approval status
   - Can check status in Twilio Console
   - Until approved, you can use a trial number for testing

### Alternative: Use Trial Number

For personal/hobby projects, you can skip A2P 10DLC registration by:

- Using a trial account
- Verifying your recipient phone number
- Note: Delivery may be slower, but works for low-volume notifications

---

## Configure GitHub Secrets

GitHub Secrets store your Twilio credentials securely. They're encrypted and only accessible to your workflows.

### Step 1: Navigate to Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Step 2: Add Required Secrets

Add these four secrets:

#### Secret 1: `TWILIO_ACCOUNT_SID`

- **Name:** `TWILIO_ACCOUNT_SID`
- **Value:** Your Account SID (e.g., `AC1234567890abcdef...`)
- **Example:** `AC1234567890abcdef1234567890abcdef`

#### Secret 2: `TWILIO_AUTH_TOKEN`

- **Name:** `TWILIO_AUTH_TOKEN`
- **Value:** Your Auth Token (reveal it in Twilio Console)
- **Example:** `your_auth_token_here_keep_secret`

#### Secret 3: `TWILIO_PHONE_NUMBER`

- **Name:** `TWILIO_PHONE_NUMBER`
- **Value:** Your Twilio phone number in E.164 format
- **Example:** `+15551234567`

#### Secret 4: `TWILIO_RECIPIENT_PHONE`

- **Name:** `TWILIO_RECIPIENT_PHONE`
- **Value:** The phone number to receive notifications (E.164 format)
- **Example:** `+19876543210`

### Step 3: Verify Secrets

After adding all secrets, you should see:

- ✅ `TWILIO_ACCOUNT_SID`
- ✅ `TWILIO_AUTH_TOKEN`
- ✅ `TWILIO_PHONE_NUMBER`
- ✅ `TWILIO_RECIPIENT_PHONE`

**⚠️ Important:** Secrets are masked in workflow logs. Never commit these values to your repository.

---

## Add Notification Job to CI Workflow

Add a notification job to your `.github/workflows/ci.yml` file. This job will run after all CI jobs complete and send an SMS if any job failed.

### Option 1: Using curl (Simple)

Add this job to your workflow file:

```yaml
notify-sms:
  name: Send SMS Notification
  runs-on: ubuntu-latest
  needs: [lint-and-typecheck, unit-tests, e2e-tests, build]
  if: |
    always() && 
    (needs.lint-and-typecheck.result == 'failure' ||
     needs.unit-tests.result == 'failure' ||
     needs.e2e-tests.result == 'failure' ||
     needs.build.result == 'failure') &&
    (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master')
  steps:
    - name: Send SMS via Twilio
      run: |
        curl -X POST "https://api.twilio.com/2010-04-01/Accounts/${{ secrets.TWILIO_ACCOUNT_SID }}/Messages.json" \
          --data-urlencode "From=${{ secrets.TWILIO_PHONE_NUMBER }}" \
          --data-urlencode "To=${{ secrets.TWILIO_RECIPIENT_PHONE }}" \
          --data-urlencode "Body=🚨 CI Failed: ${{ github.repository }} - ${{ github.ref_name }} - View: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}" \
          -u "${{ secrets.TWILIO_ACCOUNT_SID }}:${{ secrets.TWILIO_AUTH_TOKEN }}"
```

**Features:**

- ✅ Only sends SMS on failures
- ✅ Only sends for `main`/`master` branches
- ✅ Includes link to workflow run
- ✅ Simple, no dependencies

### Option 2: Using GitHub Action (Recommended)

For better error handling and reliability:

```yaml
notify-sms:
  name: Send SMS Notification
  runs-on: ubuntu-latest
  needs: [lint-and-typecheck, unit-tests, e2e-tests, build]
  if: |
    always() && 
    (needs.lint-and-typecheck.result == 'failure' ||
     needs.unit-tests.result == 'failure' ||
     needs.e2e-tests.result == 'failure' ||
     needs.build.result == 'failure')
  steps:
    - name: Send SMS via Twilio
      uses: appleboy/twilio-sms-action@v0.1.0
      with:
        account_sid: ${{ secrets.TWILIO_ACCOUNT_SID }}
        auth_token: ${{ secrets.TWILIO_AUTH_TOKEN }}
        from: ${{ secrets.TWILIO_PHONE_NUMBER }}
        to: ${{ secrets.TWILIO_RECIPIENT_PHONE }}
        body: |
          🚨 CI Failed

          Repo: ${{ github.repository }}
          Branch: ${{ github.ref_name }}
          Commit: ${{ github.sha }}
          Author: ${{ github.actor }}

          View: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
```

**Features:**

- ✅ Better error handling
- ✅ More readable message format
- ✅ Includes commit and author info
- ✅ Uses maintained GitHub Action

### Option 3: With Rate Limiting

To prevent SMS spam on repeated failures:

```yaml
notify-sms:
  name: Send SMS Notification
  runs-on: ubuntu-latest
  needs: [lint-and-typecheck, unit-tests, e2e-tests, build]
  if: |
    always() && 
    (needs.lint-and-typecheck.result == 'failure' ||
     needs.unit-tests.result == 'failure' ||
     needs.e2e-tests.result == 'failure' ||
     needs.build.result == 'failure') &&
    github.ref == 'refs/heads/main' &&
    !contains(github.event.head_commit.message, '[skip sms]')
  steps:
    - name: Send SMS via Twilio
      uses: appleboy/twilio-sms-action@v0.1.0
      with:
        account_sid: ${{ secrets.TWILIO_ACCOUNT_SID }}
        auth_token: ${{ secrets.TWILIO_AUTH_TOKEN }}
        from: ${{ secrets.TWILIO_PHONE_NUMBER }}
        to: ${{ secrets.TWILIO_RECIPIENT_PHONE }}
        body: |
          🚨 CI Failed: ${{ github.repository }}
          Branch: ${{ github.ref_name }}
          View: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
```

**Features:**

- ✅ Can skip SMS with `[skip sms]` in commit message
- ✅ Only sends for production branches
- ✅ Prevents notification spam

### Placement in Workflow

Add the notification job **after** all your CI jobs. Example structure:

```yaml
jobs:
  check-commit-message:
    # ... existing job ...

  lint-and-typecheck:
    # ... existing job ...

  unit-tests:
    # ... existing job ...

  e2e-tests:
    # ... existing job ...

  build:
    # ... existing job ...

  notify-sms: # ← Add notification job here
    # ... notification job configuration ...
```

---

## Testing Your Setup

### Step 1: Test from Command Line

Before adding to GitHub Actions, test your Twilio credentials locally:

```bash
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json" \
  --data-urlencode "From=+1234567890" \
  --data-urlencode "To=+19876543210" \
  --data-urlencode "Body=Test message from Twilio" \
  -u "YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN"
```

**Expected Response:**

```json
{
  "sid": "SM1234567890abcdef...",
  "status": "queued",
  "date_created": "2025-01-15T12:00:00Z",
  ...
}
```

If you receive this response, your credentials are correct ✅

### Step 2: Test in GitHub Actions

1. **Commit the workflow changes** with the notification job
2. **Intentionally break a test** or cause a CI failure
3. **Push to `main` branch** (or trigger the workflow)
4. **Wait for workflow to complete**
5. **Check your phone** for SMS notification

### Step 3: Verify SMS Received

You should receive an SMS with:

- 🚨 CI Failed message
- Repository name
- Branch name
- Link to workflow run

---

## Cost Considerations

### Trial Account

- **Free Credit:** $15.50 USD
- **SMS Cost (US):** ~$0.0075 per message
- **Messages Available:** ~2,000 SMS
- **Limitations:**
  - Can only send to verified numbers
  - Messages include "Sent from a Twilio trial account" prefix
  - Account expires after inactivity

### Paid Account

- **SMS Cost (US):** $0.0075 per message (~$0.75 per 100 messages)
- **Monthly Cost:** $1.00 base fee (if you have a phone number)
- **Phone Number:** ~$1.00/month per number

### Estimated Monthly Cost for CI Notifications

**Scenario:** 10 CI failures per month

- **SMS Cost:** 10 × $0.0075 = $0.075
- **Phone Number:** $1.00/month
- **Total:** ~$1.08/month

**Scenario:** 100 CI failures per month

- **SMS Cost:** 100 × $0.0075 = $0.75
- **Phone Number:** $1.00/month
- **Total:** ~$1.75/month

**Note:** If you already have a Twilio number for other purposes, SMS costs are minimal.

---

## Troubleshooting

### Error: "The number +1XXXXXXXXXX is not a valid, SMS-capable inbound phone number"

**Cause:** The sender phone number isn't verified or isn't SMS-capable.

**Solutions:**

1. Verify the number in Twilio Console → Phone Numbers → Manage
2. Ensure the number has SMS capabilities (not voice-only)
3. For trial accounts, verify the number in Verified Caller IDs

### Error: "The 'From' number +1XXXXXXXXXX is not a valid, SMS-capable inbound phone number or short code for your account"

**Cause:** The phone number isn't properly configured for your account.

**Solutions:**

1. Check that the number is active in Twilio Console
2. Verify the number has SMS capabilities enabled
3. Complete A2P 10DLC registration if sending to US/Canada
4. Ensure you're using the correct E.164 format (`+1234567890`)

### Error: "The message From/To pair violates a blacklist rule"

**Cause:** The recipient number is blocked in Twilio.

**Solutions:**

1. Go to Twilio Console → Phone Numbers → Blocked Numbers
2. Remove the number from the blocklist
3. Verify the recipient number is correct

### Error: "HTTP 401 Unauthorized"

**Cause:** Invalid Account SID or Auth Token.

**Solutions:**

1. Verify `TWILIO_ACCOUNT_SID` in GitHub Secrets matches your Account SID
2. Verify `TWILIO_AUTH_TOKEN` in GitHub Secrets matches your Auth Token
3. Check for extra spaces or characters in secrets
4. Regenerate Auth Token in Twilio Console if needed

### Error: "Unable to create record: The number +1XXXXXXXXXX is unverified"

**Cause:** Trial account trying to send to unverified number.

**Solutions:**

1. Verify the recipient number in Twilio Console → Verified Caller IDs
2. Upgrade to a paid account (if you need to send to unverified numbers)
3. Use a verified number for testing

### SMS Not Received

**Possible Causes:**

1. **Workflow didn't trigger:** Check GitHub Actions tab
2. **Job was skipped:** Check workflow conditions
3. **Phone number incorrect:** Verify E.164 format
4. **Carrier blocking:** Some carriers block automated messages
5. **A2P 10DLC not approved:** Check campaign status in Twilio Console

**Debugging Steps:**

1. Check GitHub Actions logs for the `notify-sms` job
2. Look for error messages in the workflow run
3. Check Twilio Console → Monitor → Logs → Messaging for delivery status
4. Verify phone number format (must include country code: `+1` for US)

### Workflow Job Not Running

**Possible Causes:**

1. **Condition not met:** Check the `if:` condition in the job
2. **Dependencies failed:** Ensure `needs:` jobs completed
3. **Branch filter:** Verify you're pushing to the correct branch

**Solutions:**

1. Check workflow run logs
2. Verify job conditions match your requirements
3. Test with `if: always()` temporarily to see if job runs

---

## Security Best Practices

### 1. Never Commit Credentials

**❌ Bad:**

```yaml
# Never do this!
env:
  TWILIO_AUTH_TOKEN: "your_token_here"
```

**✅ Good:**

```yaml
# Always use secrets
env:
  TWILIO_AUTH_TOKEN: ${{ secrets.TWILIO_AUTH_TOKEN }}
```

### 2. Use GitHub Secrets

- ✅ Store all Twilio credentials in GitHub Secrets
- ✅ Secrets are encrypted at rest
- ✅ Secrets are masked in workflow logs
- ✅ Only accessible to repository workflows

### 3. Rotate Auth Token Periodically

1. Go to Twilio Console → Account → Auth Tokens
2. Create a new Auth Token
3. Update GitHub Secret with new token
4. Delete old token (after confirming new one works)

### 4. Limit Notification Scope

Only send notifications for critical failures:

```yaml
if: |
  always() && 
  (needs.build.result == 'failure') &&  # Only build failures
  github.ref == 'refs/heads/main'        # Only main branch
```

### 5. Use Branch Protection

- Enable branch protection on `main`/`master`
- Require CI to pass before merging
- Prevents unnecessary notifications from broken code

### 6. Monitor Usage

- Check Twilio Console → Monitor → Usage regularly
- Set up billing alerts in Twilio Console
- Review unexpected spikes in usage

---

## Quick Checklist

Use this checklist to ensure everything is configured correctly:

### Twilio Setup

- [ ] Twilio account created
- [ ] Phone number purchased/verified
- [ ] Account SID copied
- [ ] Auth Token copied (and kept secret)
- [ ] Phone number copied (E.164 format)
- [ ] Recipient number verified (if trial account)
- [ ] A2P 10DLC registration started (if needed)

### GitHub Setup

- [ ] `TWILIO_ACCOUNT_SID` secret added
- [ ] `TWILIO_AUTH_TOKEN` secret added
- [ ] `TWILIO_PHONE_NUMBER` secret added
- [ ] `TWILIO_RECIPIENT_PHONE` secret added
- [ ] Notification job added to workflow
- [ ] Workflow file committed

### Testing

- [ ] Test SMS sent successfully from command line
- [ ] CI failure test completed
- [ ] SMS notification received
- [ ] Message content verified

### Production

- [ ] Notification conditions configured (branch filters)
- [ ] Rate limiting considered (if needed)
- [ ] Security best practices followed
- [ ] Monitoring set up (Twilio usage alerts)

---

## Additional Resources

- **Twilio API Documentation:** https://www.twilio.com/docs/sms
- **Twilio Console:** https://console.twilio.com
- **GitHub Actions Documentation:** https://docs.github.com/en/actions
- **Twilio Pricing:** https://www.twilio.com/sms/pricing
- **A2P 10DLC Guide:** https://www.twilio.com/docs/messaging/a2p-10dlc

---

## Support

If you encounter issues:

1. **Check Twilio Console Logs:**
   - Monitor → Logs → Messaging
   - Look for error messages and delivery status

2. **Check GitHub Actions Logs:**
   - Actions tab → Workflow run → notify-sms job
   - Look for error messages in step output

3. **Twilio Support:**
   - Twilio Console → Help & Support
   - Documentation: https://support.twilio.com

4. **GitHub Actions Support:**
   - GitHub Community: https://github.community
   - Documentation: https://docs.github.com/en/actions

---

**Last Updated:** 2025  
**Maintained By:** You  
**Review Schedule:** As needed when Twilio configuration changes
