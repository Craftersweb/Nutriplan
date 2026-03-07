
import React, { useState } from 'react';
import { useApp } from '../App';

const Settings: React.FC = () => {
  const { authState, updateUser, logout } = useApp();
  const [name, setName] = useState(authState.user?.name || '');
  const [email, setEmail] = useState(authState.user?.email || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    updateUser({ name, email });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl">👤</div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Paramètres du compte</h1>
            <p className="text-slate-400 text-sm font-medium">Gérez vos informations personnelles.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Nom complet</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all"
            />
          </div>

          <div className="pt-6 flex flex-col gap-4">
            <button 
              onClick={handleSave}
              className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
            >
              {isSaved ? '✓ Enregistré' : 'Sauvegarder les modifications'}
            </button>
            
            <button 
              onClick={logout}
              className="w-full py-4 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 transition-all"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
