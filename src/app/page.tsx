"use client";

import { useState, useEffect, useCallback } from 'react';
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

  const initialMessages: ChatMessage[] = [
    { 
      id: 'greeting-' + Date.now(), // Ensure unique ID for initial greeting
      role: 'assistant', 
      content: 'Hello! I am PromptFlow. How can I assist you today?', 
      timestamp: Date.now() 
    }
  ];

  const [messages, setMessages] = useLocalStorage<ChatMessage[]>('promptflow-chat-history', () => initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  
  // Effect to handle initial messages if localStorage is empty.
  // This ensures the default greeting is only set once if no history exists.
  useEffect(() => {
    if (!initialLoadComplete) {
      const storedHistory = window.localStorage.getItem('promptflow-chat-history');
      if (!storedHistory || JSON.parse(storedHistory).length === 0) {
        // Only set initial messages if local storage is truly empty or uninitialized
        // useLocalStorage hook now handles this better by setting initial value to LS if not present.
        // So, we can rely on useLocalStorage's initialValue logic.
        // If messages from LS is empty, it will use initialMessages.
      }
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
      const errorMessage: ChatMessage = {
        id: 'error-' + Date.now(),
        role: 'system', // Or 'assistant' with an error style
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      toast({
        title: "Error",
        description: "Could not get response from AI. Please check your connection or try again later.",
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
