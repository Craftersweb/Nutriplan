
import React from 'react';
import { useApp } from '../App';

const HowItWorks: React.FC = () => {
  const { setView } = useApp();

  return (
    <div className="bg-white min-h-screen">
      {/* Article Header */}
      <header className="relative pt-24 pb-16 px-6 bg-slate-50 border-b border-slate-100 overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-lg">Innovation</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temps de lecture : 4 min</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.9]">
            La science derrière <br /> <span className="text-emerald-600 italic">Nutriplan.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
            Découvrez comment l'intelligence artificielle Gemini révolutionne la planification alimentaire pour des milliers de foyers.
          </p>
        </div>
        {/* Decor */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-600/5 skew-x-12 transform translate-x-1/2"></div>
      </header>

      {/* Main Blog Content */}
      <article className="max-w-3xl mx-auto py-20 px-6">
        <section className="prose prose-slate prose-lg lg:prose-xl">
          <h2 className="text-3xl font-black text-slate-900 mb-6">1. L'IA au service de votre palais</h2>
          <p className="text-slate-600 leading-relaxed mb-8">
            Contrairement aux applications classiques qui se contentent de piocher dans une base de données fixe, 
            <strong> Nutriplan utilise Gemini 3 Pro</strong> pour créer des recettes en temps réel. Pourquoi est-ce important ? 
            Parce que vos besoins changent. Une semaine vous pouvez avoir besoin de plus d'énergie pour le sport, 
            et la suivante, vous souhaitez réduire votre budget.
          </p>
          
          <div className="my-12 p-8 bg-slate-50 rounded-[40px] border border-slate-100">
            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-4">Le saviez-vous ?</h4>
            <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
              "L'IA est capable de calculer l'empreinte carbone et le coût moyen de chaque ingrédient pour optimiser non seulement votre santé, mais aussi votre portefeuille."
            </p>
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-6">2. Une synchronisation locale et humaine</h2>
          <p className="text-slate-600 leading-relaxed mb-8">
            La plus grande frustration de la planification est le passage au supermarché. Nutriplan résout cela avec son 
            <strong> Assistant de Synchronisation Interactive</strong>. Au lieu d'un simple fichier PDF, nous ouvrons 
            directement les pages produits de Delhaize ou Colruyt pour vous.
          </p>
          
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200" 
            className="w-full h-80 object-cover rounded-[48px] my-12 shadow-2xl" 
            alt="Shopping Efficiency" 
          />

          <h2 className="text-3xl font-black text-slate-900 mb-6">3. Fini le gaspillage alimentaire</h2>
          <p className="text-slate-600 leading-relaxed mb-10">
            En planifiant vos repas, vous n'achetez que ce dont vous avez besoin. Les utilisateurs de Nutriplan 
            rapportent une réduction moyenne de <strong>30% de leur gaspillage alimentaire</strong> dès le premier mois. 
            C'est bon pour la planète, et excellent pour votre épargne.
          </p>
        </section>

        {/* Actionable Steps Card */}
        <div className="mt-20 p-10 bg-slate-950 rounded-[60px] text-white shadow-2xl">
          <h3 className="text-3xl font-black mb-10 text-center tracking-tight">Vos 3 étapes vers la réussite :</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400 font-black text-xl mx-auto mb-6">01</div>
              <h5 className="font-bold mb-2">Profil IA</h5>
              <p className="text-xs text-slate-400">Définissez vos goûts et allergies.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400 font-black text-xl mx-auto mb-6">02</div>
              <h5 className="font-bold mb-2">Génération</h5>
              <p className="text-xs text-slate-400">L'IA compose votre semaine idéale.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400 font-black text-xl mx-auto mb-6">03</div>
              <h5 className="font-bold mb-2">Courses</h5>
              <p className="text-xs text-slate-400">Remplissez votre panier en 2 min.</p>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center gap-6">
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Convaincu ?</p>
          <button 
            onClick={() => setView('auth')}
            className="px-12 py-6 bg-emerald-600 text-white font-black rounded-3xl hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 text-lg uppercase tracking-widest active:scale-95"
          >
            Démarrer mon menu gratuit
          </button>
        </div>
      </article>

      {/* Blog Footer */}
      <footer className="py-20 border-t border-slate-100 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-xl">N</div>
            <span className="font-black text-slate-900 tracking-tight">Nutriplan Blog</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2025 Nutriplan International</p>
        </div>
      </footer>
    </div>
  );
};

export default HowItWorks;
