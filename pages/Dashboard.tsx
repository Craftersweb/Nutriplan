
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
  const [defaultTakeAway, setDefaultTakeAway] = useState(false);

  const [tempDiet, setTempDiet] = useState<DietPreference>(authState.user?.diet || DietPreference.OMNIVORE);
  const [tempAllergies, setTempAllergies] = useState<string[]>(authState.user?.allergies || []);

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleGenerate = async () => {
    if (!authState.user || selectedDays.length === 0) return;
    updateUser({ diet: tempDiet, allergies: tempAllergies });
    setLoading(true);
    try {
      const data = await generateMealPlan(tempDiet, tempAllergies, servings, selectedDays, instructions);
      const initializedData = data.map(day => ({
        ...day,
        meals: {
          breakfast: { ...day.meals.breakfast, isSelected: true, isTakeAway: false },
          lunch: { ...day.meals.lunch, isSelected: true, isTakeAway: defaultTakeAway },
          dinner: { ...day.meals.dinner, isSelected: true, isTakeAway: false },
        }
      }));
      setCurrentMealPlan(initializedData || []);
      localStorage.setItem('nutriplan_last_servings', servings.toString());
      setActiveDay(0);
    } catch (err) {
      console.error("Erreur génération:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMealSelection = (dayIdx: number, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    if (!currentMealPlan) return;
    const newPlan = [...currentMealPlan];
    const meal = newPlan[dayIdx].meals[mealType];
    meal.isSelected = !meal.isSelected;
    setCurrentMealPlan(newPlan);
  };

  const toggleMealTakeAway = (dayIdx: number, mealType: 'breakfast' | 'lunch' | 'dinner', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentMealPlan) return;
    const newPlan = [...currentMealPlan];
    const meal = newPlan[dayIdx].meals[mealType];
    meal.isTakeAway = !meal.isTakeAway;
    setCurrentMealPlan(newPlan);
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
        <p className="text-xl font-bold text-slate-900 tracking-tight">IA Nutriplan compose votre menu...</p>
        <p className="text-slate-400 mt-2 text-sm italic">Planification pour {selectedDays.length} jours...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {selectedMeal && <MealDetailModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}

      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-emerald-600 rounded-[32px] p-6 text-white shadow-xl shadow-emerald-200">
            <h3 className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-4">Action Rapide</h3>
            <button 
              onClick={() => setCurrentMealPlan(null)}
              className="w-full py-4 bg-white/20 hover:bg-white/30 transition-all rounded-2xl font-black text-xs uppercase tracking-widest"
            >
              🚀 Nouveau Plan
            </button>
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-6">📂 HISTORIQUE</h3>
            <div className="space-y-3">
              {savedPlans.length === 0 ? (
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 font-medium italic">Aucun menu sauvegardé.</p>
                </div>
              ) : (
                savedPlans.slice(0, 5).map(plan => (
                  <button 
                    key={plan.id}
                    onClick={() => { setCurrentMealPlan(plan.plan); setServings(plan.servings || 2); setActiveDay(0); }}
                    className="w-full text-left p-4 rounded-2xl hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100 group"
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-slate-700 group-hover:text-emerald-700">{plan.name}</p>
                      <span className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-black">{plan.servings} PERS.</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3">
          {currentMealPlan && currentMealPlan.length > 0 ? (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mon Planning</h1>
                  <p className="text-slate-500 text-sm italic">Personnalisez chaque repas avant les courses.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setIsSaving(true)} className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600">📁 Classer</button>
                  <button onClick={() => setCurrentMealPlan(null)} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold shadow-lg">Regénérer</button>
                </div>
              </div>

              {isSaving && (
                <div className="mb-8 p-6 bg-white border border-emerald-100 rounded-[32px] flex flex-col sm:flex-row gap-4 items-center shadow-xl">
                  <input 
                    type="text" placeholder="Nom du menu..."
                    className="flex-grow px-5 py-3 rounded-xl bg-slate-50 border-none outline-none text-sm font-bold"
                    value={saveName} onChange={(e) => setSaveName(e.target.value)}
                  />
                  <button onClick={() => { saveCurrentPlan(saveName); setIsSaving(false); setSaveName(''); }} className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs uppercase">OK</button>
                </div>
              )}

              <div className="flex gap-2 mb-8 overflow-x-auto pb-4 no-scrollbar">
                {currentMealPlan.map((plan, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveDay(idx)}
                    className={`px-8 py-4 rounded-2xl whitespace-nowrap font-bold text-[10px] uppercase tracking-widest transition-all ${
                      activeDay === idx ? 'bg-emerald-600 text-white shadow-lg scale-105' : 'bg-white text-slate-400 border border-slate-100'
                    }`}
                  >
                    {plan.day}
                  </button>
                ))}
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <MealCard 
                  title="Matin" meal={currentMealPlan[activeDay]?.meals?.breakfast} 
                  onToggleSelect={() => toggleMealSelection(activeDay, 'breakfast')}
                  onToggleTakeAway={(e) => toggleMealTakeAway(activeDay, 'breakfast', e)}
                  onClick={() => setSelectedMeal(currentMealPlan[activeDay].meals.breakfast)} 
                />
                <MealCard 
                  title="Midi" meal={currentMealPlan[activeDay]?.meals?.lunch} 
                  onToggleSelect={() => toggleMealSelection(activeDay, 'lunch')}
                  onToggleTakeAway={(e) => toggleMealTakeAway(activeDay, 'lunch', e)}
                  onClick={() => setSelectedMeal(currentMealPlan[activeDay].meals.lunch)} 
                />
                <MealCard 
                  title="Soir" meal={currentMealPlan[activeDay]?.meals?.dinner} 
                  onToggleSelect={() => toggleMealSelection(activeDay, 'dinner')}
                  onToggleTakeAway={(e) => toggleMealTakeAway(activeDay, 'dinner', e)}
                  onClick={() => setSelectedMeal(currentMealPlan[activeDay].meals.dinner)} 
                />
              </div>
            </>
          ) : (
            <div className="bg-white rounded-[40px] p-10 md:p-14 shadow-sm border border-slate-100">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[30px] flex items-center justify-center text-4xl mx-auto mb-6 animate-bounce">🌱</div>
                  <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Planification IA</h2>
                  <p className="text-slate-400 font-medium text-sm">Configurez votre semaine sur-mesure.</p>
                </div>

                <div className="space-y-12">
                  {/* CHOIX DES JOURS */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">1. Pour quels jours ?</label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map(day => (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            selectedDays.includes(day) ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* SERVINGS & TAKE AWAY */}
                    <div className="space-y-6">
                      <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 text-center">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Nombre de personnes</label>
                        <div className="flex items-center justify-center gap-6">
                          <button onClick={() => setServings(Math.max(1, servings - 1))} className="w-10 h-10 bg-white rounded-full shadow-sm font-black">-</button>
                          <span className="text-4xl font-black text-slate-900">{servings}</span>
                          <button onClick={() => setServings(Math.min(12, servings + 1))} className="w-10 h-10 bg-white rounded-full shadow-sm font-black">+</button>
                        </div>
                      </div>

                      <button 
                        onClick={() => setDefaultTakeAway(!defaultTakeAway)}
                        className={`w-full p-6 rounded-[32px] border-2 flex items-center justify-between transition-all ${
                          defaultTakeAway ? 'border-amber-500 bg-amber-50' : 'border-slate-100 bg-white'
                        }`}
                      >
                        <div className="text-left">
                          <p className={`text-xs font-black uppercase ${defaultTakeAway ? 'text-amber-700' : 'text-slate-400'}`}>Mode Nomade 🥡</p>
                          <p className="text-[10px] font-medium text-slate-500 mt-1">Repas du midi "à emporter" par défaut</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${defaultTakeAway ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-200'}`}>
                          {defaultTakeAway && '✓'}
                        </div>
                      </button>
                    </div>

                    {/* DIET & ALLERGIES */}
                    <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Régime & Instructions</label>
                      <select 
                        value={tempDiet} onChange={(e) => setTempDiet(e.target.value as DietPreference)}
                        className="w-full p-3 rounded-xl mb-4 bg-white border border-slate-100 text-xs font-bold"
                      >
                        {Object.values(DietPreference).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <textarea 
                        placeholder="Instructions spéciales..."
                        className="w-full h-20 p-4 bg-white border border-slate-100 rounded-2xl text-xs font-medium resize-none"
                        value={instructions} onChange={(e) => setInstructions(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleGenerate}
                    className="w-full py-6 bg-emerald-600 text-white font-black text-lg rounded-[28px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
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

const MealDetailModal = ({ meal, onClose }: { meal: Meal, onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-in zoom-in duration-200">
      <button onClick={onClose} className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-slate-900">✕</button>
      <div className="md:w-1/2 h-64 md:h-auto overflow-hidden">
        <img src={meal.image} className="w-full h-full object-cover" alt={meal.name} />
      </div>
      <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto custom-scrollbar">
        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg">Recette</span>
        <h2 className="text-3xl font-black text-slate-900 mt-4 leading-tight">{meal.name}</h2>
        <div className="mt-8 space-y-6">
          <div>
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Ingrédients</h4>
            <ul className="space-y-2">
              {meal.ingredients.map((ing, i) => <li key={i} className="text-sm font-bold text-slate-700 flex gap-2"><span className="text-emerald-500">•</span> {ing}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MealCard = ({ title, meal, onClick, onToggleSelect, onToggleTakeAway }: any) => {
  if (!meal) return null;
  const isSelected = meal.isSelected !== false;
  return (
    <div className={`relative bg-white rounded-[32px] overflow-hidden border transition-all duration-300 flex flex-col h-full group ${isSelected ? 'border-slate-100 opacity-100' : 'opacity-40 grayscale scale-95'}`}>
      <button onClick={(e) => { e.stopPropagation(); onToggleSelect(); }} className={`absolute top-4 right-4 z-20 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200'}`}>✓</button>
      <div className="h-44 overflow-hidden cursor-pointer" onClick={onClick}>
        <img src={meal.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={meal.name} />
        <div className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur rounded-lg text-[9px] font-black text-slate-900 uppercase tracking-widest">{title}</div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-md font-black text-slate-900 mb-4 leading-tight cursor-pointer" onClick={onClick}>{meal.name}</h3>
        <div className="mt-auto flex justify-between items-center">
          <button onClick={onToggleTakeAway} className={`px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all ${meal.isTakeAway ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>
            {meal.isTakeAway ? '🥡 À Emporter' : '🍽️ Maison'}
          </button>
          <span className="text-[10px] font-black text-emerald-600">{meal.calories} KCAL</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
