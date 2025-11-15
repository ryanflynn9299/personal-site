FROM alpine:latest

# Install dependencies
RUN apk add --no-cache \
    git \
    curl \
    jq \
    bash \
    python3 \
    py3-pip

# Install Python HTTP server dependencies (for future webhook support)
RUN pip3 install flask gunicorn

# Create app directory
WORKDIR /app

# Copy sync scripts
COPY sync.sh /app/sync.sh
COPY webhook-server.py /app/webhook-server.py
COPY entrypoint.sh /app/entrypoint.sh

# Make scripts executable
RUN chmod +x /app/sync.sh /app/webhook-server.py /app/entrypoint.sh

# Create pause flag directory (mounted as volume)
RUN mkdir -p /app/flags

ENTRYPOINT ["/app/entrypoint.sh"]

