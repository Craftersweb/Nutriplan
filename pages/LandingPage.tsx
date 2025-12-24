
import React from 'react';

interface LandingProps {
  onGetStarted: () => void;
  onHowItWorks: () => void;
}

const LandingPage: React.FC<LandingProps> = ({ onGetStarted, onHowItWorks }) => {
  return (
    <div className="overflow-hidden bg-slate-50">
      {/* Hero Section */}
      <section className="relative pt-12 lg:pt-24 pb-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Propulsé par Gemini 3 Pro</span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-8">
              Mangez mieux, <br /> 
              <span className="text-emerald-600">sans effort.</span>
            </h1>
            <p className="text-xl text-slate-500 mb-12 max-w-xl font-medium leading-relaxed">
              L'assistant de nutrition intelligent qui compose vos repas et prépare votre panier de courses chez Delhaize ou Colruyt.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              <button 
                onClick={onGetStarted}
                className="px-12 py-6 bg-emerald-600 text-white font-black rounded-[28px] hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 text-lg uppercase tracking-widest active:scale-95"
              >
                C'est parti
              </button>
              <button 
                onClick={onHowItWorks}
                className="px-12 py-6 bg-white border-2 border-slate-100 text-slate-900 font-black rounded-[28px] hover:bg-slate-50 transition-all text-lg uppercase tracking-widest shadow-xl shadow-slate-100/50"
              >
                Le Blog
              </button>
            </div>
            
            <div className="mt-16 flex items-center gap-6 justify-center lg:justify-start">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <img key={i} src={`https://picsum.photos/seed/${i+100}/80/80`} className="w-12 h-12 rounded-full border-4 border-white shadow-lg" alt="User" />
                ))}
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                <span className="text-slate-900">+12,000</span> foyers optimisés
              </p>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-100 rounded-full blur-[120px] opacity-40"></div>
            <div className="relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1200" 
                className="w-full rounded-[60px] shadow-2xl border-[16px] border-white transform rotate-3 hover:rotate-0 transition-all duration-700" 
                alt="Plat Healthy" 
              />
              {/* Floating Badge */}
              <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-[32px] shadow-2xl border border-slate-100 animate-bounce duration-[3000ms]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl">🥑</div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score Nutrition</p>
                    <p className="text-xl font-black text-slate-900 tracking-tighter">98/100</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-4">Pourquoi choisir Nutriplan ?</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em]">Trois piliers pour votre réussite</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard 
              icon="🧠"
              title="Intelligence Artificielle"
              description="Chaque menu est unique et s'adapte à votre stock et vos envies du moment."
            />
            <FeatureCard 
              icon="🛍️"
              title="Sync Supermarché"
              description="Oubliez la saisie manuelle. Votre panier Delhaize ou Colruyt se remplit en 2 clics."
            />
            <FeatureCard 
              icon="📊"
              title="Budget & Santé"
              description="Réduisez vos factures de 25% en évitant les achats impulsifs et le gaspillage."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
  <div className="p-12 rounded-[48px] bg-slate-50 border border-slate-100 hover:shadow-2xl hover:bg-white transition-all group">
    <div className="text-5xl mb-8 transform group-hover:scale-110 group-hover:-rotate-6 transition-transform">{icon}</div>
    <h3 className="text-2xl font-black mb-4 text-slate-900 tracking-tight">{title}</h3>
    <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;
