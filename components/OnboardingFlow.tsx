
import React, { useState, useEffect } from 'react';
// Fix: Removed non-existent export 'WhatsAppAccount' from types import to resolve compilation error
import { Channel, MetaPage } from '../types';

declare global {
  interface Window {
    FB: any;
  }
}

interface OnboardingFlowProps {
  onClose: () => void;
  onSuccess: (channel: Channel, name: string, token: string) => void;
  appId: string;
}

type OnboardingStep = 'select-provider' | 'meta-auth' | 'select-pages' | 'whatsapp-signup' | 'verifying' | 'error';

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onClose, onSuccess, appId }) => {
  const [step, setStep] = useState<OnboardingStep>('select-provider');
  const [selectedProvider, setSelectedProvider] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState<MetaPage[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Helper to ensure FB is ready
  const ensureFBReady = async (): Promise<boolean> => {
    if (window.FB && typeof window.FB.login === 'function') {
      return true;
    }
    
    // Check if on localhost or https
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setErrorMsg("Meta SDK requires HTTPS. Please use http://localhost or host on HTTPS.");
      setStep('error');
      return false;
    }

    if (!appId || appId === 'YOUR_APP_ID') {
      setErrorMsg("Meta App ID not configured. Please go to Developer Settings (Gear icon) and enter your App ID.");
      setStep('error');
      return false;
    }

    // Wait a bit if script is still loading
    for(let i=0; i<10; i++) {
      if (window.FB && typeof window.FB.login === 'function') return true;
      await new Promise(r => setTimeout(r, 500));
    }

    setErrorMsg("Meta SDK failed to initialize. Check your adblocker or internet connection.");
    setStep('error');
    return false;
  };

  // Messenger/Instagram Login
  const handleMetaLogin = async () => {
    setLoading(true);
    const ready = await ensureFBReady();
    if (!ready) return;

    const scopes = [
      'pages_show_list',
      'pages_messaging',
      'pages_read_engagement',
      'instagram_basic',
      'instagram_manage_messages',
      'public_profile',
      'email'
    ].join(',');

    window.FB.login((response: any) => {
      if (response.authResponse) {
        fetchPages();
      } else {
        setLoading(false);
        setErrorMsg('User cancelled login or did not fully authorize.');
        setStep('error');
      }
    }, { scope: scopes });
  };

  const fetchPages = () => {
    window.FB.api('/me/accounts', { fields: 'name,id,access_token,category,instagram_business_account{id,username}' }, (response: any) => {
      if (response && !response.error) {
        setPages(response.data);
        setStep('select-pages');
      } else {
        setErrorMsg('Failed to fetch Facebook pages. Ensure your App ID is correct and has Permissions.');
        setStep('error');
      }
      setLoading(false);
    });
  };

  // WhatsApp Embedded Signup
  const handleWhatsAppSignup = async () => {
    setLoading(true);
    const ready = await ensureFBReady();
    if (!ready) return;

    window.FB.login((response: any) => {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        setStep('verifying');
        setTimeout(() => {
          onSuccess('whatsapp', 'WhatsApp Business', accessToken);
        }, 2000);
      } else {
        setLoading(false);
        setErrorMsg('WhatsApp authorization failed.');
        setStep('error');
      }
    }, {
      scope: 'whatsapp_business_management,whatsapp_business_messaging',
    });
  };

  const handleSelectPage = (page: MetaPage) => {
    setStep('verifying');
    const name = selectedProvider === 'instagram' 
      ? page.instagram_business_account?.username || page.name 
      : page.name;
    
    setTimeout(() => {
      onSuccess(selectedProvider!, name, page.access_token);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Connect Inbox</h2>
            <p className="text-sm text-slate-500">Integrating via Meta Graph API</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        <div className="p-8">
          {step === 'select-provider' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'whatsapp', icon: 'fa-whatsapp', color: 'green', label: 'WhatsApp', sub: 'Embedded Signup' },
                { id: 'messenger', icon: 'fa-facebook-messenger', color: 'blue', label: 'Messenger', sub: 'Graph API' },
                { id: 'instagram', icon: 'fa-instagram', color: 'pink', label: 'Instagram', sub: 'DMs' }
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => {
                    setSelectedProvider(item.id as Channel);
                    setStep(item.id === 'whatsapp' ? 'whatsapp-signup' : 'meta-auth');
                  }}
                  className={`group p-6 border-2 border-slate-100 rounded-2xl hover:border-${item.color === 'green' ? 'emerald' : item.color === 'blue' ? 'blue' : 'pink'}-500 hover:bg-slate-50 transition-all text-center flex flex-col items-center gap-4`}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform ${
                    item.id === 'whatsapp' ? 'bg-emerald-100 text-emerald-600' :
                    item.id === 'messenger' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                  }`}>
                    <i className={`fa-brands ${item.icon}`}></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{item.label}</h4>
                    <p className="text-xs text-slate-500 mt-1">{item.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 'meta-auth' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl">
                <i className="fa-brands fa-facebook-f"></i>
              </div>
              <h3 className="text-2xl font-bold mb-2">Login with Meta</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">Access your {selectedProvider} business messages directly within OmniChat.</p>
              
              <button 
                onClick={handleMetaLogin}
                className="bg-[#1877F2] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 mx-auto hover:bg-[#166fe5] transition-colors shadow-lg disabled:opacity-50"
                disabled={loading}
              >
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-brands fa-facebook"></i>}
                Continue with Facebook
              </button>
            </div>
          )}

          {step === 'whatsapp-signup' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl">
                <i className="fa-brands fa-whatsapp"></i>
              </div>
              <h3 className="text-2xl font-bold mb-2">WhatsApp Business</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">Use the official Embedded Signup flow to activate your WhatsApp Business API number.</p>
              
              <button 
                onClick={handleWhatsAppSignup}
                className="bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 mx-auto hover:bg-emerald-600 transition-colors shadow-lg disabled:opacity-50"
                disabled={loading}
              >
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-brands fa-whatsapp"></i>}
                Start Embedded Signup
              </button>
            </div>
          )}

          {step === 'select-pages' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Available Accounts</h3>
                <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">{pages.length} found</span>
              </div>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {pages.map(page => (
                  <div key={page.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-500">
                        {page.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{page.name}</p>
                        <p className="text-xs text-slate-500">{page.category}</p>
                        {selectedProvider === 'instagram' && (
                          <p className="text-[10px] text-pink-600 font-bold">
                            {page.instagram_business_account ? `IG: @${page.instagram_business_account.username}` : 'No IG Account linked'}
                          </p>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleSelectPage(page)}
                      disabled={selectedProvider === 'instagram' && !page.instagram_business_account}
                      className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 disabled:bg-slate-300"
                    >
                      Connect
                    </button>
                  </div>
                ))}
                {pages.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <p>No business pages found. Ensure your Meta App has "Pages Messaging" permissions.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'verifying' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-xl font-bold mb-2">Finalizing Connection...</h3>
              <p className="text-slate-500">We are subscribing to Meta webhooks for real-time delivery.</p>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-6">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Connection Error</h3>
              <p className="text-slate-500 mb-6 text-sm max-w-md mx-auto">{errorMsg}</p>
              <div className="flex justify-center gap-3">
                <button 
                  onClick={() => setStep('select-provider')}
                  className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold"
                >
                  Try Again
                </button>
                <button 
                  onClick={onClose}
                  className="bg-slate-100 text-slate-600 px-6 py-2 rounded-lg font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-medium">
          <div className="flex gap-4 uppercase tracking-widest">
            <span className="flex items-center gap-1"><i className="fa-solid fa-lock text-[8px]"></i> Meta Verified</span>
            <span>API Version v21.0</span>
          </div>
          <p>© 2024 OmniChat Systems</p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
