#!/usr/bin/env python3
"""
Webhook server for receiving GitHub webhooks.
Can be enabled/disabled via pause flag.
"""

import os
import sys
import json
import hmac
import hashlib
import subprocess
from flask import Flask, request, jsonify

app = Flask(__name__)

# Configuration from environment
WEBHOOK_SECRET = os.getenv('WEBHOOK_SECRET', '')
WEBHOOK_PORT = int(os.getenv('WEBHOOK_PORT', '8080'))
PAUSE_FLAG = '/app/flags/.sync-paused'
LOG_FILE = '/app/flags/webhook.log'

def log(message):
    """Log message to file and stdout"""
    log_entry = f"[{__import__('datetime').datetime.now()}] {message}\n"
    print(log_entry.strip())
    try:
        with open(LOG_FILE, 'a') as f:
            f.write(log_entry)
    except:
        pass

def is_paused():
    """Check if sync is paused"""
    return os.path.exists(PAUSE_FLAG)

def verify_signature(payload, signature):
    """Verify GitHub webhook signature"""
    if not WEBHOOK_SECRET:
        log("WARNING: WEBHOOK_SECRET not set, skipping signature verification")
        return True
    
    expected = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(f"sha256={expected}", signature)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'paused': is_paused()
    })

@app.route('/webhook/deploy', methods=['POST'])
def webhook():
    """Handle GitHub webhook"""
    if is_paused():
        reason = "Sync service is paused"
        try:
            with open(PAUSE_FLAG, 'r') as f:
                reason = f.read().strip() or reason
        except:
            pass
        log(f"Webhook received but sync is paused: {reason}")
        return jsonify({
            'status': 'paused',
            'message': reason
        }), 200
    
    # Verify signature
    signature = request.headers.get('X-Hub-Signature-256', '')
    payload = request.get_data()
    
    if not verify_signature(payload, signature):
        log("WARNING: Invalid webhook signature")
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Parse webhook payload
    try:
        data = request.get_json()
        event = request.headers.get('X-GitHub-Event', '')
        ref = data.get('ref', '')
        
        log(f"Webhook received: {event} for ref {ref}")
        
        # Only process pushes to main branch
        if event == 'push' and ref == 'refs/heads/main':
            log("Triggering code sync...")
            # Trigger sync script
            subprocess.Popen(['/app/sync.sh', '--once'], 
                           stdout=subprocess.PIPE, 
                           stderr=subprocess.PIPE)
            return jsonify({
                'status': 'success',
                'message': 'Deployment triggered'
            }), 200
        else:
            log(f"Ignoring webhook: {event} for {ref}")
            return jsonify({
                'status': 'ignored',
                'message': 'Not a push to main branch'
            }), 200
            
    except Exception as e:
        log(f"ERROR processing webhook: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/pause', methods=['POST'])
def pause():
    """Pause sync service (requires auth)"""
    # Simple auth check (you can enhance this)
    auth = request.headers.get('Authorization', '')
    if auth != f"Bearer {os.getenv('ADMIN_TOKEN', '')}":
        return jsonify({'error': 'Unauthorized'}), 401
    
    reason = request.json.get('reason', 'Maintenance') if request.is_json else 'Maintenance'
    
    try:
        with open(PAUSE_FLAG, 'w') as f:
            f.write(reason)
        log(f"Sync service PAUSED: {reason}")
        return jsonify({
            'status': 'paused',
            'reason': reason
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/resume', methods=['POST'])
def resume():
    """Resume sync service (requires auth)"""
    auth = request.headers.get('Authorization', '')
    if auth != f"Bearer {os.getenv('ADMIN_TOKEN', '')}":
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        if os.path.exists(PAUSE_FLAG):
            os.remove(PAUSE_FLAG)
            log("Sync service RESUMED")
            return jsonify({'status': 'resumed'}), 200
        else:
            return jsonify({'status': 'already_active'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    log("Starting webhook server...")
    log(f"Port: {WEBHOOK_PORT}")
    log(f"Paused: {is_paused()}")
    app.run(host='0.0.0.0', port=WEBHOOK_PORT, debug=False)

