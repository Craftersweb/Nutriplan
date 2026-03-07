
import React, { useState } from 'react';
import { useApp } from '../App';
import { DayPlan, Meal } from '../types';

const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const Calendar: React.FC = () => {
  const { authState, currentMealPlan, setCurrentMealPlan, savedPlans, saveCurrentPlan, setView } = useApp();
  const [activeDay, setActiveDay] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  const toggleMealProperty = (dayIdx: number, mealType: 'breakfast' | 'lunch' | 'dinner', property: 'isSelected' | 'isTakeAway') => {
    if (!currentMealPlan) return;
    const newPlan = [...currentMealPlan];
    const meal = newPlan[dayIdx].meals[mealType];
    if (meal) {
      (meal as any)[property] = !(meal as any)[property];
      setCurrentMealPlan(newPlan);
    }
  };

  if (!currentMealPlan) {
    return (
      <div className="p-12 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">📅</div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Aucun planning actif</h2>
        <p className="text-slate-500 mb-8">Commencez par générer un menu personnalisé avec l'IA.</p>
        <button 
          onClick={() => setView('create')}
          className="px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
        >
          Créer mon menu
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {selectedMeal && <MealDetailModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}

      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-emerald-600 rounded-[32px] p-6 text-white shadow-xl shadow-emerald-200">
            <h3 className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-4">Actions</h3>
            <button 
              onClick={() => setView('create')}
              className="w-full py-4 bg-white/20 hover:bg-white/30 transition-all rounded-2xl font-black text-xs uppercase tracking-widest"
            >
              🔄 Nouveau Planning
            </button>
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6">HISTORIQUE</h3>
            <div className="space-y-3">
              {savedPlans.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic font-medium px-2">Aucun menu enregistré.</p>
              ) : (
                savedPlans.slice(0, 8).map(plan => (
                  <button 
                    key={plan.id}
                    onClick={() => { setCurrentMealPlan(plan.plan); setActiveDay(0); }}
                    className="w-full text-left p-3 rounded-xl hover:bg-emerald-50 transition-all text-[11px] font-bold text-slate-600 border border-transparent hover:border-emerald-100"
                  >
                    {plan.name} <span className="opacity-40 ml-1">• {plan.servings}p</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mon Planning</h1>
              <p className="text-slate-500 text-sm">Gérez vos repas avant d'exporter la liste de courses.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsSaving(true)} className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600">Sauvegarder</button>
              <button onClick={() => setView('create')} className="px-5 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold shadow-lg">Modifier</button>
            </div>
          </div>

          {isSaving && (
            <div className="mb-8 p-6 bg-white border border-emerald-100 rounded-[32px] flex gap-4 shadow-xl animate-in slide-in-from-top duration-300">
              <input 
                type="text" placeholder="Nom de ce menu..."
                className="flex-grow px-5 py-3 rounded-xl bg-slate-50 outline-none text-sm font-bold border-none"
                value={saveName} onChange={(e) => setSaveName(e.target.value)}
              />
              <button onClick={() => { saveCurrentPlan(saveName); setIsSaving(false); setSaveName(''); }} className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest">OK</button>
            </div>
          )}

          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
            {currentMealPlan.map((plan, idx) => (
              <button
                key={idx}
                onClick={() => setActiveDay(idx)}
                className={`px-6 py-3 rounded-xl whitespace-nowrap font-bold text-[10px] uppercase tracking-widest transition-all ${
                  activeDay === idx ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'
                }`}
              >
                {plan.day}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <MealCard 
              title="Matin" meal={currentMealPlan[activeDay].meals.breakfast} 
              onToggleSelect={() => toggleMealProperty(activeDay, 'breakfast', 'isSelected')}
              onToggleTakeAway={() => toggleMealProperty(activeDay, 'breakfast', 'isTakeAway')}
              onClick={() => setSelectedMeal(currentMealPlan[activeDay].meals.breakfast)} 
            />
            <MealCard 
              title="Midi" meal={currentMealPlan[activeDay].meals.lunch} 
              onToggleSelect={() => toggleMealProperty(activeDay, 'lunch', 'isSelected')}
              onToggleTakeAway={() => toggleMealProperty(activeDay, 'lunch', 'isTakeAway')}
              onClick={() => setSelectedMeal(currentMealPlan[activeDay].meals.lunch)} 
            />
            <MealCard 
              title="Soir" meal={currentMealPlan[activeDay].meals.dinner} 
              onToggleSelect={() => toggleMealProperty(activeDay, 'dinner', 'isSelected')}
              onToggleTakeAway={() => toggleMealProperty(activeDay, 'dinner', 'isTakeAway')}
              onClick={() => setSelectedMeal(currentMealPlan[activeDay].meals.dinner)} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const MealCard = ({ title, meal, onClick, onToggleSelect, onToggleTakeAway }: any) => {
  if (!meal) return null;
  const isSelected = meal.isSelected !== false;
  return (
    <div className={`bg-white rounded-[32px] overflow-hidden border transition-all duration-300 flex flex-col h-full relative group ${isSelected ? 'border-slate-100 shadow-sm' : 'opacity-40 grayscale scale-95 border-slate-200'}`}>
      <button onClick={onToggleSelect} className={`absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${isSelected ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white border-slate-300 text-slate-300 border-2'}`}>
        {isSelected ? '✓' : ''}
      </button>
      <div className="h-44 overflow-hidden cursor-pointer" onClick={onClick}>
        <img src={meal.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={meal.name} referrerPolicy="no-referrer" />
        <div className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur rounded-lg text-[9px] font-black text-slate-900 uppercase tracking-widest shadow-sm">{title}</div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-[15px] font-black text-slate-900 mb-4 leading-tight group-hover:text-emerald-700 transition-colors cursor-pointer" onClick={onClick}>{meal.name}</h3>
        <div className="mt-auto flex justify-between items-center pt-2">
          <button 
            onClick={onToggleTakeAway}
            className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase transition-all border ${meal.isTakeAway ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
          >
            {meal.isTakeAway ? '🥡 Emporter' : '🍽️ Maison'}
          </button>
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{meal.calories} KCAL</span>
        </div>
      </div>
    </div>
  );
};

const MealDetailModal = ({ meal, onClose }: { meal: Meal, onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-3xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in duration-200 relative">
      <button onClick={onClose} className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-slate-900 hover:bg-white transition-all">✕</button>
      <div className="md:w-1/2 h-64 md:h-auto overflow-hidden">
        <img src={meal.image} className="w-full h-full object-cover" alt={meal.name} referrerPolicy="no-referrer" />
      </div>
      <div className="md:w-1/2 p-8 md:p-10 overflow-y-auto custom-scrollbar">
        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg">Fiche Recette</span>
        <h2 className="text-2xl font-black text-slate-900 mt-4 mb-8 leading-tight">{meal.name}</h2>
        <div className="space-y-8">
          <div>
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Ingrédients</h4>
            <ul className="space-y-2">
              {meal.ingredients.map((ing, i) => <li key={i} className="text-xs font-bold text-slate-700 flex items-start gap-2">• {ing}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Mode de préparation</h4>
            <ul className="space-y-4">
              {meal.instructions.map((step, i) => <li key={i} className="text-xs font-medium text-slate-600 leading-relaxed"><span className="font-black text-slate-300 mr-2">{i+1}.</span>{step}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Calendar;
