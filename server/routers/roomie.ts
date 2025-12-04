import { publicProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { ENV } from '../_core/env';
import { validateBlueprintComplete } from '../../shared/validation/blueprint';
import type { BlueprintResponse } from '../../shared/types/blueprint';

const WebhookURL = ENV.roomieWebhookUrl || '';
const ROOMIE_API_KEY = ENV.roomieApiKey || '';

export const roomieRouter = router({
  sendPrompt: publicProcedure
    .input(
      z.object({
        prompt: z.string().min(1),
        sceneState: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!WebhookURL) {
        console.error('[Roomie] Webhook URL not configured');
        
        // Return a safe fallback blueprint
        return createFallbackBlueprint(
          'Webhook URL not configured. Please set ROOMIE_WEBHOOK_URL environment variable.'
        );
      }

      const maxRetries = 3;
      let lastError: Error | null = null;

      for (let i = 0; i < maxRetries; i++) {
        try {
          console.log(`[Roomie] Sending prompt to webhook (attempt ${i + 1}/${maxRetries})`);
          
          const response = await fetch(WebhookURL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(ROOMIE_API_KEY && { Authorization: `Bearer ${ROOMIE_API_KEY}` }),
            },
            body: JSON.stringify({
              prompt: input.prompt,
              sceneState: input.sceneState || {},
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          let result = await response.json();
          
          // Handle n8n array wrapper: [{ output: ... }]
          if (Array.isArray(result) && result.length > 0 && result[0]?.output) {
            result = result[0].output;
          }

          // Validate the blueprint
          const validation = validateBlueprintComplete(result);

          if (validation.success && validation.data) {
            console.log('[Roomie] Blueprint validated successfully');
            return validation.data;
          } else {
            console.warn('[Roomie] Blueprint validation failed:', validation.errors);
            
            // Log for debugging
            console.log('[Roomie] Invalid blueprint:', JSON.stringify(result, null, 2));
            
            // Return fallback with validation errors
            return createFallbackBlueprint(
              `AI returned invalid blueprint: ${validation.errors.join(', ')}`
            );
          }
        } catch (error) {
          lastError = error as Error;
          console.warn(`[Roomie] Attempt ${i + 1} failed:`, error);

          if (i < maxRetries - 1) {
            // Exponential backoff
            const delay = Math.pow(2, i) * 1000;
            console.log(`[Roomie] Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      // All retries failed
      console.error('[Roomie] All webhook attempts failed:', lastError);
      
      return createFallbackBlueprint(
        `Failed to reach AI after ${maxRetries} attempts. ${lastError?.message || 'Unknown error'}`
      );
    }),
});

/**
 * Creates a safe fallback blueprint when AI fails
 */
function createFallbackBlueprint(message: string): BlueprintResponse {
  return {
    geometry: {
      shapes: [],
      instances: [],
    },
    behavior: {
      behaviors: [],
    },
    message,
  };
}
