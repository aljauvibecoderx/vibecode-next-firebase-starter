'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Edit2, User, Bot, Loader2, RotateCcw, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  agent?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
}

export interface ChatInterfaceProps {
  powerPrompt: string;
  title: string;
  description?: string;
  onDownloadPRD?: (content: string) => void;
  showDownloadButton?: boolean;
  className?: string;
}

const AGENTS: Agent[] = [
  {
    id: 'claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    description: 'Advanced reasoning and creative capabilities'
  },
  {
    id: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    description: 'Strong analytical skills and balanced responses'
  },
  {
    id: 'claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    description: 'Concise, focused, and creative responses'
  },
  {
    id: 'grok-fast',
    name: 'Grok Fast',
    description: 'Rapid, accurate, and insightful answers'
  }
];

const AiMutation = async ({ prompt, agent }: { prompt: string; agent: string }) => {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, agent }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get AI response');
  }

  return response.json();
};

export function ChatInterface({
  powerPrompt,
  title,
  description,
  onDownloadPRD,
  showDownloadButton = false,
  className
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(powerPrompt);
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0].id);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(powerPrompt);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const aiMutation = useMutation({
    mutationFn: AiMutation,
    onMutate: () => {
      // Add user message immediately (optimistic update)
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content: input,
        role: 'user',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setInput(editedPrompt); // Reset input to current prompt
    },
    onSuccess: (data) => {
      // Add AI response
      const aiMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
        agent: data.agent,
      };

      setMessages(prev => [...prev, aiMessage]);
    },
    onError: (error) => {
      // Remove the user message if AI call failed
      setMessages(prev => prev.slice(0, -1));
      console.error('AI Error:', error);
    },
  });

  const handleSend = () => {
    if (!input.trim() || aiMutation.isPending) return;
    aiMutation.mutate({ prompt: input, agent: selectedAgent });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEditPrompt = () => {
    setEditedPrompt(input);
    setIsEditingPrompt(true);
  };

  const handleSavePrompt = () => {
    setInput(editedPrompt);
    setIsEditingPrompt(false);
  };

  const handleCancelEdit = () => {
    setEditedPrompt(input);
    setIsEditingPrompt(false);
  };

  const handleReloadConversation = () => {
    setMessages([]);
  };

  const handleDownloadPRD = () => {
    const lastAIMessage = messages
      .filter(m => m.role === 'assistant')
      .pop();

    if (lastAIMessage && onDownloadPRD) {
      onDownloadPRD(lastAIMessage.content);
    }
  };

  const isLoading = aiMutation.isPending;

  return (
    <div className={cn('max-w-4xl mx-auto space-y-4', className)}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Agent Selector */}
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AGENTS.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {agent.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Action Buttons */}
              {showDownloadButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPRD}
                  disabled={!messages.some(m => m.role === 'assistant')}
                >
                  Download PRD
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleReloadConversation}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reload
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card className="min-h-[400px] max-h-[600px]">
        <CardContent className="p-4">
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation by editing and sending the prompt below.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3 p-3 rounded-lg',
                    message.role === 'user'
                      ? 'bg-primary/5 ml-12'
                      : 'bg-secondary/50 mr-12'
                  )}
                >
                  <div className="flex-shrink-0 mt-1">
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-primary" />
                    ) : (
                      <Bot className="w-5 h-5 text-secondary-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {message.role === 'user' ? 'You' : AGENTS.find(a => a.id === message.agent)?.name || 'AI Assistant'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex gap-3 p-3 rounded-lg bg-secondary/50 mr-12">
                <Bot className="w-5 h-5 text-secondary-foreground flex-shrink-0 mt-1" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            )}

            {/* Error State */}
            {aiMutation.error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {aiMutation.error.message || 'An error occurred while getting the AI response.'}
                </AlertDescription>
              </Alert>
            )}

            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Prompt</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={isEditingPrompt ? handleSavePrompt : handleEditPrompt}
            >
              {isEditingPrompt ? (
                <>
                  <Edit2 className="w-4 h-4 mr-1" />
                  Save
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Textarea
            value={isEditingPrompt ? editedPrompt : input}
            onChange={(e) => isEditingPrompt ? setEditedPrompt(e.target.value) : setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your prompt..."
            className="min-h-[100px] resize-none"
            disabled={isLoading}
          />
          {isEditingPrompt && (
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0">
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || isEditingPrompt}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}