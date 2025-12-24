
import React, { useState } from 'react';
import { useApp } from '../App';

interface AuthProps {
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const { login, signup, socialLogin, authState } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }

    if (isLogin) {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.message || "Une erreur est survenue.");
      } else {
        onAuthSuccess();
      }
    } else {
      if (!name.trim()) {
        setError("Veuillez entrer votre nom.");
        return;
      }
      if (!birthDate) {
        setError("Veuillez sélectionner votre date de naissance.");
        return;
      }
      const result = await signup(name, email, password, birthDate);
      if (!result.success) {
        setError(result.message || "Une erreur est survenue.");
      } else {
        onAuthSuccess();
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-[40px] p-8 md:p-12 shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-100 rounded-full blur-3xl opacity-50"></div>
        
        <div className="text-center mb-10 relative">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-6 shadow-xl shadow-emerald-100">N</div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {isLogin ? 'Bon retour !' : 'Rejoignez-nous'}
          </h2>
          <p className="text-slate-400 mt-2 font-medium text-sm">
            {isLogin ? 'Connectez-vous à Nutriplan.' : 'Créez votre profil nutritionnel.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold animate-in fade-in slide-in-from-top-1 duration-200">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          {!isLogin && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nom complet</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-slate-700"
                  placeholder="Jean Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Date de naissance</label>
                <input 
                  type="date" 
                  required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-slate-700"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-slate-700"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mot de passe</label>
            <input 
              type="password" 
              required
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-slate-700"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit"
            disabled={authState.isLoading}
            className="w-full py-5 mt-4 bg-emerald-600 text-white font-black rounded-[20px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50 flex items-center justify-center gap-2 transform active:scale-95"
          >
            {authState.isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : isLogin ? 'SE CONNECTER' : "CRÉER MON COMPTE"}
          </button>
        </form>

        <div className="mt-8 relative flex items-center justify-center">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest bg-white">Ou continuer avec</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button 
            onClick={() => socialLogin('google')}
            className="flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all transform active:scale-95 shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            <span className="text-xs font-bold text-slate-700">Google</span>
          </button>
          <button 
            onClick={() => socialLogin('apple')}
            className="flex items-center justify-center gap-2 py-4 bg-slate-900 border border-slate-900 rounded-2xl hover:bg-black transition-all transform active:scale-95 shadow-sm"
          >
            <svg className="w-5 h-5 fill-white" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
            <span className="text-xs font-bold text-white">Apple</span>
          </button>
        </div>

        <div className="mt-8 text-center relative">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors py-2"
          >
            {isLogin ? "Nouveau ici ? S'inscrire" : "Déjà membre ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
