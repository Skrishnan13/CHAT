import { config } from 'dotenv';
config();

import '@/ai/flows/generate-title.ts';
import '@/ai/flows/summarize-chat.ts';
import '@/ai/flows/chat-flow.ts'; // Add the new chat flow
