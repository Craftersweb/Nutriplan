
import React, { useState } from 'react';
import { useApp } from '../App';
import { generateMealPlan } from '../services/gemini';
import { DayPlan, DietPreference, Meal } from '../types';

const Dashboard: React.FC = () => {
  const { authState, updateUser, currentMealPlan, setCurrentMealPlan, savedPlans, saveCurrentPlan } = useApp();
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveName, setSaveName] = useState('');

  // Local state for setup
  const [tempDiet, setTempDiet] = useState<DietPreference>(authState.user?.diet || DietPreference.OMNIVORE);
  const [tempAllergies, setTempAllergies] = useState<string[]>(authState.user?.allergies || []);

  const toggleAllergy = (allergy: string) => {
    setTempAllergies(prev => 
      prev.includes(allergy) ? prev.filter(a => a !== allergy) : [...prev, allergy]
    );
  };

  const handleGenerate = async () => {
    if (!authState.user) return;
    updateUser({ diet: tempDiet, allergies: tempAllergies });
    setLoading(true);
    try {
      const data = await generateMealPlan(tempDiet, tempAllergies);
      setCurrentMealPlan(data || []);
      setActiveDay(0);
    } catch (err) {
      console.error("Erreur génération:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = () => {
    if (!saveName) {
      alert("Donnez un nom à votre dossier !");
      return;
    }
    saveCurrentPlan(saveName);
    setIsSaving(false);
    setSaveName('');
    alert("Menu enregistré avec succès !");
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-xl font-bold text-slate-900 tracking-tighter">IA Nutriplan concocte votre menu...</p>
        <p className="text-slate-400 mt-2 italic text-sm">Calcul des calories et équilibre nutritionnel en cours.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-4 gap-10">
        
        {/* SIDEBAR : MES DOSSIERS */}
        <aside className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">📁 MES DOSSIERS</h3>
            <div className="space-y-4">
              {savedPlans.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <p className="text-[10px] text-slate-400 font-bold italic text-center leading-relaxed">Enregistrez un menu pour le retrouver ici.</p>
                </div>
              ) : (
                savedPlans.map(plan => (
                  <button 
                    key={plan.id}
                    onClick={() => {
                      setCurrentMealPlan(plan.plan);
                      setActiveDay(0);
                    }}
                    className={`w-full text-left p-5 rounded-[24px] transition-all group flex flex-col gap-2 border-2 ${
                      JSON.stringify(currentMealPlan) === JSON.stringify(plan.plan) 
                        ? 'bg-emerald-50 border-emerald-500 shadow-xl shadow-emerald-50' 
                        : 'bg-white border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📂</span>
                      <p className={`text-sm font-black tracking-tight ${JSON.stringify(currentMealPlan) === JSON.stringify(plan.plan) ? 'text-emerald-700' : 'text-slate-800'}`}>
                        {plan.name}
                      </p>
                    </div>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{new Date(plan.date).toLocaleDateString()} • {plan.diet}</p>
                  </button>
                ))
              )}
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full -mr-16 -mt-16 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <h4 className="font-black text-sm mb-4 flex items-center gap-2 uppercase tracking-widest text-emerald-500"><span>⚡</span> Astuce Premium</h4>
            <p className="text-[11px] opacity-70 leading-relaxed font-bold">
              Tous vos menus sont synchronisés sur vos appareils. L'export Delhaize est illimité pour vous !
            </p>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="lg:col-span-3">
          {currentMealPlan && currentMealPlan.length > 0 ? (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Planning Actuel</h1>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-4 py-1.5 bg-emerald-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest">{authState.user?.diet}</span>
                    {authState.user?.allergies.map(a => (
                      <span key={a} className="px-4 py-1.5 bg-red-50 text-red-600 text-[10px] font-black rounded-xl uppercase tracking-widest">SANS {a}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsSaving(true)}
                    className="px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm uppercase tracking-widest"
                  >
                    📂 Classer
                  </button>
                  <button 
                    onClick={() => {
                      if(confirm("Créer un nouveau menu ?")) {
                        setCurrentMealPlan(null);
                      }
                    }}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest"
                  >
                    + Nouveau
                  </button>
                </div>
              </div>

              {isSaving && (
                <div className="mb-10 p-8 bg-white border-2 border-emerald-100 rounded-[40px] flex flex-col sm:flex-row gap-6 items-center shadow-2xl animate-in slide-in-from-top duration-500">
                  <div className="flex-grow w-full">
                    <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3 ml-2">Titre du nouveau dossier</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Ma semaine Sportive"
                      className="w-full px-6 py-4 rounded-2xl bg-emerald-50/30 border border-emerald-100 outline-none focus:ring-4 focus:ring-emerald-500/10 font-black text-slate-800 placeholder:text-slate-300"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto self-end sm:self-center">
                    <button onClick={handleSavePlan} className="flex-grow sm:flex-grow-0 px-10 py-5 bg-emerald-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 transition-transform active:scale-95">Enregistrer</button>
                    <button onClick={() => setIsSaving(false)} className="px-8 py-5 bg-slate-100 text-slate-400 font-bold rounded-2xl text-xs">Annuler</button>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mb-12 overflow-x-auto pb-6 no-scrollbar">
                {currentMealPlan.map((plan, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveDay(idx)}
                    className={`px-10 py-5 rounded-[26px] whitespace-nowrap font-black text-[11px] uppercase tracking-[0.15em] transition-all ${
                      activeDay === idx 
                        ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-200 scale-105' 
                        : 'bg-white text-slate-300 border border-slate-100 hover:border-emerald-200 hover:text-emerald-600'
                    }`}
                  >
                    {plan.day || `Jour ${idx + 1}`}
                  </button>
                ))}
              </div>

              <div className="grid md:grid-cols-3 gap-10">
                <MealCard title="Petit-Déjeuner" meal={currentMealPlan[activeDay]?.meals?.breakfast} />
                <MealCard title="Déjeuner" meal={currentMealPlan[activeDay]?.meals?.lunch} />
                <MealCard title="Dîner" meal={currentMealPlan[activeDay]?.meals?.dinner} />
              </div>
            </>
          ) : (
            <div className="bg-white rounded-[60px] p-12 md:p-20 shadow-2xl shadow-slate-100 border border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50 rounded-full -mr-40 -mt-40 blur-[100px] opacity-60"></div>
              
              <div className="text-center mb-16 relative">
                <div className="w-20 h-20 bg-emerald-600 text-white rounded-[32px] flex items-center justify-center text-4xl mx-auto mb-8 shadow-2xl shadow-emerald-100">✨</div>
                <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Votre Menu IA</h2>
                <p className="text-slate-400 font-bold text-lg">Choisissez vos critères pour cette semaine.</p>
              </div>

              <div className="space-y-16 relative">
                <div>
                  <label className="block text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] mb-8 text-center">Régime Alimentaire</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {Object.values(DietPreference).map(pref => (
                      <button
                        key={pref}
                        onClick={() => setTempDiet(pref)}
                        className={`flex flex-col items-center justify-center p-8 rounded-[35px] border-4 transition-all ${
                          tempDiet === pref 
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xl ring-8 ring-emerald-50' 
                            : 'border-slate-50 bg-slate-50/50 text-slate-300 hover:border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-4xl mb-3">{getDietEmoji(pref)}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">{pref}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] mb-8 text-center">Restrictions ({authState.user?.email})</label>
                  <div className="flex flex-wrap justify-center gap-4">
                    {['Gluten', 'Lactose', 'Arachides', 'Oeufs', 'Soja', 'Poisson'].map(allergy => (
                      <button
                        key={allergy}
                        onClick={() => toggleAllergy(allergy)}
                        className={`px-8 py-5 rounded-[22px] border-2 font-black text-xs uppercase tracking-widest transition-all ${
                          tempAllergies.includes(allergy) 
                            ? 'bg-red-500 border-red-500 text-white shadow-2xl scale-110' 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-red-100 hover:text-red-500'
                        }`}
                      >
                        {tempAllergies.includes(allergy) ? '🚫' : '⚪'} {allergy}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleGenerate}
                  className="w-full py-7 bg-emerald-600 text-white font-black text-2xl rounded-[35px] hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 flex items-center justify-center gap-6 group active:scale-95"
                >
                  <span className="group-hover:rotate-12 transition-transform">✨</span> CRÉER MON PROGRAMME
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getDietEmoji = (pref: DietPreference) => {
  switch (pref) {
    case DietPreference.OMNIVORE: return '🍗';
    case DietPreference.VEGETARIAN: return '🥕';
    case DietPreference.VEGAN: return '🌿';
    case DietPreference.KETO: return '🥑';
    case DietPreference.PALEO: return '🥩';
    case DietPreference.GLUTEN_FREE: return '🌾';
    default: return '🍽️';
  }
};

const MealCard = ({ title, meal }: { title: string, meal?: Meal }) => {
  if (!meal) return null;
  return (
    <div className="bg-white rounded-[50px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full">
      <div className="h-64 relative overflow-hidden">
        <img src={meal.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={meal.name} />
        <div className="absolute top-5 left-5 px-5 py-2.5 bg-white/95 backdrop-blur-md rounded-2xl text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] shadow-sm">{title}</div>
        <div className="absolute bottom-5 right-5 px-4 py-2 bg-emerald-600 text-white rounded-2xl text-xs font-black shadow-xl">
          {meal.calories} KCAL
        </div>
      </div>
      <div className="p-10 flex flex-col flex-grow">
        <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight group-hover:text-emerald-600 transition-colors">{meal.name}</h3>
        <p className="text-sm text-slate-400 line-clamp-3 mb-8 leading-relaxed font-bold">{meal.description}</p>
        <div className="mt-auto pt-8 border-t border-slate-50 flex justify-between items-center">
          <div className="flex gap-2">
             {meal.ingredients.slice(0, 2).map((ing, i) => (
               <span key={i} className="text-[9px] bg-slate-100 px-3 py-1.5 rounded-xl text-slate-400 font-black uppercase tracking-tighter">{ing}</span>
             ))}
          </div>
          <button className="text-[11px] font-black uppercase tracking-widest text-slate-900 hover:text-emerald-600 transition-colors flex items-center gap-2">Recette →</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
