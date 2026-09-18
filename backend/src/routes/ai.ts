import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

export const aiRouter = Router();

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// POST /api/ai/program-notes - Generate program notes for repertoire or concert pieces
aiRouter.post('/program-notes', async (req: Request, res: Response) => {
  try {
    const { pieceTitle, composer, key, mood } = req.body;
    if (!pieceTitle) {
      return res.status(400).json({ success: false, error: 'Piece title is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        source: 'template_fallback',
        data: {
          notes: `"${pieceTitle}" (${composer || 'Bharath Kannan'}, in ${key || 'Minor'}) unfolds with nuanced textural restraint, evoking contemplation and auditory stillness tailored for acoustic recital halls.`,
        },
      });
    }

    const ai = getGenAI();
    const prompt = `Write eloquent, sophisticated classical/contemporary program notes (approx 80-120 words) for a concert piece titled "${pieceTitle}" by ${composer || 'Bharath Kannan'}. Key: ${key || 'unspecified'}. Mood: ${mood || 'poignant, contemplative'}. Keep the prose evocative, poetic, and suitable for a luxury concert playbill.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({
      success: true,
      source: 'gemini-2.5-flash',
      data: {
        notes: response.text,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI Generation error';
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/ai/refine-bio - Refine biography text for festival submissions or press releases
aiRouter.post('/refine-bio', async (req: Request, res: Response) => {
  try {
    const { rawBio, targetLength, tone } = req.body;
    if (!rawBio) {
      return res.status(400).json({ success: false, error: 'Raw biography text is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        source: 'template_fallback',
        data: {
          refinedBio: rawBio,
        },
      });
    }

    const ai = getGenAI();
    const prompt = `You are a public relations editor for international concert pianists and composers. Refine and polish the following musician biography to be ${tone || 'distinguished, captivating, and high-impact'} (approx ${targetLength || '150 words'}):

${rawBio}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({
      success: true,
      source: 'gemini-2.5-flash',
      data: {
        refinedBio: response.text,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI Polish error';
    res.status(500).json({ success: false, error: message });
  }
});
