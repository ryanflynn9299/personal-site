# -----------------------------------------------------------------------------
# Stage 1: The "Builder"
#
# This stage installs dependencies, copies all source code, and builds
# the Next.js application.
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

# Enable Corepack to use pnpm (respects packageManager field in package.json)
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

# Set the working directory
WORKDIR /app

# 1. Install Dependencies
# Copy only the package manifests first.
COPY package.json pnpm-lock.yaml ./
# Install dependencies. This layer is cached by Docker and will only
# re-run if the manifest or lockfile changes.
RUN pnpm install --frozen-lockfile

# 2. Build the Application
# Copy the rest of your application's source code
COPY . .
# Run the Next.js build command.
# CRITICAL: This step requires `output: 'standalone'` in your next.config.ts
# to generate the /app/.next/standalone directory.
RUN pnpm build


# -----------------------------------------------------------------------------
# Stage 2: The "Runner"
#
# This is the final, lean production image. It copies *only* the
# necessary build artifacts from the "builder" stage and nothing else.
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment variables for production
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# --- FIX: Create Non-Root User Correctly ---
# Create a system group named 'nodejs' with a specific Group ID (GID)
# We use '-S' (short for --system) as required by Alpine's BusyBox.
RUN addgroup -S -g 1001 nodejs

# Create a system user named 'nextjs' with a specific User ID (UID)
# -S: Create a system user
# -u 1001: Set the UID
# -g nodejs: Add the user to the 'nodejs' group
# -h /app: Set the user's home directory
# -D: Do not assign a password
RUN adduser -S -u 1001 -g nodejs -h /app -D nextjs

# Copy the *only* files needed for production from the "builder" stage.
# This is why the `standalone` output is so important.
# We also set ownership to our new non-root user.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to the non-root user for enhanced security
USER nextjs

# Expose the port the Next.js server will run on
EXPOSE 3000

# Set the port environment variable
ENV PORT 3000

# The command to start the application.
# The 'server.js' file is part of the 'standalone' output.
CMD ["node", "server.js"]
