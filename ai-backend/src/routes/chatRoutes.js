import express from 'express';
import { createSession, addMessage, getSessions, getSessionById, updateSessionTitle, regenerateMessageResponse, likeMessage, updatePrompt } from '../controllers/chatController.js';

const router = express.Router();

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Create new chat session with first message
 *     description: Creates a new chat session with an AI-generated contextual title based on the fire safety response
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - userId
 *             properties:
 *               text:
 *                 type: string
 *                 description: The user's fire safety question or message
 *                 example: "How can I prevent kitchen fires?"
 *               userId:
 *                 type: string
 *                 description: User or Officer ID to associate with the session
 *                 example: "68fe08c1ae5b0066605af7ce"
 *     responses:
 *       201:
 *         description: Session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Unique identifier for the chat session
 *                 userId:
 *                   type: string
 *                   description: User or Officer ID associated with the session
 *                 title:
 *                   type: string
 *                   description: AI-generated contextual title for the session
 *                   example: "Kitchen Fire Safety"
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       prompt:
 *                         type: string
 *                       response:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       likes:
 *                         type: number
 *                         default: 0
 *                       dislikes:
 *                         type: number
 *                         default: 0
 *                       userFeedback:
 *                         type: string
 *                         enum: [like, dislike, null]
 *                         default: null
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - text or userId is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Text is required"
 *       500:
 *         description: Internal server error
 */
router.post('/chat', createSession);

/**
 * @swagger
 * /chat/{sessionId}/message:
 *   post:
 *     summary: Add user message to session and get AI response
 *     description: Adds a new message to an existing chat session and gets an AI response with conversation context awareness
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the chat session
 *         example: "68fdec6c8926e0f530e312b5"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The user's fire safety question or follow-up message
 *                 example: "What should I do during a fire evacuation?"
 *     responses:
 *       200:
 *         description: Message added and AI response returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     prompt:
 *                       type: string
 *                     response:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     likes:
 *                       type: number
 *                       default: 0
 *                     dislikes:
 *                       type: number
 *                       default: 0
 *                     userFeedback:
 *                       type: string
 *                       enum: [like, dislike, null]
 *                       default: null
 *                 updatedSession:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     lastMessage:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Bad request - text is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Text is required"
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Session not found"
 *       500:
 *         description: Internal server error
 */
router.post('/chat/:sessionId/message', addMessage);

/**
 * @swagger
 * /chat:
 *   get:
 *     summary: Get all recent chat sessions
 *     description: Retrieves all chat sessions with their contextual titles and last messages. Optionally filter by userId.
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter sessions by user ID
 *     responses:
 *       200:
 *         description: List of sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Unique session identifier
 *                   userId:
 *                     type: string
 *                     description: User or Officer ID associated with the session
 *                   title:
 *                     type: string
 *                     description: AI-generated contextual title
 *                     example: "Kitchen Fire Safety"
 *                   lastMessage:
 *                     type: string
 *                     description: The most recent AI response
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                     description: When the session was last updated
 *                   messages:
 *                     type: array
 *                     description: All messages in the session
 *                     items:
 *                       type: object
 *       500:
 *         description: Internal server error
 */
router.get('/chat', getSessions);

/**
 * @swagger
 * /chat/{sessionId}:
 *   get:
 *     summary: Get full message history of a chat session
 *     description: Retrieves the complete conversation history for a specific chat session with messages sorted by timestamp
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the chat session
 *         example: "68fdec6c8926e0f530e312b5"
 *     responses:
 *       200:
 *         description: Session details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Session identifier
 *                 userId:
 *                   type: string
 *                   description: User or Officer ID associated with the session
 *                 title:
 *                   type: string
 *                   description: AI-generated contextual title
 *                   example: "Kitchen Fire Safety"
 *                 lastMessage:
 *                   type: string
 *                   description: The most recent AI response
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: When the session was last updated
 *                 messages:
 *                   type: array
 *                   description: All messages sorted by timestamp
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       prompt:
 *                         type: string
 *                       response:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       likes:
 *                         type: number
 *                         default: 0
 *                       dislikes:
 *                         type: number
 *                         default: 0
 *                       userFeedback:
 *                         type: string
 *                         enum: [like, dislike, null]
 *                         default: null
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Session not found"
 *       500:
 *         description: Internal server error
 */
router.get('/chat/:sessionId', getSessionById);

/**
 * @swagger
 * /chat/{sessionId}/title:
 *   put:
 *     summary: Update session title based on conversation context
 *     description: Regenerates the session title using AI analysis of the conversation content and fire safety responses
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the chat session
 *         example: "68fdec6c8926e0f530e312b5"
 *     responses:
 *       200:
 *         description: Session title updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   description: The session identifier
 *                 title:
 *                   type: string
 *                   description: The new AI-generated contextual title
 *                   example: "Electrical Fire Prevention"
 *                 message:
 *                   type: string
 *                   example: "Session title updated successfully"
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Session not found"
 *       500:
 *         description: Internal server error
 */
router.put('/chat/:sessionId/title', updateSessionTitle);

/**
 * @swagger
 * /chat/{sessionId}/regenerate/{messageId}:
 *   put:
 *     summary: Regenerate AI response for a specific message
 *     description: Regenerates the AI response for a specific message in a conversation, using the same prompt but with updated conversation context
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the chat session
 *         example: "68fdec6c8926e0f530e312b5"
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the message to regenerate
 *         example: "8f14375a-1601-48d9-b950-e2ac1da2d80a"
 *     responses:
 *       200:
 *         description: Message response regenerated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     prompt:
 *                       type: string
 *                     response:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     likes:
 *                       type: number
 *                       default: 0
 *                     dislikes:
 *                       type: number
 *                       default: 0
 *                     userFeedback:
 *                       type: string
 *                       enum: [like, dislike, null]
 *                       default: null
 *                 updatedSession:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     lastMessage:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                 messageId:
 *                   type: string
 *                 regenerated:
 *                   type: boolean
 *       404:
 *         description: Session or message not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Session not found"
 *       500:
 *         description: Failed to regenerate response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to regenerate message response"
 *   post:
 *     summary: Regenerate AI response for a specific message (POST alternative)
 *     description: Alternative POST method for regenerating AI responses
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the chat session
 *         example: "68fdec6c8926e0f530e312b5"
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the message to regenerate
 *         example: "8f14375a-1601-48d9-b950-e2ac1da2d80a"
 *     responses:
 *       200:
 *         description: Message response regenerated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: object
 *                 updatedSession:
 *                   type: object
 *                 messageId:
 *                   type: string
 *                 regenerated:
 *                   type: boolean
 *       404:
 *         description: Session or message not found
 *       500:
 *         description: Failed to regenerate response
 */
router.put('/chat/:sessionId/regenerate/:messageId', regenerateMessageResponse);

// Alternative POST route for regenerate
router.post('/chat/:sessionId/regenerate/:messageId', regenerateMessageResponse);

/**
 * @swagger
 * /chat/{sessionId}/message/{messageId}/like:
 *   post:
 *     summary: Like or dislike a specific message
 *     description: Allows users to like or dislike AI responses to provide feedback
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the chat session
 *         example: "68fdec6c8926e0f530e312b5"
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the message to like/dislike
 *         example: "8f14375a-1601-48d9-b950-e2ac1da2d80a"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [like, dislike]
 *                 description: The action to perform
 *                 example: "like"
 *     responses:
 *       200:
 *         description: Message feedback updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     prompt:
 *                       type: string
 *                     response:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     likes:
 *                       type: number
 *                     dislikes:
 *                       type: number
 *                     userFeedback:
 *                       type: string
 *                       enum: [like, dislike, null]
 *                 action:
 *                   type: string
 *                   description: The action performed
 *                   example: "like"
 *                 likes:
 *                   type: number
 *                   description: Total likes for the message
 *                 dislikes:
 *                   type: number
 *                   description: Total dislikes for the message
 *                 userFeedback:
 *                   type: string
 *                   description: Current user's feedback state
 *                   enum: [like, dislike, null]
 *                 messageId:
 *                   type: string
 *                   description: The ID of the message
 *       400:
 *         description: Bad request - invalid action
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Action must be \"like\" or \"dislike\""
 *       404:
 *         description: Session or message not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Session not found"
 *       500:
 *         description: Internal server error
 */
router.post('/chat/:sessionId/message/:messageId/like', likeMessage);

/**
 * @swagger
 * /chat/{sessionId}/message/{messageId}:
 *   put:
 *     summary: Update prompt and regenerate response for a specific message
 *     description: Updates the prompt for a specific message and regenerates the AI response with conversation context awareness
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the chat session
 *         example: "68fdec6c8926e0f530e312b5"
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the message to update
 *         example: "8f14375a-1601-48d9-b950-e2ac1da2d80a"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPrompt
 *             properties:
 *               newPrompt:
 *                 type: string
 *                 description: The updated prompt for the message
 *                 example: "What are the key fire safety tips for a commercial kitchen?"
 *     responses:
 *       200:
 *         description: Prompt updated and response regenerated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *                   example: "Prompt updated and AI response regenerated successfully"
 *       400:
 *         description: Bad request - new prompt is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "New prompt is required"
 *       404:
 *         description: Session or message not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Session not found"
 *       500:
 *         description: Internal server error
 */
router.put('/chat/:sessionId/message/:messageId', updatePrompt);

export default router;
