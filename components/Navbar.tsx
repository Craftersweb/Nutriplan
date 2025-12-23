
import React from 'react';
import { useAuth } from '../App';

interface NavbarProps {
  currentView: string;
  setView: (v: any) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const { logout, authState } = useAuth();

  return (
    <nav className="glass-effect sticky top-0 z-50 border-b border-slate-200 py-3 px-6 flex items-center justify-between">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('dashboard')}>
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">N</div>
        <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Nutriplan</span>
      </div>

      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <button 
          onClick={() => setView('dashboard')}
          className={`hover:text-emerald-600 transition-colors ${currentView === 'dashboard' ? 'text-emerald-600' : ''}`}
        >
          Tableau de bord
        </button>
        <button 
          onClick={() => setView('shopping')}
          className={`hover:text-emerald-600 transition-colors ${currentView === 'shopping' ? 'text-emerald-600' : ''}`}
        >
          Liste de courses
        </button>
        <button 
          onClick={() => setView('preferences')}
          className={`hover:text-emerald-600 transition-colors ${currentView === 'preferences' ? 'text-emerald-600' : ''}`}
        >
          Préférences
        </button>
        <button 
          onClick={() => setView('subscription')}
          className={`hover:text-emerald-600 transition-colors ${currentView === 'subscription' ? 'text-emerald-600' : ''}`}
        >
          Premium
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:block text-right">
          <p className="text-xs font-semibold text-slate-900">{authState.user?.name}</p>
          <p className="text-[10px] text-slate-500 capitalize">{authState.user?.subscriptionType}</p>
        </div>
        <button 
          onClick={logout}
          className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
