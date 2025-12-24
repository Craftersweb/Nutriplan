
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../App';
import { generateShoppingList } from '../services/gemini';
import { ShoppingListItem } from '../types';

type Retailer = 'delhaize' | 'colruyt' | 'carrefour';

const ShoppingList: React.FC = () => {
  const { currentMealPlan, savedPlans } = useApp();
  const [list, setList] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('current');
  const [retailer, setRetailer] = useState<Retailer>(() => {
    return (localStorage.getItem('nutriplan_fav_retailer') as Retailer) || 'delhaize';
  });
  const [viewMode, setViewMode] = useState<'standard' | 'assistant'>('standard');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Persistence du magasin préféré
  useEffect(() => {
    localStorage.setItem('nutriplan_fav_retailer', retailer);
  }, [retailer]);

  const activePlan = useMemo(() => {
    let p = selectedWeekId === 'current' ? currentMealPlan : savedPlans.find(p => p.id === selectedWeekId)?.plan;
    if (!p) return null;
    return p.map(day => ({
      ...day,
      meals: {
        breakfast: day.meals.breakfast.isSelected !== false ? day.meals.breakfast : null as any,
        lunch: day.meals.lunch.isSelected !== false ? day.meals.lunch : null as any,
        dinner: day.meals.dinner.isSelected !== false ? day.meals.dinner : null as any,
      }
    })).filter(day => day.meals.breakfast || day.meals.lunch || day.meals.dinner);
  }, [selectedWeekId, currentMealPlan, savedPlans]);

  useEffect(() => {
    const fetchList = async () => {
      if (!activePlan || activePlan.length === 0) {
        setList([]);
        return;
      }
      setLoading(true);
      try {
        const data = await generateShoppingList(activePlan);
        setList(data);
      } catch (e) {
        console.error("Erreur liste courses:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [activePlan]);

  const getRetailerUrl = (item: string) => {
    const q = encodeURIComponent(item);
    if (retailer === 'delhaize') return `https://www.delhaize.be/fr-be/search?text=${q}`;
    if (retailer === 'colruyt') return `https://www.collectandgo.be/colruyt/fr/recherche?searchTerm=${q}`;
    if (retailer === 'carrefour') return `https://www.carrefour.be/fr/recherche.html?q=${q}`;
    return '';
  };

  const openSearch = (item: string) => {
    const url = getRetailerUrl(item);
    window.open(url, '_blank');
  };

  const handleNextWithSearch = () => {
    // 1. On ouvre la recherche pour l'article actuel
    openSearch(list[currentIndex].item);

    // 2. On passe au suivant si possible
    if (currentIndex < list.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setViewMode('standard');
      alert("Félicitations ! Votre panier est complet.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
      <p className="font-black text-[10px] uppercase text-emerald-600 tracking-widest">Optimisation de la liste...</p>
    </div>
  );

  return (
    <div className={`min-h-screen transition-all duration-500 ${viewMode === 'assistant' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-6xl mx-auto p-6 lg:p-12">
        
        {/* HEADER & CONFIG */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className={`${viewMode === 'assistant' ? 'opacity-40' : 'opacity-100'} transition-opacity`}>
            <h1 className="text-5xl font-black tracking-tighter mb-2">Ma Liste.</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-slate-100 inline-block">
              {list.length} articles à synchroniser
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Choix de l'Enseigne</label>
              <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                {(['delhaize', 'colruyt', 'carrefour'] as Retailer[]).map(r => (
                  <button 
                    key={r}
                    onClick={() => setRetailer(r)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                      retailer === r ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {r === 'delhaize' ? 'Delhaize' : r === 'colruyt' ? 'Colruyt' : 'Carrefour'}
                  </button>
                ))}
              </div>
            </div>

            {list.length > 0 && viewMode === 'standard' && (
              <button 
                onClick={() => { setViewMode('assistant'); setCurrentIndex(0); }}
                className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
              >
                🚀 Lancer l'Assistance Panier
              </button>
            )}
          </div>
        </div>

        {list.length > 0 ? (
          viewMode === 'assistant' ? (
            <div className="bg-white/5 border border-white/10 rounded-[50px] p-12 md:p-24 text-center animate-in zoom-in duration-500 shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-700 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                  style={{ width: `${((currentIndex + 1) / list.length) * 100}%` }}
                ></div>
              </div>
              
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-center gap-4 mb-10">
                  <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                    {retailer.toUpperCase()} MODE
                  </span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    ARTICLE {currentIndex + 1} / {list.length}
                  </span>
                </div>

                <h2 className="text-6xl md:text-8xl font-black mt-4 mb-6 leading-tight tracking-tighter">{list[currentIndex].item}</h2>
                <p className="text-3xl font-bold text-slate-400 mb-16">Besoin : <span className="text-white underline decoration-emerald-500 decoration-4 underline-offset-8">{list[currentIndex].amount}</span></p>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <button 
                      disabled={currentIndex === 0}
                      onClick={() => setCurrentIndex(currentIndex - 1)}
                      className="w-20 py-6 bg-white/5 text-white font-bold rounded-[30px] border border-white/10 disabled:opacity-20 transition-all hover:bg-white/10"
                    >
                      ←
                    </button>
                    <button 
                      onClick={handleNextWithSearch}
                      className={`flex-grow py-8 rounded-[30px] font-black text-xl uppercase tracking-widest shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 ${
                        retailer === 'delhaize' ? 'bg-red-600 shadow-red-600/20' : 
                        retailer === 'colruyt' ? 'bg-orange-600 shadow-orange-600/20' : 
                        'bg-blue-600 shadow-blue-600/20'
                      }`}
                    >
                      <span>🔍 Rechercher & Suivant</span>
                      <span className="text-white/40">→</span>
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center pt-10">
                    <button onClick={() => setViewMode('standard')} className="text-[11px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors">Abandonner la synchronisation</button>
                    <p className="text-[10px] font-bold text-slate-500 italic">L'onglet {retailer} s'ouvre à chaque clic.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {list.map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-emerald-500 transition-all shadow-sm">
                  <div>
                    <p className="text-[13px] font-black text-slate-800 leading-tight mb-1">{item.item}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{item.amount}</p>
                  </div>
                  <button 
                    onClick={() => openSearch(item.item)}
                    className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-600 flex items-center justify-center transition-all border border-transparent group-hover:border-emerald-100"
                    title={`Chercher sur ${retailer}`}
                  >
                    <span className="text-lg">🛒</span>
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-32 bg-white rounded-[60px] border-4 border-dashed border-slate-100">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">👜</div>
            <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Votre liste est vide.</h3>
            <p className="text-slate-400 text-sm mt-2 font-medium">Générez un menu dans le planning pour commencer vos achats.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;
