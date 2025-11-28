import type { VercelRequest, VercelResponse } from '@vercel/node';

const WEBHOOK_URL = process.env.ROOMIE_WEBHOOK_URL || '';
const ROOMIE_API_KEY = process.env.ROOMIE_API_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!WEBHOOK_URL) {
    return res.status(500).json({ 
      error: 'Webhook URL not configured. Please set ROOMIE_WEBHOOK_URL environment variable.' 
    });
  }

  const { prompt, sceneState } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const maxRetries = 3;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(ROOMIE_API_KEY && { Authorization: `Bearer ${ROOMIE_API_KEY}` }),
        },
        body: JSON.stringify({
          prompt,
          sceneState: sceneState || {},
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Handle array output from n8n
      if (Array.isArray(result) && result.length > 0 && result[0].output) {
        const rawOutput = result[0].output;
        return res.status(200).json({
          action: 'none',
          targetId: 'none',
          response: rawOutput,
        });
      }

      // Handle structured command
      if (result.action) {
        return res.status(200).json(result);
      }

      // Handle simple text response
      if (result.text) {
        return res.status(200).json({
          action: 'none',
          targetId: 'none',
          response: result.text,
        });
      }

      // Fallback
      return res.status(200).json({
        action: 'none',
        targetId: 'none',
        response: `Received response: ${JSON.stringify(result)}`,
      });
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed:`, error);

      if (i === maxRetries - 1) {
        return res.status(500).json({
          error: `Failed to reach webhook after ${maxRetries} attempts. Check your webhook URL and configuration.`,
        });
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }

  return res.status(500).json({ error: 'Webhook request failed' });
}
