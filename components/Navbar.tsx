
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
      setView('dashboard');
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
            onClick={() => setView('dashboard')}
            className={`hover:text-emerald-600 transition-colors ${currentView === 'dashboard' ? 'text-emerald-600' : ''}`}
          >
            Planning
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
            Profil
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
