import { CommandResponse } from '../agent/commandExecutor';

const API_URL = import.meta.env.VITE_ROOMIE_API_URL || '/api/roomie';

export interface WebhookRequest {
  prompt: string;
  sceneState?: Record<string, unknown>;
}

export async function sendPromptToWebhook(
  prompt: string,
  sceneState?: Record<string, unknown>
): Promise<CommandResponse> {
  const maxRetries = 3;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        const extractedCode = extractCodeFromBlock(rawOutput);

        if (extractedCode) {
          return {
            action: 'none',
            targetId: 'none',
            response: `Code detected but execution disabled for security. Response: ${rawOutput}`,
          };
        }

        return {
          action: 'none',
          targetId: 'none',
          response: rawOutput,
        };
      }

      // Handle structured command
      if (result.action) {
        return result as CommandResponse;
      }

      // Handle simple text response
      if (result.text) {
        return {
          action: 'none',
          targetId: 'none',
          response: result.text,
        };
      }

      // Fallback for unexpected structure
      return {
        action: 'none',
        targetId: 'none',
        response: `Received response: ${JSON.stringify(result)}`,
      };
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed:`, error);

      if (i === maxRetries - 1) {
        throw new Error(
          `Failed to reach webhook after ${maxRetries} attempts. Check your connection and API URL.`
        );
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }

  throw new Error('Webhook request failed');
}

function extractCodeFromBlock(rawOutput: string): string | null {
  const codeBlockRegex = /```[^\n]*\n([\s\S]*?)```/;
  const match = rawOutput.match(codeBlockRegex);
  return match ? match[1].trim() : null;
}
