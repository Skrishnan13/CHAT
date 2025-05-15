"use client";

import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ChatMessage as ChatMessageType } from '@/types';
import ChatMessage from './chat-message';
import { cn } from '@/lib/utils';
import { Bot, Loader2 } from 'lucide-react';

interface ChatHistoryProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  className?: string;
}

const ChatHistory: FC<ChatHistoryProps> = ({ messages, isLoading, className }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <ScrollArea 
      className={cn("w-full p-4", className)} 
      ref={scrollAreaRef}
      viewportRef={viewportRef}
    >
      <div className="max-w-3xl mx-auto">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex items-end gap-2 my-3 justify-start">
            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-accent/20 text-accent">
              <Bot className="h-5 w-5" />
            </div>
            <div className="bg-card text-card-foreground rounded-xl rounded-bl-none shadow-md p-3">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ChatHistory;
