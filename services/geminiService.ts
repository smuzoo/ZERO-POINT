
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAnalysis = async (anomalyName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are the 'CORP' AI system. Analyze this frozen object found at absolute zero: "${anomalyName}". Describe it in a cold, clinical, yet horrifying way. Keep it under 50 words. Focus on how it shouldn't exist in the ice.`,
      config: {
        temperature: 0.9,
        topP: 0.95,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "ANALYSIS FAILED. DATA CORRUPTION DETECTED. OBJECT PERSISTS DESPITE THERMAL NULLIFICATION.";
  }
};

export const getCorporateOrder = async (targetId: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a cryptic, authoritative corporate instruction for a pilot stuck in a 1km deep ice moon. Target ID: ${targetId}. Mention things like 'Heat signature stability', 'Layer integrity', or 'The Archive requires observation'. Maximum 2 sentences.`,
    });
    return response.text;
  } catch {
    return `PROCEED TO SECTOR ${targetId}. MINIMIZE OXYGEN EXPENDITURE. OBSERVATION IS MANDATORY.`;
  }
};
