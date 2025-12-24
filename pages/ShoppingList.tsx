
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../App';
import { generateShoppingList } from '../services/gemini';
import { ShoppingListItem, SavedPlan } from '../types';

type Retailer = 'delhaize' | 'colruyt';

const ShoppingList: React.FC = () => {
  const { currentMealPlan, savedPlans } = useApp();
  const [list, setList] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [retailer, setRetailer] = useState<Retailer>(() => {
    return (localStorage.getItem('nutriplan_fav_retailer') as Retailer) || 'delhaize';
  });
  const [viewMode, setViewMode] = useState<'selection' | 'standard' | 'assistant'>('selection');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    localStorage.setItem('nutriplan_fav_retailer', retailer);
  }, [retailer]);

  const activePlanData = useMemo(() => {
    if (!selectedPlanId) return null;
    
    let p;
    if (selectedPlanId === 'current') {
      p = currentMealPlan;
    } else {
      p = savedPlans.find(plan => plan.id === selectedPlanId)?.plan;
    }

    if (!p) return null;

    return p.map(day => ({
      ...day,
      meals: {
        breakfast: day.meals.breakfast.isSelected !== false ? day.meals.breakfast : null as any,
        lunch: day.meals.lunch.isSelected !== false ? day.meals.lunch : null as any,
        dinner: day.meals.dinner.isSelected !== false ? day.meals.dinner : null as any,
      }
    })).filter(day => day.meals.breakfast || day.meals.lunch || day.meals.dinner);
  }, [selectedPlanId, currentMealPlan, savedPlans]);

  useEffect(() => {
    const fetchList = async () => {
      if (!activePlanData || activePlanData.length === 0) {
        setList([]);
        return;
      }
      setLoading(true);
      try {
        const data = await generateShoppingList(activePlanData);
        setList(data);
        setViewMode('standard');
      } catch (e) {
        console.error("Erreur liste courses:", e);
      } finally {
        setLoading(false);
      }
    };
    if (selectedPlanId) fetchList();
  }, [selectedPlanId, activePlanData]);

  const cleanItemForSearch = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\d+\s*(g|kg|ml|l|boîtes|unités|cl|pots|sachets|tranches|cuillères|pincées|verres|tasses|gousses)/g, '')
      .replace(/(cuits|fraîches|frais|bio|découpé|entier|en boîte|nature|naturel|congelé|surgelé|mûres|rouges)/g, '')
      .replace(/\s(de|d'|du|des|un|une)\s/g, ' ')
      .replace(/\d+/g, '')
      .trim()
      .split(',')[0]
      .split('(')[0];
  };

  const getRetailerUrl = (item: string) => {
    const cleaned = cleanItemForSearch(item);
    const q = encodeURIComponent(cleaned).replace(/%20/g, '+');
    if (retailer === 'delhaize') return `https://www.delhaize.be/fr-be/search?text=${q}`;
    if (retailer === 'colruyt') return `https://www.collectandgo.be/colruyt/fr/recherche?searchTerm=${q}`;
    return '';
  };

  const syncSearch = (item: string) => {
    const url = getRetailerUrl(item);
    window.open(url, 'nutriplan_sync');
  };

  const startAssistant = () => {
    if (list.length === 0) return;
    setCurrentIndex(0);
    setViewMode('assistant');
    // Ouverture automatique du premier produit au lancement
    syncSearch(list[0].item);
  };

  const handleNextWithSearch = () => {
    if (currentIndex < list.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      syncSearch(list[nextIdx].item);
    } else {
      setViewMode('standard');
      alert("Félicitations, votre panier est complet !");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
      <p className="font-black text-xs uppercase text-emerald-600 tracking-widest animate-pulse">Analyse des ingrédients...</p>
    </div>
  );

  // VUE 1 : SÉLECTION DU MENU (SEMAINE)
  if (viewMode === 'selection') {
    return (
      <div className="max-w-4xl mx-auto p-6 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-4">Pour quelle semaine ?</h1>
          <p className="text-slate-500 font-medium">Choisissez le menu pour lequel vous souhaitez faire vos courses.</p>
        </header>

        <div className="grid gap-6">
          {currentMealPlan && (
            <button 
              onClick={() => setSelectedPlanId('current')}
              className="group bg-white p-8 rounded-[32px] border-2 border-emerald-100 hover:border-emerald-500 transition-all text-left shadow-sm hover:shadow-xl flex items-center justify-between"
            >
              <div>
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-lg mb-3">Planning Actuel</span>
                <h3 className="text-2xl font-black text-slate-900">Ma semaine en cours</h3>
                <p className="text-slate-400 text-sm mt-1">{currentMealPlan.length} jours configurés</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🛒</div>
            </button>
          )}

          <div className="pt-8 pb-4">
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6">HISTORIQUE DES MENUS</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              {savedPlans.length > 0 ? (
                savedPlans.map(plan => (
                  <button 
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className="p-6 bg-white rounded-3xl border border-slate-100 hover:border-emerald-500 transition-all text-left shadow-sm hover:shadow-md"
                  >
                    <h3 className="text-lg font-black text-slate-800 leading-tight mb-1">{plan.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">{new Date(plan.date).toLocaleDateString()} • {plan.servings} pers.</p>
                  </button>
                ))
              ) : (
                <div className="sm:col-span-2 p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] text-center">
                  <p className="text-slate-400 text-sm font-bold">Aucun menu sauvegardé disponible.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VUE 2 : LISTE STANDARD OU ASSISTANT
  return (
    <div className={`min-h-screen transition-all duration-500 ${viewMode === 'assistant' ? 'bg-slate-950 text-white overflow-hidden' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-6xl mx-auto p-4 md:p-8 lg:p-12">
        
        {/* Header Navigation */}
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 ${viewMode === 'assistant' ? 'hidden md:flex opacity-20' : ''}`}>
          <div>
            <button 
              onClick={() => setViewMode('selection')}
              className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2 hover:translate-x-[-4px] transition-transform"
            >
              ← Changer de semaine
            </button>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">Ma Liste.</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white shadow-sm px-3 py-1 rounded-full border border-slate-100 inline-block">
              {list.length} articles consolidés
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 w-full sm:w-auto">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Enseigne choisie</label>
              <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                {(['delhaize', 'colruyt'] as Retailer[]).map(r => (
                  <button 
                    key={r}
                    onClick={() => setRetailer(r)}
                    className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                      retailer === r ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {list.length > 0 && viewMode === 'standard' && (
              <button 
                onClick={startAssistant}
                className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
              >
                🚀 Lancer l'Assistant
              </button>
            )}
          </div>
        </div>

        {list.length > 0 ? (
          viewMode === 'assistant' ? (
            <div className="flex flex-col h-[calc(100vh-140px)] md:h-auto justify-center animate-in zoom-in duration-500">
              
              <div className="mb-6 md:mb-10 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-center gap-3">
                <span className="text-xl">💡</span>
                <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-emerald-400 text-center">
                  PC : Mettez Nutriplan et {retailer} en <span className="text-white underline underline-offset-4 decoration-2">Split Screen</span> (côte à côte) !
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[40px] md:rounded-[60px] p-6 md:p-16 lg:p-24 text-center shadow-2xl relative flex flex-col justify-center min-h-[50vh]">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5 overflow-hidden rounded-t-[40px] md:rounded-t-[60px]">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-700 shadow-[0_0_20px_rgba(16,185,129,0.5)]" 
                    style={{ width: `${((currentIndex + 1) / list.length) * 100}%` }}
                  ></div>
                </div>
                
                <div className="max-w-3xl mx-auto w-full">
                  <div className="mb-6 md:mb-10">
                    <span className="px-3 py-1 md:px-4 md:py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                      SYNC : {retailer.toUpperCase()}
                    </span>
                    <div className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      ARTICLE {currentIndex + 1} SUR {list.length}
                    </div>
                  </div>

                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 leading-tight tracking-tighter break-words px-2">
                    {list[currentIndex].item}
                  </h2>
                  <p className="text-xl md:text-3xl font-bold text-slate-400 mb-10 md:mb-16 italic">
                    Besoin : <span className="text-white not-italic">{list[currentIndex].amount}</span>
                  </p>
                  
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        disabled={currentIndex === 0}
                        onClick={() => {
                          const prevIdx = currentIndex - 1;
                          setCurrentIndex(prevIdx);
                          syncSearch(list[prevIdx].item);
                        }}
                        className="order-2 sm:order-1 flex-1 py-5 md:py-8 bg-white/5 text-white font-black rounded-[24px] md:rounded-[30px] border border-white/10 disabled:opacity-20 hover:bg-white/10 transition-all uppercase text-[10px] tracking-widest"
                      >
                        Précédent
                      </button>
                      <button 
                        onClick={handleNextWithSearch}
                        className={`order-1 sm:order-2 flex-[2] py-6 md:py-8 rounded-[24px] md:rounded-[30px] font-black text-lg md:text-xl uppercase tracking-widest shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-4 ${
                          retailer === 'delhaize' ? 'bg-red-600 hover:bg-red-500' : 'bg-orange-600 hover:bg-orange-500'
                        }`}
                      >
                        <span>{currentIndex === list.length - 1 ? 'Terminer' : 'Suivant'}</span>
                        <span className="opacity-40">→</span>
                      </button>
                    </div>
                    
                    <div className="pt-6 md:pt-10 flex flex-col items-center gap-4">
                      <p className="text-[9px] md:text-[10px] text-slate-500 font-medium px-4">L'onglet de votre magasin reste ouvert et se met à jour.</p>
                      <button onClick={() => setViewMode('standard')} className="text-[10px] md:text-[11px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors py-2">Quitter l'assistance</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-in fade-in duration-500">
              {list.map((item, idx) => (
                <div key={idx} className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-emerald-500 transition-all shadow-sm">
                  <div className="pr-4">
                    <p className="text-[13px] md:text-[14px] font-black text-slate-800 leading-tight mb-1">{item.item}</p>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.amount}</p>
                  </div>
                  <button 
                    onClick={() => syncSearch(item.item)}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-50 text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-600 flex items-center justify-center transition-all border border-transparent group-hover:border-emerald-100 shrink-0"
                  >
                    🛒
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-20 md:py-32 bg-white rounded-[40px] md:rounded-[60px] border-4 border-dashed border-slate-100">
            <h3 className="text-xl md:text-2xl font-black text-slate-300 uppercase tracking-widest">Aucun aliment trouvé.</h3>
            <p className="text-slate-400 text-sm mt-2 font-medium px-6">Assurez-vous d'avoir sélectionné des repas dans votre planning.</p>
            <button onClick={() => setViewMode('selection')} className="mt-8 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs">Retour au choix</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;
