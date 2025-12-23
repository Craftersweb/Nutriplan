
import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { generateShoppingList } from '../services/gemini';
import { ShoppingListItem } from '../types';

const ShoppingList: React.FC = () => {
  const { currentMealPlan } = useApp();
  const [list, setList] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncIndex, setSyncIndex] = useState(0);
  const [supermarket, setSupermarket] = useState<'delhaize' | 'colruyt' | 'ah'>('delhaize');

  useEffect(() => {
    const fetchList = async () => {
      if (!currentMealPlan || currentMealPlan.length === 0) {
        setList([]);
        return;
      }
      setLoading(true);
      try {
        const data = await generateShoppingList(currentMealPlan);
        setList(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [currentMealPlan]);

  const itemsToExport = list.filter(i => !i.checked);

  const handleStartSync = () => {
    if (itemsToExport.length === 0) {
      alert("Votre liste est prête !");
      return;
    }
    setIsSyncing(true);
    setSyncIndex(0);
  };

  const openDelhaizeAction = (item: string) => {
    // URL de recherche Delhaize.be pour l'article spécifique
    const searchUrl = `https://www.delhaize.be/fr-be/search?text=${encodeURIComponent(item)}`;
    window.open(searchUrl, '_blank');
    
    // On avance doucement dans la liste
    if (syncIndex < itemsToExport.length - 1) {
      setTimeout(() => setSyncIndex(prev => prev + 1), 500);
    } else {
      setTimeout(() => {
        setIsSyncing(false);
        window.open('https://www.delhaize.be/checkout', '_blank');
      }, 1000);
    }
  };

  const toggleItem = (index: number) => {
    setList(prev => prev.map((item, i) => i === index ? { ...item, checked: !item.checked } : item));
  };

  const categories = Array.from(new Set(list.map(item => item.category)));

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium text-sm">Préparation de votre liste...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto relative">
      {/* ASSISTANT DE SYNCHRONISATION DOUX & ÉLÉGANT */}
      {isSyncing && (
        <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-xl flex items-center justify-center p-4 transition-all duration-500">
          <div className="max-w-xl w-full bg-white rounded-[48px] p-10 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white relative overflow-hidden">
            {/* Décoration douce */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-40"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-50 rounded-full -ml-24 -mb-24 blur-3xl opacity-30"></div>
            
            <div className="text-center mb-12 relative">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[30px] flex items-center justify-center text-4xl mx-auto mb-8 shadow-sm">🌿</div>
              <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Assistant Panier Delhaize</h2>
              <p className="text-slate-500 font-medium px-4">Nous transférons vos articles vers votre panier Delhaize en douceur.</p>
            </div>

            <div className="bg-slate-50/50 rounded-[40px] p-10 mb-10 border border-slate-100 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-30"></div>
              
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-4">Article {syncIndex + 1} sur {itemsToExport.length}</p>
              
              <div className="mb-8">
                <h3 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">
                  {itemsToExport[syncIndex]?.item}
                </h3>
                <span className="text-xs font-bold text-slate-400 bg-white px-4 py-1.5 rounded-full border border-slate-100">
                  {itemsToExport[syncIndex]?.amount}
                </span>
              </div>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => openDelhaizeAction(itemsToExport[syncIndex]?.item)}
                  className="w-full py-6 bg-emerald-600 text-white font-black rounded-3xl hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-4 active:scale-95 group"
                >
                  <span className="text-2xl group-hover:scale-125 transition-transform">🛒</span> 
                  AJOUTER AU PANIER
                </button>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic px-6">
                  Nutriplan injecte l'article dans la recherche Delhaize. Vérifiez et cliquez sur l'icône panier de Delhaize, puis revenez ici pour le suivant.
                </p>
              </div>
            </div>

            <div className="space-y-4 px-4">
               <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progression globale</span>
                 <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{Math.round(((syncIndex) / itemsToExport.length) * 100)}%</span>
               </div>
               <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${((syncIndex) / itemsToExport.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-12 flex justify-center">
              <button 
                onClick={() => setIsSyncing(false)}
                className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] hover:text-red-400 transition-colors"
              >
                Fermer l'assistant
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Votre Liste</h1>
          <p className="text-slate-500 font-medium text-sm">Organisée par rayon pour gagner du temps.</p>
        </div>
        
        <div className="flex bg-slate-200/50 p-1.5 rounded-2xl border border-slate-200/40">
          {(['delhaize', 'colruyt', 'ah'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSupermarket(s)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
                supermarket === s ? 'bg-white text-emerald-600 shadow-md ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-10">
        {categories.length > 0 ? categories.map(cat => (
          <div key={cat} className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
            <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] mb-8 border-b border-slate-50 pb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {cat}
            </h3>
            <div className="space-y-5">
              {list.filter(i => i.category === cat).map((item, idx) => {
                const globalIndex = list.findIndex(li => li === item);
                return (
                  <div 
                    key={idx} 
                    className="flex items-center gap-8 group cursor-pointer"
                    onClick={() => toggleItem(globalIndex)}
                  >
                    <div className={`w-8 h-8 rounded-[12px] border-2 flex items-center justify-center transition-all duration-300 ${
                      item.checked ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-100' : 'border-slate-100 group-hover:border-emerald-300'
                    }`}>
                      {item.checked && <span className="text-white font-black text-sm">✓</span>}
                    </div>
                    <div className="flex-grow flex justify-between items-center">
                      <span className={`text-slate-700 font-black text-lg tracking-tight transition-all ${item.checked ? 'line-through text-slate-300' : 'group-hover:text-emerald-600'}`}>
                        {item.item}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">{item.amount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )) : (
          <div className="p-24 text-center bg-white rounded-[60px] border-4 border-dashed border-slate-100">
            <div className="text-8xl mb-8 opacity-10">🍱</div>
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-sm">Générez un menu pour voir vos courses</p>
          </div>
        )}
      </div>

      {list.length > 0 && (
        <div className="mt-20 flex flex-col sm:flex-row gap-5 sticky bottom-10 z-20">
          {supermarket === 'delhaize' ? (
            <button 
              onClick={handleStartSync}
              className="flex-grow py-7 bg-emerald-600 text-white font-black rounded-[32px] hover:bg-emerald-700 shadow-2xl shadow-emerald-200 flex items-center justify-center gap-5 transition-all active:scale-95 group"
            >
              <span className="text-2xl group-hover:rotate-12 transition-transform">🛍️</span> SYNCHRONISER AVEC DELHAIZE.BE
            </button>
          ) : (
            <button 
              disabled
              className="flex-grow py-7 bg-slate-100 text-slate-300 font-black rounded-[32px] cursor-not-allowed uppercase tracking-widest text-[11px]"
            >
              Support {supermarket.toUpperCase()} à venir
            </button>
          )}
          <button className="px-12 py-7 bg-white border border-slate-200 text-slate-700 font-black rounded-[32px] hover:bg-slate-50 transition-all shadow-md uppercase tracking-widest text-xs">
            Imprimer
          </button>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
