import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

/**
 * Extract email address from a message
 * @param {string} message - The message to search for email
 * @returns {string|null} Email address if found, null otherwise
 */
export function extractEmail(message) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = message.match(emailRegex);
    return match ? match[0] : null;
}

/**
 * Analyze conversation messages to detect potential sales opportunities
 * @param {string} visitorMessage - The visitor's message
 * @param {string} aiResponse - The AI's response
 * @param {Array} history - Conversation history
 * @returns {Promise<Object>} Sale detection analysis
 */
export async function analyzePotentialSale(visitorMessage, aiResponse, history = []) {
    try {
        const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash-exp' });
        
        const analysisPrompt = `You are a sales opportunity detection system. Analyze this conversation to determine if there's a potential sale opportunity.

Conversation History:
${JSON.stringify(history, null, 2)}

Latest Exchange:
Visitor: "${visitorMessage}"
AI Response: "${aiResponse}"

Analyze this conversation and respond with ONLY a JSON object (no additional text) with these exact fields:

{
    "hasPotentialSale": boolean,
    "confidenceScore": number between 0 and 1,
    "alertType": "potential_sale" | "purchase_intent" | "price_inquiry" | "none",
    "productMentioned": "extracted product/service name or empty string",
    "priority": "high" | "medium" | "low",
    "estimatedValue": number (0 if unknown),
    "reason": "brief explanation of why this is/isn't a potential sale"
}

Detection criteria:
- HIGH priority: Direct purchase intent, specific product requests, pricing discussions, ready to buy signals
- MEDIUM priority: Product inquiries, comparison requests, feature questions, timeline discussions  
- LOW priority: General questions, early research phase
- NONE: Greeting, support questions, unrelated topics

Look for signals like:
- "I want to buy", "how much", "price", "cost", "purchase", "order"
- Product-specific questions, feature requests
- Timeline discussions ("when can I get", "how soon")
- Decision-making language ("I'm considering", "looking for")
- Quantity mentions ("I need 10 of", "bulk order")

Respond with valid JSON only:`;

        const result = await model.generateContent(analysisPrompt);
        const analysisText = result.response.text().trim();
        
        // Clean up the response to extract JSON
        let cleanJson = analysisText;
        if (cleanJson.includes('```json')) {
            cleanJson = cleanJson.split('```json')[1].split('```')[0];
        }
        if (cleanJson.includes('```')) {
            cleanJson = cleanJson.split('```')[1];
        }
        
        const analysis = JSON.parse(cleanJson);
        
        // Validate the response structure
        if (typeof analysis.hasPotentialSale !== 'boolean' || 
            typeof analysis.confidenceScore !== 'number' ||
            !['potential_sale', 'purchase_intent', 'price_inquiry', 'none'].includes(analysis.alertType)) {
            throw new Error('Invalid analysis format');
        }

        // Ensure confidence score is between 0 and 1
        analysis.confidenceScore = Math.max(0, Math.min(1, analysis.confidenceScore));
        
        return analysis;
    } catch (error) {
        console.error('Error analyzing potential sale:', error);
        // Return default safe analysis on error
        return {
            hasPotentialSale: false,
            confidenceScore: 0.0,
            alertType: 'none',
            productMentioned: '',
            priority: 'low',
            estimatedValue: 0,
            reason: 'Analysis failed'
        };
    }
}

/**
 * Create a conversation context string from history
 * @param {Array} history - Message history
 * @param {number} maxMessages - Maximum number of recent messages to include
 * @returns {string} Formatted conversation context
 */
export function createConversationContext(history, maxMessages = 10) {
    if (!history || !Array.isArray(history)) return '';
    
    const recentMessages = history.slice(-maxMessages);
    return recentMessages.map(msg => {
        const timestamp = new Date(msg.timestamp).toLocaleTimeString();
        return `[${timestamp}] ${msg.type}: ${msg.message}`;
    }).join('\n');
}
