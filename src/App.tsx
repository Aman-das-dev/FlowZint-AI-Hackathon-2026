import { useState, useEffect } from 'react';
import type { User } from './services/api';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { Leaf } from 'lucide-react';
import { supabase } from './utils/supabase';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  const clearAuthUrl = () => {
    if (window.location.hash.includes('access_token=')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  // Check auth session on startup
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          localStorage.setItem('ecotrack_token', session.access_token);
          clearAuthUrl();
          setUser({
            id: session.user.id as any,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            avatar_url: session.user.user_metadata?.avatar_url || '',
            eco_points: 0
          });
        }
      } catch (err) {
        console.error('Failed to validate session token:', err);
        localStorage.removeItem('ecotrack_token');
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen to Supabase auth state changes (e.g. from Google OAuth redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowPasswordReset(true);
      }

      if (session) {
        localStorage.setItem('ecotrack_token', session.access_token);
        clearAuthUrl();
        try {
          // Use the Supabase session directly once the auth redirect completes
          setUser({
            id: session.user.id as any,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            avatar_url: session.user.user_metadata?.avatar_url || '',
            eco_points: 0
          });
        } catch (err) {
          console.error('Failed to set session user:', err);
        }
      } else {
        // If there's no session, ensure user is cleared
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleStartApp = async () => {
    // Check if there is already a valid Supabase session (e.g. from Google OAuth redirect)
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setLoading(true);
      try {
        setUser({
          id: session.user.id as any,
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          avatar_url: session.user.user_metadata?.avatar_url || '',
          eco_points: 0
        });
      } catch (e) {
        setAuthModalOpen(true);
      } finally {
        setLoading(false);
      }
    } else {
      // No session — require login. Never auto-login.
      setAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = (loggedUser: User) => {
    setUser(loggedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('ecotrack_token');
    setUser(null);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);
    try {
      if (newPassword.length < 6) throw new Error('Password must be at least 6 characters');
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setShowPasswordReset(false);
      setNewPassword('');
      alert('Password updated successfully!');
    } catch (err: any) {
      setResetError(err.message || 'Failed to update password');
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center animate-spin">
          <Leaf size={24} className="text-black" />
        </div>
        <span className="text-emerald-400 text-sm font-semibold tracking-wider uppercase animate-pulse">Initializing EcoTrack AI...</span>
      </div>
    );
  }

  return (
    <>
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <LandingPage 
          onStartApp={handleStartApp} 
          onOpenAuth={() => setAuthModalOpen(true)} 
        />
      )}

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onAuthSuccess={handleAuthSuccess} 
      />

      {showPasswordReset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a2e1a] border border-[#2d4a2d] rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-md animate-fade-in-up text-white">
            <h2 className="text-2xl font-bold text-[#84B056] mb-2 flex items-center gap-2">Reset Password</h2>
            <p className="text-[#9ab89a] text-sm mb-6">Please enter your new password below.</p>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              {resetError && <div className="text-rose-400 bg-rose-950/20 border border-rose-900 p-3 rounded-lg text-sm">{resetError}</div>}
              <div>
                <label className="block text-xs font-semibold text-[#9ab89a] uppercase tracking-wider mb-2">New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  required 
                  className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-[#2d4a2d] text-white focus:outline-none focus:border-[#84B056]" 
                  placeholder="••••••••"
                />
              </div>
              <button disabled={resetLoading} type="submit" className="w-full py-3 bg-[#84B056] hover:bg-[#a5c87a] text-[#0f1a0f] font-bold rounded-xl transition-all">
                {resetLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
