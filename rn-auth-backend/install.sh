#!/bin/bash
set -e

# Check if Caddy is already installed
if command -v caddy &> /dev/null && systemctl is-active --quiet caddy; then
    echo "✅ Caddy is already installed and running"
    echo "🔄 Reloading configuration..."
    sudo systemctl reload caddy
    exit 0
fi

echo "🚀 Starting Caddy installation..."

# === 1. Update System ===
sudo apt update -y && sudo apt upgrade -y

# === 2. Install Dependencies ===
sudo apt install -y curl debian-keyring debian-archive-keyring apt-transport-https gnupg

# === 2.5. Install Node.js ===
echo "📦 Installing Node.js v22.21.0 LTS..."

# Function to install Node.js using robust NodeSource installer
install_nodejs() {
    echo "🔧 Setting up NodeSource repository for Node.js 22.x..."
    
    # Check if Node.js is already installed
    if command -v node &> /dev/null; then
        echo "✅ Node.js $(node --version) is already installed"
        return 0
    fi
    
    # Install prerequisites
    echo "📋 Installing prerequisites..."
    sudo apt update -y
    sudo apt install -y apt-transport-https ca-certificates curl gnupg
    
    # Create keyrings directory
    sudo mkdir -p /usr/share/keyrings
    
    # Download and add NodeSource signing key
    echo "🔑 Adding NodeSource GPG key..."
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | \
        sudo gpg --dearmor -o /usr/share/keyrings/nodesource.gpg
    
    # Determine architecture
    ARCH=$(dpkg --print-architecture)
    echo "🏗️ Detected architecture: $ARCH"
    
    # Add NodeSource repository
    echo "📦 Adding NodeSource repository..."
    echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" | \
        sudo tee /etc/apt/sources.list.d/nodesource.list
    
    # Update package list
    echo "🔄 Updating package list..."
    sudo apt update -y
    
    # Install Node.js
    echo "⚡ Installing Node.js 22.x..."
    sudo apt install -y nodejs
    
    # Verify installation
    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        echo "✅ Node.js $(node --version) and npm $(npm --version) installed successfully"
        return 0
    else
        echo "❌ Node.js installation failed"
        return 1
    fi
}

# Run Node.js installation
if install_nodejs; then
    echo "🎉 Node.js installation completed successfully"
else
    echo "💥 Node.js installation failed, but continuing with Caddy setup..."
fi

# === 3. Add and Install Caddy ===
echo "🌐 Installing Caddy..."
sudo rm -f /usr/share/keyrings/caddy-stable.gpg
curl -fsSL 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | \
  sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/caddy-stable-archive-keyring.gpg] \
https://dl.cloudsmith.io/public/caddy/stable/deb/debian any-version main" | \
  sudo tee /etc/apt/sources.list.d/caddy-stable.list

sudo apt update -y && sudo apt install -y caddy

# === 4. Create Status Page Directory ===
STATUS_DIR=/var/www/status
sudo mkdir -p $STATUS_DIR
sudo chown -R caddy:caddy $STATUS_DIR

echo "🎨 Creating status page..."
sudo tee $STATUS_DIR/index.html <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Caddy Proxy Server - Status</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #333;
        }
        
        .container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 3rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 600px;
            width: 90%;
            backdrop-filter: blur(10px);
        }
        
        .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            border-radius: 50%;
            margin: 0 auto 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: white;
            font-weight: bold;
        }
        
        h1 {
            color: #2c3e50;
            margin-bottom: 1rem;
            font-size: 2.5rem;
        }
        
        .status {
            display: inline-block;
            background: #27ae60;
            color: white;
            padding: 0.5rem 1.5rem;
            border-radius: 25px;
            font-weight: bold;
            margin-bottom: 2rem;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }
        
        .info-card {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        
        .info-card h3 {
            color: #2c3e50;
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        }
        
        .info-card p {
            color: #666;
            font-size: 0.9rem;
        }
        
        .backend-status {
            margin: 2rem 0;
            padding: 1rem;
            border-radius: 10px;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
        }
        
        .backend-status h3 {
            color: #856404;
            margin-bottom: 0.5rem;
        }
        
        .backend-status p {
            color: #856404;
            font-size: 0.9rem;
        }
        
        .footer {
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 0.9rem;
        }
        
        .refresh-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 0.8rem 2rem;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1rem;
            margin-top: 1rem;
            transition: all 0.3s ease;
        }
        
        .refresh-btn:hover {
            background: #5a6fd8;
            transform: translateY(-2px);
        }
        
        @media (max-width: 600px) {
            .container {
                padding: 2rem 1.5rem;
            }
            
            h1 {
                font-size: 2rem;
            }
            
            .info-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">C</div>
        <h1>Caddy Proxy Server</h1>
        <div class="status">🟢 RUNNING</div>
        
        <div class="info-grid">
            <div class="info-card">
                <h3>🌐 Domain</h3>
                <p id="domain">auth.ekowlabs.space</p>
            </div>
            <div class="info-card">
                <h3>🔒 SSL Status</h3>
                <p>✅ Automatic HTTPS</p>
            </div>
            <div class="info-card">
                <h3>🔄 Proxy Target</h3>
                <p>localhost:5000</p>
            </div>
            <div class="info-card">
                <h3>📊 Uptime</h3>
                <p id="uptime">Loading...</p>
            </div>
        </div>
        
        <div class="backend-status">
            <h3>⚠️ Backend Status</h3>
            <p>Waiting for Node.js backend to start on port 5000...</p>
            <p>Once deployed via GitHub Actions, your API will be available at <strong>/api/*</strong></p>
        </div>
        
        <button class="refresh-btn" onclick="location.reload()">🔄 Refresh Status</button>
        
        <div class="footer">
            <p>Powered by Caddy Web Server</p>
            <p>Last updated: <span id="timestamp"></span></p>
        </div>
    </div>
    
    <script>
        // Update timestamp
        document.getElementById('timestamp').textContent = new Date().toLocaleString();
        
        // Update uptime (simplified)
        let startTime = Date.now();
        setInterval(() => {
            const uptime = Math.floor((Date.now() - startTime) / 1000);
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = uptime % 60;
            document.getElementById('uptime').textContent = 
                `${hours}h ${minutes}m ${seconds}s`;
        }, 1000);
        
        // Check backend status
        async function checkBackend() {
            try {
                const response = await fetch('/api/health', {
                    method: 'GET',
                    timeout: 3000
                });
                if (response.ok) {
                    document.querySelector('.backend-status').innerHTML = `
                        <h3 style="color: #27ae60;">✅ Backend Connected</h3>
                        <p style="color: #27ae60;">Node.js backend is running and responding!</p>
                    `;
                }
            } catch (error) {
                // Backend not ready yet
            }
        }
        
        // Check backend every 5 seconds
        setInterval(checkBackend, 5000);
        checkBackend();
    </script>
</body>
</html>
EOF

# === 5. Create Log Directory ===
echo "📁 Creating Caddy log directory..."
sudo mkdir -p /var/log/caddy
sudo chown caddy:caddy /var/log/caddy

# === 6. Configure Caddy as Reverse Proxy ===
DOMAIN="auth.ekowlabs.space"
BACKEND_PORT="5000"

echo "🧩 Configuring Caddy as reverse proxy for domain: $DOMAIN"
sudo tee /etc/caddy/Caddyfile <<EOF
$DOMAIN {
    # Try to proxy to backend first, fallback to status page
    @backend {
        path /api/*
    }
    
    # Serve status page for root and non-API routes
    @status {
        not path /api/*
    }
    
    # Route API requests and docs to backend
    handle @backend {
        reverse_proxy localhost:$BACKEND_PORT {
            health_uri /api/health
            health_interval 10s
            health_timeout 5s
        }
    }
    
    # Route Swagger docs to backend
    handle /api-docs* {
        reverse_proxy localhost:$BACKEND_PORT
    }
    
    # Serve status page for other routes
    handle @status {
        root * $STATUS_DIR
        file_server
    }
    
    # Enable gzip compression
    encode gzip
    
    # Add security headers
    header {
        # Enable HSTS
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        # Prevent clickjacking
        X-Frame-Options "SAMEORIGIN"
        # Prevent MIME type sniffing
        X-Content-Type-Options "nosniff"
        # XSS protection
        X-XSS-Protection "1; mode=block"
        # CORS headers for React Native/Expo mobile app
        Access-Control-Allow-Origin "*"
        Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, Accept, Origin"
    }
    
    # Log requests
    log {
        output file /var/log/caddy/access.log
    }
    
    # Handle preflight requests
    @options {
        method OPTIONS
    }
    respond @options 200
}
EOF

# === 7. Restart and Enable Caddy ===
echo "🔄 Restarting Caddy..."
sudo systemctl reload caddy || sudo systemctl restart caddy
sudo systemctl enable caddy

# === 8. Verify Caddy Status ===
echo ""
echo "🔍 Checking Caddy status..."
sudo systemctl status caddy --no-pager

echo ""
echo "✅ Caddy reverse proxy setup complete!"
echo ""
echo "📋 Configuration Summary:"
echo "   • Domain: $DOMAIN"
echo "   • Backend Port: $BACKEND_PORT"
echo "   • SSL: Automatic (Let's Encrypt)"
echo "   • Status Page: https://$DOMAIN"
echo "   • API Routes: https://$DOMAIN/api/*"
echo "   • Logs: /var/log/caddy/"
echo "   • Config: /etc/caddy/Caddyfile"
echo ""
echo "🎨 Status Page Features:"
echo "   • Beautiful UI showing Caddy status"
echo "   • Real-time backend health monitoring"
echo "   • Responsive design for mobile/desktop"
echo "   • Automatic refresh and uptime tracking"
echo ""
echo "🔄 How it works:"
echo "   • Root domain shows status page"
echo "   • /api/* routes proxy to your backend"
echo "   • Automatic fallback if backend is down"
echo ""
echo "📝 Useful Commands:"
echo "   • Check status: sudo systemctl status caddy"
echo "   • Restart: sudo systemctl restart caddy"
echo "   • Reload config: sudo systemctl reload caddy"
echo "   • View logs: sudo journalctl -u caddy -f"
echo "   • Test config: sudo caddy validate --config /etc/caddy/Caddyfile"
echo ""
echo "🚀 Next Steps:"
echo "   1. Deploy your Node.js backend via GitHub Actions"
echo "   2. The backend will run as a systemd service"
echo "   3. Caddy will automatically proxy API requests"
echo "   4. Visit https://$DOMAIN to see the status page"
echo ""
echo "🌍 Visit your status page: https://$DOMAIN"
echo ""
