
import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

// Fix: Initialized GoogleGenAI with exactly the named parameter process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const summarizeConversation = async (messages: Message[]): Promise<string> => {
  try {
    const chatHistory = messages.map(m => `${m.isMe ? 'Agent' : 'Customer'}: ${m.text}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize this customer support conversation concisely:\n\n${chatHistory}`,
      config: {
        systemInstruction: "You are a helpful customer support assistant. Provide short, bulleted summaries of the main issue and current status.",
      }
    });
    // Fix: Access response.text directly (it is a property, not a method)
    return response.text || "Failed to generate summary.";
  } catch (error) {
    console.error("Gemini summary error:", error);
    return "Could not generate summary at this time.";
  }
};

export const suggestReply = async (messages: Message[]): Promise<string> => {
  try {
    const chatHistory = messages.map(m => `${m.isMe ? 'Agent' : 'Customer'}: ${m.text}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on this conversation, suggest a professional next reply for the agent:\n\n${chatHistory}`,
      config: {
        systemInstruction: "You are an expert customer success manager. Suggest helpful, empathetic, and concise replies.",
      }
    });
    // Fix: Access response.text directly
    return response.text || "I'm sorry, I can't think of a reply right now.";
  } catch (error) {
    console.error("Gemini suggestion error:", error);
    return "Error getting suggestion.";
  }
};
