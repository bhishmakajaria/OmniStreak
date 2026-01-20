
export type Channel = 'whatsapp' | 'instagram' | 'messenger';

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isMe: boolean;
  type: 'text' | 'image' | 'video';
  mediaUrl?: string;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  phoneNumber?: string;
  email?: string;
  socialId: string;
  channel: Channel;
  tags: string[]; // Added tags to contact
}

export interface Conversation {
  id: string;
  contact: Contact;
  lastMessage: string;
  lastMessageAt: Date;
  status: 'open' | 'snoozed' | 'resolved';
  assigneeId?: string;
  unreadCount: number;
  messages: Message[];
}

export interface MetaConfig {
  metaAppId: string;
  metaAppSecret: string;
  whatsappConfigId: string;
}

export interface MetaPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  instagram_business_account?: {
    id: string;
    username: string;
  };
}
