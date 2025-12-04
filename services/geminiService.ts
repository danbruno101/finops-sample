import { GoogleGenAI } from "@google/genai";
import { AggregatedStats, OrgLevel1 } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to sanitize data to save tokens
const simplifyDataForAnalysis = (data: any) => {
  return JSON.stringify(data, (key, value) => {
    if (key === 'skus') return undefined; // Remove granular SKU data for high-level analysis to save tokens
    if (typeof value === 'number') return Math.round(value); // Round numbers
    return value;
  });
};

export const analyzeData = async (
  prompt: string, 
  contextData: { currentLevel: string; stats: AggregatedStats; topSpenders: any[] }
): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please ensure process.env.API_KEY is set.";
  }

  const systemInstruction = `
    You are an expert Cloud FinOps and Security Analyst. 
    You are provided with a summary of cloud spend and security vulnerability data.
    
    Data Structure:
    - Providers: AWS, Azure, GCP, OCI
    - Tiers: 0-5 (0 is lowest priority, 5 is mission critical)
    - Vulnerabilities: Critical, High, Medium, Low
    
    Your goal is to provide concise, actionable insights. 
    If asked about overspending, look at spend vs forecast.
    If asked about security, highlight critical vulnerabilities.
    Keep responses professional but conversational. Use markdown for formatting.
  `;

  const dataContext = `
    Current View Context: ${contextData.currentLevel}
    Aggregated Stats: ${JSON.stringify(contextData.stats)}
    Top Spenders: ${JSON.stringify(contextData.topSpenders)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `Context Data: ${dataContext}` }] },
        { role: 'user', parts: [{ text: `User Question: ${prompt}` }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.4,
      }
    });

    return response.text || "I couldn't generate an analysis at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while contacting the AI analyst.";
  }
};