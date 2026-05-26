import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini with the provided key
const ai = new GoogleGenAI({ apiKey: 'AIzaSyDoEgcTUBOmNe0gOsj0y8PcKSTAsT9FMb' });

export const extractJobDetails = async (req: Request, res: Response) => {
  try {
    const { voice_text } = req.body;
    
    if (!voice_text) return res.status(400).json({ error: 'Missing voice text input' });

    const prompt = `
      You are an AI assistant for a hyperlocal workforce platform in India.
      A user said this phrase to search or post a job: "${voice_text}".
      Extract the following fields in JSON format exactly:
      - category (e.g. Electrician, Plumber, Construction, Agriculture)
      - urgency (e.g. HIGH, NORMAL)
      - estimated_wage (e.g. 500, or null if unknown)
      - intent (e.g. HIRE, WORK)
      - workers_needed (integer, e.g. 2. Default to 1 if not specified)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'Failed to extract AI details' });
  }
};

export const translateText = async (req: Request, res: Response) => {
  try {
    const { text, target_language } = req.body;
    
    if (!text || !target_language) return res.status(400).json({ error: 'Missing parameters' });

    const prompt = `Translate the following text to ${target_language}. Return ONLY the translated text without any quotes or extra explanation: "${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ translated_text: response.text?.trim() });
  } catch (error) {
    console.error('AI Translation Error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
};
