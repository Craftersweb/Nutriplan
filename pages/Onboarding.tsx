
import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    title: "Bienvenue sur Nutriplan",
    description: "L'application qui utilise l'intelligence artificielle pour simplifier votre vie en cuisine.",
    icon: "✨",
    color: "bg-emerald-500"
  },
  {
    title: "IA Gemini 3 Pro",
    description: "Dites à notre IA vos préférences et allergies, elle génère un menu équilibré pour toute votre famille en quelques secondes.",
    icon: "🧠",
    color: "bg-blue-500"
  },
  {
    title: "Courses Instantanées",
    description: "Une fois votre menu prêt, synchronisez votre panier avec Delhaize ou Colruyt. Fini les oublis et le gaspillage !",
    icon: "🛍️",
    color: "bg-amber-500"
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-[48px] shadow-2xl shadow-slate-200 border border-slate-100 p-10 relative overflow-hidden flex flex-col items-center text-center animate-in zoom-in duration-300">
        
        {/* Progress indicator */}
        <div className="flex gap-2 mb-10">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-200'}`}
            ></div>
          ))}
        </div>

        {/* Content */}
        <div key={currentStep} className="animate-in slide-in-from-right-8 fade-in duration-500 flex flex-col items-center">
          <div className={`w-24 h-24 ${steps[currentStep].color} rounded-[32px] flex items-center justify-center text-5xl shadow-2xl shadow-emerald-200/50 mb-8`}>
            {steps[currentStep].icon}
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">
            {steps[currentStep].title}
          </h2>
          
          <p className="text-slate-500 font-medium leading-relaxed mb-12">
            {steps[currentStep].description}
          </p>
        </div>

        {/* Buttons */}
        <div className="w-full space-y-4">
          <button 
            onClick={handleNext}
            className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 active:scale-95 uppercase tracking-widest text-[11px]"
          >
            {currentStep === steps.length - 1 ? "Commencer maintenant" : "Continuer"}
          </button>
          
          <button 
            onClick={onComplete}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-all py-2 px-4"
          >
            Passer le tutoriel
          </button>
        </div>

        {/* Decor */}
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-slate-50 rounded-full blur-3xl opacity-50"></div>
      </div>
    </div>
  );
};

export default Onboarding;
