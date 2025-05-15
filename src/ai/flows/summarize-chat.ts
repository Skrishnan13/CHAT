// SummarizeChat.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing chat conversations.
 *
 * The flow takes a chat history as input and returns a summarized version of the chat.
 * It exports the following:
 * - `summarizeChat`: An async function to summarize a chat.
 * - `SummarizeChatInput`: The input type for the `summarizeChat` function.
 * - `SummarizeChatOutput`: The output type for the `summarizeChat` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the summarizeChat flow
const SummarizeChatInputSchema = z.object({
  chatHistory: z.string().describe('The complete chat history as a string.'),
});
export type SummarizeChatInput = z.infer<typeof SummarizeChatInputSchema>;

// Define the output schema for the summarizeChat flow
const SummarizeChatOutputSchema = z.object({
  summary: z.string().describe('A summarized version of the chat history.'),
});
export type SummarizeChatOutput = z.infer<typeof SummarizeChatOutputSchema>;

// Exported function to summarize the chat
export async function summarizeChat(input: SummarizeChatInput): Promise<SummarizeChatOutput> {
  return summarizeChatFlow(input);
}

// Define the prompt for summarizing the chat
const summarizeChatPrompt = ai.definePrompt({
  name: 'summarizeChatPrompt',
  input: {schema: SummarizeChatInputSchema},
  output: {schema: SummarizeChatOutputSchema},
  prompt: `Summarize the following chat history in a concise manner:\n\n{{{chatHistory}}}`, // Access chatHistory from input
});

// Define the Genkit flow for summarizing the chat
const summarizeChatFlow = ai.defineFlow(
  {
    name: 'summarizeChatFlow',
    inputSchema: SummarizeChatInputSchema,
    outputSchema: SummarizeChatOutputSchema,
  },
  async input => {
    // Call the prompt to get the summarized version of the chat
    const {output} = await summarizeChatPrompt(input);
    // Return the summary
    return output!;
  }
);
