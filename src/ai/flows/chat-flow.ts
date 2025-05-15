// src/ai/flows/chat-flow.ts
'use server';

/**
 * @fileOverview Defines a Genkit flow for handling chat conversations.
 *
 * - invokeChatFlow - An async function to get a response from the chat AI.
 * - ChatFlowInput - The input type for the invokeChatFlow function.
 * - ChatFlowOutput - The return type for the invokeChatFlow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// This schema is for communication with the AI flow (external contract).
// The main app might use a slightly different ChatMessage type (e.g. with timestamp).
const ChatMessageForAIFlowSchema = z.object({
  role: z.enum(['user', 'assistant']).describe("The role of the message sender, either 'user' or 'assistant'."),
  content: z.string().describe("The content of the message."),
});

const ChatFlowInputSchema = z.object({
  history: z.array(ChatMessageForAIFlowSchema).describe('The history of the conversation, excluding the latest user prompt.'),
  userPrompt: z.string().describe('The latest user prompt to respond to.'),
});
export type ChatFlowInput = z.infer<typeof ChatFlowInputSchema>;

const ChatFlowOutputSchema = z.object({
  assistantResponse: z.string().describe("The LLM's response to the user prompt."),
});
export type ChatFlowOutput = z.infer<typeof ChatFlowOutputSchema>;

// Internal schema for the prompt itself
const ChatPromptInternalInputSchema = z.object({
  formattedHistory: z.string().describe('The pre-formatted history of the conversation as a single string.'),
  userPrompt: z.string().describe('The latest user prompt to respond to.'),
});

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: ChatPromptInternalInputSchema }, // Use internal schema
  output: { schema: ChatFlowOutputSchema },
  prompt: `You are PromptFlow, a helpful and friendly AI assistant. Provide concise and informative responses.

Conversation History:
{{{formattedHistory}}}

User: {{{userPrompt}}}
Assistant:`, // Model will complete from here
});

const chatFlowDefinition = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatFlowInputSchema,   // External input schema
    outputSchema: ChatFlowOutputSchema, // External output schema
  },
  async (input) => {
    try {
      // Ensure history is not excessively long to avoid token limits.
      // This is a simple truncation, more sophisticated summarization might be needed for very long histories.
      const maxHistoryLength = 10; // Keep last 10 exchanges (user + assistant = 1 exchange)
      const truncatedHistory = input.history.slice(-maxHistoryLength * 2); // *2 for user and assistant messages
      
      // Format history for the prompt
      const formattedHistory = truncatedHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const { output } = await chatPrompt({ 
        formattedHistory: formattedHistory, 
        userPrompt: input.userPrompt 
      });

      if (!output || typeof output.assistantResponse !== 'string') {
        console.warn('Chat flow output was missing or not in expected format:', output);
        return { assistantResponse: "I'm sorry, I couldn't formulate a response at this moment." };
      }
      return output;
    } catch (error) {
      console.error('Error in chatFlow:', error);
      // Provide a user-friendly error message
      return { assistantResponse: "Sorry, an unexpected error occurred while processing your request. Please try again later." };
    }
  }
);

// This function will be called by the client (e.g., from a server action in page.tsx)
export const invokeChatFlow = async (input: ChatFlowInput): Promise<ChatFlowOutput> => {
    return chatFlowDefinition(input);
};
