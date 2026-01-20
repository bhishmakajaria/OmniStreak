
import React, { useState, useMemo, useEffect } from 'react';
import { Channel, Conversation, Agent, Message, Contact, MetaConfig } from './types';
import { INITIAL_CONVERSATIONS, MOCK_AGENTS, CURRENT_AGENT } from './constants';
import Sidebar from './components/Sidebar';
import ConversationList from './components/ConversationList';
import ChatWindow from './components/ChatWindow';
import ContactDetails from './components/ContactDetails';
import OnboardingFlow from './components/OnboardingFlow';
import SettingsModal from './components/SettingsModal';

const App: React.FC = () => {
  // Database Simulation: Loading from localStorage
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('omnichat_conversations');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Revive dates
      return parsed.map((c: any) => ({
        ...c,
        lastMessageAt: new Date(c.lastMessageAt),
        messages: c.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
      }));
    }
    return INITIAL_CONVERSATIONS;
  });

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(conversations[0]?.id || null);
  const [activeChannel, setActiveChannel] = useState<Channel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<'open' | 'resolved' | 'snoozed'>('open');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [config, setConfig] = useState<MetaConfig>(() => {
    const saved = localStorage.getItem('omnichat_config');
    return saved ? JSON.parse(saved) : { metaAppId: 'YOUR_APP_ID', metaAppSecret: '', whatsappConfigId: '' };
  });

  // Persist conversations to "database" whenever they change
  useEffect(() => {
    localStorage.setItem('omnichat_conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Initialize Meta SDK
  useEffect(() => {
    if (window.FB && config.metaAppId && config.metaAppId !== 'YOUR_APP_ID') {
      window.FB.init({
        appId: config.metaAppId,
        cookie: true,
        xfbml: true,
        version: 'v21.0'
      });
    }
  }, [config.metaAppId]);

  const selectedConversation = useMemo(() => 
    conversations.find(c => c.id === selectedConversationId) || null
  , [conversations, selectedConversationId]);

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      const matchesChannel = activeChannel === 'all' || c.contact.channel === activeChannel;
      const matchesStatus = c.status === activeStatus;
      const matchesSearch = c.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesChannel && matchesStatus && matchesSearch;
    });
  }, [conversations, activeChannel, activeStatus, searchQuery]);

  const handleSendMessage = (text: string, media?: { type: 'image' | 'video', url: string }) => {
    if (!selectedConversationId) return;

    const newMessage: Message = {
      id: `m_${Date.now()}`,
      senderId: CURRENT_AGENT.id,
      senderName: CURRENT_AGENT.name,
      text,
      timestamp: new Date(),
      isMe: true,
      type: media?.type || 'text',
      mediaUrl: media?.url
    };

    setConversations(prev => prev.map(c => {
      if (c.id === selectedConversationId) {
        return {
          ...c,
          messages: [...c.messages, newMessage],
          lastMessage: media ? `[${media.type}]` : text,
          lastMessageAt: new Date()
        };
      }
      return c;
    }));
  };

  const handleAssignAgent = (conversationId: string, agentId: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return { ...c, assigneeId: agentId || undefined };
      }
      return c;
    }));
  };

  const handleStatusChange = (conversationId: string, status: 'open' | 'resolved' | 'snoozed') => {
    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return { ...c, status };
      }
      return c;
    }));
  };

  const handleUpdateTags = (conversationId: string, tags: string[]) => {
    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return { ...c, contact: { ...c.contact, tags } };
      }
      return c;
    }));
  };

  const handleSaveSettings = (newConfig: MetaConfig) => {
    setConfig(newConfig);
    localStorage.setItem('omnichat_config', JSON.stringify(newConfig));
    setShowSettings(false);
    window.location.reload(); 
  };

  const handleOnboardingSuccess = (channel: Channel, name: string, token: string) => {
    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      contact: {
        id: `contact_${Date.now()}`,
        name: `${name}`,
        avatar: `https://ui-avatars.com/api/?name=${name}&background=random`,
        channel: channel,
        socialId: `new_${channel}_channel`,
        tags: ['New Account']
      },
      lastMessage: `System: Channel active.`,
      lastMessageAt: new Date(),
      status: 'open',
      unreadCount: 0,
      messages: [
        {
          id: `m_welcome`,
          senderId: 'system',
          senderName: 'System',
          text: `Connection success! Authorized with token ${token.substring(0, 8)}...`,
          timestamp: new Date(),
          isMe: false,
          type: 'text'
        }
      ]
    };

    setConversations(prev => [newConv, ...prev]);
    setShowOnboarding(false);
    setActiveChannel(channel);
    setSelectedConversationId(newConv.id);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-900">
      {showOnboarding && (
        <OnboardingFlow 
          onClose={() => setShowOnboarding(false)} 
          onSuccess={handleOnboardingSuccess}
          appId={config.metaAppId}
        />
      )}

      {showSettings && (
        <SettingsModal 
          onClose={() => setShowSettings(false)}
          config={config}
          onSave={handleSaveSettings}
        />
      )}

      <Sidebar 
        activeChannel={activeChannel} 
        onChannelChange={setActiveChannel} 
        onOpenOnboarding={() => setShowOnboarding(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

      <div className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <ConversationList 
          conversations={filteredConversations}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
        {selectedConversation ? (
          <ChatWindow 
            conversation={selectedConversation}
            onSendMessage={handleSendMessage}
            agents={MOCK_AGENTS}
            onAssign={handleAssignAgent}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <i className="fa-solid fa-comments text-6xl mb-4"></i>
            <p className="text-xl font-medium">Select a conversation to start messaging</p>
          </div>
        )}
      </div>

      {selectedConversation && (
        <div className="w-80 border-l border-slate-200 bg-white flex flex-col shrink-0">
          <ContactDetails 
            contact={selectedConversation.contact} 
            conversation={selectedConversation}
            onUpdateTags={(tags) => handleUpdateTags(selectedConversation.id, tags)}
          />
        </div>
      )}
    </div>
  );
};

export default App;
