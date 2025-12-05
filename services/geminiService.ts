import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AggregatedStats } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export interface AiResponse {
  text: string;
  chart?: {
    type: 'bar' | 'pie' | 'area';
    title: string;
    data: { label: string; value: number }[];
  }
}

// Define the response schema using Type
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    text: { 
      type: Type.STRING, 
      description: "The natural language answer to the user's question. Use markdown for formatting." 
    },
    chart: {
      type: Type.OBJECT,
      description: "Optional chart configuration. Include this ONLY if the user asks for a visualization or if comparing data points is best done visually.",
      properties: {
        type: { 
          type: Type.STRING, 
          description: "The type of chart to display. Use 'bar' for comparisons, 'pie' for distribution, 'area' for trends.",
          enum: ['bar', 'pie', 'area']
        },
        title: { 
          type: Type.STRING, 
          description: "A short, descriptive title for the chart." 
        },
        data: {
          type: Type.ARRAY,
          description: "The data points for the chart.",
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING, description: "The label for the X-axis or legend." },
              value: { type: Type.NUMBER, description: "The numerical value." }
            }
          }
        }
      }
    }
  },
  required: ["text"]
};

export const analyzeData = async (
  prompt: string, 
  contextData: { 
    currentLevel: string; 
    stats: AggregatedStats; 
    topSpenders: any[];
    monthlyTrends?: any[];
    availableEntities?: any[];
  }
): Promise<string> => {
  if (!apiKey) {
    return JSON.stringify({ text: "API Key is missing. Please ensure process.env.API_KEY is set." });
  }

  const systemInstruction = `
    You are an expert Cloud FinOps and Security Analyst. 
    You are provided with a summary of cloud spend and security vulnerability data.
    
    Data Structure:
    - Providers: AWS, Azure, GCP, OCI
    - Tiers: 0-5 (0 is lowest priority, 5 is mission critical)
    - Vulnerabilities: Critical, High, Medium, Low
    
    Your goal is to provide concise, actionable insights. 
    
    CRITICAL INSTRUCTION:
    - You have access to "Detailed Entity Data" which lists specific organizations (Level 1) and departments (Level 2) with their monthly spend.
    - If the user asks about a specific entity (e.g., "Global Engineering", "Corporate IT"), LOOK IT UP in the "Detailed Entity Data" array first.
    - Even if the "Current View Context" is different, use the "Detailed Entity Data" to answer questions about specific named entities.
    - If the user asks for a chart for a specific entity, use the monthly data from "Detailed Entity Data".
    
    Chart Rules:
    - Use 'bar' charts for comparing spend between providers or top accounts.
    - Use 'pie' charts for breakdown of spend by provider or status.
    - Use 'area' charts for trends over time (monthly spend).
    
    Response Format:
    - You must return a valid JSON object matching the provided schema.
    - The 'text' field should contain your conversational response.
    - The 'chart' field is optional but encouraged for numerical comparisons.
  `;

  const dataContext = `
    Current View Context: ${contextData.currentLevel}
    Aggregated Stats (Current View): ${JSON.stringify(contextData.stats)}
    Top Spenders (Current View): ${JSON.stringify(contextData.topSpenders)}
    Monthly Trends (Current View): ${JSON.stringify(contextData.monthlyTrends)}
    
    Detailed Entity Data (Reference this for questions about specific L1/L2 areas):
    ${JSON.stringify(contextData.availableEntities)}
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
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    return response.text || JSON.stringify({ text: "I couldn't generate an analysis at this time." });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return JSON.stringify({ text: "An error occurred while contacting the AI analyst." });
  }
};
