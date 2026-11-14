#!/usr/bin/env bash
set -euo pipefail

# Deployment script for shortly-lab on labmuma.xyz host
APP_DIR="/root/shortly-lab"
PORT=3005
APP_NAME="shortly-lab"

cd "$APP_DIR"
echo "=== [1/4] Pulling latest changes ==="
git pull --ff-only origin main

echo "=== [2/4] Installing dependencies ==="
npm install --omit=dev

echo "=== [3/4] Building Next.js 16 production bundle ==="
npm run build

echo "=== [4/4] Starting / Reloading PM2 process ==="
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  pm2 restart "$APP_NAME"
else
  pm2 start npm --name "$APP_NAME" -- run start -- -p "$PORT"
fi

pm2 save
echo "=== Deployment finished successfully on port $PORT ==="
