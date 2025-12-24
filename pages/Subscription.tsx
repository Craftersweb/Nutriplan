
import React from 'react';
// Fix: useApp is the exported hook from App.tsx, not useAuth
import { useApp } from '../App';

const Subscription: React.FC = () => {
  // Fix: use useApp() to access authState and updateUser
  const { authState, updateUser } = useApp();

  const handleUpgrade = () => {
    // Integration with Stripe or payment API here
    updateUser({ subscriptionType: 'premium' });
    alert("Merci ! Vous êtes maintenant Premium.");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Passez au niveau supérieur</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Débloquez toutes les fonctionnalités de Nutriplan et atteignez vos objectifs santé 2x plus vite.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        {/* Free Plan */}
        <div className="bg-white border border-slate-100 rounded-[40px] p-10 flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Gratuit</h3>
          <p className="text-slate-400 mb-8">Pour essayer les bases.</p>
          <div className="text-4xl font-bold text-slate-900 mb-10">0€ <span className="text-lg text-slate-400 font-medium">/mois</span></div>
          
          <ul className="space-y-4 flex-grow mb-10">
            <FeatureItem included={true} text="Menu hebdomadaire limité" />
            <FeatureItem included={true} text="Liste de courses basique" />
            <FeatureItem included={false} text="Export vers supermarchés" />
            <FeatureItem included={false} text="Support nutritionniste 24/7" />
            <FeatureItem included={false} text="Recettes illimitées" />
          </ul>

          <button className="w-full py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl cursor-default">
            Plan actuel
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-slate-900 border-4 border-emerald-500 rounded-[40px] p-10 flex flex-col relative overflow-hidden text-white scale-105 shadow-2xl">
          <div className="absolute top-6 right-6 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            Populaire
          </div>
          
          <h3 className="text-xl font-bold mb-2">Premium</h3>
          <p className="text-slate-400 mb-8">L'expérience complète sans compromis.</p>
          <div className="text-4xl font-bold mb-10">9.99€ <span className="text-lg text-slate-400 font-medium">/mois</span></div>
          
          <ul className="space-y-4 flex-grow mb-10">
            <FeatureItem included={true} text="Menus IA illimités" dark />
            <FeatureItem included={true} text="Liste de courses intelligente" dark />
            <FeatureItem included={true} text="Export Delhaize & Colruyt" dark />
            <FeatureItem included={true} text="Scan de produits mobiles" dark />
            <FeatureItem included={true} text="Support prioritaire" dark />
          </ul>

          <button 
            onClick={handleUpgrade}
            disabled={authState.user?.subscriptionType === 'premium'}
            className={`w-full py-4 font-bold rounded-2xl transition-all ${
                authState.user?.subscriptionType === 'premium'
                ? 'bg-slate-800 text-slate-500'
                : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-xl shadow-emerald-500/20'
            }`}
          >
            {authState.user?.subscriptionType === 'premium' ? 'Abonnement actif' : 'Passer au Premium'}
          </button>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ included, text, dark }: { included: boolean, text: string, dark?: boolean }) => (
  <li className="flex items-center gap-3">
    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
      included ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
    }`}>
      {included ? '✓' : '✕'}
    </div>
    <span className={`text-sm ${included ? (dark ? 'text-white' : 'text-slate-700') : 'text-slate-400'}`}>
      {text}
    </span>
  </li>
);

export default Subscription;
