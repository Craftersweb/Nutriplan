
import React, { useState } from 'react';
// Fix: useApp is the exported hook from App.tsx, not useAuth
import { useApp } from '../App';
import { DietPreference } from '../types';

const Preferences: React.FC = () => {
  // Fix: use useApp() to access authState and updateUser
  const { authState, updateUser } = useApp();
  const [diet, setDiet] = useState<DietPreference>(authState.user?.diet || DietPreference.OMNIVORE);
  const [allergyInput, setAllergyInput] = useState('');
  const [allergies, setAllergies] = useState<string[]>(authState.user?.allergies || []);

  const addAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (allergyInput && !allergies.includes(allergyInput)) {
      const newAllergies = [...allergies, allergyInput];
      setAllergies(newAllergies);
      setAllergyInput('');
    }
  };

  const removeAllergy = (val: string) => {
    setAllergies(allergies.filter(a => a !== val));
  };

  const handleSave = () => {
    updateUser({ diet, allergies });
    alert("Profil mis à jour !");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Préférences Alimentaires</h1>
      <p className="text-slate-500 mb-10">Dites-nous ce que vous aimez pour des menus sur-mesure.</p>

      <div className="space-y-12">
        {/* Diet Selection */}
        <section>
          <h3 className="text-lg font-bold text-slate-800 mb-6">Type de régime</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Object.values(DietPreference).map(pref => (
              <button
                key={pref}
                onClick={() => setDiet(pref)}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${
                  diet === pref 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-50' 
                    : 'border-slate-100 bg-white text-slate-500 hover:border-emerald-200'
                }`}
              >
                <span className="text-2xl">{getEmojiForDiet(pref)}</span>
                <span className="text-sm font-bold">{pref}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Allergies */}
        <section>
          <h3 className="text-lg font-bold text-slate-800 mb-4">Allergies & Restrictions</h3>
          <form onSubmit={addAllergy} className="flex gap-4 mb-6">
            <input 
              type="text" 
              className="flex-grow px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ex: Arachides, Gluten, Lactose..."
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
            />
            <button 
              type="submit"
              className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all"
            >
              Ajouter
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {allergies.map(a => (
              <span key={a} className="pl-4 pr-2 py-2 bg-slate-100 text-slate-700 font-bold rounded-full flex items-center gap-2">
                {a}
                <button 
                  onClick={() => removeAllergy(a)}
                  className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs hover:bg-red-200 hover:text-red-700 transition-all"
                >
                  ✕
                </button>
              </span>
            ))}
            {allergies.length === 0 && <p className="text-sm text-slate-400 italic">Aucune restriction ajoutée.</p>}
          </div>
        </section>

        <div className="pt-8">
          <button 
            onClick={handleSave}
            className="w-full py-5 bg-emerald-600 text-white font-bold rounded-3xl hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all"
          >
            Sauvegarder les préférences
          </button>
        </div>
      </div>
    </div>
  );
};

const getEmojiForDiet = (pref: DietPreference) => {
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

export default Preferences;
