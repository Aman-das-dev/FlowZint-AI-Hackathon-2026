import React from 'react';
import { ArrowRight, Leaf, ShieldAlert, Award, Compass, Truck, BarChart3, Users } from 'lucide-react';

interface LandingPageProps {
  onStartApp: () => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartApp, onOpenAuth }) => {
  return (
    <div className="relative min-h-screen bg-[#070b13] overflow-hidden text-gray-200">
      
      {/* Ambient Bubbles Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="bubble" style={{ width: '40px', height: '40px', left: '8%', animationDelay: '0s', animationDuration: '14s' }}></div>
        <div className="bubble" style={{ width: '60px', height: '60px', left: '22%', animationDelay: '3s', animationDuration: '18s' }}></div>
        <div className="bubble" style={{ width: '30px', height: '30px', left: '42%', animationDelay: '1s', animationDuration: '12s' }}></div>
        <div className="bubble" style={{ width: '50px', height: '50px', left: '58%', animationDelay: '5s', animationDuration: '16s' }}></div>
        <div className="bubble" style={{ width: '45px', height: '45px', left: '72%', animationDelay: '2s', animationDuration: '15s' }}></div>
        <div className="bubble" style={{ width: '70px', height: '70px', left: '88%', animationDelay: '7s', animationDuration: '20s' }}></div>
        <div className="bubble" style={{ width: '35px', height: '35px', left: '12%', animationDelay: '9s', animationDuration: '13s' }}></div>
        <div className="bubble" style={{ width: '55px', height: '55px', left: '82%', animationDelay: '11s', animationDuration: '17s' }}></div>
      </div>

      {/* Background Neon Orbs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-1/3 right-1/10 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[150px] animate-pulse-slow"></div>

      {/* Header / Navbar */}
      <header className="relative z-10 w-full px-8 lg:px-20 py-5 flex justify-between items-center animate-fade-in-up">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Leaf size={22} className="text-black font-extrabold" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-mono">
            ECOTRACK<span className="text-emerald-400">.AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onOpenAuth}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-semibold hover:bg-white/5 transition-all cursor-pointer animate-quantum"
          >
            Sign In
          </button>
          <button 
            onClick={onStartApp}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-semibold text-sm transition-all cursor-pointer shadow-lg shadow-emerald-500/15 animate-quantum"
          >
            Launch Portal
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 w-full px-8 lg:px-20 pt-16 pb-24 grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Hero Text */}
        <div className="lg:col-span-7 space-y-6 animate-fade-in-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
            <span>🌱</span> Hackathon AI Winner Proposal
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Recycle Smarter with <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">AI Intelligence</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-xl font-light leading-relaxed">
            Scan e-waste instantly, calculate recycling reward values, locate certified local centers, schedule driver pickups, and track your carbon savings index.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={onStartApp}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold flex items-center gap-2.5 transition-all shadow-xl shadow-emerald-500/20 group cursor-pointer animate-quantum"
            >
              Start Recycling Now
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onOpenAuth}
              className="px-8 py-4 rounded-xl border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-white font-semibold transition-all cursor-pointer animate-quantum"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Hero Visual - Animated Earth & Neon Rings */}
        <div className="lg:col-span-5 flex justify-center relative animate-fade-in-right">
          <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center animate-levitate">
            
            {/* Spinning Neon Rings */}
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" style={{ animationDuration: '10s' }}></div>
            <div className="absolute inset-6 rounded-full border border-teal-500/15 border-b-teal-400 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
            <div className="absolute inset-12 rounded-full border-2 border-dashed border-cyan-500/10 animate-pulse"></div>

            {/* Earth Core Graphic */}
            <div className="w-56 h-56 md:w-64 md:h-64 rounded-full bg-gradient-to-tr from-emerald-900 via-teal-950 to-blue-950 border border-emerald-500/30 shadow-2xl shadow-emerald-500/20 flex items-center justify-center overflow-hidden animate-anti-grav">
              <svg className="w-full h-full opacity-60 text-emerald-400" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.8">
                {/* Simulated continents */}
                <path d="M 20 50 Q 25 35 40 40 T 60 30 T 80 40 T 70 65 T 50 60 T 30 75 Z" fill="currentColor" fillOpacity="0.05" />
                <path d="M 30 20 Q 45 10 50 25 T 75 15" />
                <path d="M 10 40 Q 20 30 25 45" />
                <path d="M 45 75 Q 60 85 70 70 T 85 85" fill="currentColor" fillOpacity="0.05" />
                
                {/* Latitude/Longitude lines */}
                <circle cx="50" cy="50" r="49" strokeDasharray="3 3" opacity="0.3" />
                <line x1="50" y1="1" x2="50" y2="99" strokeDasharray="2 2" opacity="0.3" />
                <line x1="1" y1="50" x2="99" y2="50" strokeDasharray="2 2" opacity="0.3" />
              </svg>
            </div>

            {/* Floating Devices */}
            <div className="absolute top-8 left-8 p-3 rounded-2xl glass-panel border border-emerald-500/30 text-emerald-400 animate-zero-g">
              📱
            </div>
            <div className="absolute bottom-10 right-4 p-3 rounded-2xl glass-panel border border-teal-500/30 text-teal-400 animate-weightless">
              💻
            </div>
            <div className="absolute top-1/2 -right-6 p-2 rounded-2xl glass-panel border border-cyan-500/30 text-cyan-400 animate-float-up">
              🔋
            </div>
          </div>
        </div>

      </section>

      {/* Statistics Section */}
      <section className="relative z-10 py-16 bg-black/40 border-y border-white/5">
        <div className="w-full px-8 lg:px-20 grid md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2 p-6 rounded-2xl glass-panel animate-float-up hover:scale-105 hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <h3 className="text-4xl md:text-5xl font-extrabold text-emerald-400">62.0M</h3>
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">Metric Tonnes E-Waste Annually</p>
            <p className="text-xs text-gray-500">According to the UN Global E-waste Monitor (2024)</p>
          </div>
          <div className="space-y-2 p-6 rounded-2xl glass-panel animate-float-up hover:scale-105 hover:border-teal-500/20 hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-300" style={{ animationDelay: '250ms', animationFillMode: 'both' }}>
            <h3 className="text-4xl md:text-5xl font-extrabold text-teal-400">22.3%</h3>
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">Globally Recycled Rate</p>
            <p className="text-xs text-gray-500">Over 77% ends up in landfills or toxic dumping pits</p>
          </div>
          <div className="space-y-2 p-6 rounded-2xl glass-panel animate-float-up hover:scale-105 hover:border-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
            <h3 className="text-4xl md:text-5xl font-extrabold text-cyan-400">$62B</h3>
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">Precious Metal Value Discarded</p>
            <p className="text-xs text-gray-500">Equivalent to billions of dollars of gold, silver, & copper lost</p>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="relative z-10 w-full px-8 lg:px-20 py-24 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4 animate-float-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Full-Suite Circular Economy Platform</h2>
          <p className="text-gray-400">EcoTrack AI integrates cutting-edge computer vision and maps to transform electronic disposal.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="glass-panel p-8 rounded-2xl hover:border-emerald-500/30 hover:-translate-y-1.5 transition-all duration-300 group animate-orbit-in animate-quantum" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI Vision Scanner</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Upload or snap a device image. The AI classifies the model, flags hazardous components, and calculates its life expectancy.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl hover:border-teal-500/30 hover:-translate-y-1.5 transition-all duration-300 group animate-orbit-in animate-quantum" style={{ animationDelay: '250ms', animationFillMode: 'both' }}>
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
              <Compass size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Certified Recycler Maps</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Locate authorized recycling, refurbishing, and collection centers on an interactive map. Direct route navigation lines included.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl hover:border-cyan-500/30 hover:-translate-y-1.5 transition-all duration-300 group animate-orbit-in animate-quantum" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
              <Truck size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Smart Pickups</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Schedule doorstep pickups with certified drivers. Track status in real-time from Pending to Completed.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl hover:border-emerald-500/30 hover:-translate-y-1.5 transition-all duration-300 group animate-orbit-in animate-quantum" style={{ animationDelay: '550ms', animationFillMode: 'both' }}>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Environmental Index</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Visualize carbon footprints offset, equivalent trees planted, and water volumes preserved using live charts.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl hover:border-teal-500/30 hover:-translate-y-1.5 transition-all duration-300 group animate-orbit-in animate-quantum" style={{ animationDelay: '700ms', animationFillMode: 'both' }}>
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
              <Award size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Gamified Rewards</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Earn EcoPoints for recycling. Level up, secure achievement badges, and climb the public leaderboard.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl hover:border-cyan-500/30 hover:-translate-y-1.5 transition-all duration-300 group animate-orbit-in animate-quantum" style={{ animationDelay: '850ms', animationFillMode: 'both' }}>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Interactive Chat Assistant</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Consult the AI Eco-Assistant to handle battery safety, secure disk wipes, and understand the recycling pipeline.
            </p>
          </div>

        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 w-[calc(100%-4rem)] lg:w-[calc(100%-10rem)] mx-auto px-6 py-16 bg-[#0c1220] rounded-3xl border border-white/5 p-12 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
        <h2 className="text-3xl font-bold text-white text-center mb-12">User Success Testimonials</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-gray-300 italic">
              "EcoTrack AI completely demystified the recycling process for my old company laptops. In 10 minutes we scheduled a certified pickup, tracked the driver, and logged our ESG carbon impact credits."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-black">
                AM
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Amanda Myers</h4>
                <p className="text-xs text-gray-500">Sustainability Coordinator, TechGlobal</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-gray-300 italic">
              "I love the gamified achievements. I scanned three old phones and an old keyboard, earned 250 EcoPoints, and won my 'Green Recruit' and 'First Scan' badges. Very encouraging interface!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center font-bold text-black">
                DL
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">David Lin</h4>
                <p className="text-xs text-gray-500">University Student & Tech Enthusiast</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full px-8 lg:px-20 py-12 flex flex-col md:flex-row justify-between items-center gap-6 mt-12 border-t border-white/5">
        <p className="text-xs text-gray-500">© 2026 EcoTrack AI Inc. All rights reserved. Supporting R2v3 and e-Stewards standards.</p>
        <div className="flex gap-6 text-xs text-gray-400">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">ESG Reporting</a>
        </div>
      </footer>

    </div>
  );
};
