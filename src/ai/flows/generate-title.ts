// src/ai/flows/generate-title.ts
'use server';

/**
 * @fileOverview Generates a title for a chat session based on the conversation history.
 *
 * - generateTitle - A function that generates a title for a chat session.
 * - GenerateTitleInput - The input type for the generateTitle function.
 * - GenerateTitleOutput - The return type for the generateTitle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTitleInputSchema = z.object({
  conversationHistory: z
    .string()
    .describe('The complete conversation history of the chat session.'),
});
export type GenerateTitleInput = z.infer<typeof GenerateTitleInputSchema>;

const GenerateTitleOutputSchema = z.object({
  title: z
    .string()
    .describe(
      'A concise and relevant title for the chat session, summarizing the main topic of the conversation.'
    ),
});
export type GenerateTitleOutput = z.infer<typeof GenerateTitleOutputSchema>;

export async function generateTitle(input: GenerateTitleInput): Promise<GenerateTitleOutput> {
  return generateTitleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTitlePrompt',
  input: {schema: GenerateTitleInputSchema},
  output: {schema: GenerateTitleOutputSchema},
  prompt: `You are a title generation expert. You will generate a title for a chat session based on the conversation history.

Conversation History:
{{{conversationHistory}}}

Title:`,
});

const generateTitleFlow = ai.defineFlow(
  {
    name: 'generateTitleFlow',
    inputSchema: GenerateTitleInputSchema,
    outputSchema: GenerateTitleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
