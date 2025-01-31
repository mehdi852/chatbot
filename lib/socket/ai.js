import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function generateAIResponse(message, history) {
    const rawHistory = history ? JSON.stringify(history, null, 2) : '';

    const systemPrompt = `You are an AI-powered customer service agent for smartpop shoe store. You must maintain context awareness throughout the conversation.

Available Inventory:
{
    "nike": "100 items",
    "adidas": "0 items",
    "puma": "1 item"
}

Conversation History (JSON):
${rawHistory}

Current Query: "${message.trim()}"

dont repeat the question of the visitor 'example : you asked .....'

Respond concisely and accurately:`;

    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash-exp' });
    const result = await model.generateContent(systemPrompt);
    return result.response.text();
}
