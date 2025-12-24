
import React, { useState, createContext, useContext, useEffect } from 'react';
import { DietPreference, User, AuthState, DayPlan, SavedPlan } from './types';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Preferences from './pages/Preferences';
import ShoppingList from './pages/ShoppingList';
import Subscription from './pages/Subscription';
import HowItWorks from './pages/HowItWorks';
import Onboarding from './pages/Onboarding';
import Navbar from './components/Navbar';

interface AppContextType {
  authState: AuthState;
  login: (email: string, pass: string) => Promise<{success: boolean, message?: string}>;
  signup: (name: string, email: string, pass: string, birthDate: string) => Promise<{success: boolean, message?: string}>;
  handleGoogleSuccess: (userData: any) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  currentMealPlan: DayPlan[] | null;
  setCurrentMealPlan: (plan: DayPlan[] | null) => void;
  savedPlans: SavedPlan[];
  saveCurrentPlan: (name: string) => void;
  setView: (v: any) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

interface LocalUserDB extends User {
  password?: string;
  hasSeenTutorial?: boolean;
}

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'auth' | 'dashboard' | 'preferences' | 'shopping' | 'subscription' | 'how-it-works' | 'onboarding'>('landing');
  
  const safeParse = (key: string, fallback: any) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.error(`Error parsing localStorage key "${key}":`, e);
      return fallback;
    }
  };

  const [currentMealPlan, setCurrentMealPlan] = useState<DayPlan[] | null>(() => safeParse('nutriplan_current_plan', null));
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>(() => safeParse('nutriplan_saved_plans', []));
  const [authState, setAuthState] = useState<AuthState>(() => safeParse('nutriplan_auth', {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false
  }));

  useEffect(() => {
    localStorage.setItem('nutriplan_current_plan', JSON.stringify(currentMealPlan));
  }, [currentMealPlan]);

  useEffect(() => {
    localStorage.setItem('nutriplan_saved_plans', JSON.stringify(savedPlans));
  }, [savedPlans]);

  useEffect(() => {
    localStorage.setItem('nutriplan_auth', JSON.stringify(authState));
    
    if (authState.isAuthenticated && (view === 'landing' || view === 'auth')) {
        setView('dashboard');
    }
  }, [authState.isAuthenticated]);

  const getUsersDB = (): LocalUserDB[] => safeParse('nutriplan_users_db', []);

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
  };

  const signup = async (name: string, email: string, pass: string, birthDate: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 1. Vérification de l'âge (18 ans min)
    const age = calculateAge(birthDate);
    if (age < 18) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, message: "Vous devez avoir au moins 18 ans pour vous inscrire." };
    }

    // 2. Vérification si déjà inscrit
    const db = getUsersDB();
    if (db.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, message: "Cet email est déjà associé à un compte." };
    }

    const newUser: LocalUserDB = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email: email.toLowerCase(),
      password: pass,
      birthDate,
      diet: DietPreference.OMNIVORE,
      allergies: [],
      subscriptionType: 'free',
      hasSeenTutorial: false
    };

    localStorage.setItem('nutriplan_users_db', JSON.stringify([...db, newUser]));
    
    const { password, ...userSession } = newUser;
    setAuthState({
      user: userSession,
      token: 'sess_' + userSession.id,
      isAuthenticated: true,
      isLoading: false
    });
    
    setView('onboarding');
    return { success: true };
  };

  const login = async (email: string, pass: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const db = getUsersDB();
    const foundUser = db.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, message: "Compte introuvable." };
    }

    if (foundUser.password !== pass) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, message: "Mot de passe incorrect." };
    }

    const { password, ...userSession } = foundUser;
    setAuthState({
      user: userSession,
      token: 'sess_' + userSession.id,
      isAuthenticated: true,
      isLoading: false
    });
    
    setView('dashboard');
    return { success: true };
  };

  const handleGoogleSuccess = (googleData: any) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    const user: User = {
      id: `google_${googleData.sub}`,
      name: googleData.name,
      email: googleData.email,
      birthDate: '1990-01-01',
      diet: DietPreference.OMNIVORE,
      allergies: [],
      subscriptionType: 'free'
    };

    setAuthState({
      user,
      token: 'google_token_' + googleData.sub,
      isAuthenticated: true,
      isLoading: false
    });
    
    setView('dashboard');
  };

  const logout = () => {
    setAuthState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    setCurrentMealPlan(null);
    setView('landing');
  };

  const updateUser = (data: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user!, ...data };
      setAuthState(prev => ({ ...prev, user: updatedUser }));
      const db = getUsersDB();
      const newDb = db.map(u => u.id === updatedUser.id ? { ...u, ...data } : u);
      localStorage.setItem('nutriplan_users_db', JSON.stringify(newDb));
    }
  };

  const saveCurrentPlan = (name: string) => {
    if (!currentMealPlan || !authState.user) return;
    const lastServings = parseInt(localStorage.getItem('nutriplan_last_servings') || '2');
    const newSavedPlan: SavedPlan = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || `Menu du ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      plan: currentMealPlan,
      diet: authState.user.diet,
      servings: lastServings
    };
    setSavedPlans(prev => [newSavedPlan, ...prev]);
  };

  const renderView = () => {
    switch (view) {
      case 'landing': return <LandingPage onGetStarted={() => setView('auth')} onHowItWorks={() => setView('how-it-works')} />;
      case 'auth': return <Auth onAuthSuccess={() => {}} />;
      case 'dashboard': return <Dashboard />;
      case 'preferences': return <Preferences />;
      case 'shopping': return <ShoppingList />;
      case 'subscription': return <Subscription />;
      case 'how-it-works': return <HowItWorks />;
      case 'onboarding': return <Onboarding onComplete={() => setView('dashboard')} />;
      default: return <LandingPage onGetStarted={() => setView('auth')} onHowItWorks={() => setView('how-it-works')} />;
    }
  };

  return (
    <AppContext.Provider value={{ 
      authState, login, signup, handleGoogleSuccess, logout, updateUser, 
      currentMealPlan, setCurrentMealPlan, 
      savedPlans, saveCurrentPlan, setView
    }}>
      <div className="min-h-screen flex flex-col bg-slate-50">
        {(authState.isAuthenticated || view !== 'landing') && view !== 'onboarding' && view !== 'auth' && <Navbar currentView={view} setView={setView} />}
        <main className="flex-grow">
          {renderView()}
        </main>
      </div>
    </AppContext.Provider>
  );
};

export default App;
