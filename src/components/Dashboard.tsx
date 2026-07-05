import React, { useState, useEffect } from 'react';
import { api, type User, type Recycler, type DeviceSubmission } from '../services/api';
import { AIScan } from './AIScan';
import { RecyclerMap } from './RecyclerMap';
import { PickupTracker } from './PickupTracker';
import { ImpactDashboard } from './ImpactDashboard';
import { RewardsLeaderboard } from './RewardsLeaderboard';
import { AdminPanel } from './AdminPanel';
import { Chatbot } from './Chatbot';
import { useTheme } from '../context/ThemeContext';
import { 
  Home, Sparkles, MapPin, Truck, BarChart3, Trophy, Shield, 
  LogOut, Leaf, Zap, Calendar, Heart, ShieldAlert, Menu, X, Moon, Sun
} from 'lucide-react';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

type TabType = 'overview' | 'scan' | 'map' | 'pickup' | 'impact' | 'rewards' | 'admin';

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map((email: string) => email.trim().toLowerCase())
  .filter(Boolean);

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [userPoints, setUserPoints] = useState(user.eco_points);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [history, setHistory] = useState<DeviceSubmission[]>([]);
  const [selectedRecyclerForPickup, setSelectedRecyclerForPickup] = useState<Recycler | null>(null);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [showWelcomeToast, setShowWelcomeToast] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeToast(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  // Load User submission history
  const loadHistory = async () => {
    setFetchingHistory(true);
    try {
      const data = await api.getHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      loadHistory();
    }
  }, [activeTab]);

  const handleSelectRecyclerForPickup = (recycler: Recycler) => {
    setSelectedRecyclerForPickup(recycler);
    setActiveTab('pickup'); // Switch tab to pickup tracker
  };

  const handleClearPreselectedRecycler = () => {
    setSelectedRecyclerForPickup(null);
  };

  const handleUpdatePoints = (points: number) => {
    setUserPoints(prev => prev + points);
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row animate-fade-in-up overflow-hidden relative ${isDarkMode ? 'bg-[#090D14]' : 'bg-[#F8F9FA]'}`}>
      
      {/* Mobile Top Header (Visible only on mobile screen) */}
      <div className={`md:hidden w-full px-5 py-3 flex justify-between items-center z-30 shadow-md ${isDarkMode ? 'bg-[#030712] text-white' : 'bg-[#38523A] text-white'}`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D9E335] flex items-center justify-center">
              <Leaf size={16} className="text-[#38523A] font-extrabold" />
            </div>
            <span className="text-base font-bold tracking-tight text-white font-mono">
              ECOTRACK<span className="text-[#D9E335]">.AI</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            {isDarkMode ? <Sun size={16} className="text-[#D9E335]" /> : <Moon size={16} />}
          </button>
          <div className="text-xs font-bold bg-[#D9E335]/20 border border-[#D9E335]/30 rounded-lg px-2.5 py-1 flex items-center gap-1">
            <Zap size={12} className="fill-emerald-400 text-emerald-400" /> {userPoints} pts
          </div>
        </div>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Floating Login Verification Toast */}
      {showWelcomeToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#38523A] border border-[#84B056]/40 text-white shadow-2xl shadow-[#38523A]/20 backdrop-blur-md animate-fade-in-up">
          <div className="w-8 h-8 rounded-xl bg-[#D9E335] text-[#38523A] flex items-center justify-center font-extrabold shadow-md">
            ✓
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#D9E335]">Portal Access Unlocked</h4>
            <p className="text-xs opacity-90 font-medium">Authentication Verified. Welcome, {user.full_name}!</p>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isDarkMode ? 'bg-[#030712] text-white' : 'bg-[#38523A] text-white'}
      `}>
        
        {/* Close Button on Mobile */}
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden absolute top-5 right-5 opacity-70 hover:opacity-100 p-1 rounded-lg hover:bg-white/10"
        >
          <X size={20} />
        </button>

        <div className="space-y-6 py-6">
          {/* Logo */}
          <div className="px-6 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D9E335] flex items-center justify-center shadow-lg">
              <Leaf size={18} className="text-[#38523A] font-extrabold" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white font-mono">
              ECOTRACK<span className="text-[#D9E335]">.AI</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1.5">
            <button
              onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
              className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all cursor-pointer
                ${activeTab === 'overview' ? 'bg-[#D9E335] text-[#38523A] shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10 hover:translate-x-1'}`}
            >
              <Home size={18} /> Overview
            </button>
            
            <button
              onClick={() => { setActiveTab('scan'); setIsSidebarOpen(false); }}
              className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all cursor-pointer
                ${activeTab === 'scan' ? 'bg-[#D9E335] text-[#38523A] shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10 hover:translate-x-1'}`}
            >
              <Sparkles size={18} /> AI Device Scan
            </button>

            <button
              onClick={() => { setActiveTab('map'); setIsSidebarOpen(false); }}
              className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all cursor-pointer
                ${activeTab === 'map' ? 'bg-[#D9E335] text-[#38523A] shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10 hover:translate-x-1'}`}
            >
              <MapPin size={18} /> Locator Map
            </button>

            <button
              onClick={() => { setActiveTab('pickup'); setIsSidebarOpen(false); }}
              className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all cursor-pointer
                ${activeTab === 'pickup' ? 'bg-[#D9E335] text-[#38523A] shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10 hover:translate-x-1'}`}
            >
              <Truck size={18} /> Pickup Scheduler
            </button>

            <button
              onClick={() => { setActiveTab('impact'); setIsSidebarOpen(false); }}
              className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all cursor-pointer
                ${activeTab === 'impact' ? 'bg-[#D9E335] text-[#38523A] shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10 hover:translate-x-1'}`}
            >
              <BarChart3 size={18} /> Impact Dashboard
            </button>

            <button
              onClick={() => { setActiveTab('rewards'); setIsSidebarOpen(false); }}
              className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all cursor-pointer
                ${activeTab === 'rewards' ? 'bg-[#D9E335] text-[#38523A] shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10 hover:translate-x-1'}`}
            >
              <Trophy size={18} /> Rewards Hub
            </button>

            {ADMIN_EMAILS.includes(user.email) && (
              <button
                onClick={() => { setActiveTab('admin'); setIsSidebarOpen(false); }}
                className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all cursor-pointer
                  ${activeTab === 'admin' ? 'bg-[#D9E335] text-[#38523A] shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10 hover:translate-x-1'}`}
              >
                <Shield size={18} /> Admin Console
              </button>
            )}
          </nav>
        </div>

        {/* User profile footer section */}
        <div className="p-4 border-t border-white/10 bg-black/20 space-y-3">
          <div className="flex items-center gap-3">
            <img 
              src={user.avatar_url} 
              alt={user.full_name} 
              className="w-10 h-10 rounded-xl bg-white/10 border border-white/20"
            />
            <div className="truncate">
              <h4 className="text-sm font-bold text-white truncate">{user.full_name}</h4>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <Zap size={10} className="fill-emerald-400" /> {userPoints} EcoPoints
              </span>
            </div>
          </div>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-full py-2 rounded-xl border border-white/20 text-white/80 hover:bg-white/10 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isDarkMode 
              ? <><Sun size={14} className="text-[#D9E335]" /> Light Mode</> 
              : <><Moon size={14} /> Dark Mode</>}
          </button>

          <button
            onClick={onLogout}
            className="w-full py-2.5 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/20 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>

      </aside>

      {/* Main View Area */}
      <main className="flex-grow p-6 md:p-10 w-full overflow-y-auto">
        
        {/* Tab Routing Router */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Greeting */}
            <div className="animate-float-up" style={{ animationDelay: '50ms' }}>
              <h2 className="text-3xl font-extrabold" style={{ color: 'var(--accent-forest)' }}>Eco Portal Overview</h2>
              <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Welcome back, {user.full_name}! Let's recycle electronics safely and offset carbon footprint.</p>
            </div>

            {/* Quick Cards Info */}
            <div className="grid sm:grid-cols-3 gap-6">
              
              <div className="p-5 rounded-2xl glass-panel border-white/5 space-y-4 flex flex-col justify-between animate-orbit-in animate-quantum hover:scale-[1.03] hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Device Scanning</span>
                  <Sparkles className="text-emerald-400 animate-pulse" size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-bold text-sm">Need to Recycle?</h4>
                  <p className="text-xs text-gray-400 leading-normal">Snap a picture with your webcam to classify materials and get estimates.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('scan')}
                  className="w-full mt-2 py-2.5 bg-emerald-500 text-black font-bold text-xs rounded-xl hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 animate-quantum"
                >
                  Open Scanner
                </button>
              </div>

              <div className="p-5 rounded-2xl glass-panel border-white/5 space-y-4 flex flex-col justify-between animate-orbit-in animate-quantum hover:scale-[1.03] hover:border-teal-500/30 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300" style={{ animationDelay: '250ms', animationFillMode: 'both' }}>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Certified Locator</span>
                  <MapPin className="text-teal-400 animate-pulse" size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-bold text-sm">Find Nearby Hubs</h4>
                  <p className="text-xs text-gray-400 leading-normal">Locate authorized collectors who handle toxic materials properly.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('map')}
                  className="w-full mt-2 py-2.5 bg-teal-500 text-black font-bold text-xs rounded-xl hover:bg-teal-400 active:scale-95 transition-all cursor-pointer shadow-lg shadow-teal-500/20 animate-quantum"
                >
                  Locate Center
                </button>
              </div>

              <div className="p-5 rounded-2xl glass-panel border-white/5 space-y-4 flex flex-col justify-between animate-orbit-in animate-quantum hover:scale-[1.03] hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Eco Achievements</span>
                  <Trophy className="text-amber-400 animate-pulse" size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-bold text-sm">Leaderboard & Prizes</h4>
                  <p className="text-xs text-gray-400 leading-normal">Complete tasks to collect badges and climb the community ranks.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('rewards')}
                  className="w-full mt-2 py-2.5 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400 active:scale-95 transition-all cursor-pointer shadow-lg shadow-amber-500/20 animate-quantum"
                >
                  View Rewards
                </button>
              </div>

            </div>

            {/* Submission History Section */}
            <div className="space-y-4 animate-float-up" style={{ animationDelay: '550ms', animationFillMode: 'both' }}>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="text-emerald-400" size={20} /> Your Recycling History
              </h3>

              {fetchingHistory ? (
                <div className="p-12 border border-white/5 rounded-2xl bg-black/20 text-center text-gray-500 text-sm">
                  <span className="text-emerald-400 font-semibold animate-pulse">Loading submission records...</span>
                </div>
              ) : history.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {history.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl glass-panel border-white/5 flex gap-4 hover:border-emerald-500/30 hover:scale-[1.02] transition-all duration-300 animate-quantum">
                      <img 
                        src={item.image_url} 
                        alt={item.device_name}
                        className="w-20 h-20 rounded-lg object-cover bg-black/40 border border-white/10 flex-shrink-0"
                      />
                      <div className="space-y-1 truncate">
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-bold text-sm truncate">{item.device_name}</h4>
                          <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">{item.category}</span>
                        </div>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><ShieldAlert size={12} className="text-rose-400" /> Hazard: {item.hazard_level.substring(0, 15)}...</p>
                        <p className="text-xs text-emerald-400 font-bold flex items-center gap-1"><Heart size={12} fill="currentColor" /> Recycled Value: ${item.recycling_val.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 border border-dashed border-white/10 rounded-2xl bg-black/10 text-center text-gray-500 text-sm flex flex-col items-center justify-center gap-2 hover:border-emerald-500/20 transition-all">
                  <Sparkles size={36} className="text-emerald-400/80 animate-zero-g" />
                  <p className="font-semibold text-gray-300 text-base">No recycled devices logged yet</p>
                  <p className="text-xs text-gray-500 max-w-xs leading-normal">Go to the AI Device Scan tab to submit your first electronic device for recycling.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === 'scan' && (
          <div className="animate-holo-warp">
            <AIScan onSuccess={loadHistory} updateUserPoints={handleUpdatePoints} />
          </div>
        )}

        {activeTab === 'map' && (
          <div className="animate-aurora-glow rounded-2xl p-1">
            <RecyclerMap onSelectRecyclerForPickup={handleSelectRecyclerForPickup} />
          </div>
        )}

        {activeTab === 'pickup' && (
          <div className="animate-magnetic-tilt">
            <PickupTracker 
              preselectedRecycler={selectedRecyclerForPickup} 
              onClearPreselection={handleClearPreselectedRecycler}
              updateUserPoints={handleUpdatePoints}
            />
          </div>
        )}

        {activeTab === 'impact' && (
          <div className="animate-holo-warp">
            <ImpactDashboard />
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="animate-aurora-glow rounded-2xl p-1">
            <RewardsLeaderboard userPoints={userPoints} />
          </div>
        )}

        {activeTab === 'admin' && ADMIN_EMAILS.includes(user.email) && (
          <div className="animate-magnetic-tilt">
            <AdminPanel user={user} />
          </div>
        )}

      </main>

      {/* Floating chatbot assistant */}
      <Chatbot />

    </div>
  );
};
