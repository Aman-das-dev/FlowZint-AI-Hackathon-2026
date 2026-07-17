import React, { useEffect, useState } from 'react';
import { api, type DashboardStats } from '../services/api';
import { Leaf, Droplets, ShieldAlert, Award, Calendar, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

// Theme colors matching dark eco-cyberpunk style
const COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

export const ImpactDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="rounded-2xl border border-white/5 bg-black/20 p-24 text-center text-gray-500">
        <span className="text-emerald-400 font-semibold animate-pulse">Loading environmental analytics...</span>
      </div>
    );
  }

  const { metrics, device_categories, historical_analytics } = stats;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <BarChart3 className="text-emerald-400" /> Environmental Impact Ledger
        </h2>
        <p className="text-gray-400 mt-1">Audit active carbon footprint offsets, resources conservation indexes, and historical recycling volume trends.</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        
        <div className="p-5 rounded-2xl glass-panel border-white/5 flex flex-col justify-between hover:border-emerald-500/30 hover:scale-105 transition-all duration-300 shadow-lg animate-holo-warp animate-electro-hover" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 animate-magnetic-tilt">
            <Leaf size={20} />
          </div>
          <div className="mt-4 space-y-1">
            <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">CO₂ Saved</span>
            <span className="text-2xl font-extrabold text-white">{metrics.carbon_saved.toLocaleString()} kg</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-white/5 flex flex-col justify-between hover:border-teal-500/30 hover:scale-105 transition-all duration-300 shadow-lg animate-holo-warp animate-electro-hover" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 animate-magnetic-tilt">
            <Droplets size={20} />
          </div>
          <div className="mt-4 space-y-1">
            <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Water Conserved</span>
            <span className="text-2xl font-extrabold text-white">{metrics.water_saved.toLocaleString()} L</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-white/5 flex flex-col justify-between hover:border-cyan-500/30 hover:scale-105 transition-all duration-300 shadow-lg animate-holo-warp animate-electro-hover" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 animate-magnetic-tilt">
            <Calendar size={20} />
          </div>
          <div className="mt-4 space-y-1">
            <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Trees Equiv.</span>
            <span className="text-2xl font-extrabold text-white">{metrics.trees_equivalent.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-white/5 flex flex-col justify-between hover:border-amber-500/30 hover:scale-105 transition-all duration-300 shadow-lg animate-holo-warp animate-electro-hover" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 animate-magnetic-tilt">
            <ShieldAlert size={20} />
          </div>
          <div className="mt-4 space-y-1">
            <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Plastics Recycled</span>
            <span className="text-2xl font-extrabold text-white">{metrics.plastic_recycled.toLocaleString()} kg</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-white/5 flex flex-col justify-between hover:border-indigo-500/30 hover:scale-105 transition-all duration-300 shadow-lg animate-holo-warp animate-electro-hover" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 animate-magnetic-tilt">
            <Award size={20} />
          </div>
          <div className="mt-4 space-y-1">
            <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Metals Recovered</span>
            <span className="text-2xl font-extrabold text-white">{metrics.metals_recovered.toLocaleString()} kg</span>
          </div>
        </div>

      </div>

      {/* Target Progress Bar */}
      <div className="p-6 rounded-2xl glass-panel border-white/5 space-y-3">
        <div className="flex justify-between items-center text-sm font-semibold text-gray-400">
          <span>Carbon Offsets Target (Annual Goal)</span>
          <span className="text-emerald-400">{metrics.carbon_saved.toLocaleString()} kg / 5,000 kg</span>
        </div>
        <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
            style={{ width: `${(metrics.carbon_saved / 5000) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Recharts Diagrams Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Historical Carbon offset (Col-7) */}
        <div className="lg:col-span-8 rounded-2xl glass-panel p-6 border-white/5 space-y-4">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">Carbon Savings & Pickups Progression</h3>
          
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historical_analytics}>
                <defs>
                  <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#475569" />
                <YAxis stroke="#475569" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="carbon" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCarbon)" name="CO2 Saved (kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Device Categories Split Pie Chart (Col-5) */}
        <div className="lg:col-span-4 rounded-2xl glass-panel p-6 border-white/5 flex flex-col justify-between">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">Category Contribution</h3>
          
          <div className="h-56 w-full flex items-center justify-center my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={device_categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {device_categories.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Labels List */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {device_categories.slice(0, 6).map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-1.5 text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="truncate">{cat.name}: <b>{cat.value}</b></span>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
