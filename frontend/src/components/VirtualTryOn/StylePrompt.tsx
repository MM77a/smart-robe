'use client';

import React, { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';

interface StylePromptProps {
  onPromptSubmit?: (prompt: string) => void;
}

const StylePrompt: React.FC<StylePromptProps> = ({ onPromptSubmit }) => {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState([
    '我想看起来更成熟专业',
    '希望展现年轻活力的风格',
    '想要舒适但不失时髦',
    '寻找约会出街的穿搭',
  ]);

  const handleSubmit = (text: string) => {
    onPromptSubmit?.(text);
  };

  const handleQuickSelect = (suggestion: string) => {
    setPrompt(suggestion);
    handleSubmit(suggestion);
  };

  return (
    <div className="my-8">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">穿搭建议</h3>
        </div>

        {/* Input Area */}
        <div className="mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && prompt.trim()) {
                  handleSubmit(prompt);
                }
              }}
              placeholder="告诉我你的穿搭需求..."
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
            <button
              onClick={() => prompt.trim() && handleSubmit(prompt)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:shadow-lg transition-all flex items-center gap-2 group"
            >
              <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              发送
            </button>
          </div>
        </div>

        {/* Quick Suggestions */}
        <div>
          <p className="text-sm text-slate-400 mb-3">快速建议：</p>
          <div className="grid grid-cols-2 gap-3">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickSelect(suggestion)}
                className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-left text-sm text-slate-300 hover:bg-slate-700 hover:border-slate-600 transition-all group"
              >
                <p className="text-white font-medium group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400">
                  {suggestion}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StylePrompt;
