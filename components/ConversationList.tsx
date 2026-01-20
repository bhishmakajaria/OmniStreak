
import React from 'react';
import { Conversation, Channel } from '../types';
import { MOCK_AGENTS } from '../constants';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  activeStatus: 'open' | 'resolved' | 'snoozed';
  onStatusChange: (status: 'open' | 'resolved' | 'snoozed') => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

const ChannelIcon: React.FC<{ channel: Channel }> = ({ channel }) => {
  switch (channel) {
    case 'whatsapp': return <i className="fa-brands fa-whatsapp text-emerald-500"></i>;
    case 'instagram': return <i className="fa-brands fa-instagram text-pink-500"></i>;
    case 'messenger': return <i className="fa-brands fa-facebook-messenger text-blue-500"></i>;
  }
};

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelect,
  activeStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <>
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-xl font-bold mb-4">Unified Inbox</h2>
        
        <div className="relative mb-4">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"></i>
          <input 
            type="text" 
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex p-1 bg-slate-100 rounded-xl">
          {(['open', 'resolved', 'snoozed'] as const).map(status => (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className={`flex-1 py-2 text-xs font-bold capitalize rounded-lg transition-all ${
                activeStatus === status 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 text-2xl mb-4">
              <i className="fa-solid fa-inbox"></i>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No conversations</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const assignee = MOCK_AGENTS.find(a => a.id === conv.assigneeId);
            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full p-4 flex gap-3 border-b border-slate-100 text-left transition-all relative ${
                  selectedId === conv.id ? 'bg-indigo-50/70 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50'
                }`}
              >
                <div className="relative shrink-0 self-start mt-1">
                  <img 
                    src={conv.contact.avatar} 
                    alt={conv.contact.name} 
                    className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-sm">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center bg-slate-50 text-[8px]">
                      <ChannelIcon channel={conv.contact.channel} />
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="font-bold text-sm truncate text-slate-800">{conv.contact.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold shrink-0">
                      {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 mb-2 font-medium">
                    {conv.lastMessage}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    {conv.unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[9px] font-black rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                    {assignee && (
                      <div className="flex items-center gap-1.5 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        <img src={assignee.avatar} className="w-3.5 h-3.5 rounded-full" alt="" />
                        <span className="text-[9px] text-slate-600 font-bold">
                          {assignee.name.split(' ')[0]}
                        </span>
                      </div>
                    )}
                    {conv.contact.tags.slice(0, 1).map(tag => (
                      <span key={tag} className="text-[8px] font-black text-indigo-500 bg-indigo-50 px-1 py-0.5 rounded uppercase tracking-tighter">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </>
  );
};

export default ConversationList;
