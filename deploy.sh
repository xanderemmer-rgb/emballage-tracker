#!/bin/bash
# ─── Emballage Tracker — Deploy naar Vercel ───────────────────────────────────
# Dit script bouwt de app en deployt naar Vercel.
#
# Eenmalig: npm install -g vercel
# Dan: bash deploy.sh

set -e

echo "🍺 Emballage Tracker — Deploy"
echo "─────────────────────────────"

# Build
echo "📦 Building..."
npm run build

# Deploy
echo "🚀 Deploying to Vercel..."
npx vercel deploy dist --prod --yes --name emballage-tracker

echo ""
echo "✅ Done! Je app is live."
