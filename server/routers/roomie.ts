import { publicProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { ENV } from '../_core/env';

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
        throw new Error('Webhook URL not configured. Please set VITE_ROOMIE_WEBHOOK_URL environment variable.');
      }

      const maxRetries = 3;

      for (let i = 0; i < maxRetries; i++) {
        try {
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

          const result = await response.json();

          // Handle array output from n8n
          if (Array.isArray(result) && result.length > 0 && result[0].output) {
            const rawOutput = result[0].output;

            return {
              action: 'none',
              targetId: 'none',
              response: rawOutput,
            };
          }

          // Handle structured command
          if (result.action) {
            return result;
          }

          // Handle simple text response
          if (result.text) {
            return {
              action: 'none',
              targetId: 'none',
              response: result.text,
            };
          }

          // Fallback
          return {
            action: 'none',
            targetId: 'none',
            response: `Received response: ${JSON.stringify(result)}`,
          };
        } catch (error) {
          console.warn(`Attempt ${i + 1} failed:`, error);

          if (i === maxRetries - 1) {
            throw new Error(
              `Failed to reach webhook after ${maxRetries} attempts. Check your webhook URL and configuration.`
            );
          }

          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }

      throw new Error('Webhook request failed');
    }),
});
