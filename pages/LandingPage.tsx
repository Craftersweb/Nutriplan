
import React from 'react';

const LandingPage: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6">
              Mangez mieux, <br /> 
              <span className="text-emerald-600">sans effort.</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-xl">
              Nutriplan crée vos menus personnalisés pour la semaine et génère votre liste de courses pour vos supermarchés préférés. Gagnez du temps et restez en bonne santé.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={onGetStarted}
                className="px-8 py-4 bg-emerald-600 text-white font-semibold rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
              >
                Démarrer gratuitement
              </button>
              <button className="px-8 py-4 bg-white border border-slate-200 text-slate-900 font-semibold rounded-2xl hover:bg-slate-50 transition-all">
                Comment ça marche ?
              </button>
            </div>
            
            <div className="mt-12 flex items-center gap-4 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <img key={i} src={`https://picsum.photos/seed/${i+10}/40/40`} className="w-10 h-10 rounded-full border-2 border-white" alt="User" />
                ))}
              </div>
              <p className="text-sm text-slate-500">
                <span className="font-bold text-slate-900">+5000</span> utilisateurs belges nous font confiance.
              </p>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
            <img 
              src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800" 
              className="relative z-10 w-full rounded-[40px] shadow-2xl border-8 border-white" 
              alt="App Mockup" 
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Fonctionnalités Clés</h2>
            <p className="text-slate-500">Tout ce dont vous avez besoin pour maîtriser votre alimentation.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="🥗"
              title="Menu Personnalisé"
              description="Des menus adaptés à votre régime (Keto, Vegan, etc.) générés par IA."
            />
            <FeatureCard 
              icon="🛒"
              title="Liste de Courses"
              description="Exportez votre liste vers Delhaize, Colruyt ou Albert Heijn en un clic."
            />
            <FeatureCard 
              icon="⏱️"
              title="Gain de Temps"
              description="Ne passez plus des heures à chercher quoi manger ou à faire vos courses."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
  <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;
