import { ChatOpenAI } from "@langchain/openai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import dotenv from "dotenv";

dotenv.config();
process.env.OPENAI_API_KEY = process.env.OPEN_ROUTER; // 👈 this is the fix

const model = new ChatOpenAI({
  openAIApiKey: process.env.OPEN_ROUTER,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
  modelName: "mistralai/mistral-7b-instruct",
  temperature: 0.7,
  maxTokens: 1000,
});

// Clean AI response by removing unwanted symbols and formatting artifacts
function cleanAIResponse(response) {
  if (!response || typeof response !== 'string') {
    return response;
  }
  
  // Remove common AI model artifacts
  let cleaned = response
    // Remove <s> and </s> tags
    .replace(/<s>/g, '')
    .replace(/<\/s>/g, '')
    .replace(/\[s\]/g, '')
    .replace(/\[\/s\]/g, '')
    // Remove [INST] and [/INST] tags
    .replace(/\[INST\]/g, '')
    .replace(/\[\/INST\]/g, '')
    // Remove [B_INST] and [E_INST] tags
    .replace(/\[B_INST\]/g, '')
    .replace(/\[E_INST\]/g, '')
    // Remove other common artifacts
    .replace(/<|im_start>/g, '')
    .replace(/<|im_end>/g, '')
    .replace(/<|endoftext|>/g, '')
    // Remove multiple spaces and normalize whitespace
    .replace(/\s+/g, ' ')
    // Trim whitespace
    .trim();
  
  // If the response is empty or too short after cleaning, return a fallback
  if (cleaned.length < 10) {
    return "I apologize, but I'm having trouble processing your request right now. Please try again. If the problem persists, please rephrase your question about fire safety.";
  }
  
  return cleaned;
}

export async function getLLMResponse(inputText, conversationHistory = []) {
  try {
    // Debug: Log the conversation history
    console.log('🔍 Conversation History Debug:');
    console.log('📊 Total messages:', conversationHistory.length);
    conversationHistory.forEach((msg, index) => {
      console.log(`📝 Message ${index + 1}:`, {
        id: msg.id,
        prompt: msg.prompt?.substring(0, 50) + '...',
        response: msg.response?.substring(0, 50) + '...',
        hasResponse: !!(msg.response && msg.response.trim() !== '')
      });
    });
    
    // Create conversation context
    let contextPrompt = `You are a helpful fire safety assistant. You provide expert advice on fire prevention, safety procedures, and emergency response. Always stay focused on fire safety topics and provide practical, actionable advice.\n\n`;
    
    if (conversationHistory.length > 0) {
      contextPrompt += `Previous conversation:\n`;
      conversationHistory.forEach(msg => {
        // Only include messages with actual responses (not empty ones or error messages)
        if (msg.response && msg.response.trim() !== '' && !msg.response.includes('trouble processing')) {
          contextPrompt += `Human: ${msg.prompt}\nAssistant: ${msg.response}\n\n`;
        }
      });
    }
    
    contextPrompt += `Current question: ${inputText}\n\nPlease provide a helpful fire safety response:`;
    
    console.log('🔍 Final Context Prompt Length:', contextPrompt.length);
    console.log('🔍 Context Preview:', contextPrompt.substring(0, 200) + '...');
    
    const prompt = PromptTemplate.fromTemplate("{input}");
    const chain = new LLMChain({ llm: model, prompt });
    console.log('🔍 About to call AI service...');
    const response = await chain.call({ input: contextPrompt });
    console.log('🔍 AI Response received:', !!response);
    console.log('🔍 Response text length:', response?.text?.length || 0);
    
        // Ensure we have a valid response
        if (!response.text || response.text.trim() === '') {
          throw new Error('Empty response from AI service');
        }
        
        // Clean the response to remove unwanted symbols and artifacts
        const cleanedResponse = cleanAIResponse(response.text);
        console.log('🔍 Original response length:', response.text.length);
        console.log('🔍 Cleaned response length:', cleanedResponse.length);
        
        return cleanedResponse;
  } catch (error) {
    console.error('🚨 LLM Error Details:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error type:', error.constructor.name);
    console.error('Environment check - OPEN_ROUTER exists:', !!process.env.OPEN_ROUTER);
    console.error('Environment check - OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
    
    // Return a fallback response instead of throwing
    return `I apologize, but I'm having trouble processing your request right now. Please try again. If the problem persists, please rephrase your question about fire safety.`;
  }
}

// Generate contextual session title based on conversation content
export async function generateSessionTitle(conversationHistory = []) {
  try {
    console.log('🔍 Starting title generation...');
    console.log('📊 Total messages received:', conversationHistory.length);
    
    // Filter out error messages and empty responses
    const validMessages = conversationHistory.filter(msg => 
      msg.response && 
      msg.response.trim() !== '' && 
      !msg.response.includes('trouble processing') &&
      !msg.response.includes('tools needed') &&
      !msg.response.includes('[B_INST]') // Filter out malformed responses
    );

    console.log('📊 Valid messages after filtering:', validMessages.length);

    if (validMessages.length === 0) {
      console.log('⚠️ No valid messages found, using default title');
      return "Fire Safety Discussion";
    }

    // Create a simple title based on the first valid response
    const firstResponse = validMessages[0].response;
    
    // Extract key fire safety topics from the response
    let title = "Fire Safety Discussion";
    
    if (firstResponse.toLowerCase().includes('electrical')) {
      title = "Electrical Fire Prevention";
    } else if (firstResponse.toLowerCase().includes('extinguisher')) {
      title = "Fire Extinguisher Usage";
    } else if (firstResponse.toLowerCase().includes('smoke')) {
      title = "Smoke Detection & Response";
    } else if (firstResponse.toLowerCase().includes('evacuation')) {
      title = "Fire Evacuation Procedures";
    } else if (firstResponse.toLowerCase().includes('prevention')) {
      title = "Fire Prevention Tips";
    } else if (firstResponse.toLowerCase().includes('kitchen')) {
      title = "Kitchen Fire Safety";
    } else if (firstResponse.toLowerCase().includes('cooking')) {
      title = "Cooking Fire Safety";
    } else if (firstResponse.toLowerCase().includes('heater')) {
      title = "Space Heater Safety";
    } else if (firstResponse.toLowerCase().includes('candle')) {
      title = "Candle Fire Safety";
    } else if (firstResponse.toLowerCase().includes('escape')) {
      title = "Fire Escape Planning";
    } else if (firstResponse.toLowerCase().includes('surge')) {
      title = "Surge Protector Safety";
    } else if (firstResponse.toLowerCase().includes('wiring')) {
      title = "Electrical Wiring Safety";
    } else {
      // Try to extract a meaningful title from the response
      const words = firstResponse.toLowerCase().split(' ');
      const fireKeywords = ['fire', 'safety', 'prevention', 'emergency', 'evacuation', 'extinguisher', 'smoke', 'alarm'];
      const foundKeywords = words.filter(word => fireKeywords.includes(word));
      
      if (foundKeywords.length > 0) {
        title = `${foundKeywords[0].charAt(0).toUpperCase() + foundKeywords[0].slice(1)} Safety`;
      }
    }
    
    console.log('✅ Generated title:', title);
    return title;
    
  } catch (error) {
    console.error('🚨 Title Generation Error:', error.message);
    console.error('Error stack:', error.stack);
    return "Fire Safety Discussion";
  }
}
