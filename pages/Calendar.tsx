
import React, { useState } from 'react';
import { useApp } from '../App';
import { DayPlan, Meal } from '../types';

const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const Calendar: React.FC = () => {
  const { authState, currentMealPlan, setCurrentMealPlan, savedPlans, saveCurrentPlan, setView } = useApp();
  const [activeDay, setActiveDay] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveWeek, setSaveWeek] = useState(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
  });
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  const toggleMealProperty = (dayIdx: number, mealType: 'breakfast' | 'lunch' | 'dinner', property: 'isSelected') => {
    if (!currentMealPlan) return;
    const newPlan = [...currentMealPlan];
    const meal = newPlan[dayIdx].meals[mealType];
    if (meal) {
      (meal as any)[property] = !(meal as any)[property];
      setCurrentMealPlan(newPlan);
    }
  };

  const [viewMode, setViewModeInternal] = useState<'tabs' | 'grid'>('tabs');

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
            <div className="space-y-2">
              <button 
                onClick={() => setView('create')}
                className="w-full py-4 bg-white/20 hover:bg-white/30 transition-all rounded-2xl font-black text-xs uppercase tracking-widest"
              >
                🔄 Nouveau Planning
              </button>
              <button 
                onClick={() => setViewModeInternal(viewMode === 'tabs' ? 'grid' : 'tabs')}
                className="w-full py-4 bg-white/10 hover:bg-white/20 transition-all rounded-2xl font-black text-xs uppercase tracking-widest"
              >
                {viewMode === 'tabs' ? '📅 Vue Grille' : '📱 Vue Liste'}
              </button>
            </div>
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
                    <div className="flex justify-between items-center">
                      <span>{plan.name}</span>
                      <span className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">{plan.week}</span>
                    </div>
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
            <div className="mb-8 p-6 bg-white border border-emerald-100 rounded-[32px] flex flex-col gap-4 shadow-xl animate-in slide-in-from-top duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nom du menu</label>
                  <input 
                    type="text" placeholder="Ex: Semaine Healthy..."
                    className="w-full px-5 py-3 rounded-xl bg-slate-50 outline-none text-sm font-bold border-none"
                    value={saveName} onChange={(e) => setSaveName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Semaine</label>
                  <input 
                    type="week"
                    className="w-full px-5 py-3 rounded-xl bg-slate-50 outline-none text-sm font-bold border-none"
                    value={saveWeek} onChange={(e) => setSaveWeek(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsSaving(false)} className="px-6 py-3 text-slate-400 font-bold text-xs uppercase tracking-widest">Annuler</button>
                <button onClick={() => { saveCurrentPlan(saveName, saveWeek); setIsSaving(false); setSaveName(''); }} className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest">Confirmer</button>
              </div>
            </div>
          )}

          {viewMode === 'tabs' ? (
            <>
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
                  onClick={() => setSelectedMeal(currentMealPlan[activeDay].meals.breakfast)} 
                />
                <MealCard 
                  title="Midi" meal={currentMealPlan[activeDay].meals.lunch} 
                  onToggleSelect={() => toggleMealProperty(activeDay, 'lunch', 'isSelected')}
                  onClick={() => setSelectedMeal(currentMealPlan[activeDay].meals.lunch)} 
                />
                <MealCard 
                  title="Soir" meal={currentMealPlan[activeDay].meals.dinner} 
                  onToggleSelect={() => toggleMealProperty(activeDay, 'dinner', 'isSelected')}
                  onClick={() => setSelectedMeal(currentMealPlan[activeDay].meals.dinner)} 
                />
              </div>
            </>
          ) : (
            <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto no-scrollbar">
                <div className="min-w-[1000px]">
                  {/* Header Row */}
                  <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-md z-30">
                    <div className="p-4 border-r border-slate-100 bg-slate-50/50 flex items-center justify-center">
                      <span className="text-[10px] font-black text-slate-300">GMT+1</span>
                    </div>
                    {currentMealPlan.map((dayPlan, idx) => (
                      <div key={idx} className="p-4 text-center border-r border-slate-100 last:border-r-0">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                          {dayPlan.day.split(' ')[0]}
                        </span>
                        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-lg font-black ${idx === 0 ? 'bg-emerald-600 text-white' : 'text-slate-900'}`}>
                          {dayPlan.day.split(' ')[1] || (idx + 1)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Meal Rows */}
                  {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => (
                    <div key={mealType} className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-100 last:border-b-0">
                      <div className="p-4 border-r border-slate-100 bg-slate-50/50 flex flex-col items-center justify-start pt-8 sticky left-0 z-20">
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                          {mealType === 'breakfast' ? '08:00' : mealType === 'lunch' ? '12:00' : '19:00'}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                          {mealType === 'breakfast' ? 'Matin' : mealType === 'lunch' ? 'Midi' : 'Soir'}
                        </span>
                      </div>
                      {currentMealPlan.map((dayPlan, dayIdx) => (
                        <div key={dayIdx} className="p-1 border-r border-slate-100 last:border-r-0 min-h-[200px] relative group bg-white hover:bg-slate-50/50 transition-colors">
                          <MealGridItem 
                            meal={dayPlan.meals[mealType]} 
                            onToggleSelect={() => toggleMealProperty(dayIdx, mealType, 'isSelected')}
                            onClick={() => setSelectedMeal(dayPlan.meals[mealType])}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MealGridItem = ({ meal, onClick, onToggleSelect }: any) => {
  if (!meal) return <div className="h-full bg-slate-50/20 rounded-lg border border-dashed border-slate-100"></div>;
  const isSelected = meal.isSelected !== false;
  
  return (
    <div 
      className={`h-full rounded-2xl p-2 transition-all cursor-pointer relative group flex flex-col border ${
        isSelected 
          ? 'bg-white border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-200' 
          : 'bg-slate-50 opacity-40 grayscale border-transparent'
      }`}
      onClick={onClick}
    >
      <button 
        onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
        className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black transition-all z-10 ${
          isSelected ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-300'
        }`}
      >
        {isSelected ? '✓' : ''}
      </button>
      
      <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-2">
        <img src={meal.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={meal.name} referrerPolicy="no-referrer" />
      </div>
      
      <h4 className="text-[10px] font-black text-slate-800 leading-tight line-clamp-2 mb-1 group-hover:text-emerald-700 transition-colors">
        {meal.name}
      </h4>
      <div className="mt-auto flex items-center justify-between">
        <span className="text-[7px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-1.5 py-0.5 rounded">
          {meal.calories} KCAL
        </span>
        <span className="text-[7px] font-bold text-slate-300 uppercase">Détails</span>
      </div>
    </div>
  );
};

const MealCard = ({ title, meal, onClick, onToggleSelect }: any) => {
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
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{meal.calories} KCAL</span>
          <button onClick={onClick} className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">Détails →</button>
        </div>
      </div>
    </div>
  );
};

const MealDetailModal = ({ meal, onClose }: { meal: Meal, onClose: () => void }) => {
  const [servings, setServings] = useState(2);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in duration-200 relative">
        <button onClick={onClose} className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-slate-900 hover:bg-white transition-all">✕</button>
        <div className="md:w-1/2 h-64 md:h-auto overflow-hidden">
          <img src={meal.image} className="w-full h-full object-cover" alt={meal.name} referrerPolicy="no-referrer" />
        </div>
        <div className="md:w-1/2 p-8 md:p-10 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-6">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg">Fiche Recette</span>
            <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              <button onClick={() => setServings(Math.max(1, servings - 1))} className="text-slate-400 hover:text-emerald-600 font-bold">-</button>
              <span className="text-xs font-black text-slate-700">{servings} pers.</span>
              <button onClick={() => setServings(servings + 1)} className="text-slate-400 hover:text-emerald-600 font-bold">+</button>
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-8 leading-tight">{meal.name}</h2>
          <div className="space-y-8">
            <div>
              <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Ingrédients</h4>
              <ul className="space-y-2">
                {meal.ingredients.map((ing, i) => (
                  <li key={i} className="text-xs font-bold text-slate-700 flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">●</span>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Mode de préparation</h4>
              <ul className="space-y-4">
                {meal.instructions.map((step, i) => (
                  <li key={i} className="text-xs font-medium text-slate-600 leading-relaxed">
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black text-slate-400">{i+1}</span>
                      <span>{step}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
