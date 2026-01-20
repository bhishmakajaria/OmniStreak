
import { Conversation, Agent, Contact } from './types';

export const CURRENT_AGENT: Agent = {
  id: 'agent_1',
  name: 'Alex Rivera',
  avatar: 'https://i.pravatar.cc/150?u=agent_1',
  email: 'alex@omnichat.io'
};

export const MOCK_AGENTS: Agent[] = [
  CURRENT_AGENT,
  { id: 'agent_2', name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?u=agent_2', email: 'sarah@omnichat.io' },
  { id: 'agent_3', name: 'James Wilson', avatar: 'https://i.pravatar.cc/150?u=agent_3', email: 'james@omnichat.io' }
];

export const MOCK_CONTACTS: Contact[] = [
  { id: 'c1', name: 'Elena Gilbert', avatar: 'https://i.pravatar.cc/150?u=c1', phoneNumber: '+1 555 010 1234', channel: 'whatsapp', socialId: 'elena_wa', tags: ['VIP', 'Support'] },
  { id: 'c2', name: 'Marcus Sterling', avatar: 'https://i.pravatar.cc/150?u=c2', socialId: 'marcus_ig', channel: 'instagram', tags: ['Sales'] },
  { id: 'c3', name: 'Sophie Turner', avatar: 'https://i.pravatar.cc/150?u=c3', socialId: 'sophie_fb', channel: 'messenger', tags: [] },
  { id: 'c4', name: 'Damon Salvatore', avatar: 'https://i.pravatar.cc/150?u=c4', phoneNumber: '+1 555 010 9988', channel: 'whatsapp', socialId: 'damon_wa', tags: ['New User'] },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    contact: MOCK_CONTACTS[0],
    lastMessage: 'I need help with my recent order #4521',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 5),
    status: 'open',
    unreadCount: 2,
    messages: [
      { id: 'm1', senderId: 'c1', senderName: 'Elena Gilbert', text: 'Hello, are you there?', timestamp: new Date(Date.now() - 1000 * 60 * 10), isMe: false, type: 'text' },
      { id: 'm2', senderId: 'c1', senderName: 'Elena Gilbert', text: 'I need help with my recent order #4521', timestamp: new Date(Date.now() - 1000 * 60 * 5), isMe: false, type: 'text' },
    ]
  },
  {
    id: 'conv_2',
    contact: MOCK_CONTACTS[1],
    lastMessage: 'Awesome photo! How much is the shipping?',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60),
    status: 'open',
    assigneeId: 'agent_2',
    unreadCount: 0,
    messages: [
      { id: 'm3', senderId: 'c2', senderName: 'Marcus Sterling', text: 'Awesome photo! How much is the shipping?', timestamp: new Date(Date.now() - 1000 * 60 * 60), isMe: false, type: 'text' },
      { id: 'm4', senderId: 'c2', senderName: 'Marcus Sterling', text: '', timestamp: new Date(Date.now() - 1000 * 60 * 58), isMe: false, type: 'image', mediaUrl: 'https://picsum.photos/seed/shop/400/300' },
    ]
  },
  {
    id: 'conv_3',
    contact: MOCK_CONTACTS[2],
    lastMessage: 'Thank you for the quick resolution.',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: 'resolved',
    unreadCount: 0,
    messages: [
      { id: 'm5', senderId: 'c3', senderName: 'Sophie Turner', text: 'Issue resolved. Thanks!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), isMe: false, type: 'text' },
    ]
  }
];
