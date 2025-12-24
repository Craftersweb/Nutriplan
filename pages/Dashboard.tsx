
import React, { useState } from 'react';
import { useApp } from '../App';
import { generateMealPlan } from '../services/gemini';
import { DayPlan, DietPreference, Meal } from '../types';

const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const Dashboard: React.FC = () => {
  const { authState, updateUser, currentMealPlan, setCurrentMealPlan, savedPlans, saveCurrentPlan } = useApp();
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [servings, setServings] = useState(2);
  const [selectedDays, setSelectedDays] = useState<string[]>(DAYS_OF_WEEK);
  const [defaultTakeAway, setDefaultTakeAway] = useState(true);

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleGenerate = async () => {
    if (!authState.user || selectedDays.length === 0) return;
    setLoading(true);
    try {
      const data = await generateMealPlan(authState.user.diet, authState.user.allergies, servings, selectedDays, instructions);
      const initializedData = data.map(day => ({
        ...day,
        meals: {
          breakfast: { ...day.meals.breakfast, isSelected: true, isTakeAway: false },
          lunch: { ...day.meals.lunch, isSelected: true, isTakeAway: defaultTakeAway },
          dinner: { ...day.meals.dinner, isSelected: true, isTakeAway: false },
        }
      }));
      setCurrentMealPlan(initializedData);
      localStorage.setItem('nutriplan_last_servings', servings.toString());
      setActiveDay(0);
    } catch (err) {
      console.error("Erreur génération:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPlan = () => {
    setCurrentMealPlan(null);
    setActiveDay(0);
    setIsSaving(false);
  };

  const toggleMealProperty = (dayIdx: number, mealType: 'breakfast' | 'lunch' | 'dinner', property: 'isSelected' | 'isTakeAway') => {
    if (!currentMealPlan) return;
    const newPlan = [...currentMealPlan];
    const meal = newPlan[dayIdx].meals[mealType];
    (meal as any)[property] = !(meal as any)[property];
    setCurrentMealPlan(newPlan);
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
        <p className="text-xl font-bold text-slate-900 tracking-tight">IA Nutriplan compose votre menu...</p>
        <p className="text-slate-400 mt-2 text-sm italic">Planification pour {selectedDays.length} jours</p>
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
              onClick={handleNewPlan}
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
                    onClick={() => { setCurrentMealPlan(plan.plan); setServings(plan.servings); setActiveDay(0); }}
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
          {currentMealPlan ? (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mon Planning</h1>
                  <p className="text-slate-500 text-sm italic">Personnalisez votre menu avant les courses.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsSaving(true)} className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-all">Sauvegarder</button>
                  <button onClick={handleNewPlan} className="px-5 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold hover:bg-slate-800 shadow-lg transition-all">Modifier critères</button>
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
                      activeDay === idx ? 'bg-emerald-600 text-white shadow-lg scale-105' : 'bg-white text-slate-400 border border-slate-100 hover:border-emerald-200'
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
            </>
          ) : (
            <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100">
              <div className="max-w-3xl mx-auto space-y-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">⚙️</div>
                  <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Configuration IA</h2>
                  <p className="text-slate-400 text-sm font-medium">Définissez vos besoins pour la génération.</p>
                </div>

                <div className="space-y-10">
                  <div>
                    <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">1. Pour quels jours ?</label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map(day => (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                            selectedDays.includes(day) ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 border border-slate-100'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 text-center">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Nombre de convives</label>
                      <div className="flex items-center justify-center gap-6">
                        <button onClick={() => setServings(Math.max(1, servings - 1))} className="w-10 h-10 bg-white rounded-full shadow-sm font-black text-slate-400 hover:text-emerald-600 transition-colors">-</button>
                        <span className="text-4xl font-black text-slate-900">{servings}</span>
                        <button onClick={() => setServings(Math.min(10, servings + 1))} className="w-10 h-10 bg-white rounded-full shadow-sm font-black text-slate-400 hover:text-emerald-600 transition-colors">+</button>
                      </div>
                    </div>
                    <button 
                      onClick={() => setDefaultTakeAway(!defaultTakeAway)}
                      className={`p-6 rounded-[32px] border-2 flex flex-col items-center justify-center transition-all ${
                        defaultTakeAway ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-lg shadow-amber-100' : 'border-slate-100 bg-white text-slate-300'
                      }`}
                    >
                      <span className="text-3xl mb-1">{defaultTakeAway ? '🥡' : '🍽️'}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">Le midi à emporter</span>
                      <span className="text-[9px] font-bold mt-1 opacity-60 italic">{defaultTakeAway ? 'Configuré par défaut' : 'Cuisiné maison'}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-300 uppercase mb-4 tracking-widest">2. Instructions de l'IA</label>
                    <textarea 
                      placeholder="Ex: Repas rapides le soir, pas de poisson, plus de protéines le mardi..."
                      className="w-full h-28 p-5 bg-slate-50 border border-slate-100 rounded-[24px] text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:bg-white outline-none transition-all"
                      value={instructions} onChange={(e) => setInstructions(e.target.value)}
                    />
                  </div>

                  <button 
                    onClick={handleGenerate}
                    className="w-full py-6 bg-emerald-600 text-white font-black rounded-[28px] hover:bg-emerald-700 shadow-xl shadow-emerald-100 active:scale-95 transition-all text-lg tracking-tight"
                  >
                    GÉNÉRER MON MENU IA
                  </button>
                </div>
              </div>
            </div>
          )}
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
        <img src={meal.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={meal.name} />
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
        <img src={meal.image} className="w-full h-full object-cover" alt={meal.name} />
      </div>
      <div className="md:w-1/2 p-8 md:p-10 overflow-y-auto custom-scrollbar">
        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg">Fiche Recette</span>
        <h2 className="text-2xl font-black text-slate-900 mt-4 mb-8 leading-tight">{meal.name}</h2>
        <div className="space-y-8">
          <div>
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Liste des ingrédients</h4>
            <ul className="space-y-2">
              {meal.ingredients.map((ing, i) => <li key={i} className="text-xs font-bold text-slate-700 flex items-start gap-2"><span className="text-emerald-500 mt-1">•</span> {ing}</li>)}
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

export default Dashboard;
