
import React, { useState } from 'react';
import { MetaConfig } from '../types';

interface SettingsModalProps {
  onClose: () => void;
  config: MetaConfig;
  onSave: (config: MetaConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, config, onSave }) => {
  const [formData, setFormData] = useState<MetaConfig>({
    metaAppId: config.metaAppId || '',
    metaAppSecret: config.metaAppSecret || '',
    whatsappConfigId: config.whatsappConfigId || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800">Developer Integration Keys</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Meta Graph API & WhatsApp</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-times text-lg"></i>
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700 leading-relaxed flex gap-3">
            <i className="fa-solid fa-shield-halved text-lg opacity-50"></i>
            <p>These keys are used for client-side OAuth flows. App Secret is required for generating secure tokens during the handshake process.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Meta App ID
              </label>
              <div className="relative">
                <i className="fa-solid fa-id-card absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input 
                  type="text" 
                  name="metaAppId"
                  value={formData.metaAppId}
                  onChange={handleChange}
                  placeholder="e.g. 123456789012345"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Meta App Secret
              </label>
              <div className="relative">
                <i className="fa-solid fa-key absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input 
                  type="password" 
                  name="metaAppSecret"
                  value={formData.metaAppSecret}
                  onChange={handleChange}
                  placeholder="••••••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                WhatsApp Configuration ID (Embedded Signup)
              </label>
              <div className="relative">
                <i className="fa-brands fa-whatsapp absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input 
                  type="text" 
                  name="whatsappConfigId"
                  value={formData.whatsappConfigId}
                  onChange={handleChange}
                  placeholder="e.g. waba_config_789..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 italic leading-relaxed">
                Required for the Embedded Signup flow. Found in your Meta Business Suite under Phone Numbers > WhatsApp Manager.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <button 
              onClick={() => onSave(formData)}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]"
            >
              Update Integration
            </button>
            <p className="text-center text-[10px] text-slate-400 font-medium">
              Changes persist in local storage. System will reload upon saving.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
