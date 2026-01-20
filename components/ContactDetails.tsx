
import React, { useState } from 'react';
import { Contact, Conversation } from '../types';
import { summarizeConversation } from '../services/gemini';

interface ContactDetailsProps {
  contact: Contact;
  conversation: Conversation;
  onUpdateTags: (tags: string[]) => void;
}

const ContactDetails: React.FC<ContactDetailsProps> = ({ contact, conversation, onUpdateTags }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleGenerateSummary = async () => {
    setLoading(true);
    const result = await summarizeConversation(conversation.messages);
    setSummary(result);
    setLoading(false);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim() && !contact.tags.includes(newTag.trim())) {
      onUpdateTags([...contact.tags, newTag.trim()]);
      setNewTag('');
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateTags(contact.tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
          <img 
            src={contact.avatar} 
            alt={contact.name} 
            className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white"
          />
          <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${
              contact.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-600' :
              contact.channel === 'messenger' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
            }`}>
              <i className={`fa-brands fa-${contact.channel === 'messenger' ? 'facebook-messenger' : contact.channel}`}></i>
            </div>
          </div>
        </div>
        <h3 className="text-lg font-bold text-slate-900">{contact.name}</h3>
        <span className="text-[10px] text-slate-400 flex items-center gap-1.5 uppercase tracking-widest font-bold mt-1">
          {contact.channel} Customer
        </span>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Contact Information</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <i className="fa-solid fa-phone text-xs"></i>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-medium">Identifier</p>
                <p className="text-sm font-semibold truncate">{contact.phoneNumber || contact.socialId}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Summary</h4>
            <button 
              onClick={handleGenerateSummary}
              disabled={loading}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 flex items-center gap-1"
            >
              <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
              {loading ? 'Thinking...' : 'Generate'}
            </button>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            {summary ? (
              <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap italic">
                {summary}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-2 italic font-medium">
                Generate a summary to see main issues and status.
              </p>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Conversation Tags</h4>
          <div className="flex flex-wrap gap-2">
            {contact.tags.map(tag => (
              <span 
                key={tag} 
                className="group flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase transition-all hover:bg-red-50 hover:text-red-600 cursor-pointer"
                onClick={() => handleRemoveTag(tag)}
                title="Click to remove"
              >
                {tag}
                <i className="fa-solid fa-times text-[8px] opacity-0 group-hover:opacity-100"></i>
              </span>
            ))}
            
            {isAddingTag ? (
              <form onSubmit={handleAddTag} className="inline-block">
                <input 
                  autoFocus
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onBlur={() => setIsAddingTag(false)}
                  className="px-2 py-1 border border-indigo-300 text-[10px] font-bold rounded uppercase outline-none focus:ring-2 focus:ring-indigo-500 w-24"
                  placeholder="Tag Name..."
                />
              </form>
            ) : (
              <button 
                onClick={() => setIsAddingTag(true)}
                className="px-2 py-1 border-2 border-dashed border-slate-200 text-slate-400 text-[10px] font-bold rounded uppercase hover:border-slate-300 hover:text-slate-500 transition-colors"
              >
                + Add Tag
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-8 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-3">
          <button className="py-2.5 px-4 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] hover:bg-slate-200 transition-colors uppercase tracking-wider">
            Snooze
          </button>
          <button className="py-2.5 px-4 bg-red-50 text-red-600 rounded-xl font-bold text-[10px] hover:bg-red-100 transition-colors uppercase tracking-wider">
            Block
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactDetails;
