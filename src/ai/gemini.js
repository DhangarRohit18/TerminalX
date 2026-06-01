import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const getModel = () => genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export const generateText = async (prompt) => {
  const model = getModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const generateJSON = async (prompt) => {
  const model = getModel();
  const fullPrompt = `${prompt}\n\nIMPORTANT: Respond with ONLY valid JSON. No markdown, no code blocks, no explanation. Just pure JSON.`;
  const result = await model.generateContent(fullPrompt);
  let text = result.response.text().trim();
  // Strip markdown code fences if present
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  return JSON.parse(text);
};
