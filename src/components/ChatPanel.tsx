'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/hooks/useOnlineGame';

// Quick reactions - Te Reo themed!
const QUICK_REACTIONS = [
  { emoji: '👏', label: 'Ka pai!' },
  { emoji: '🔥', label: 'Tino pai!' },
  { emoji: '😂', label: 'Ha ha!' },
  { emoji: '🤔', label: 'Hmm...' },
  { emoji: '💪', label: 'Kia kaha!' },
  { emoji: '❤️', label: 'Aroha!' },
];

interface ChatPanelProps {
  messages: ChatMessage[];
  currentPlayerId: string | null;
  onSendMessage: (content: string) => void;
  onSendReaction: (emoji: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ChatPanel({
  messages,
  currentPlayerId,
  onSendMessage,
  onSendReaction,
  isCollapsed = false,
  onToggleCollapse,
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="flex items-center gap-2 px-3 py-2 bg-white/90 rounded-lg shadow-md
                   hover:bg-white transition-colors"
      >
        <span className="text-lg">💬</span>
        <span className="text-sm font-medium text-gray-700">Chat</span>
        {messages.length > 0 && (
          <span className="w-5 h-5 bg-teal-500 text-white text-xs rounded-full flex items-center justify-center">
            {messages.length > 9 ? '9+' : messages.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-col w-80 h-96 bg-white/95 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-teal-600 text-white">
        <h3 className="font-semibold">💬 Chat</h3>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="text-white/80 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Quick reactions */}
      <div className="flex gap-1 px-2 py-2 bg-gray-50 border-b overflow-x-auto">
        {QUICK_REACTIONS.map(({ emoji, label }) => (
          <button
            key={emoji}
            onClick={() => onSendReaction(emoji)}
            title={label}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200
                       hover:bg-teal-50 hover:border-teal-300 transition-colors
                       flex items-center justify-center text-lg"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">
            No messages yet. Say kia ora! 👋
          </p>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.playerId === currentPlayerId;

            if (msg.isReaction) {
              // Reaction - show inline with name
              return (
                <div
                  key={msg.id}
                  className={`flex items-center gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <span className="text-xs text-gray-400">{msg.playerName}</span>
                  <span className="text-2xl animate-bounce-once">{msg.content}</span>
                </div>
              );
            }

            // Regular message
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs font-medium ${isOwnMessage ? 'text-teal-600' : 'text-gray-600'}`}>
                    {isOwnMessage ? 'You' : msg.playerName}
                  </span>
                  <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
                </div>
                <div
                  className={`max-w-[85%] px-3 py-1.5 rounded-2xl ${
                    isOwnMessage
                      ? 'bg-teal-500 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm break-words">{msg.content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-2 border-t bg-gray-50">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            maxLength={200}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-full
                       focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="px-4 py-2 bg-teal-500 text-white rounded-full text-sm font-medium
                       hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatPanel;
