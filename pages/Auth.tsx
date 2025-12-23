
import React, { useState } from 'react';
import { useAuth } from '../App';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('Test@gmail.com');
  const [password, setPassword] = useState('test1234');
  const { login, authState } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-100 rounded-full blur-3xl opacity-50"></div>
        
        <div className="text-center mb-10 relative">
          <div className="w-20 h-20 bg-emerald-600 rounded-[28px] flex items-center justify-center text-white font-black text-4xl mx-auto mb-6 shadow-xl shadow-emerald-100">N</div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{isLogin ? 'Bon retour !' : 'Bienvenue'}</h2>
          <p className="text-slate-400 mt-2 font-medium">Connectez-vous pour voir vos menus.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-slate-700"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Mot de passe</label>
              {isLogin && <button type="button" className="text-[10px] font-bold text-emerald-600 hover:underline">Oublié ?</button>}
            </div>
            <input 
              type="password" 
              required
              className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-slate-700"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit"
            disabled={authState.isLoading}
            className="w-full py-5 bg-emerald-600 text-white font-black rounded-[20px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {authState.isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : isLogin ? 'SE CONNECTER' : "CRÉER MON COMPTE"}
          </button>
        </form>

        <div className="mt-10 text-center relative">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
          >
            {isLogin ? "Nouveau sur Nutriplan ? S'inscrire" : "Déjà membre ? Se connecter"}
          </button>
        </div>

        {/* Info for tester */}
        <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-[10px] font-bold text-amber-700 leading-relaxed">
          COMPTE TEST DÉTECTÉ :<br/>
          Email: Test@gmail.com | Mdp: test1234
        </div>
      </div>
    </div>
  );
};

export default Auth;
