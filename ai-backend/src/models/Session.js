import mongoose, { Schema } from 'mongoose';
import MessageSchema from './Message.js';

const SessionSchema = new Schema({
  userId: { type: String }, // optional
  title: { type: String, required: true },
  lastMessage: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  messages: [MessageSchema],
});

const Session = mongoose.model('Session', SessionSchema);
export default Session; 