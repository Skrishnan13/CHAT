"use client";

import type { FC } from 'react';
import { useState, useRef, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizontal, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';


interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  className?: string;
}

const ChatInput: FC<ChatInputProps> = ({ onSendMessage, isLoading, className }) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      // Auto-resize textarea if needed, or reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; 
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event as unknown as FormEvent<HTMLFormElement>);
    }
  };
  
  const handleTextareaInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set to scroll height
    }
  };


  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn("p-4 border-t border-border bg-background", className)}
    >
      <div className="flex items-end gap-2 max-w-3xl mx-auto bg-card p-2 rounded-xl shadow-sm border">
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleTextareaInput}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none bg-transparent max-h-32 overflow-y-auto pr-0"
          rows={1}
          disabled={isLoading}
          aria-label="Chat message input"
        />
        <Button 
          type="submit" 
          variant="default" 
          size="icon" 
          disabled={isLoading || !inputValue.trim()}
          className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg aspect-square h-10 w-10"
          aria-label="Send message"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizontal className="h-5 w-5" />}
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
