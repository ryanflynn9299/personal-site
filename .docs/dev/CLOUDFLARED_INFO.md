# Secure Remote Access to Private Services via Identity-Aware Tunneling

## Purpose of This Document

This document captures the **architecture, mental model, and moving parts** of a system designed to:

- Keep production services private and always-on
- Allow secure access from anywhere in the world
- Avoid device-level VPNs or client software
- Prefer identity-based access over network-based trust
- Integrate cleanly with containerized (Docker-based) infrastructure

The goal is **long-term recall**: even years later, this should restore enough context to re-derive the exact implementation details using current tooling and documentation.

---

## Core Problem Statement

You have:

- A private production stack (e.g., web app, APIs, CMS, databases)
- Services connected via an internal container network
- No desire to expose services directly to the public internet
- A need to access backend services from remote development environments

Key constraint:

> Development machines should not need to join the private network.

---

## High-Level Solution Pattern

**Identity-aware ingress via outbound tunnels**

Instead of extending the private network outward (VPN), you:

1. Keep all services private
2. Establish an outbound, encrypted tunnel from the private network
3. Place an identity-aware access layer _before_ traffic reaches your services
4. Access services via HTTPS using authenticated hostnames

This inverts the traditional trust model:

- ❌ “If you’re on the network, you’re trusted”
- ✅ “If your identity is authorized, you get access to this service”

---

## Mental Model (Anchor This)

- **Internal network**: trusted, container-name-based, non-routable
- **Tunnel**: encrypted, outbound-only connection to an edge provider
- **Edge**: terminates TLS, enforces identity, routes traffic
- **Access layer**: identity, MFA, policy, auditing
- **Developer machine**: untrusted external client

Container DNS _never_ crosses the Docker boundary.

---

## Major Components and Responsibilities

### 1. Tunnel Agent (e.g., `cloudflared`-like component)

Responsibilities:

- Runs inside the private network
- Maintains persistent outbound connections
- Forwards traffic from edge → internal services
- Does **no authentication or authorization**

Properties:

- Stateless
- Low resource usage
- Always running
- Restartable without data loss

---

### 2. Identity / Access Control Plane

Responsibilities:

- Authenticate users and services
- Enforce policies (who can access what)
- Require MFA, device posture, or other conditions
- Issue short-lived access sessions
- Provide audit logs

Configured dynamically (dashboard / API), not in local config files.

---

### 3. Routing Configuration (Data Plane)

Defined locally with the tunnel agent.

Responsibilities:

- Map hostnames to internal services
- Specify fallback behavior
- Remain simple and declarative

Example (abstract):

```yaml
ingress:
  - hostname: service.dev.example.com
    service: http://internal-service:port
  - service: http_status:404
```

This layer:
Knows where traffic goes
Does not know who is allowed

### 4. DNS

Responsibilities:
Map public hostnames to tunnel endpoints
Never point to private IPs
Always route through the edge provider
Important property:
DNS does not imply reachability without authentication
