import { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const MessageSchema = new Schema({
  id: { type: String, default: uuidv4 },
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  userFeedback: { 
    type: String, 
    enum: ['like', 'dislike', null], 
    default: null 
  }
});

export default MessageSchema;