"use client";

import type { FC } from 'react';
import { User, Bot } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Assuming Avatar is from shadcn

interface ChatAvatarProps {
  role: 'user' | 'assistant' | 'system';
}

const ChatAvatar: FC<ChatAvatarProps> = ({ role }) => {
  const commonAvatarClass = "h-8 w-8";
  const commonIconClass = "h-5 w-5";

  if (role === 'user') {
    return (
      <Avatar className={commonAvatarClass}>
        {/* Placeholder image or actual user image can be used here */}
        {/* <AvatarImage src="https://placehold.co/40x40.png" alt="User" /> */}
        <AvatarFallback className="bg-primary/20 text-primary">
          <User className={commonIconClass} />
        </AvatarFallback>
      </Avatar>
    );
  }

  if (role === 'assistant') {
    return (
      <Avatar className={commonAvatarClass}>
        {/* <AvatarImage src="https://placehold.co/40x40.png" alt="AI Assistant" data-ai-hint="robot technology" /> */}
        <AvatarFallback className="bg-accent/20 text-accent">
          <Bot className={commonIconClass} />
        </AvatarFallback>
      </Avatar>
    );
  }
  
  // For system or other roles, can return null or a generic icon
  return null; 
};

export default ChatAvatar;
