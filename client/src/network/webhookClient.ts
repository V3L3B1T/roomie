import { BlueprintResponse } from '../../../shared/types/blueprint';
import { BlueprintResponseSchema } from '../../../shared/validation/blueprint';

// Hard-coded webhook URL for prototype - POST directly to n8n
const WEBHOOK_URL = 'https://v3l3b1t.app.n8n.cloud/webhook/3a1c7269-29ff-42b5-a8b3-75047c74bcd0';

export interface WebhookRequest {
  prompt: string;
  sceneState?: Record<string, unknown>;
}

export async function sendPromptToWebhook(
  prompt: string,
  sceneState?: Record<string, unknown>
): Promise<BlueprintResponse> {
  const maxRetries = 3;

  console.log('[Webhook] Sending prompt to n8n:', prompt);
  console.log('[Webhook] Scene state:', sceneState);

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          sceneState: sceneState || {},
        }),
      });

      console.log('[Webhook] Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawResult = await response.json();
      console.log('[Webhook] Raw response:', rawResult);

      // Handle array output from n8n (common format)
      let result = rawResult;
      if (Array.isArray(rawResult) && rawResult.length > 0) {
        result = rawResult[0];
        console.log('[Webhook] Extracted first array element:', result);
      }

      // Try to parse as BlueprintResponse
      try {
        const validated = BlueprintResponseSchema.parse(result);
        console.log('[Webhook] ✅ Valid BlueprintResponse:', validated);
        return validated;
      } catch (validationError) {
        console.warn('[Webhook] ⚠️ Response does not match BlueprintResponse schema:', validationError);
        
        // Fallback: create a text-only response
        const fallbackResponse: BlueprintResponse = {
          message: typeof result === 'string' ? result : JSON.stringify(result),
          geometry: { shapes: [], instances: [] },
          behavior: { behaviors: [] },
        };
        console.log('[Webhook] Using fallback response:', fallbackResponse);
        return fallbackResponse;
      }
    } catch (error) {
      console.warn(`[Webhook] Attempt ${i + 1} failed:`, error);

      if (i === maxRetries - 1) {
        throw new Error(
          `Failed to reach webhook after ${maxRetries} attempts. Check your connection and n8n URL.`
        );
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }

  throw new Error('Webhook request failed');
}
