// src/ai/flows/chat-flow.ts
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// This schema is for communication with the AI flow.
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

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: ChatFlowInputSchema },
  output: { schema: ChatFlowOutputSchema },
  prompt: (input) => {
    let promptString = "You are PromptFlow, a helpful and friendly AI assistant. Provide concise and informative responses.\n\nConversation History:\n";
    input.history.forEach(msg => {
      promptString += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    promptString += `User: ${input.userPrompt}\nAssistant:`; // The model will complete from here
    return promptString;
  },
});

const chatFlowDefinition = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatFlowInputSchema,
    outputSchema: ChatFlowOutputSchema,
  },
  async (input) => {
    try {
      // Ensure history is not excessively long to avoid token limits.
      // This is a simple truncation, more sophisticated summarization might be needed for very long histories.
      const maxHistoryLength = 10; // Keep last 10 exchanges (20 messages)
      const truncatedHistory = input.history.slice(-maxHistoryLength * 2);
      
      const { output } = await chatPrompt({ ...input, history: truncatedHistory });

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
    // "use server" directive is typically for functions directly called from client components as server actions.
    // Since this flow itself is defined with 'use server' at the top (implicitly by being in an AI flow file potentially),
    // and Genkit handles the server-side execution, we directly export the function.
    // If this file was NOT implicitly a server module, then 'use server' would be needed here.
    // For Genkit flows, they are server-side by nature.
    return chatFlowDefinition(input);
};
