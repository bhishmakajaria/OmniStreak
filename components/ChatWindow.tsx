
import React, { useState, useRef, useEffect } from 'react';
import { Conversation, Message, Agent } from '../types';
import { suggestReply } from '../services/gemini';

interface ChatWindowProps {
  conversation: Conversation;
  onSendMessage: (text: string, media?: { type: 'image' | 'video', url: string }) => void;
  agents: Agent[];
  onAssign: (convId: string, agentId: string) => void;
  onStatusChange: (convId: string, status: 'open' | 'resolved' | 'snoozed') => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  conversation, 
  onSendMessage, 
  agents, 
  onAssign, 
  onStatusChange 
}) => {
  const [inputText, setInputText] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation.messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleSuggest = async () => {
    setIsSuggesting(true);
    const suggestion = await suggestReply(conversation.messages);
    setInputText(suggestion);
    setIsSuggesting(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Mock upload and send
      onSendMessage("Sent an attachment", { 
        type: 'image', 
        url: URL.createObjectURL(file) 
      });
    }
  };

  return (
    <>
      {/* Header */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <img src={conversation.contact.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
          <div>
            <h3 className="font-bold text-sm leading-tight">{conversation.contact.name}</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
             <span className="text-xs text-slate-500">Assign:</span>
             <select 
              className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none"
              value={conversation.assigneeId || ''}
              onChange={(e) => onAssign(conversation.id, e.target.value)}
             >
               <option value="">Unassigned</option>
               {agents.map(a => (
                 <option key={a.id} value={a.id}>{a.name}</option>
               ))}
             </select>
          </div>

          <button 
            onClick={() => onStatusChange(conversation.id, conversation.status === 'resolved' ? 'open' : 'resolved')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
              conversation.status === 'resolved' 
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {conversation.status === 'resolved' ? 'Reopen' : 'Resolve'}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {conversation.messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] group ${msg.isMe ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                msg.isMe 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
              }`}>
                {msg.type === 'text' ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : msg.type === 'image' ? (
                  <div className="space-y-2">
                    <img src={msg.mediaUrl} className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity" alt="attachment" />
                    {msg.text && <p className="text-sm opacity-90">{msg.text}</p>}
                  </div>
                ) : null}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200 shadow-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
             <button 
                type="button"
                onClick={handleSuggest}
                disabled={isSuggesting}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100 disabled:opacity-50 transition-colors"
             >
               <i className={`fa-solid ${isSuggesting ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
               AI Suggest Reply
             </button>
             <button 
                type="button"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100"
             >
               <i className="fa-solid fa-note-sticky"></i>
               Add Note
             </button>
          </div>

          <div className="relative">
            <textarea 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-24 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none min-h-[50px] max-h-[150px]"
              placeholder="Type your message..."
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <i className="fa-solid fa-paperclip text-lg"></i>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileUpload}
                accept="image/*,video/*"
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 transition-all"
              >
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChatWindow;
