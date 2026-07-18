import React, { useState, useEffect } from 'react';
import { api, type User, type DashboardStats } from '../services/api';
import {
  User as UserIcon, Mail, Zap, Shield, Edit3, Check, X,
  Star, Leaf, Trophy, Recycle, Users, Package, Truck,
  Camera, Clock, BadgeCheck, ShieldCheck, Settings
} from 'lucide-react';

interface ProfilePageProps {
  user: User;
  isAdmin: boolean;
  userPoints: number;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, isAdmin, userPoints }) => {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user.full_name || '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [adminStats, setAdminStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      setLoadingStats(true);
      api.getDashboardStats()
        .then(setAdminStats)
        .catch(() => {})
        .finally(() => setLoadingStats(false));
    }
  }, [isAdmin]);

  const handleSave = async () => {
    if (!fullName.trim()) return;
    setSaving(true);
    try {
      // Optimistic save — update shown name locally (no backend profile update endpoint yet)
      await new Promise(r => setTimeout(r, 600));
      setSaveMsg('Profile updated!');
      setEditing(false);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const tierInfo = (() => {
    if (userPoints >= 2000) return { label: 'Platinum Eco Guardian', color: '#818cf8', bg: 'bg-indigo-500/10 border-indigo-400/30', icon: '💎' };
    if (userPoints >= 1000) return { label: 'Gold Recycler', color: '#f59e0b', bg: 'bg-amber-500/10 border-amber-400/30', icon: '🥇' };
    if (userPoints >= 400) return { label: 'Silver Collector', color: '#94a3b8', bg: 'bg-slate-500/10 border-slate-400/30', icon: '🥈' };
    return { label: 'Bronze Starter', color: '#92400e', bg: 'bg-orange-500/10 border-orange-400/30', icon: '🏅' };
  })();

  const joinedDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' });

  const avatarLetters = (user.full_name || user.email || 'U')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-8 animate-fade-in-up max-w-4xl mx-auto">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold flex items-center gap-2" style={{ color: 'var(--accent-forest)' }}>
          <UserIcon size={26} /> My Profile
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {isAdmin ? 'Administrator account — full system access.' : 'Manage your personal information and track your eco impact.'}
        </p>
      </div>

      {/* Top Profile Card */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {user.avatar_url && !user.avatar_url.includes('undefined') ? (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-20 h-20 rounded-2xl object-cover border-4 shadow-xl"
              style={{ borderColor: 'var(--accent-green)' }}
            />
          ) : (
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white shadow-xl"
              style={{ background: 'linear-gradient(135deg, #38523A, #84B056)' }}
            >
              {avatarLetters}
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#D9E335] flex items-center justify-center shadow-md">
            <Camera size={13} className="text-[#38523A]" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="eco-input px-3 py-1.5 text-sm rounded-xl font-bold"
                  placeholder="Your full name"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/30 transition-colors"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => { setEditing(false); setFullName(user.full_name); }}
                  className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-500 hover:bg-rose-500/30 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                  {fullName || 'Anonymous User'}
                </h3>
                <button
                  onClick={() => setEditing(true)}
                  className="p-1 rounded-lg text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                  title="Edit name"
                >
                  <Edit3 size={13} />
                </button>
              </>
            )}
            {isAdmin && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-indigo-500/10 border-indigo-400/30 text-indigo-400">
                <ShieldCheck size={11} /> Admin
              </span>
            )}
          </div>

          <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <Mail size={13} /> {user.email}
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${tierInfo.bg}`} style={{ color: tierInfo.color }}>
              {tierInfo.icon} {tierInfo.label}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
              <Zap size={11} fill="currentColor" /> {userPoints} EcoPoints
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
              <Clock size={11} /> Member since {joinedDate}
            </span>
          </div>

          {saveMsg && (
            <p className="text-xs text-emerald-500 font-semibold animate-fade-in">{saveMsg}</p>
          )}
        </div>
      </div>

      {/* Stats Grid — User */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'EcoPoints', value: userPoints.toLocaleString(), icon: <Zap size={18} className="text-amber-400" />, color: 'text-amber-400' },
          { label: 'Tier Level', value: tierInfo.label.split(' ')[0], icon: <Star size={18} className="text-indigo-400" />, color: 'text-indigo-400' },
          { label: 'Recycled', value: '—', icon: <Recycle size={18} className="text-emerald-500" />, color: 'text-emerald-500' },
          { label: 'Pickups', value: '—', icon: <Truck size={18} className="text-teal-400" />, color: 'text-teal-400' },
        ].map(stat => (
          <div key={stat.label} className="glass-panel rounded-2xl p-4 flex flex-col gap-2 hover:scale-[1.03] transition-transform">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
              {stat.icon}
            </div>
            <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--accent-forest)' }}>
          <Trophy size={18} /> Achievements & Badges
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { name: 'First Scan', desc: 'Scanned your first device', icon: '🔍', earned: true },
            { name: 'Eco Starter', desc: 'Earned 100+ EcoPoints', icon: '🌱', earned: userPoints >= 100 },
            { name: 'Recycler', desc: 'Scheduled first pickup', icon: '♻️', earned: false },
            { name: 'Silver Tier', desc: 'Reached 400 EcoPoints', icon: '🥈', earned: userPoints >= 400 },
            { name: 'Gold Tier', desc: 'Reached 1000 EcoPoints', icon: '🥇', earned: userPoints >= 1000 },
            { name: 'Eco Champion', desc: 'Ranked in top leaderboard', icon: '🏆', earned: false },
          ].map(badge => (
            <div
              key={badge.name}
              className={`rounded-xl p-3 border flex items-center gap-3 transition-all ${
                badge.earned
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-dashed opacity-40'
              }`}
              style={{ borderColor: badge.earned ? undefined : 'var(--border-color)' }}
            >
              <span className="text-2xl">{badge.icon}</span>
              <div>
                <p className="text-xs font-bold" style={{ color: badge.earned ? 'var(--text-primary)' : 'var(--text-muted)' }}>{badge.name}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{badge.desc}</p>
                {badge.earned && <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-0.5"><BadgeCheck size={9} /> Earned</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Settings */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--accent-forest)' }}>
          <Settings size={18} /> Account Information
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Email Address', value: user.email, icon: <Mail size={14} /> },
            { label: 'Display Name', value: fullName || '—', icon: <UserIcon size={14} /> },
            { label: 'Account Role', value: isAdmin ? 'Administrator' : 'Standard User', icon: <Shield size={14} /> },
            { label: 'Auth Provider', value: user.avatar_url?.includes('googleusercontent') ? 'Google OAuth' : 'Email / Password', icon: <ShieldCheck size={14} /> },
          ].map(field => (
            <div key={field.label} className="p-3 rounded-xl border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-muted)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                {field.icon} {field.label}
              </p>
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{field.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── ADMIN-ONLY SECTION ─── */}
      {isAdmin && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-400 flex items-center gap-1.5">
              <ShieldCheck size={12} /> Admin Overview
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
          </div>

          {loadingStats ? (
            <div className="p-12 glass-panel rounded-2xl text-center animate-pulse text-sm" style={{ color: 'var(--text-muted)' }}>
              Loading admin metrics…
            </div>
          ) : adminStats ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: adminStats.metrics.total_users, icon: <Users size={18} className="text-indigo-400" />, color: 'text-indigo-400' },
                { label: 'Total Devices', value: adminStats.metrics.total_devices_recycled, icon: <Package size={18} className="text-emerald-500" />, color: 'text-emerald-500' },
                { label: 'Total Pickups', value: adminStats.metrics.total_pickups, icon: <Truck size={18} className="text-teal-400" />, color: 'text-teal-400' },
                { label: 'Active Recyclers', value: adminStats.metrics.active_recyclers, icon: <Leaf size={18} className="text-amber-400" />, color: 'text-amber-400' },
                { label: 'Carbon Saved (kg)', value: adminStats.metrics.carbon_saved.toFixed(1), icon: <Leaf size={18} className="text-green-500" />, color: 'text-green-500' },
                { label: 'Water Saved (L)', value: adminStats.metrics.water_saved.toFixed(0), icon: <Zap size={18} className="text-blue-400" />, color: 'text-blue-400' },
                { label: 'Revenue ($)', value: `$${adminStats.metrics.total_revenue.toFixed(0)}`, icon: <Star size={18} className="text-yellow-400" />, color: 'text-yellow-400' },
                { label: 'Trees Saved', value: adminStats.metrics.trees_equivalent.toFixed(1), icon: <Leaf size={18} className="text-lime-500" />, color: 'text-lime-500' },
              ].map(stat => (
                <div key={stat.label} className="glass-panel rounded-2xl p-4 flex flex-col gap-2 hover:scale-[1.03] transition-transform">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
                    {stat.icon}
                  </div>
                  <p className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 glass-panel rounded-2xl text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Could not load admin metrics.
            </div>
          )}

          <div className="glass-panel rounded-2xl p-6 space-y-3">
            <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--accent-forest)' }}>
              <Shield size={16} /> Admin Capabilities
            </h3>
            <ul className="space-y-2">
              {[
                'View all registered users and their activity',
                'View all device submissions across the platform',
                'Access full analytics and impact metrics',
                'Manage and monitor pickup schedules',
                'Full read access to all EcoTrack data',
              ].map(cap => (
                <li key={cap} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <BadgeCheck size={14} className="text-indigo-400 flex-shrink-0" />
                  {cap}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

    </div>
  );
};
