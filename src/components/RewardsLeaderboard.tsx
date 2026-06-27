import React, { useEffect, useState } from 'react';
import { api, type LeaderboardItem } from '../services/api';
import { Award, Trophy, Zap } from 'lucide-react';

interface RewardsLeaderboardProps {
  userPoints: number;
}

const BADGES_LIST = [
  { name: 'Green Recruit', desc: 'Joined the platform to dispose of electronics responsibly.', emoji: '🌱', pointsReq: 100 },
  { name: 'First Scan', desc: 'Completed your first AI device categorization scan.', emoji: '📷', pointsReq: 150 },
  { name: 'Recycling Hero', desc: 'Booked your first certified local driver collection.', emoji: '🚚', pointsReq: 250 },
  { name: 'Silver Recycler', desc: 'Earned over 500 total EcoPoints on the network.', emoji: '🥈', pointsReq: 500 },
  { name: 'Gold Safeguard', desc: 'Earned over 1,000 total EcoPoints.', emoji: '🥇', pointsReq: 1000 },
  { name: 'Zero-Waste Master', desc: 'Climbed to the top ranks of the local leaderboard.', emoji: '👑', pointsReq: 1500 },
];

export const RewardsLeaderboard: React.FC<RewardsLeaderboardProps> = ({ userPoints }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [userRank, setUserRank] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = async () => {
    try {
      const data = await api.getLeaderboard();
      setLeaderboard(data.leaderboard);
      setUserRank(data.user_rank);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [userPoints]);

  const getTier = (points: number) => {
    if (points >= 1500) return { name: 'Zero-Waste Master', color: 'text-amber-400', border: 'border-amber-400/40', next: 'Max Level' };
    if (points >= 1000) return { name: 'Gold Safeguard', color: 'text-yellow-400', border: 'border-yellow-400/40', next: '1,500 pts for Zero-Waste' };
    if (points >= 500) return { name: 'Silver Recycler', color: 'text-slate-300', border: 'border-slate-300/40', next: '1,000 pts for Gold' };
    return { name: 'Green Recruit', color: 'text-emerald-400', border: 'border-emerald-500/30', next: '500 pts for Silver' };
  };

  const currentTier = getTier(userPoints);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <Trophy className="text-emerald-400" /> Eco-Rewards Hub & Rankings
        </h2>
        <p className="text-gray-400 mt-1">Acquire rewards tokens, audit badge completions, and check positions on the global leaderboard.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Columns: Gamified user summary & achievements (Col-7) */}
        <div className="lg:col-span-7 space-y-6 animate-holo-warp">
          
          {/* User Score Summary Card */}
          <div className={`rounded-2xl glass-panel p-6 border ${currentTier.border} bg-gradient-to-br from-emerald-950/10 via-[#070b13] to-teal-950/10 grid sm:grid-cols-3 gap-6 items-center shadow-xl animate-aurora-glow hover:scale-[1.02] transition-all`}>
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Tier</span>
              <span className={`block text-xl font-bold ${currentTier.color}`}>{currentTier.name}</span>
            </div>
            
            <div className="space-y-1 text-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total EcoPoints</span>
              <span className="block text-4xl font-black text-white flex items-center justify-center gap-1">
                <Zap size={24} className="fill-emerald-400 text-emerald-400 animate-pulse" /> {userPoints}
              </span>
            </div>

            <div className="space-y-1 text-center sm:text-right">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Position Rank</span>
              <span className="block text-2xl font-bold text-white">#{userRank || 'N/A'}</span>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="rounded-2xl glass-panel p-6 border-white/5 space-y-5 animate-magnetic-tilt" style={{ animationDelay: '200ms' }}>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="text-emerald-400 animate-pulse" size={18} /> Achievement Badges
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {BADGES_LIST.map(badge => {
                const isUnlocked = userPoints >= badge.pointsReq;
                return (
                  <div 
                    key={badge.name}
                    className={`p-4 rounded-xl border transition-all duration-300 flex items-start gap-3.5 animate-electro-hover hover:scale-105
                      ${isUnlocked ? 'bg-emerald-500/5 border-emerald-500/30 text-white shadow-lg shadow-emerald-500/5' : 'bg-white/2 border-white/5 opacity-50'}`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-white/5 border border-white/5 flex-shrink-0 ${isUnlocked ? 'animate-magnetic-tilt' : ''}`}>
                      {badge.emoji}
                    </div>
                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm truncate">{badge.name}</h4>
                        {isUnlocked && <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">Unlocked</span>}
                      </div>
                      <p className="text-xs text-gray-400 whitespace-normal leading-relaxed">{badge.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Columns: Competitive Leaderboard (Col-5) */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl glass-panel p-6 border-white/5 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4">
              <Trophy className="text-amber-400" size={18} /> Global Leaderboard
            </h3>

            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <span className="text-emerald-400 font-semibold animate-pulse">Loading ranking roster...</span>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((item) => (
                  <div 
                    key={item.full_name}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all
                      ${item.is_current ? 'bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-500/5' : 'bg-white/5 border-white/5'}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank Indicator */}
                      <span className={`w-6 text-center font-bold text-sm 
                        ${item.rank === 1 ? 'text-amber-400' : item.rank === 2 ? 'text-slate-300' : item.rank === 3 ? 'text-amber-600' : 'text-gray-500'}`}>
                        {item.rank}
                      </span>
                      
                      {/* Avatar */}
                      <img 
                        src={item.avatar_url} 
                        alt={item.full_name} 
                        className="w-8 h-8 rounded-lg bg-black/40 border border-white/10"
                      />
                      
                      {/* Name */}
                      <span className={`text-sm font-semibold truncate max-w-[150px] ${item.is_current ? 'text-emerald-400 font-bold' : 'text-white'}`}>
                        {item.full_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                      <Zap size={14} className="text-emerald-400 fill-emerald-400" /> {item.eco_points} <span className="text-[10px] text-gray-500 font-normal">pts</span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
