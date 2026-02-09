const keywordResponses = [
  {
    keywords: ['fire', 'emergency'],
    response: 'For fire emergencies, please call 911 immediately and evacuate the area if safe to do so.'
  },
  {
    keywords: ['safety', 'prevent'],
    response: 'Fire safety tips: 1) Install smoke detectors. 2) Keep flammable items away from heat sources. 3) Have an escape plan.'
  },
  {
    keywords: ['evacuation', 'escape'],
    response: 'Evacuation procedures: 1) Get out immediately. 2) Stay low to avoid smoke. 3) Do not use elevators.'
  },
  {
    keywords: ['help', 'assist'],
    response: 'I can help with: Fire safety tips, emergency procedures, and evacuation plans.'
  },
];

const fallbackResponse = "I'm here to help with fire safety and emergency response. Ask me anything!";

export function simulateAIResponse(text) {
  const lowerText = text.toLowerCase();
  for (const { keywords, response } of keywordResponses) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return response;
    }
  }
  return fallbackResponse;
} 