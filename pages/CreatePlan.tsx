
import React, { useState } from 'react';
import { useApp } from '../App';
import { generateMealPlan } from '../services/gemini';
import { DayPlan, Meal } from '../types';

const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const MEAL_TYPES = [
  { id: 'breakfast', label: 'Matin', emoji: '🍳' },
  { id: 'lunch', label: 'Midi', emoji: '🥗' },
  { id: 'dinner', label: 'Soir', emoji: '🍲' }
];

const CreatePlan: React.FC = () => {
  const { authState, setCurrentMealPlan, setView } = useApp();
  const [loading, setLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(DAYS_OF_WEEK);
  const [dayMeals, setDayMeals] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    DAYS_OF_WEEK.forEach(day => {
      initial[day] = ['breakfast', 'lunch', 'dinner'];
    });
    return initial;
  });
  const [instructions, setInstructions] = useState('');

  const toggleDay = (day: string) => {
    setSelectedDays(prev => {
      const next = prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day];
      // Sort the days based on their index in DAYS_OF_WEEK
      return next.sort((a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b));
    });
  };

  const toggleMeal = (day: string, mealId: string) => {
    setDayMeals(prev => {
      const current = prev[day] || [];
      const next = current.includes(mealId) 
        ? current.filter(m => m !== mealId) 
        : [...current, mealId];
      return { ...prev, [day]: next };
    });
  };

  const handleGenerate = async () => {
    if (!authState.user || selectedDays.length === 0) return;
    
    // Build a specific instruction for the AI based on meal selection
    const mealRequirements = selectedDays.map(day => {
      const meals = dayMeals[day] || [];
      return `${day} : ${meals.length > 0 ? meals.join(', ') : 'aucun repas'}`;
    }).join('; ');

    const fullInstructions = `REQUIS : Génère uniquement les repas spécifiés ici : ${mealRequirements}. ${instructions}`;

    setLoading(true);
    try {
      const data = await generateMealPlan(authState.user.diet, authState.user.allergies, selectedDays, fullInstructions);
      
      // Initialize data and mark unselected meals as not selected
      const initializedData = data.map(day => {
        const selectedForThisDay = dayMeals[day.day] || [];
        return {
          ...day,
          meals: {
            breakfast: { 
              ...day.meals.breakfast, 
              isSelected: selectedForThisDay.includes('breakfast'), 
              isTakeAway: false 
            },
            lunch: { 
              ...day.meals.lunch, 
              isSelected: selectedForThisDay.includes('lunch'), 
              isTakeAway: false 
            },
            dinner: { 
              ...day.meals.dinner, 
              isSelected: selectedForThisDay.includes('dinner'), 
              isTakeAway: false 
            },
          }
        };
      });

      setCurrentMealPlan(initializedData);
      setView('calendar');
    } catch (err) {
      console.error("Erreur génération:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
        <p className="text-xl font-bold text-slate-900 tracking-tight">IA Nutriplan compose votre menu...</p>
        <p className="text-slate-400 mt-2 text-sm italic">Personnalisation en cours</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100 animate-in fade-in duration-500">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">⚙️</div>
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Configuration IA</h2>
            <p className="text-slate-400 text-sm font-medium">Définissez vos besoins pour la génération.</p>
          </div>

          <div className="space-y-10">
            {/* 1. Days Selection */}
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

            {/* 2. Meals Selection per Day */}
            {selectedDays.length > 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">2. Quels repas pour chaque jour ?</label>
                <div className="grid gap-4">
                  {selectedDays.map(day => (
                    <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-4">
                      <span className="text-sm font-black text-slate-700 w-24">{day}</span>
                      <div className="flex gap-2">
                        {MEAL_TYPES.map(meal => (
                          <button
                            key={meal.id}
                            onClick={() => toggleMeal(day, meal.id)}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all border ${
                              dayMeals[day]?.includes(meal.id) 
                                ? 'bg-white border-emerald-500 text-emerald-600 shadow-sm' 
                                : 'bg-transparent border-slate-200 text-slate-400'
                            }`}
                          >
                            <span className="mr-1">{meal.emoji}</span>
                            {meal.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-1 gap-8">
              <div className="bg-emerald-50/50 p-8 rounded-[32px] border border-emerald-100 text-center">
                <p className="text-sm font-medium text-emerald-800">
                  L'IA va générer vos recettes. Vous pourrez ajuster le nombre de portions directement dans le calendrier pour chaque repas.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-300 uppercase mb-4 tracking-widest">3. Instructions de l'IA</label>
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
    </div>
  );
};

export default CreatePlan;
