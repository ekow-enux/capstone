# Postman Configuration Guide for AI Chat API

## 🚨 **FOUND THE ISSUE!**

**Your curl command used `Content-Type: text/plain` but it should be `Content-Type: application/json`**

### ❌ **Your Command (Doesn't Work):**
```bash
curl --request PUT \
  --url https://ai.ekowlabs.space/api/chat/68fe08c1ae5b0066605af7ce/message/3aab2ccc-bc30-456d-b922-bf4ddc0a0c16/prompt \
  --header 'Content-Type: text/plain' \
  --data '{"newPrompt": "What are the most important fire safety tips for offices?"}'
```

### ✅ **Correct Command (Works):**
```bash
curl --request PUT \
  --url https://ai.ekowlabs.space/api/chat/68fe08c1ae5b0066605af7ce/message/3aab2ccc-bc30-456d-b922-bf4ddc0a0c16/prompt \
  --header 'Content-Type: application/json' \
  --data '{"newPrompt": "What are the most important fire safety tips for offices?"}'
```

### **In Postman:**
1. **Method**: Use `PATCH` (semantically correct for partial updates) or `PUT`/`POST` as alternatives
2. **Headers Tab**: Make sure `Content-Type` is set to `application/json` (NOT `text/plain`)
3. **Body Tab**: Select `raw` and `JSON` format
4. **Body Content**: `{"newPrompt": "What are the most important fire safety tips for offices?"}`

### **✅ Recommended Methods (in order of preference):**
1. **PATCH** - Semantically correct for partial resource updates (✅ **WORKING NOW**)
2. **PUT** - Alternative method (✅ **WORKING NOW**)
3. **POST** - Alternative method (✅ **WORKING NOW**)

**✅ All methods are now available and working!**

---

## 🚨 Common Postman Issues & Solutions

### 1. **Method & URL Configuration**

**For Prompt Update:**
- **Method**: `PUT` (or `POST` as alternative)
- **URL**: `https://ai.ekowlabs.space/api/chat/68fe08c1ae5b0066605af7ce/message/3aab2ccc-bc30-456d-b922-bf4ddc0a0c16/prompt`

### 2. **Headers Configuration**

**Required Headers:**
```
Content-Type: application/json
```

**Steps to add headers in Postman:**
1. Go to the **Headers** tab
2. Add key: `Content-Type`
3. Add value: `application/json`

### 3. **Body Configuration**

**Body Type**: `raw`
**Format**: `JSON`

**Example Body:**
```json
{
  "newPrompt": "What are the most important fire safety tips for homes?"
}
```

### 4. **Step-by-Step Postman Setup**

#### **Step 1: Create New Request**
1. Click **"New"** → **"Request"**
2. Name it: "Update Prompt"

#### **Step 2: Configure Request**
1. **Method**: Select `PUT` from dropdown
2. **URL**: `https://ai.ekowlabs.space/api/chat/68fe08c1ae5b0066605af7ce/message/3aab2ccc-bc30-456d-b922-bf4ddc0a0c16/prompt`
3. **Headers Tab**: Add `Content-Type: application/json`
4. **Body Tab**: 
   - Select `raw`
   - Select `JSON` from dropdown
   - Paste the JSON body:
   ```json
   {
     "newPrompt": "What are the most important fire safety tips for homes?"
   }
   ```

#### **Step 3: Send Request**
1. Click **"Send"**
2. Check the response

#### **✅ WORKING CONFIGURATION (Verified)**
- **Method**: `PATCH` (✅ **RECOMMENDED**), `PUT`, or `POST`
- **URL**: `https://ai.ekowlabs.space/api/chat/68fe08c1ae5b0066605af7ce/message/3aab2ccc-bc30-456d-b922-bf4ddc0a0c16/prompt`
- **Headers**: `Content-Type: application/json`
- **Body**: `{"newPrompt": "What are the most important fire safety tips for offices?"}`

### 5. **Common Issues & Fixes**

#### **Issue 1: "Could not get response"**
**Solutions:**
- Check internet connection
- Verify URL is correct
- Try without SSL verification (Settings → General → SSL certificate verification: OFF)

#### **Issue 2: "404 Not Found"**
**Solutions:**
- Verify the session ID exists: `68fe08c1ae5b0066605af7ce`
- Verify the message ID exists: `3aab2ccc-bc30-456d-b922-bf4ddc0a0c16`
- Check URL format is exactly: `/api/chat/{sessionId}/message/{messageId}/prompt`

#### **Issue 3: "400 Bad Request"**
**Solutions:**
- Check JSON format is valid
- Ensure `newPrompt` field is included
- Verify Content-Type header is set

#### **Issue 4: "500 Internal Server Error" - "Failed to update prompt and regenerate response"**
**Solutions:**
- ✅ **VERIFIED WORKING**: The API is working correctly with curl
- Check if you're using the exact URL format: `/api/chat/{sessionId}/message/{messageId}/prompt`
- Ensure the session ID and message ID are correct
- Verify the JSON body format is exactly: `{"newPrompt": "your new prompt"}`
- Check if Content-Type header is set to `application/json`
- Try the POST alternative: Change method from `PUT` to `POST` with same URL and body

**Common Postman Mistakes:**
1. **Wrong URL format**: Make sure it's `/message/{messageId}/prompt` not `/regenerate/{messageId}`
2. **Missing Content-Type header**: Must be `application/json`
3. **Wrong body format**: Must be `{"newPrompt": "text"}` not `{"text": "prompt"}`
4. **Body not set to raw/JSON**: Must be raw with JSON format selected

### 6. **Alternative Endpoints to Test**

#### **Test 1: Health Check**
```
GET https://ai.ekowlabs.space/api/health
```

#### **Test 2: Get Session**
```
GET https://ai.ekowlabs.space/api/chat/68fe08c1ae5b0066605af7ce
```

#### **Test 3: Create New Session**
```
POST https://ai.ekowlabs.space/api/chat
Body: {"text": "Test message"}
```

#### **Test 4: Add Message**
```
POST https://ai.ekowlabs.space/api/chat/68fe08c1ae5b0066605af7ce/message
Body: {"text": "Another test message"}
```

### 7. **Postman Collection JSON**

Save this as a Postman collection:

```json
{
  "info": {
    "name": "AI Chat API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "https://ai.ekowlabs.space/api/health",
          "protocol": "https",
          "host": ["ai", "ekowlabs", "space"],
          "path": ["api", "health"]
        }
      }
    },
    {
      "name": "Update Prompt",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"newPrompt\": \"What are the most important fire safety tips for homes?\"\n}"
        },
        "url": {
          "raw": "https://ai.ekowlabs.space/api/chat/68fe08c1ae5b0066605af7ce/message/3aab2ccc-bc30-456d-b922-bf4ddc0a0c16/prompt",
          "protocol": "https",
          "host": ["ai", "ekowlabs", "space"],
          "path": ["api", "chat", "68fe08c1ae5b0066605af7ce", "message", "3aab2ccc-bc30-456d-b922-bf4ddc0a0c16", "prompt"]
        }
      }
    }
  ]
}
```

### 8. **Debugging Steps**

#### **Step 1: Test Basic Connectivity**
```
GET https://ai.ekowlabs.space/api/health
```

#### **Step 2: Verify Session Exists**
```
GET https://ai.ekowlabs.space/api/chat/68fe08c1ae5b0066605af7ce
```

#### **Step 3: Test Simple Endpoint**
```
POST https://ai.ekowlabs.space/api/chat
Body: {"text": "Hello"}
```

#### **Step 4: Test Prompt Update**
```
PUT https://ai.ekowlabs.space/api/chat/68fe08c1ae5b0066605af7ce/message/3aab2ccc-bc30-456d-b922-bf4ddc0a0c16/prompt
Body: {"newPrompt": "Test prompt"}
```

### 9. **Expected Response Format**

**Success Response (200):**
```json
{
  "message": {
    "id": "3aab2ccc-bc30-456d-b922-bf4ddc0a0c16",
    "prompt": "What are the most important fire safety tips for homes?",
    "response": "Fire safety is crucial for protecting your home...",
    "timestamp": "2025-10-26T11:53:51.095Z",
    "likes": 0,
    "dislikes": 0,
    "userFeedback": null
  },
  "updatedSession": {
    "_id": "68fe08c1ae5b0066605af7ce",
    "title": "Electrical Fire Prevention",
    "lastMessage": "Fire safety is crucial...",
    "timestamp": "2025-10-26T11:53:51.095Z",
    "messages": [...]
  },
  "messageId": "3aab2ccc-bc30-456d-b922-bf4ddc0a0c16",
  "promptUpdated": true,
  "oldPrompt": "Previous prompt",
  "newPrompt": "What are the most important fire safety tips for homes?"
}
```

**Error Response (400/404/500):**
```json
{
  "error": "Error message here"
}
```

### 10. **Troubleshooting Checklist**

- [ ] **Method**: Is it set to `PUT`?
- [ ] **URL**: Is the full URL correct?
- [ ] **Headers**: Is `Content-Type: application/json` set?
- [ ] **Body**: Is it set to `raw` and `JSON`?
- [ ] **JSON**: Is the JSON valid and properly formatted?
- [ ] **Session ID**: Does the session exist?
- [ ] **Message ID**: Does the message exist in that session?
- [ ] **Internet**: Is your internet connection working?
- [ ] **SSL**: Try disabling SSL verification if needed

### 11. **Quick Test Commands**

**Test with curl first:**
```bash
curl -X PUT https://ai.ekowlabs.space/api/chat/68fe08c1ae5b0066605af7ce/message/3aab2ccc-bc30-456d-b922-bf4ddc0a0c16/prompt \
  -H "Content-Type: application/json" \
  -d '{"newPrompt": "Test prompt"}'
```

If curl works but Postman doesn't, the issue is in Postman configuration.

---

## 🆘 Still Having Issues?

**Please share:**
1. **Error message** you're getting in Postman
2. **Screenshot** of your Postman configuration
3. **Response body** (if any)
4. **Status code** (200, 400, 404, 500, etc.)

This will help me provide more specific troubleshooting steps!
