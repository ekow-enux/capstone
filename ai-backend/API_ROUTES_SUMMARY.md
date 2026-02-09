# AI Chat Backend API Routes Summary

## Overview
This document provides a comprehensive summary of all chat-related API routes for frontend implementation. The API supports creating sessions, managing messages, regenerating responses, updating prompts, and handling user feedback through likes/dislikes.

## Base URL
```
https://ai.ekowlabs.space/api
```

## Authentication
Currently no authentication required (can be added later if needed).

---

## 📝 Chat Session Routes

### 1. Create New Chat Session
**POST** `/chat`

Creates a new chat session with the first message and AI-generated contextual title.

**Request Body:**
```json
{
  "text": "How can I prevent kitchen fires?"
}
```

**Response (201):**
```json
{
  "sessionId": "68fde8ec7a9e21e474ad2f33",
  "title": "Kitchen Fire Safety",
  "messages": [
    {
      "id": "71f2c258-2644-4369-b50b-79c30c167ad0",
      "prompt": "How can I prevent kitchen fires?",
      "response": "To prevent kitchen fires, follow these essential safety tips...",
      "timestamp": "2025-10-26T09:24:58.562Z",
      "likes": 0,
      "dislikes": 0,
      "userFeedback": null
    }
  ],
  "timestamp": "2025-10-26T09:24:58.562Z"
}
```

---

### 2. Add Message to Existing Session
**POST** `/chat/{sessionId}/message`

Adds a new message to an existing chat session and gets an AI response with conversation context awareness.

**Parameters:**
- `sessionId` (path): The ID of the chat session

**Request Body:**
```json
{
  "text": "What should I do during a fire evacuation?"
}
```

**Response (200):**
```json
{
  "message": {
    "id": "8966055c-92ae-4104-8f9f-4181593d3538",
    "prompt": "What should I do during a fire evacuation?",
    "response": "During a fire evacuation, follow these steps...",
    "timestamp": "2025-10-26T09:25:26.153Z",
    "likes": 0,
    "dislikes": 0,
    "userFeedback": null
  },
  "updatedSession": {
    "_id": "68fde8ec7a9e21e474ad2f33",
    "title": "Fire Evacuation Safety",
    "lastMessage": "During a fire evacuation, follow these steps...",
    "timestamp": "2025-10-26T09:25:26.153Z",
    "messages": [...]
  }
}
```

---

### 3. Get All Chat Sessions
**GET** `/chat`

Retrieves all chat sessions with their contextual titles and last messages.

**Response (200):**
```json
[
  {
    "_id": "68fde8ec7a9e21e474ad2f33",
    "title": "Kitchen Fire Safety",
    "lastMessage": "To prevent kitchen fires, follow these essential safety tips...",
    "timestamp": "2025-10-26T09:24:58.562Z",
    "messages": [...]
  }
]
```

---

### 4. Get Specific Chat Session
**GET** `/chat/{sessionId}`

Retrieves the complete conversation history for a specific chat session with messages sorted by timestamp.

**Parameters:**
- `sessionId` (path): The ID of the chat session

**Response (200):**
```json
{
  "id": "68fde8ec7a9e21e474ad2f33",
  "title": "Kitchen Fire Safety",
  "lastMessage": "To prevent kitchen fires, follow these essential safety tips...",
  "timestamp": "2025-10-26T09:24:58.562Z",
  "messages": [
    {
      "id": "71f2c258-2644-4369-b50b-79c30c167ad0",
      "prompt": "How can I prevent kitchen fires?",
      "response": "To prevent kitchen fires, follow these essential safety tips...",
      "timestamp": "2025-10-26T09:24:58.562Z",
      "likes": 0,
      "dislikes": 0,
      "userFeedback": null
    }
  ]
}
```

---

## 🔄 Response Management Routes

### 5. Regenerate AI Response
**PUT** `/chat/{sessionId}/regenerate/{messageId}`  
**POST** `/chat/{sessionId}/regenerate/{messageId}`

Regenerates the AI response for a specific message using the same prompt but with updated conversation context.

**Parameters:**
- `sessionId` (path): The ID of the chat session
- `messageId` (path): The ID of the message to regenerate

**Response (200):**
```json
{
  "message": {
    "id": "8966055c-92ae-4104-8f9f-4181593d3538",
    "prompt": "What about fire drills?",
    "response": "Fire drills are essential for ensuring that everyone in a building knows what to do...",
    "timestamp": "2025-10-26T10:16:29.106Z",
    "likes": 0,
    "dislikes": 0,
    "userFeedback": null
  },
  "updatedSession": {
    "_id": "68fde8ec7a9e21e474ad2f33",
    "title": "Smoke Detection & Response",
    "lastMessage": "Fire drills are essential for ensuring that everyone in a building knows what to do...",
    "timestamp": "2025-10-26T10:16:29.106Z",
    "messages": [...]
  },
  "messageId": "8966055c-92ae-4104-8f9f-4181593d3538",
  "regenerated": true
}
```

---

### 6. Update Prompt and Regenerate Response
**PUT** `/chat/{sessionId}/message/{messageId}/prompt`  
**POST** `/chat/{sessionId}/message/{messageId}/prompt`

Updates the user's prompt for a specific message and generates a new AI response based on the updated question.

**Parameters:**
- `sessionId` (path): The ID of the chat session
- `messageId` (path): The ID of the message to update

**Request Body:**
```json
{
  "newPrompt": "How often should fire drills be conducted in schools?"
}
```

**Response (200):**
```json
{
  "message": {
    "id": "8966055c-92ae-4104-8f9f-4181593d3538",
    "prompt": "How often should fire drills be conducted in schools?",
    "response": "Fire drills in schools should be conducted regularly to ensure students and staff are prepared...",
    "timestamp": "2025-10-26T10:16:44.845Z",
    "likes": 0,
    "dislikes": 0,
    "userFeedback": null
  },
  "updatedSession": {
    "_id": "68fde8ec7a9e21e474ad2f33",
    "title": "Smoke Detection & Response",
    "lastMessage": "Fire drills in schools should be conducted regularly to ensure students and staff are prepared...",
    "timestamp": "2025-10-26T10:16:44.845Z",
    "messages": [...]
  },
  "messageId": "8966055c-92ae-4104-8f9f-4181593d3538",
  "promptUpdated": true,
  "oldPrompt": "What about fire drills?",
  "newPrompt": "How often should fire drills be conducted in schools?"
}
```

---

## 👍 User Feedback Routes

### 7. Like or Dislike Message
**POST** `/chat/{sessionId}/message/{messageId}/like`

Allows users to like or dislike AI responses to provide feedback. Supports toggle functionality.

**Parameters:**
- `sessionId` (path): The ID of the chat session
- `messageId` (path): The ID of the message to like/dislike

**Request Body:**
```json
{
  "action": "like"  // or "dislike"
}
```

**Response (200):**
```json
{
  "message": {
    "id": "71f2c258-2644-4369-b50b-79c30c167ad0",
    "prompt": "What should I do during a fire evacuation?",
    "response": "During a fire evacuation, follow these steps...",
    "timestamp": "2025-10-26T09:24:58.562Z",
    "likes": 1,
    "dislikes": 0,
    "userFeedback": "like"
  },
  "action": "like",
  "likes": 1,
  "dislikes": 0,
  "userFeedback": "like",
  "messageId": "71f2c258-2644-4369-b50b-79c30c167ad0"
}
```

**Toggle Behavior:**
- Like → Like = Remove like (likes: 0, userFeedback: null)
- Dislike → Dislike = Remove dislike (dislikes: 0, userFeedback: null)
- Like → Dislike = Change to dislike (likes: 0, dislikes: 1, userFeedback: "dislike")
- Dislike → Like = Change to like (likes: 1, dislikes: 0, userFeedback: "like")

---

## 🏷️ Session Management Routes

### 8. Update Session Title
**PUT** `/chat/{sessionId}/title`

Regenerates the session title using AI analysis of the conversation content and fire safety responses.

**Parameters:**
- `sessionId` (path): The ID of the chat session

**Response (200):**
```json
{
  "sessionId": "68fde8ec7a9e21e474ad2f33",
  "title": "Electrical Fire Prevention",
  "message": "Session title updated successfully"
}
```

---

## 📊 Data Models

### Message Object
```typescript
interface Message {
  id: string;                    // UUID for the message
  prompt: string;                // User's question/prompt
  response: string;              // AI's response
  timestamp: string;             // ISO date string
  likes: number;                 // Number of likes (default: 0)
  dislikes: number;              // Number of dislikes (default: 0)
  userFeedback: 'like' | 'dislike' | null;  // Current user's feedback
}
```

### Session Object
```typescript
interface Session {
  _id: string;                   // MongoDB ObjectId
  id: string;                    // Session identifier (same as _id)
  title: string;                 // AI-generated contextual title
  lastMessage: string;           // Most recent AI response
  timestamp: string;             // ISO date string
  messages: Message[];           // Array of messages
}
```

---

## 🚨 Error Responses

### Common Error Codes

**400 Bad Request:**
```json
{
  "error": "Text is required"
}
```

**404 Not Found:**
```json
{
  "error": "Session not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to create session"
}
```

---

## 🎯 Frontend Implementation Tips

### 1. State Management
- Store sessions in an array/object with sessionId as key
- Track current session and messages
- Handle loading states for API calls

### 2. UI Components Needed
- **Chat Interface**: Message list, input field, send button
- **Session List**: Display all sessions with titles and last messages
- **Message Actions**: Like/dislike buttons, regenerate button, edit prompt button
- **Session Management**: Create new session, switch between sessions

### 3. Key Features to Implement
- **Real-time Updates**: Update UI when messages are added/modified
- **Feedback Indicators**: Show like/dislike counts and user's current feedback
- **Context Awareness**: Display conversation history for better UX
- **Error Handling**: Show appropriate error messages
- **Loading States**: Show spinners during API calls

### 4. API Call Examples

**Create Session:**
```javascript
const createSession = async (text) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return response.json();
};
```

**Add Message:**
```javascript
const addMessage = async (sessionId, text) => {
  const response = await fetch(`/api/chat/${sessionId}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return response.json();
};
```

**Like Message:**
```javascript
const likeMessage = async (sessionId, messageId, action) => {
  const response = await fetch(`/api/chat/${sessionId}/message/${messageId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action })
  });
  return response.json();
};
```

---

## 🔗 Additional Resources

- **Swagger Documentation**: https://ai.ekowlabs.space/api-docs
- **Health Check**: https://ai.ekowlabs.space/api/health
- **Repository**: Check the backend repository for latest updates

---

## 📝 Notes

- All timestamps are in ISO format
- Message IDs are UUIDs for frontend tracking
- Session titles are automatically generated based on conversation content
- AI responses are cleaned to remove unwanted symbols and artifacts
- The API supports both PUT and POST methods for regenerate and prompt update endpoints
