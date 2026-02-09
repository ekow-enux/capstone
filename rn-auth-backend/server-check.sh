#!/bin/bash
# Quick server verification script
# Run on server: cd ~/school-project/backend/rn-auth-backend && bash server-check.sh

echo "🔍 Auth Backend Health Check"
echo "=============================="
echo ""

# Check if .env exists
echo "1️⃣ Checking .env file..."
if [ -f ".env" ]; then
  echo "✅ .env file exists"
  echo "   Contents (masked):"
  cat .env | sed 's/=.*/=***MASKED***/g'
else
  echo "❌ .env file NOT found!"
  echo "   Create it with:"
  echo "   cat > .env << EOF"
  echo "   PORT=5000"
  echo "   MONGO_URI=your-mongodb-uri"
  echo "   JWT_SECRET=\$(openssl rand -base64 32)"
  echo "   NODE_ENV=production"
  echo "   EOF"
fi

echo ""
echo "2️⃣ Checking PM2 status..."
if command -v pm2 &> /dev/null; then
  echo "✅ PM2 is installed"
  pm2 list
  echo ""
  if pm2 describe auth-backend > /dev/null 2>&1; then
    echo "✅ auth-backend process exists"
    pm2 info auth-backend
  else
    echo "❌ auth-backend process NOT running"
    echo "   Start it with: pm2 start ecosystem.config.cjs"
  fi
else
  echo "❌ PM2 not installed"
  echo "   Install with: sudo npm install -g pm2"
fi

echo ""
echo "3️⃣ Checking local API..."
if curl -f -s http://localhost:5000/api/health > /dev/null 2>&1; then
  echo "✅ API is responding on localhost:5000"
  echo "   Response:"
  curl -s http://localhost:5000/api/health | jq '.' || curl -s http://localhost:5000/api/health
else
  echo "❌ API not responding on localhost:5000"
  echo "   Check PM2 logs: pm2 logs auth-backend"
fi

echo ""
echo "4️⃣ Checking public API..."
if curl -f -s https://auth.ekowlabs.space/api/health > /dev/null 2>&1; then
  echo "✅ API is responding at https://auth.ekowlabs.space"
  echo "   Response:"
  curl -s https://auth.ekowlabs.space/api/health | jq '.' || curl -s https://auth.ekowlabs.space/api/health
else
  echo "❌ API not responding at https://auth.ekowlabs.space"
  echo "   Check Caddy: sudo systemctl status caddy"
fi

echo ""
echo "5️⃣ Checking Caddy status..."
if sudo systemctl is-active --quiet caddy; then
  echo "✅ Caddy is running"
else
  echo "❌ Caddy is not running"
  echo "   Start with: sudo systemctl start caddy"
fi

echo ""
echo "=============================="
echo "Health check complete!"

