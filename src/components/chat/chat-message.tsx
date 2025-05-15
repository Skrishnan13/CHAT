"use client";

import type { FC } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import type { ChatMessage as ChatMessageType } from '@/types';
import { cn } from '@/lib/utils';
import ChatAvatar from './chat-avatar';
import { Card, CardContent } from '@/components/ui/card';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const timeAgo = formatDistanceToNow(new Date(message.timestamp), { addSuffix: true });

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="my-2 flex justify-center"
      >
        <div className="text-xs text-muted-foreground italic px-4 py-2 bg-muted/50 rounded-lg shadow-sm">
          {message.content}
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-end gap-2 my-3 animate-in fade-in slide-in-from-bottom-5",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && <ChatAvatar role={message.role} />}
      <Card className={cn(
        "max-w-[70%] rounded-xl shadow-md",
        isUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card text-card-foreground rounded-bl-none"
      )}>
        <CardContent className="p-3">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <p className={cn(
            "text-xs mt-1",
            isUser ? "text-primary-foreground/70 text-right" : "text-muted-foreground text-left"
          )}>
            {timeAgo}
          </p>
        </CardContent>
      </Card>
      {isUser && <ChatAvatar role={message.role} />}
    </motion.div>
  );
};

export default ChatMessage;
