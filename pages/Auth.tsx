
import React, { useState, useEffect } from 'react';
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
  const [showConfigHelp, setShowConfigHelp] = useState(false);
  
  const { login, signup, handleGoogleSuccess, authState } = useApp();

  const GOOGLE_CLIENT_ID = "876547268030-nfgelidbo8p0jvd3hbnp4tosaeng74a0.apps.googleusercontent.com";

  useEffect(() => {
    const initializeGoogle = () => {
      const win = window as any;
      if (win.google && win.google.accounts) {
        try {
          win.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response: any) => {
              const payload = JSON.parse(atob(response.credential.split('.')[1]));
              handleGoogleSuccess(payload);
            },
            cancel_on_tap_outside: false,
          });
          
          const btnParent = document.getElementById("googleBtn");
          if (btnParent) {
            win.google.accounts.id.renderButton(
              btnParent,
              { 
                theme: "filled_blue", 
                size: "large", 
                width: 320, // FIX: Utiliser un nombre de pixels (200-400) et non "100%"
                shape: "pill",
                text: isLogin ? "signin_with" : "signup_with"
              }
            );
          }
        } catch (e) {
          console.error("Google Auth Init Error:", e);
          setShowConfigHelp(true);
        }
      } else {
        setTimeout(() => {
          if (!win.google) setShowConfigHelp(true);
        }, 3000);
      }
    };

    const timer = setTimeout(initializeGoogle, 500);
    return () => clearTimeout(timer);
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    if (isLogin) {
      const result = await login(email, password);
      if (!result.success) setError(result.message || "Identifiants invalides.");
      // Note: redirection gérée par App.tsx suite au changement d'authState
    } else {
      if (!name.trim() || !birthDate) {
        setError("Tous les champs sont requis.");
        return;
      }
      const result = await signup(name, email, password, birthDate);
      if (!result.success) setError(result.message || "Erreur lors de la création.");
      // Note: redirection gérée par App.tsx suite au changement d'authState
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-lg bg-white rounded-[48px] p-8 md:p-12 shadow-2xl shadow-slate-200/60 border border-slate-100 relative z-10 transition-all duration-500">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-6 shadow-xl shadow-emerald-200">N</div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
            {isLogin ? 'Bon retour !' : 'Rejoindre Nutriplan'}
          </h2>
          <p className="text-sm text-slate-400 font-medium">Votre santé commence dans votre assiette.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold animate-in fade-in slide-in-from-top-2">
            ⚠️ {error}
          </div>
        )}

        {showConfigHelp && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-100 text-amber-700 rounded-2xl text-[10px] font-bold leading-relaxed">
            <p className="uppercase tracking-widest mb-1 text-amber-900">Note sur Google Auth :</p>
            Le bouton Google peut prendre quelques secondes à charger. Si l'erreur 401 persiste sur un domaine personnalisé, vérifiez les réglages Google Cloud.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Nom</label>
                <input 
                  type="text" required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold text-slate-700"
                  placeholder="Jean Dupont"
                  value={name} onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Naissance</label>
                <input 
                  type="date" required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold text-slate-700"
                  value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Email</label>
            <input 
              type="email" required
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold text-slate-700"
              placeholder="jean@exemple.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Mot de passe</label>
            <input 
              type="password" required
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold text-slate-700"
              placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit"
            disabled={authState.isLoading}
            className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center uppercase tracking-widest text-[11px]"
          >
            {authState.isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : isLogin ? 'Se connecter' : "Créer mon accès"}
          </button>
        </form>

        <div className="my-8 flex items-center justify-center">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="px-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] bg-white">ou</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        <div className="flex justify-center">
          <div id="googleBtn" className="inline-block overflow-hidden rounded-full"></div>
        </div>

        <div className="mt-8 text-center flex flex-col gap-2">
          {window.location.hostname === 'localhost' && (
            <button 
              onClick={() => signup('Développeur', `dev${Date.now()}@nutriplan.local`, 'password123', '1990-01-01')}
              className="text-[10px] font-bold text-emerald-600 border border-emerald-100 rounded-xl py-2 px-4 hover:bg-emerald-50 transition-all"
            >
              Test Rapid Inscription (Dev Only)
            </button>
          )}
          
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-all py-2 px-4 rounded-full hover:bg-emerald-50"
          >
            {isLogin ? "Nouveau ici ? Créer un compte" : "Déjà membre ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
