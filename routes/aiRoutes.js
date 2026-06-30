import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

router.post('/smart-search', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text prompt is required' });
  }

  const systemInstruction = `
    You are the smart intent-routing engine for LifeFlow, a blood donation platform.
    Analyze the user's input text and extract their primary intent and entities.
    
    Valid intents:
    1. REQUEST_BLOOD (User needs/wants to find blood for a patient)
    2. OFFER_DONATION (User wants to donate blood or register as a donor)
    3. FIND_CENTER (User is looking for a nearby hospital or blood bank center)
    4. GENERAL_FAQ (General questions about health, blood eligibility, tattoos, etc.)

    Return ONLY a strict JSON object matching this structure:
    {
      "intent": "REQUEST_BLOOD" | "OFFER_DONATION" | "FIND_CENTER" | "GENERAL_FAQ",
      "entities": {
        "bloodGroup": "string or null (e.g., A+, O-, B+)",
        "location": "string or null (extract city, area, or hospital name)",
        "urgency": "high" | "normal"
      },
      "faqResponse": "string or null (Fill this ONLY if intent is GENERAL_FAQ. Keep it warm, concise, and helpful.)"
    }
  `;

  try {
    // 1. Initialize the client safely inside the route handler
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 2. Call the generation API matching the @google/genai SDK requirements
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: text,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    // 3. Extract text content cleanly
    let responseText = response.text;
    
    if (!responseText) {
      throw new Error("Empty response received from Gemini API");
    }

    // 4. Clean up markdown wrappers if Gemini added them by accident
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    // 5. Safely parse and send JSON
    const resultJson = JSON.parse(responseText);
    res.json(resultJson);

  } catch (error) {
    // This will now print the exact breakdown of why it failed to your terminal
    console.error('--- GEMINI CRASH DETAILS ---');
    console.error(error);
    console.error('----------------------------');
    
    res.status(500).json({ error: 'Failed to process natural language request.' });
  }
});

export default router;