import React, { useEffect, useState, useRef } from 'react';
import { api, type DashboardStats, type User } from '../services/api';
import { Shield, Users, Activity, BarChart2, DollarSign, Leaf, Map, Truck, Trash2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import L from 'leaflet';

interface AdminPanelProps {
  user: User;
}

export const AdminPanel: React.FC<AdminPanelProps> = () => {
  const [stats, setStats] = useState<DashboardStats | null>(() => {
    try {
      const cached = localStorage.getItem('ecotrack_dashboard_stats');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(!stats);
  const [deletingUser, setDeletingUser] = useState<number | null>(null);

  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapRef = useRef<L.Map | null>(null);

  // SF Center Hotspots for Heatmap simulation
  const HEATMAP_POINTS = [
    { coords: [37.7749, -122.4194], radius: 450, density: 'High' }, // Civic Center
    { coords: [37.7833, -122.4167], radius: 300, density: 'Medium' }, // Tenderloin
    { coords: [37.7699, -122.4468], radius: 550, density: 'High' }, // Haight Ashbury
    { coords: [37.7942, -122.3996], radius: 250, density: 'Low' }, // Financial District
    { coords: [37.7599, -122.4368], radius: 400, density: 'Medium' }, // Castro
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
      localStorage.setItem('ecotrack_dashboard_stats', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to completely remove this user from the system?")) return;
    
    setDeletingUser(userId);
    try {
      await api.deleteUser(userId);
      await fetchStats(); // Refresh the list
    } catch (err: any) {
      alert(err.message || 'Failed to delete user.');
    } finally {
      setDeletingUser(null);
    }
  };

  const handleUpdateStatus = async (pickupId: number, nextStatus: string) => {
    try {
      await api.updatePickupStatus(pickupId, nextStatus);
      await fetchStats(); // Refresh the list
    } catch (err: any) {
      alert(err.message || 'Failed to update pickup status.');
    }
  };

  // Initialize Mini Heatmap
  useEffect(() => {
    if (loading || !miniMapContainerRef.current) return;

    if (!miniMapRef.current) {
      miniMapRef.current = L.map(miniMapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: false
      }).setView([37.776, -122.425], 12);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(miniMapRef.current);

      // Render heatmap circles
      HEATMAP_POINTS.forEach(pt => {
        const color = pt.density === 'High' ? '#ef4444' : pt.density === 'Medium' ? '#f59e0b' : '#10b981';
        L.circle(pt.coords as [number, number], {
          radius: pt.radius,
          fillColor: color,
          fillOpacity: 0.25,
          color: color,
          weight: 1
        })
        .addTo(miniMapRef.current!)
        .bindPopup(`<b>Hotspot Density: ${pt.density}</b>`);
      });
    }

    return () => {
      if (miniMapRef.current) {
        miniMapRef.current.remove();
        miniMapRef.current = null;
      }
    };
  }, [loading]);

  if (!stats) {
    return (
      <div className="rounded-2xl border border-white/5 bg-black/20 p-24 text-center text-gray-500">
        <span className="text-emerald-400 font-semibold animate-pulse">Loading logistics admin console...</span>
      </div>
    );
  }

  const { metrics, device_categories, historical_analytics } = stats;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Shield className="text-rose-400" /> Administrative Logistics Control
          </h2>
          <p className="text-gray-400 mt-1 text-sm">Supervise aggregate node users, prediction analytics, scrap revenue, and dispatch density overlays.</p>
        </div>
      </div>

      {/* Admin metrics counters grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl glass-panel border-white/5 flex items-center gap-4 hover:border-blue-500/30 hover:scale-105 transition-all duration-300 shadow-lg animate-holo-warp animate-electro-hover" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0 animate-magnetic-tilt">
            <Users size={22} />
          </div>
          <div>
            <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Active Users</span>
            <span className="text-2xl font-extrabold text-white">{metrics.total_users}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-white/5 flex items-center gap-4 hover:border-emerald-500/30 hover:scale-105 transition-all duration-300 shadow-lg animate-holo-warp animate-electro-hover" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 animate-magnetic-tilt">
            <Activity size={22} />
          </div>
          <div>
            <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Devices Logged</span>
            <span className="text-2xl font-extrabold text-white">{metrics.total_devices_recycled}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-white/5 flex items-center gap-4 hover:border-teal-500/30 hover:scale-105 transition-all duration-300 shadow-lg animate-holo-warp animate-electro-hover" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 flex-shrink-0 animate-magnetic-tilt">
            <Leaf size={22} />
          </div>
          <div>
            <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Global Carbon Saved</span>
            <span className="text-2xl font-extrabold text-white">{metrics.carbon_saved.toLocaleString()} kg</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-white/5 flex items-center gap-4 hover:border-amber-500/30 hover:scale-105 transition-all duration-300 shadow-lg animate-holo-warp animate-electro-hover" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0 animate-magnetic-tilt">
            <DollarSign size={22} />
          </div>
          <div>
            <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Scrap Resale Revenue</span>
            <span className="text-2xl font-extrabold text-white">${metrics.total_revenue.toLocaleString()}</span>
          </div>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Device Categories Bar Chart (Col-7) */}
        <div className="lg:col-span-7 rounded-2xl glass-panel p-6 border-white/5 space-y-4">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart2 size={18} className="text-emerald-400" /> Device Classification Ratios
          </h3>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={device_categories}>
                <XAxis dataKey="name" stroke="#475569" />
                <YAxis stroke="#475569" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction trend graph (Col-5) */}
        <div className="lg:col-span-5 rounded-2xl glass-panel p-6 border-white/5 space-y-4">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity size={18} className="text-rose-400" /> Predictive Recycling Volume
          </h3>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historical_analytics}>
                <XAxis dataKey="month" stroke="#475569" />
                <YAxis stroke="#475569" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Line type="monotone" dataKey="pickups" stroke="#ef4444" strokeWidth={2.5} name="Scheduled Pickups" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Heatmap density section */}
      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Heatmap Plot (Col-7) */}
        <div className="lg:col-span-7 rounded-2xl glass-panel p-6 border-white/5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Map size={18} className="text-teal-400" /> Dispatch Density Hotspots (Heatmap)
            </h3>
            <p className="text-gray-400 text-xs mt-1">Geographic density distribution mapping cluster coordinates of booked collections.</p>
          </div>
          
          <div className="rounded-xl overflow-hidden border border-white/10 h-72 relative mt-4">
            <div ref={miniMapContainerRef} className="h-full w-full z-0" />
            <div className="absolute bottom-3 left-3 z-10 bg-[#0f172a]/95 border border-white/10 rounded-lg px-2.5 py-1 text-[10px] space-y-1 shadow-md">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> High Density</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Med Density</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Low Density</div>
            </div>
          </div>
        </div>

        {/* Node stats detail (Col-5) */}
        <div className="lg:col-span-5 rounded-2xl glass-panel p-6 border-white/5 space-y-4 flex flex-col justify-between">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">Logistics Performance Audit</h3>
          
          <div className="space-y-4 divide-y divide-white/5 flex-grow flex flex-col justify-around">
            
            <div className="flex justify-between items-center py-2 text-xs">
              <span className="text-gray-400 font-semibold uppercase">Total Pickups Booked</span>
              <span className="text-white font-extrabold">{metrics.total_pickups} Collections</span>
            </div>

            <div className="flex justify-between items-center py-2 text-xs">
              <span className="text-gray-400 font-semibold uppercase">Active Recycling Hubs</span>
              <span className="text-emerald-400 font-extrabold">{metrics.active_recyclers} Certified Nodes</span>
            </div>

            <div className="flex justify-between items-center py-2 text-xs">
              <span className="text-gray-400 font-semibold uppercase">Average Completion Time</span>
              <span className="text-white font-extrabold">2.4 Hours</span>
            </div>

            <div className="flex justify-between items-center py-2 text-xs">
              <span className="text-gray-400 font-semibold uppercase">Refurbish Extraction Rate</span>
              <span className="text-cyan-400 font-extrabold">34.2% of submissions</span>
            </div>

          </div>

          <div className="p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-xl text-rose-300 text-xs text-center leading-relaxed">
            All algorithms operate under certified EPA and e-Stewards data schemas.
          </div>

        </div>

      </div>

      {/* Admin Registered Users & Submissions lists */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Registered Users Table (Col-5) */}
        <div className="lg:col-span-5 rounded-2xl glass-panel p-6 border-white/5 space-y-4 flex flex-col">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users size={18} className="text-blue-400" /> Registered Node Users
            </h3>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
              {stats.users?.length ?? 0} total
            </span>
          </div>
          <div className="overflow-x-auto mt-2 max-h-72 overflow-y-auto custom-scrollbar border border-white/5 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/5 border-b border-white/5 text-gray-400 uppercase tracking-wider font-bold">
                  <th className="p-3">User ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Password</th>
                  <th className="p-3 text-right">Points</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {stats.users && stats.users.length > 0 ? (
                  stats.users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-mono text-gray-500">#{u.id}</td>
                      <td className="p-3 font-semibold text-white">{u.full_name}</td>
                      <td className="p-3 text-gray-400">{u.email}</td>
                      <td className="p-3 font-mono text-pink-400">{u.password || 'demopassword'}</td>
                      <td className="p-3 text-right font-extrabold text-emerald-400">{u.eco_points}</td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={deletingUser === u.id}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors disabled:opacity-50"
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">No registered users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* E-Waste Device Submissions Table (Col-7) */}
        <div className="lg:col-span-7 rounded-2xl glass-panel p-6 border-white/5 space-y-4 flex flex-col">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity size={18} className="text-emerald-400" /> E-Waste Submissions Log
            </h3>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              {stats.submissions?.length ?? 0} total
            </span>
          </div>
          <div className="overflow-x-auto mt-2 max-h-72 overflow-y-auto custom-scrollbar border border-white/5 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/5 border-b border-white/5 text-gray-400 uppercase tracking-wider font-bold">
                  <th className="p-3">Email</th>
                  <th className="p-3">Device</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Hazard</th>
                  <th className="p-3 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {stats.submissions && stats.submissions.length > 0 ? (
                  stats.submissions.map((s) => (
                    <tr key={s.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 text-gray-400 font-medium">{s.user_email}</td>
                      <td className="p-3 font-bold text-white">{s.device_name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/5">
                          {s.category}
                        </span>
                      </td>
                      <td className="p-3 font-medium">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.hazard_level.toLowerCase().includes('high') || s.hazard_level.toLowerCase().includes('extreme')
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        }`}>
                          {s.hazard_level.split(' ')[0]}
                        </span>
                      </td>
                      <td className="p-3 text-right font-extrabold text-teal-400">${s.market_val.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">No submissions logged yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Admin Pickups Management */}
      <div className="rounded-2xl glass-panel p-6 border-white/5 space-y-4 flex flex-col">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Truck size={18} className="text-amber-400" /> Platform Scheduled Pickups
          </h3>
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
            {stats.pickups?.length ?? 0} total
          </span>
        </div>
        <div className="overflow-x-auto mt-2 max-h-72 overflow-y-auto custom-scrollbar border border-white/5 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/5 text-gray-400 uppercase tracking-wider font-bold">
                <th className="p-3">Order ID</th>
                <th className="p-3">User Email</th>
                <th className="p-3">Center</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {stats.pickups && stats.pickups.length > 0 ? (
                stats.pickups.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono text-gray-500">#{p.id}</td>
                    <td className="p-3 text-gray-400 font-medium">{p.user_email}</td>
                    <td className="p-3 font-bold text-white">{p.recycler_name}</td>
                    <td className="p-3 text-gray-400">{p.pickup_date}</td>
                    <td className="p-3 font-medium">
                      <select
                        value={p.status}
                        onChange={(e) => handleUpdateStatus(p.id, e.target.value)}
                        className={`px-2 py-1 rounded text-[10px] font-bold bg-[#0b0f19] border ${
                          p.status === 'Completed' ? 'text-teal-400 border-teal-500/30' : 
                          p.status === 'Pending' ? 'text-gray-400 border-white/10' :
                          p.status === 'Accepted' ? 'text-blue-400 border-blue-500/30' :
                          p.status === 'Driver Assigned' ? 'text-indigo-400 border-indigo-500/30' :
                          'text-amber-400 border-amber-500/30'
                        } cursor-pointer focus:outline-none`}
                      >
                        <option value="Pending" className="bg-[#0b0f19] text-gray-400">Pending</option>
                        <option value="Accepted" className="bg-[#0b0f19] text-blue-400">Accepted</option>
                        <option value="Driver Assigned" className="bg-[#0b0f19] text-indigo-400">Driver Assigned</option>
                        <option value="Picked Up" className="bg-[#0b0f19] text-amber-400">Picked Up</option>
                        <option value="Completed" className="bg-[#0b0f19] text-teal-400">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No scheduled pickups found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
