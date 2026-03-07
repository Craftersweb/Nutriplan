
import React from 'react';
import { useApp } from '../App';

interface NavbarProps {
  currentView: string;
  setView: (v: any) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const { logout, authState } = useApp();

  const handleLogoClick = () => {
    if (authState.isAuthenticated) {
      setView('calendar');
    } else {
      setView('landing');
    }
  };

  return (
    <nav className="glass-effect sticky top-0 z-50 border-b border-slate-200 py-3 px-6 flex items-center justify-between">
      <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">N</div>
        <span className="text-xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent tracking-tighter">Nutriplan</span>
      </div>

      {authState.isAuthenticated && (
        <div className="hidden md:flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <button 
            onClick={() => setView('create')}
            className={`hover:text-emerald-600 transition-colors ${currentView === 'create' ? 'text-emerald-600' : ''}`}
          >
            Créer
          </button>
          <button 
            onClick={() => setView('calendar')}
            className={`hover:text-emerald-600 transition-colors ${currentView === 'calendar' ? 'text-emerald-600' : ''}`}
          >
            Calendrier
          </button>
          <button 
            onClick={() => setView('shopping')}
            className={`hover:text-emerald-600 transition-colors ${currentView === 'shopping' ? 'text-emerald-600' : ''}`}
          >
            Courses
          </button>
          <button 
            onClick={() => setView('preferences')}
            className={`hover:text-emerald-600 transition-colors ${currentView === 'preferences' ? 'text-emerald-600' : ''}`}
          >
            Préférence
          </button>
          <button 
            onClick={() => setView('settings')}
            className={`hover:text-emerald-600 transition-colors ${currentView === 'settings' ? 'text-emerald-600' : ''}`}
          >
            Paramètre
          </button>
          <button 
            onClick={() => setView('premium')}
            className={`px-3 py-1 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors ${currentView === 'premium' ? 'bg-amber-200' : ''}`}
          >
            Premium
          </button>
        </div>
      )}

      <div className="flex items-center gap-4">
        {authState.isAuthenticated ? (
          <>
            <div className="hidden sm:block text-right">
              <p className="text-[10px] font-black text-slate-900 leading-none">{authState.user?.name}</p>
              <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">{authState.user?.subscriptionType}</p>
            </div>
            <button 
              onClick={logout}
              className="px-4 py-2 bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all"
            >
              Sortir
            </button>
          </>
        ) : (
          <button 
            onClick={() => setView('auth')}
            className="px-6 py-2.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
          >
            S'identifier
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
