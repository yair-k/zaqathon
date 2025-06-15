import Groq from 'groq-sdk';
import { ExtractedItem } from './types';

// Initialize Groq client lazily to ensure environment variables are loaded
let groq: Groq | null = null;

function getGroqClient() {
  if (!groq) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }
  return groq;
}

export interface ExtractedOrder {
  customer: {
    name: string;
    address: string;
  };
  items: Array<{
    product: string;
    quantity: number;
    confidence: number;
  }>;
  delivery: {
    date: string;
    address: string;
  };
}

export async function extractOrder(emailContent: string): Promise<ExtractedOrder> {
  const prompt = `
Extract order information from this email. Return ONLY valid JSON with this exact structure:

{
  "customer": {
    "name": "string",
    "address": "string"
  },
  "items": [
    {
      "product": "exact product name or code from email",
      "quantity": number,
      "confidence": number between 0-1
    }
  ],
  "delivery": {
    "date": "YYYY-MM-DD or 'not specified'",
    "address": "delivery address or same as customer"
  }
}

Email content:
${emailContent}

Rules:
- Extract exact product names/codes as written
- Parse quantities carefully (numbers before product names)
- If delivery address not specified, use customer address
- Set confidence based on clarity of information
- Return valid JSON only, no other text
`;
  try {
    const groqClient = getGroqClient();
    const completion = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens: 1000
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from LLM');
    }

    // Clean up response to extract JSON
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}') + 1;
    const jsonStr = content.slice(jsonStart, jsonEnd);

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('LLM extraction error:', error);
    // Fallback parsing
    return {
      customer: {
        name: 'Unknown Customer',
        address: 'Address not found'
      },
      items: [],
      delivery: {
        date: 'not specified',
        address: 'Address not found'
      }
    };
  }
}
