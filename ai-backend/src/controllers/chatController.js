import Session from '../models/Session.js';
import { getLLMResponse, generateSessionTitle } from '../services/aiService.js';
import { v4 as uuidv4 } from 'uuid';

// Create new session with first message
export const createSession = async (req, res) => {
  try {
    const { text } = req.body;
     console.log('Creating session with text:', text);
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const aiText = await getLLMResponse(text);
    const messageObj = {
      id: uuidv4(),
      prompt: text,
      response: aiText,
      timestamp: new Date(),
      likes: 0,
      dislikes: 0,
      userFeedback: null
    };
    // Generate contextual title based on the AI response
    const contextualTitle = await generateSessionTitle([messageObj]);
    
    const session = await Session.create({
      title: contextualTitle,
      lastMessage: aiText,
      messages: [messageObj],
      timestamp: new Date(),
    });
    console.log('Session created:', session.messages);
    res.status(201).json({
      sessionId: session._id,
      title: session.title,
      messages: session.messages,
      timestamp: session.timestamp,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create session' });
  }
};

// Add user message to session and get AI response
export const addMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    // Pass conversation history to AI service
    const conversationHistory = session.messages || [];
    console.log('🔍 Controller Debug - Session Messages:');
    console.log('📊 Total messages in session:', conversationHistory.length);
    conversationHistory.forEach((msg, index) => {
      console.log(`📝 Session Message ${index + 1}:`, {
        id: msg.id,
        _id: msg._id,
        prompt: msg.prompt?.substring(0, 30) + '...',
        response: msg.response?.substring(0, 30) + '...',
        hasResponse: !!(msg.response && msg.response.trim() !== '')
      });
    });
    
    const aiText = await getLLMResponse(text, conversationHistory);
    
    const messageObj = {
      id: uuidv4(),
      prompt: text,
      response: aiText,
      timestamp: new Date(),
      likes: 0,
      dislikes: 0,
      userFeedback: null
    };
    
    session.messages.push(messageObj);
    session.lastMessage = aiText;
    session.timestamp = new Date();
    
    // Update session title based on full conversation context
    const updatedTitle = await generateSessionTitle(session.messages);
    session.title = updatedTitle;
    
    await session.save();
    
    // Sort messages by timestamp to ensure proper order
    const sortedMessages = session.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    res.json({
      message: messageObj,
      updatedSession: {
        ...session.toObject(),
        messages: sortedMessages
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add message' });
  }
};

// Get all recent sessions (latest first)
export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({})
      // .sort({ timestamp: -1 })
      // .select('title lastMessage timestamp');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

// Get full message history for a session
export const getSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    // Map messages to exclude _id and __v, and sort by timestamp
    const messages = (session.messages || [])
      .map(msg => ({
        id: msg.id,
        prompt: msg.prompt,
        response: msg.response,
        timestamp: msg.timestamp,
        likes: msg.likes || 0,
        dislikes: msg.dislikes || 0,
        userFeedback: msg.userFeedback || null
      }))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    res.json({
      id: session._id,
      title: session.title,
      lastMessage: session.lastMessage,
      timestamp: session.timestamp,
      messages,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch session' });
  }
};

// Update session title based on conversation context
export const updateSessionTitle = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    // Generate new title based on all messages
    const newTitle = await generateSessionTitle(session.messages);
    session.title = newTitle;
    await session.save();
    
    res.json({
      sessionId: session._id,
      title: session.title,
      message: 'Session title updated successfully'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update session title' });
  }
};

// Regenerate response for a specific message
export const regenerateMessageResponse = async (req, res) => {
  try {
    const { sessionId, messageId } = req.params;
    
    // Find the session
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    // Find the specific message
    const messageIndex = session.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return res.status(404).json({ error: 'Message not found' });
    
    const message = session.messages[messageIndex];
    
    // Get conversation history up to this point (excluding the current message)
    const conversationHistory = session.messages.slice(0, messageIndex);
    
    console.log('🔄 Regenerating response for message:', messageId);
    console.log('📊 Conversation history length:', conversationHistory.length);
    
    // Generate new AI response using the same prompt but with conversation context
    const newResponse = await getLLMResponse(message.prompt, conversationHistory);
    
    // Update the message with new response and timestamp
    session.messages[messageIndex].response = newResponse;
    session.messages[messageIndex].timestamp = new Date();
    
    // Update session's last message if this was the last message
    if (messageIndex === session.messages.length - 1) {
      session.lastMessage = newResponse;
    }
    
    // Update session timestamp
    session.timestamp = new Date();
    
    // Regenerate session title based on updated conversation
    const updatedTitle = await generateSessionTitle(session.messages);
    session.title = updatedTitle;
    
    await session.save();
    
    // Sort messages by timestamp to ensure proper order
    const sortedMessages = session.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    res.json({
      message: session.messages[messageIndex],
      updatedSession: {
        ...session.toObject(),
        messages: sortedMessages
      },
      messageId: messageId,
      regenerated: true
    });
    
  } catch (err) {
    console.error('🚨 Regenerate Error:', err);
    res.status(500).json({ error: 'Failed to regenerate message response' });
  }
};

// Like or dislike a specific message
export const likeMessage = async (req, res) => {
  try {
    const { sessionId, messageId } = req.params;
    const { action } = req.body; // 'like' or 'dislike'
    
    if (!action || !['like', 'dislike'].includes(action)) {
      return res.status(400).json({ error: 'Action must be "like" or "dislike"' });
    }
    
    // Find the session
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    // Find the specific message
    const messageIndex = session.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return res.status(404).json({ error: 'Message not found' });
    
    const message = session.messages[messageIndex];
    
    // Initialize likes/dislikes if they don't exist
    if (!message.likes) message.likes = 0;
    if (!message.dislikes) message.dislikes = 0;
    if (!message.userFeedback) message.userFeedback = null;
    
    // Update likes/dislikes based on current feedback and new action
    if (message.userFeedback === 'like' && action === 'like') {
      // Already liked, remove like
      message.likes = Math.max(0, message.likes - 1);
      message.userFeedback = null;
    } else if (message.userFeedback === 'dislike' && action === 'dislike') {
      // Already disliked, remove dislike
      message.dislikes = Math.max(0, message.dislikes - 1);
      message.userFeedback = null;
    } else if (message.userFeedback === 'like' && action === 'dislike') {
      // Change from like to dislike
      message.likes = Math.max(0, message.likes - 1);
      message.dislikes = message.dislikes + 1;
      message.userFeedback = 'dislike';
    } else if (message.userFeedback === 'dislike' && action === 'like') {
      // Change from dislike to like
      message.dislikes = Math.max(0, message.dislikes - 1);
      message.likes = message.likes + 1;
      message.userFeedback = 'like';
    } else if (!message.userFeedback) {
      // No previous feedback, add new feedback
      if (action === 'like') {
        message.likes = message.likes + 1;
        message.userFeedback = 'like';
      } else {
        message.dislikes = message.dislikes + 1;
        message.userFeedback = 'dislike';
      }
    }
    
    // Update the message in the session
    session.messages[messageIndex] = message;
    await session.save();
    
    res.json({
      message: message,
      action: action,
      likes: message.likes,
      dislikes: message.dislikes,
      userFeedback: message.userFeedback,
      messageId: messageId
    });
    
  } catch (err) {
    console.error('🚨 Like Message Error:', err);
    res.status(500).json({ error: 'Failed to update message feedback' });
  }
};

// Update prompt and regenerate response for a specific message
export const updatePrompt = async (req, res) => {
  try {
    const { sessionId, messageId } = req.params;
    const { newPrompt } = req.body;
    
    if (!newPrompt || newPrompt.trim() === '') {
      return res.status(400).json({ error: 'New prompt is required' });
    }
    
    // Find the session
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    // Find the specific message
    const messageIndex = session.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return res.status(404).json({ error: 'Message not found' });
    
    const message = session.messages[messageIndex];
    
    console.log('🔄 Updating prompt for message:', messageId);
    console.log('📝 Old prompt:', message.prompt);
    console.log('📝 New prompt:', newPrompt);
    
    // Get conversation history up to this point (excluding the current message)
    const conversationHistory = session.messages.slice(0, messageIndex);
    
    console.log('📊 Conversation history length:', conversationHistory.length);
    
    // Generate new AI response using the new prompt with conversation context
    const newResponse = await getLLMResponse(newPrompt, conversationHistory);
    
    // Update the message with new prompt, response, and timestamp
    session.messages[messageIndex].prompt = newPrompt;
    session.messages[messageIndex].response = newResponse;
    session.messages[messageIndex].timestamp = new Date();
    
    // Reset likes/dislikes for the updated message
    session.messages[messageIndex].likes = 0;
    session.messages[messageIndex].dislikes = 0;
    session.messages[messageIndex].userFeedback = null;
    
    // Update session's last message if this was the last message
    if (messageIndex === session.messages.length - 1) {
      session.lastMessage = newResponse;
    }
    
    // Update session timestamp
    session.timestamp = new Date();
    
    // Regenerate session title based on updated conversation
    const updatedTitle = await generateSessionTitle(session.messages);
    session.title = updatedTitle;
    
    await session.save();
    
    // Sort messages by timestamp to ensure proper order
    const sortedMessages = session.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    res.json({
      success: true,
      message: "Prompt updated and AI response regenerated successfully"
    });
    
  } catch (err) {
    console.error('🚨 Update Prompt Error:', err);
    res.status(500).json({ error: 'Failed to update prompt and regenerate response' });
  }
}; 