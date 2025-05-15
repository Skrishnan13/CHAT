
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import ChatHistory from '@/components/chat/chat-history';
import ChatInput from '@/components/chat/chat-input';
import type { ChatMessage } from '@/types';
import useLocalStorage from '@/hooks/use-local-storage';
import { invokeChatFlow, type ChatFlowInput } from '@/ai/flows/chat-flow'; // Ensure correct path
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";


const PromptFlowPage: NextPage = () => {
  const { toast } = useToast();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Memoize initialMessages to make it stable
  const stableInitialMessages = useMemo<ChatMessage[]>(() => [
    {
      id: 'greeting-initial', // Stable ID
      role: 'assistant',
      content: 'Hello! I am PromptFlow. How can I assist you today?',
      timestamp: Date.now() // Timestamp captured once on initial memoization
    }
  ], []); // Empty dependency array ensures this is created only once

  const [messages, setMessages] = useLocalStorage<ChatMessage[]>(
    'promptflow-chat-history',
    stableInitialMessages // Pass the stable, memoized array
  );
  const [isLoading, setIsLoading] = useState(false);

  // Effect to handle initial messages if localStorage is empty.
  // This ensures the default greeting is only set once if no history exists.
  useEffect(() => {
    if (!initialLoadComplete) {
      // The useLocalStorage hook now correctly handles setting the initial value
      // to localStorage if it's not present, and initializing the state.
      // So, this effect primarily serves to set initialLoadComplete.
      setInitialLoadComplete(true);
    }
  }, [initialLoadComplete]);


  const handleSendMessage = useCallback(async (userPrompt: string) => {
    if (!userPrompt.trim()) return;

    const newUserMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: userPrompt,
      timestamp: Date.now(),
    };

    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setIsLoading(true);

    try {
      // Prepare history for AI: only user and assistant messages, and map to AI flow schema
      const historyForAI = messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant', // Type assertion
          content: msg.content,
        }));

      const aiInput: ChatFlowInput = {
        history: historyForAI,
        userPrompt: userPrompt,
      };

      const aiResponse = await invokeChatFlow(aiInput);

      const newAssistantMessage: ChatMessage = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: aiResponse.assistantResponse,
        timestamp: Date.now(),
      };
      setMessages(prevMessages => [...prevMessages, newAssistantMessage]);

    } catch (error) {
      console.error("Error sending message or getting AI response:", error);
      
      let clientErrorMessage = "Sorry, an unexpected error occurred on the client. Please try again.";
      let toastDescription = "Could not get response from AI. Please check your connection or try again later.";

      if (error instanceof Error && error.message) {
        clientErrorMessage = `Client-side error: ${error.message}`;
        toastDescription = `Details: ${error.message}`;
      } else if (typeof error === 'string') {
        clientErrorMessage = `Client-side error: ${error}`;
        toastDescription = `Details: ${error}`;
      } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as {message:unknown}).message === 'string') {
          clientErrorMessage = `Client-side error: ${(error as {message:string}).message}`;
          toastDescription = `Details: ${(error as {message:string}).message}`;
      }

      const errorMessageToDisplay: ChatMessage = {
        id: 'error-' + Date.now(),
        role: 'system', 
        content: clientErrorMessage,
        timestamp: Date.now(),
      };
      setMessages(prevMessages => [...prevMessages, errorMessageToDisplay]);
      
      toast({
        title: "Error Sending Message",
        description: toastDescription,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, setMessages, toast]);

  if (!initialLoadComplete) {
    // Optional: Show a loading spinner or skeleton screen while useLocalStorage initializes
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background text-foreground">
        {/* You can add a spinner here if needed */}
        <p>Loading Chat...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>PromptFlow</title>
        <meta name="description" content="Chat with PromptFlow AI" />
      </Head>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <header className="p-4 border-b border-border shadow-sm shrink-0 bg-card">
          <h1 className="text-xl font-semibold text-primary text-center sm:text-left sm:text-2xl">PromptFlow</h1>
        </header>
        <ChatHistory messages={messages} isLoading={isLoading} className="flex-1" />
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} className="shrink-0" />
      </div>
      <Toaster />
    </>
  );
};

export default PromptFlowPage;
