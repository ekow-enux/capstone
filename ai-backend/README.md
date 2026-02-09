# Fire Assistant AI – Chat Support Backend

A secure, scalable backend API for fire safety and emergency response chat, built with Node.js 22.21.0 LTS, Express, and MongoDB. This backend powers AI-driven conversations about fire safety, emergency procedures, and prevention strategies.

## 🎯 Purpose

This backend serves as the foundation for fire safety education and emergency response applications. It provides:

- **Educational AI Chat** - Interactive conversations about fire prevention
- **Emergency Guidance** - Real-time advice during fire emergencies  
- **Safety Training** - Structured learning about fire safety protocols
- **Mobile App Support** - API backend for React Native/Expo applications

## 🏢 Use Cases

- **Fire Departments** - Training and public education tools
- **Schools & Universities** - Fire safety education programs
- **Corporate Safety** - Workplace fire safety training
- **Residential Apps** - Home fire safety guidance
- **Emergency Services** - Quick reference during incidents

[![Node.js Version](https://img.shields.io/badge/node.js-22.21.0%20LTS-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/express-5.1.0-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/mongodb-8.16.4-green.svg)](https://mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📋 Table of Contents

- [Purpose](#-purpose)
- [Use Cases](#-use-cases)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [API Routes & Frontend Usage](#api-routes--frontend-usage)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Monitoring & Health Checks](#-monitoring--health-checks)
- [Security Features](#-security-features)
- [Recent Updates](#-recent-updates--fixes)
- [Project Structure](#-project-structure)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Troubleshooting](#-troubleshooting)
- [Best Practices](#-best-practices)
- [License](#-license)

## 🌟 Features

### Core Functionality
- **💬 Chat session management** - Persistent conversations with unique session IDs
- **💾 Message storage and retrieval** - MongoDB-backed message history
- **🤖 Real AI responses** - OpenRouter integration via LangChain
- **🔍 Smart context** - Maintains conversation context across messages

### Development & Deployment
- **🏗️ Modular, clean ES6+ codebase** - Well-structured, maintainable code
- **🚀 Automatic deployment** - GitHub Actions CI/CD pipeline
- **⚡ Production-ready** - PM2 process management with Caddy reverse proxy
- **📊 Health monitoring** - Built-in health checks and status endpoints

### Security & Performance
- **🔒 Secure API** - Input validation with Zod schemas
- **🌐 CORS enabled** - Ready for React Native/Expo integration
- **📝 Request logging** - Morgan HTTP request logging
- **🛡️ Security headers** - HSTS, XSS protection, and more

## 🛠 Tech Stack

### Backend Technologies
- **Node.js 22.21.0 LTS** - JavaScript runtime
- **Express 5.1.0** - Web framework
- **MongoDB 8.16.4** - NoSQL database
- **Mongoose 8.16.4** - MongoDB object modeling

### Development Tools
- **Zod 3.22.4** - Runtime type checking and validation
- **Morgan 1.10.1** - HTTP request logging
- **LangChain 0.3.30** - LLM integration framework
- **OpenRouter API** - AI model access

### Production Infrastructure
- **PM2** - Process management for Node.js
- **Caddy** - Reverse proxy with automatic HTTPS
- **GitHub Actions** - CI/CD pipeline
- **Ubuntu Server** - Production environment

## 🚀 Quick Start

### Local Development
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and OpenRouter API key
   ```

4. **Start MongoDB** (local or cloud)
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

**Requirements:**
- Node.js 22.21.0 LTS or higher
- MongoDB (local or cloud)
- OpenRouter API key

6. **Access the API**
   - **API Base URL**: `http://localhost:5000`
   - **Swagger Documentation**: `http://localhost:5000/api-docs`
   - **Health Check**: `http://localhost:5000/api/health`

### Production Deployment
The application is automatically deployed via GitHub Actions to `https://ai.ekowlabs.space`:

- **Live API**: `https://ai.ekowlabs.space/api/`
- **Status Page**: `https://ai.ekowlabs.space`
- **Health Check**: `https://ai.ekowlabs.space/api/health`

## 📚 API Documentation

### Interactive Documentation
- **🌐 Live Swagger UI**: [https://ai.ekowlabs.space/api-docs](https://ai.ekowlabs.space/api-docs)
- **💻 Local Development**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **📖 All endpoints** are documented and testable in Swagger UI

### API Overview
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check and system status |
| `/api/chat` | POST | Start new chat session |
| `/api/chat` | GET | List recent chat sessions |
| `/api/chat/:sessionId` | GET | Get specific chat session |
| `/api/chat/:sessionId/message` | POST | Send message to existing session |

### Base URLs
- **Production**: `https://ai.ekowlabs.space/api`
- **Local Development**: `http://localhost:5000/api`

---

# API Routes & Frontend Usage

## 1. POST `/api/chat`
**Start a new chat session with the first user message.**

**Request:**
```json
POST /api/chat
Content-Type: application/json
{
  "text": "How can I prevent kitchen fires?"
}
```

**Response:**
```json
{
  "sessionId": "1234567890",
  "title": "How can I prevent kitchen fires?",
  "messages": [
    { "id": "...", "text": "...", "isUser": true, "timestamp": "..." },
    { "id": "...", "text": "...", "isUser": false, "timestamp": "..." }
  ],
  "timestamp": "2025-07-21T19:00:00Z"
}
```

**React Native Example:**
```js
const res = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: userMessage }),
});
const data = await res.json();
setSessionId(data.sessionId);
setMessages(data.messages);
```

---

## 2. POST `/api/chat/:sessionId/message`
**Add a new user message to an existing session and get the AI’s reply.**

**Request:**
```json
POST /api/chat/1234567890/message
Content-Type: application/json
{
  "text": "What should I do during a fire evacuation?"
}
```

**Response:**
```json
{
  "message": { "id": "...", "text": "...", "isUser": true, "timestamp": "..." },
  "aiResponse": { "id": "...", "text": "...", "isUser": false, "timestamp": "..." },
  "updatedSession": { ... }
}
```

**React Native Example:**
```js
const res = await fetch(`/api/chat/${sessionId}/message`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: userMessage }),
});
const data = await res.json();
setMessages([...messages, data.message, data.aiResponse]);
```

---

## 3. GET `/api/chat`
**Get a list of recent chat sessions.**

**Response:**
```json
[
  {
    "id": "1",
    "title": "Fire Safety Tips",
    "lastMessage": "How can I prevent kitchen fires?",
    "timestamp": "2025-07-21T17:45:00Z"
  },
  ...
]
```

**React Native Example:**
```js
const res = await fetch('/api/chat');
const sessions = await res.json();
setSessions(sessions);
```

---

## 4. GET `/api/chat/:sessionId`
**Get the full message history for a session.**

**Response:**
```json
{
  "id": "1",
  "title": "Fire Safety Tips",
  "messages": [
    { "id": "1", "text": "...", "isUser": false, "timestamp": "..." },
    ...
  ]
}
```

**React Native Example:**
```js
const res = await fetch(`/api/chat/${sessionId}`);
const session = await res.json();
setMessages(session.messages);
```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/fire-assistant
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/fire-assistant

# AI Service
OPEN_ROUTER=your_openrouter_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

## 🚀 Deployment

### Automatic Deployment (GitHub Actions)
The application automatically deploys when you push to the `main` branch:

#### 🚀 Deployment Process
1. **Setup Server Environment** - Installs Node.js 22.21.0 LTS, PM2, and Caddy
2. **Build & Test** - Runs tests and builds the application
3. **Deploy Application** - Uploads and starts the application with PM2
4. **Health Verification** - Ensures the application is running correctly
5. **Live deployment** at `https://ai.ekowlabs.space`

#### 🔧 Enhanced Installation Process
- **Direct file upload** - Clean upload of install-caddy.sh without directory structure
- **Robust NodeSource installer** with error handling and logging
- **Architecture detection** for proper package selection
- **GPG key management** for secure package verification
- **Prerequisites installation** (apt-transport-https, ca-certificates, etc.)
- **Installation verification** with version checking
- **Clean execution** - Script runs directly from home directory

### Manual Deployment
If you need to deploy manually:

```bash
# Install PM2 globally
npm install -g pm2

# Install dependencies
npm ci --production

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
```

## 📊 Monitoring & Health Checks

### Health Endpoints
- **Health Check**: `GET /api/health`
- **Status Page**: `https://ai.ekowlabs.space`

### PM2 Commands
```bash
# Check application status
pm2 status

# View logs
pm2 logs ai-backend

# Restart application
pm2 restart ai-backend

# Stop application
pm2 stop ai-backend
```

## 🛡 Security Features
- **CORS** configured for React Native/Expo apps
- **Security headers** (HSTS, XSS protection, etc.)
- **Input validation** with Zod schemas
- **Automatic HTTPS** via Caddy
- **Environment variable** protection

## 🔧 Recent Updates & Fixes

### Latest Improvements (v1.0.0)
- ✅ **Node.js 22.21.0 LTS** - Updated to latest LTS version with robust installer
- ✅ **Enhanced NodeSource installer** - Professional installation with error handling
- ✅ **Fixed deployment issues** - Resolved "npm: command not found" error
- ✅ **Enhanced CI/CD** - Improved GitHub Actions workflow
- ✅ **Production setup** - Automated server configuration with install-caddy.sh
- ✅ **Health monitoring** - Added comprehensive health checks
- ✅ **Error handling** - Better error reporting and troubleshooting
- ✅ **Fixed file upload issues** - Resolved "install-caddy.sh not found" errors
- ✅ **Clean deployment pipeline** - Direct file upload without directory structure
- ✅ **Simplified workflow** - Streamlined GitHub Actions for reliable deployment

## 📁 Project Structure
```
ai-backend/
├── src/
│   ├── config/          # Database and Swagger configuration
│   ├── controllers/      # Business logic and request handling
│   ├── middleware/      # Logging, validation, error handling
│   ├── models/          # Mongoose schemas (Message, Session)
│   ├── routes/          # Express route definitions
│   ├── services/        # AI integration (OpenRouter)
│   ├── utils/           # Helper functions and utilities
│   └── server.js        # Application entry point
├── .github/workflows/   # GitHub Actions CI/CD
├── install-caddy.sh     # Caddy installation script
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🔄 CI/CD Pipeline

The GitHub Actions workflow (`deploy-pipeline.yml`) handles:

### Setup Server Job
1. **Code checkout** with full repository access
2. **Repository structure verification** - Ensures install-caddy.sh exists
3. **Direct file upload** - Uploads install-caddy.sh directly to home directory
4. **Script execution** - Runs install-caddy.sh to install Node.js 22.21.0 LTS, PM2, and Caddy
5. **Directory setup** - Creates /opt/ai-backend and /var/log/pm2 directories

### Deploy Application Job
1. **Node.js 22.21.0 LTS setup** with npm caching
2. **Dependency installation** with npm ci
3. **Test execution** (if tests exist)
4. **Deployment package creation** with PM2 configuration and environment variables
5. **Application upload** via SCP to /opt/ai-backend/
6. **Application deployment** with PM2 process management
7. **Health checks** and status verification
8. **Deployment notification** with success/failure status

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

**MongoDB connection issues:**
- Check your `MONGODB_URI` in `.env`
- Ensure MongoDB is running (local) or accessible (cloud)

**PM2 process not starting:**
```bash
# Check PM2 logs
pm2 logs ai-backend

# Restart PM2
pm2 restart ai-backend
```

## 📝 Best Practices
- Always check for errors in API responses
- Use the Swagger UI for up-to-date documentation and live testing
- Keep your frontend and backend in sync with endpoint changes
- Monitor application health via `/api/health` endpoint
- Use environment variables for sensitive configuration
- Test locally before pushing to trigger deployment

## 📄 License
MIT License - see LICENSE file for details
