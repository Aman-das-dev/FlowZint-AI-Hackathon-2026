import React, { useState, useEffect, useRef } from 'react';
import { api, type User, type DashboardStats } from '../services/api';
import {
  User as UserIcon, Mail, Zap, Shield, Edit3, X,
  Star, Leaf, Trophy, Users, Package, Truck,
  Camera, Clock, BadgeCheck, ShieldCheck, Settings,
  Phone, MapPin, Link, FileText, Upload, Trash2, Save
} from 'lucide-react';

interface ProfilePageProps {
  user: User;
  isAdmin: boolean;
  userPoints: number;
}

const STORAGE_KEY = 'ecotrack_profile';

interface LocalProfile {
  fullName: string;
  phone: string;
  location: string;
  bio: string;
  website: string;
  gender: string;
  avatarDataUrl: string;
}

function loadProfile(user: User): LocalProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY + '_' + user.id);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    fullName: user.full_name || '',
    phone: '',
    location: '',
    bio: '',
    website: '',
    gender: '',
    avatarDataUrl: user.avatar_url || '',
  };
}

function saveProfile(userId: number, data: LocalProfile) {
  localStorage.setItem(STORAGE_KEY + '_' + userId, JSON.stringify(data));
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, isAdmin, userPoints }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<LocalProfile>(() => loadProfile(user));
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<LocalProfile>(profile);
  const [saveMsg, setSaveMsg] = useState('');
  const [avatarHover, setAvatarHover] = useState(false);

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

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setSaveMsg('Image must be under 2 MB.'); 
      setTimeout(() => setSaveMsg(''), 3000);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setDraft(d => ({ ...d, avatarDataUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setDraft(d => ({ ...d, avatarDataUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    saveProfile(user.id, draft);
    setProfile(draft);
    setEditMode(false);
    setSaveMsg('✓ Profile saved successfully!');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleCancel = () => {
    setDraft(profile);
    setEditMode(false);
  };

  const tierInfo = (() => {
    if (userPoints >= 2000) return { label: 'Platinum Guardian', color: '#818cf8', bg: 'bg-indigo-500/10 border-indigo-400/30', icon: '💎' };
    if (userPoints >= 1000) return { label: 'Gold Recycler', color: '#f59e0b', bg: 'bg-amber-500/10 border-amber-400/30', icon: '🥇' };
    if (userPoints >= 400)  return { label: 'Silver Collector', color: '#94a3b8', bg: 'bg-slate-500/10 border-slate-400/30', icon: '🥈' };
    return { label: 'Bronze Starter', color: '#b45309', bg: 'bg-orange-500/10 border-orange-400/30', icon: '🏅' };
  })();

  const avatarLetters = (profile.fullName || user.email || 'U')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const displayAvatar = (editMode ? draft.avatarDataUrl : profile.avatarDataUrl) || user.avatar_url || '';
  const displayName = editMode ? draft.fullName : profile.fullName;

  return (
    <div className="space-y-8 animate-fade-in-up max-w-4xl mx-auto pb-10">

      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-extrabold flex items-center gap-2" style={{ color: 'var(--accent-forest)' }}>
            <UserIcon size={26} /> My Profile
          </h2>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            {isAdmin ? 'Administrator — full system access enabled.' : 'Manage your identity and track your eco impact.'}
          </p>
        </div>
        {!editMode ? (
          <button
            onClick={() => { setDraft(profile); setEditMode(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border"
            style={{ borderColor: 'var(--accent-green)', color: 'var(--accent-forest)', background: 'var(--bg-card)' }}
          >
            <Edit3 size={15} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            >
              <X size={14} /> Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, #38523A, #84B056)' }}
            >
              <Save size={14} /> Save Changes
            </button>
          </div>
        )}
      </div>

      {saveMsg && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 animate-fade-in">
          {saveMsg}
        </div>
      )}

      {/* ── Profile Card ── */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row gap-8 items-start">

        {/* Avatar Column */}
        <div className="flex flex-col items-center gap-3 flex-shrink-0">
          {/* Avatar display / upload trigger */}
          <div
            className="relative w-28 h-28 cursor-pointer group"
            onMouseEnter={() => setAvatarHover(true)}
            onMouseLeave={() => setAvatarHover(false)}
            onClick={() => editMode && fileInputRef.current?.click()}
            title={editMode ? 'Click to upload photo' : ''}
          >
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt="Avatar"
                className="w-28 h-28 rounded-2xl object-cover border-4 shadow-xl transition-all"
                style={{ borderColor: editMode ? 'var(--accent-green)' : 'var(--border-color)' }}
              />
            ) : (
              <div
                className="w-28 h-28 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white shadow-xl border-4 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #38523A, #84B056)',
                  borderColor: editMode ? 'var(--accent-green)' : 'transparent',
                }}
              >
                {avatarLetters}
              </div>
            )}

            {/* Hover overlay in edit mode */}
            {editMode && avatarHover && (
              <div className="absolute inset-0 rounded-2xl bg-black/60 flex flex-col items-center justify-center gap-1 animate-fade-in">
                <Upload size={20} className="text-white" />
                <span className="text-white text-[10px] font-bold">Upload Photo</span>
              </div>
            )}

            {/* Camera badge always visible */}
            {!editMode && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#D9E335] flex items-center justify-center shadow-md border-2 border-white">
                <Camera size={14} className="text-[#38523A]" />
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />

          {/* Upload / Remove buttons in edit mode */}
          {editMode && (
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
                style={{ borderColor: 'var(--accent-green)', color: 'var(--accent-forest)' }}
              >
                <Upload size={11} /> Upload
              </button>
              {draft.avatarDataUrl && (
                <button
                  onClick={handleRemoveAvatar}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-rose-400/30 text-rose-500 hover:bg-rose-500/10 transition-all"
                >
                  <Trash2 size={11} /> Remove
                </button>
              )}
            </div>
          )}

          <p className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
            {editMode ? 'JPG, PNG up to 2 MB' : 'Click Edit Profile to change photo'}
          </p>

          {/* Tier badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${tierInfo.bg}`} style={{ color: tierInfo.color }}>
            {tierInfo.icon} {tierInfo.label}
          </span>
        </div>

        {/* Info Column */}
        <div className="flex-1 space-y-5 w-full">

          {/* Name row */}
          <div className="flex items-center gap-2 flex-wrap">
            {editMode ? (
              <input
                value={draft.fullName}
                onChange={e => setDraft(d => ({ ...d, fullName: e.target.value }))}
                className="eco-input px-3 py-2 text-lg font-bold rounded-xl w-full sm:w-auto flex-1"
                placeholder="Your full name"
              />
            ) : (
              <h3 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                {displayName || 'Anonymous User'}
              </h3>
            )}
            {isAdmin && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-indigo-500/10 border-indigo-400/30 text-indigo-400">
                <ShieldCheck size={11} /> Admin
              </span>
            )}
          </div>

          {/* Email (read-only) */}
          <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <Mail size={13} /> {user.email}
          </p>

          {/* Editable fields grid */}
          <div className="grid sm:grid-cols-2 gap-4">

            {/* Phone */}
            <div>
              <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                <Phone size={10} /> Phone Number
              </label>
              {editMode ? (
                <input
                  value={draft.phone}
                  onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))}
                  className="eco-input w-full px-3 py-2 text-sm rounded-xl"
                  placeholder="+91 98765 43210"
                  type="tel"
                />
              ) : (
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {profile.phone || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                <MapPin size={10} /> Location
              </label>
              {editMode ? (
                <input
                  value={draft.location}
                  onChange={e => setDraft(d => ({ ...d, location: e.target.value }))}
                  className="eco-input w-full px-3 py-2 text-sm rounded-xl"
                  placeholder="City, Country"
                />
              ) : (
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {profile.location || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                <UserIcon size={10} /> Gender
              </label>
              {editMode ? (
                <select
                  value={draft.gender}
                  onChange={e => setDraft(d => ({ ...d, gender: e.target.value }))}
                  className="eco-input w-full px-3 py-2 text-sm rounded-xl"
                >
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {profile.gender || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}
                </p>
              )}
            </div>

            {/* Website */}
            <div>
              <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                <Link size={10} /> Website / Social
              </label>
              {editMode ? (
                <input
                  value={draft.website}
                  onChange={e => setDraft(d => ({ ...d, website: e.target.value }))}
                  className="eco-input w-full px-3 py-2 text-sm rounded-xl"
                  placeholder="https://yoursite.com"
                  type="url"
                />
              ) : (
                profile.website ? (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-emerald-500 hover:underline truncate block">
                    {profile.website}
                  </a>
                ) : (
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Not set</p>
                )
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              <FileText size={10} /> About Me
            </label>
            {editMode ? (
              <textarea
                value={draft.bio}
                onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))}
                className="eco-input w-full px-3 py-2 text-sm rounded-xl resize-none"
                placeholder="Tell the EcoTrack community a bit about yourself…"
                rows={3}
                maxLength={300}
              />
            ) : (
              <p className="text-sm leading-relaxed" style={{ color: profile.bio ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                {profile.bio || 'No bio added yet.'}
              </p>
            )}
          </div>

          {/* Member info badges */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-600">
              <Zap size={11} fill="currentColor" /> {userPoints} EcoPoints
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
              <Clock size={11} /> Member since {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
              {isAdmin ? <><ShieldCheck size={11} /> Administrator</> : <><UserIcon size={11} /> Standard User</>}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'EcoPoints', value: userPoints.toLocaleString(), icon: <Zap size={18} className="text-amber-400" />, color: 'text-amber-400' },
          { label: 'Tier', value: tierInfo.icon + ' ' + tierInfo.label.split(' ')[0], icon: <Star size={18} className="text-indigo-400" />, color: 'text-indigo-400' },
          { label: 'Auth Provider', value: user.avatar_url?.includes('googleusercontent') ? 'Google' : 'Email', icon: <ShieldCheck size={18} className="text-emerald-500" />, color: 'text-emerald-500' },
          { label: 'Role', value: isAdmin ? 'Admin' : 'User', icon: <Shield size={18} className="text-teal-400" />, color: 'text-teal-400' },
        ].map(stat => (
          <div key={stat.label} className="glass-panel rounded-2xl p-4 flex flex-col gap-2 hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
              {stat.icon}
            </div>
            <p className={`text-lg font-extrabold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Achievements ── */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--accent-forest)' }}>
          <Trophy size={18} /> Achievements & Badges
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { name: 'First Scan',     desc: 'Scanned your first device', icon: '🔍', earned: true },
            { name: 'Eco Starter',    desc: 'Earned 100+ EcoPoints',      icon: '🌱', earned: userPoints >= 100 },
            { name: 'Recycler',       desc: 'Scheduled first pickup',     icon: '♻️', earned: false },
            { name: 'Silver Tier',    desc: 'Reached 400 EcoPoints',      icon: '🥈', earned: userPoints >= 400 },
            { name: 'Gold Tier',      desc: 'Reached 1000 EcoPoints',     icon: '🥇', earned: userPoints >= 1000 },
            { name: 'Eco Champion',   desc: 'Top 10 on leaderboard',      icon: '🏆', earned: false },
          ].map(badge => (
            <div
              key={badge.name}
              className={`rounded-xl p-3 border flex items-center gap-3 transition-all ${
                badge.earned ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-dashed opacity-40'
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

      {/* ── Account Info (read-only fields) ── */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--accent-forest)' }}>
          <Settings size={18} /> Account Details
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Email Address', value: user.email, icon: <Mail size={13} /> },
            { label: 'Display Name',  value: profile.fullName || '—', icon: <UserIcon size={13} /> },
            { label: 'Account Role',  value: isAdmin ? 'Administrator' : 'Standard User', icon: <Shield size={13} /> },
            { label: 'Auth Method',   value: user.avatar_url?.includes('googleusercontent') ? 'Google OAuth 2.0' : 'Email & Password', icon: <ShieldCheck size={13} /> },
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
            <div className="p-10 glass-panel rounded-2xl text-center animate-pulse text-sm" style={{ color: 'var(--text-muted)' }}>
              Loading admin metrics…
            </div>
          ) : adminStats ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Users',      value: adminStats.metrics.total_users,                         icon: <Users  size={18} className="text-indigo-400" />, color: 'text-indigo-400' },
                { label: 'Devices Recycled', value: adminStats.metrics.total_devices_recycled,               icon: <Package size={18} className="text-emerald-500" />, color: 'text-emerald-500' },
                { label: 'Total Pickups',    value: adminStats.metrics.total_pickups,                         icon: <Truck  size={18} className="text-teal-400" />, color: 'text-teal-400' },
                { label: 'Recyclers Active', value: adminStats.metrics.active_recyclers,                      icon: <Leaf   size={18} className="text-amber-400" />, color: 'text-amber-400' },
                { label: 'Carbon Saved kg',  value: adminStats.metrics.carbon_saved.toFixed(1),              icon: <Leaf   size={18} className="text-green-500" />, color: 'text-green-500' },
                { label: 'Water Saved L',    value: adminStats.metrics.water_saved.toFixed(0),               icon: <Zap    size={18} className="text-blue-400" />, color: 'text-blue-400' },
                { label: 'Revenue $',        value: `$${adminStats.metrics.total_revenue.toFixed(0)}`,       icon: <Star   size={18} className="text-yellow-400" />, color: 'text-yellow-400' },
                { label: 'Trees Equivalent', value: adminStats.metrics.trees_equivalent.toFixed(1),          icon: <Leaf   size={18} className="text-lime-500" />, color: 'text-lime-500' },
              ].map(stat => (
                <div key={stat.label} className="glass-panel rounded-2xl p-4 flex flex-col gap-2 hover:scale-[1.02] transition-transform">
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
                'Access all device submissions across the platform',
                'Read full analytics, carbon & impact metrics',
                'Monitor and manage pickup schedules',
                'View system-wide revenue and recycler data',
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
