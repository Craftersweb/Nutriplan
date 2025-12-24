
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../App';
import { generateShoppingList } from '../services/gemini';
import { ShoppingListItem } from '../types';

const ShoppingList: React.FC = () => {
  const { currentMealPlan, savedPlans } = useApp();
  const [list, setList] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('current');
  const [viewMode, setViewMode] = useState<'standard' | 'assistant'>('standard');
  const [currentIndex, setCurrentIndex] = useState(0);

  const servings = useMemo(() => {
    if (selectedWeekId === 'current') return localStorage.getItem('nutriplan_last_servings') || '2';
    return savedPlans.find(p => p.id === selectedWeekId)?.servings?.toString() || '2';
  }, [selectedWeekId, savedPlans]);

  const activePlan = useMemo(() => {
    let p = selectedWeekId === 'current' ? currentMealPlan : savedPlans.find(p => p.id === selectedWeekId)?.plan;
    if (!p) return null;
    return p.filter(day => day.meals.breakfast?.isSelected || day.meals.lunch?.isSelected || day.meals.dinner?.isSelected);
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
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [activePlan]);

  const openRetailerSearch = (item: string, retailer: 'delhaize' | 'colruyt' | 'carrefour') => {
    let url = '';
    const q = encodeURIComponent(item);
    if (retailer === 'delhaize') url = `https://www.delhaize.be/fr-be/search?text=${q}`;
    else if (retailer === 'colruyt') url = `https://www.collectandgo.be/colruyt/fr/recherche?searchTerm=${q}`;
    else url = `https://www.carrefour.be/fr/recherche.html?q=${q}`;
    window.open(url, '_blank');
  };

  const nextItem = () => {
    if (currentIndex < list.length - 1) setCurrentIndex(currentIndex + 1);
    else setViewMode('standard');
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-emerald-600">
      <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
      <p className="font-black text-[10px] uppercase tracking-widest">IA Nutriplan optimise vos achats...</p>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 ${viewMode === 'assistant' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-7xl mx-auto p-6 lg:p-12">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tighter">Mon Panier.</h1>
            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
              Pour {servings} personnes • {list.length} articles
            </p>
          </div>

          <div className="flex gap-4">
             <select 
              value={selectedWeekId} onChange={(e) => setSelectedWeekId(e.target.value)}
              className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 shadow-sm"
             >
               <option value="current">Semaine Actuelle</option>
               {savedPlans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
             </select>
             {list.length > 0 && viewMode === 'standard' && (
               <button 
                onClick={() => { setViewMode('assistant'); setCurrentIndex(0); }}
                className="px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-200"
               >
                 Démarrer l'Assistance Panier 🚀
               </button>
             )}
          </div>
        </div>

        {list.length > 0 ? (
          <div className="grid lg:grid-cols-12 gap-10">
            {viewMode === 'assistant' ? (
              <div className="lg:col-span-12">
                <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 md:p-20 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${((currentIndex+1)/list.length)*100}%` }}></div>
                  </div>
                  
                  <div className="mb-12">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Article {currentIndex + 1} / {list.length}</span>
                    <h2 className="text-6xl md:text-8xl font-black mt-6 mb-4">{list[currentIndex].item}</h2>
                    <p className="text-3xl font-bold text-slate-400">Besoin : <span className="text-white">{list[currentIndex].amount}</span></p>
                  </div>

                  <div className="max-w-2xl mx-auto space-y-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">1. Choisir l'enseigne pour ouvrir la recherche :</p>
                    <div className="grid grid-cols-3 gap-4">
                      <button onClick={() => openRetailerSearch(list[currentIndex].item, 'delhaize')} className="py-6 bg-red-600 hover:bg-red-500 text-white font-black rounded-3xl text-xs uppercase tracking-widest transition-all">Delhaize</button>
                      <button onClick={() => openRetailerSearch(list[currentIndex].item, 'colruyt')} className="py-6 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-3xl text-xs uppercase tracking-widest transition-all">Colruyt</button>
                      <button onClick={() => openRetailerSearch(list[currentIndex].item, 'carrefour')} className="py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl text-xs uppercase tracking-widest transition-all">Carrefour</button>
                    </div>
                    
                    <div className="pt-10">
                      <button 
                        onClick={nextItem}
                        className="w-full py-8 bg-white text-slate-900 font-black rounded-[32px] text-xl shadow-2xl hover:bg-slate-100 transition-all"
                      >
                        {currentIndex === list.length - 1 ? 'TERMINER' : 'ARTICLE SUIVANT →'}
                      </button>
                      <button onClick={() => setViewMode('standard')} className="mt-6 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Quitter l'assistance</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {list.map((item, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col group hover:border-emerald-500 transition-all">
                    <div className="mb-6">
                      <p className="text-xs font-black text-slate-800">{item.item}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 italic">{item.amount}</p>
                    </div>
                    <div className="mt-auto grid grid-cols-3 gap-1">
                       <button onClick={() => openRetailerSearch(item.item, 'delhaize')} className="p-2 bg-red-50 text-red-600 rounded-lg text-[8px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">D.</button>
                       <button onClick={() => openRetailerSearch(item.item, 'colruyt')} className="p-2 bg-orange-50 text-orange-600 rounded-lg text-[8px] font-black uppercase hover:bg-orange-600 hover:text-white transition-all">C.</button>
                       <button onClick={() => openRetailerSearch(item.item, 'carrefour')} className="p-2 bg-blue-50 text-blue-600 rounded-lg text-[8px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all">F.</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[60px] border-4 border-dashed border-slate-100">
            <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Panier vide.</h3>
            <p className="text-slate-400 mt-2 font-medium">Générez un menu pour commencer vos achats.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;
