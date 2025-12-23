
import React, { useState, createContext, useContext, useEffect } from 'react';
import { DietPreference, User, AuthState, DayPlan, SavedPlan } from './types';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Preferences from './pages/Preferences';
import ShoppingList from './pages/ShoppingList';
import Subscription from './pages/Subscription';
import Navbar from './components/Navbar';

interface AppContextType {
  authState: AuthState;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  currentMealPlan: DayPlan[] | null;
  setCurrentMealPlan: (plan: DayPlan[] | null) => void;
  savedPlans: SavedPlan[];
  saveCurrentPlan: (name: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

export const useAuth = useApp;

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'auth' | 'dashboard' | 'preferences' | 'shopping' | 'subscription'>('landing');
  
  // Persistence avec LocalStorage
  const [currentMealPlan, setCurrentMealPlan] = useState<DayPlan[] | null>(() => {
    const saved = localStorage.getItem('nutriplan_current_plan');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>(() => {
    const saved = localStorage.getItem('nutriplan_saved_plans');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [authState, setAuthState] = useState<AuthState>(() => {
    const saved = localStorage.getItem('nutriplan_auth');
    return saved ? JSON.parse(saved) : {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    };
  });

  // Sauvegarde auto quand l'état change
  useEffect(() => {
    localStorage.setItem('nutriplan_current_plan', JSON.stringify(currentMealPlan));
  }, [currentMealPlan]);

  useEffect(() => {
    localStorage.setItem('nutriplan_saved_plans', JSON.stringify(savedPlans));
  }, [savedPlans]);

  useEffect(() => {
    localStorage.setItem('nutriplan_auth', JSON.stringify(authState));
  }, [authState]);

  const login = async (email: string, pass: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const isTestAccount = email.toLowerCase() === 'test@gmail.com' && pass === 'test1234';
    
    const mockUser: User = {
      id: '1',
      name: isTestAccount ? 'Test User' : 'Utilisateur Nutriplan',
      email: email,
      diet: DietPreference.OMNIVORE,
      allergies: [],
      subscriptionType: 'free'
    };
    
    setAuthState({
      user: mockUser,
      token: 'fake-jwt-token',
      isAuthenticated: true,
      isLoading: false
    });
    setView('dashboard');
  };

  const logout = () => {
    setAuthState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    setCurrentMealPlan(null);
    localStorage.clear();
    setView('landing');
  };

  const updateUser = (data: Partial<User>) => {
    if (authState.user) {
      setAuthState(prev => ({
        ...prev,
        user: { ...prev.user!, ...data }
      }));
    }
  };

  const saveCurrentPlan = (name: string) => {
    if (!currentMealPlan || !authState.user) return;
    const newSavedPlan: SavedPlan = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || `Menu du ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      plan: currentMealPlan,
      diet: authState.user.diet
    };
    setSavedPlans(prev => [newSavedPlan, ...prev]);
  };

  const renderView = () => {
    switch (view) {
      case 'landing': return <LandingPage onGetStarted={() => setView('auth')} />;
      case 'auth': return <Auth />;
      case 'dashboard': return <Dashboard />;
      case 'preferences': return <Preferences />;
      case 'shopping': return <ShoppingList />;
      case 'subscription': return <Subscription />;
      default: return <LandingPage onGetStarted={() => setView('auth')} />;
    }
  };

  return (
    <AppContext.Provider value={{ 
      authState, login, logout, updateUser, 
      currentMealPlan, setCurrentMealPlan, 
      savedPlans, saveCurrentPlan 
    }}>
      <div className="min-h-screen flex flex-col bg-slate-50">
        {authState.isAuthenticated && <Navbar currentView={view} setView={setView} />}
        <main className="flex-grow">
          {renderView()}
        </main>
      </div>
    </AppContext.Provider>
  );
};

export default App;
