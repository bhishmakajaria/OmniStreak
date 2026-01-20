
import React from 'react';
import { Channel } from '../types';

interface SidebarProps {
  activeChannel: Channel | 'all';
  onChannelChange: (channel: Channel | 'all') => void;
  onOpenOnboarding: () => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeChannel, 
  onChannelChange, 
  onOpenOnboarding, 
  onOpenSettings 
}) => {
  const items = [
    { id: 'all', icon: 'fa-inbox', label: 'All Inboxes' },
    { id: 'whatsapp', icon: 'fa-brands fa-whatsapp', label: 'WhatsApp' },
    { id: 'instagram', icon: 'fa-brands fa-instagram', label: 'Instagram' },
    { id: 'messenger', icon: 'fa-brands fa-facebook-messenger', label: 'Messenger' },
  ];

  return (
    <div className="w-20 bg-slate-900 flex flex-col items-center py-6 shrink-0">
      <div className="mb-8">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
          <i className="fa-solid fa-bolt text-xl"></i>
        </div>
      </div>
      
      <div className="flex flex-col gap-4 w-full px-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onChannelChange(item.id as Channel | 'all')}
            className={`flex flex-col items-center justify-center py-3 rounded-lg transition-all group ${
              activeChannel === item.id 
                ? 'bg-slate-800 text-white shadow-inner' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={item.label}
          >
            <i className={`fa-solid ${item.icon} text-lg mb-1`}></i>
            <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              {item.label}
            </span>
          </button>
        ))}

        <button
          onClick={onOpenOnboarding}
          className="flex flex-col items-center justify-center py-3 rounded-lg transition-all text-slate-500 hover:text-indigo-400 hover:bg-slate-800 mt-2 border-t border-slate-800 pt-6"
          title="Add Channel"
        >
          <i className="fa-solid fa-circle-plus text-xl mb-1"></i>
          <span className="text-[10px] font-medium">Add</span>
        </button>
      </div>

      <div className="mt-auto flex flex-col gap-4 w-full px-2">
        <button 
          onClick={onOpenSettings}
          className="text-slate-400 hover:text-white py-3"
          title="Developer Settings"
        >
          <i className="fa-solid fa-gear text-lg"></i>
        </button>
        <div className="w-10 h-10 rounded-full border-2 border-slate-700 p-0.5">
          <img 
            src="https://i.pravatar.cc/150?u=agent_1" 
            alt="Profile" 
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
