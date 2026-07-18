import { useState, useEffect } from 'react';
import { api, type User } from './services/api';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { Leaf } from 'lucide-react';
import { supabase } from './utils/supabase';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check auth session on startup
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('ecotrack_token');
        if (token) {
          const profile = await api.getMe();
          setUser(profile.user);
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        localStorage.setItem('ecotrack_token', session.access_token);
        // Clean up the dangling '#' left by Supabase from the URL for a cleaner look
        if (window.location.hash === '' || window.location.hash === '#') {
           window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        try {
          const profile = await api.getMe();
          setUser(profile.user);
        } catch (err) {
          console.error('Failed to validate session token:', err);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleStartApp = async () => {
    // If not logged in, we can either show the AuthModal or directly log them in as a demo user
    const token = localStorage.getItem('ecotrack_token');
    if (token) {
      setLoading(true);
      try {
        const profile = await api.getMe();
        setUser(profile.user);
      } catch (e) {
        setAuthModalOpen(true);
      } finally {
        setLoading(false);
      }
    } else {
      // For a seamless hackathon user experience, let's auto-auth as the Demo user
      // if they click 'Launch' without a custom account.
      setLoading(true);
      try {
        const profile = await api.getMe(); // Backend defaults to demo user if no token is passed
        setUser(profile.user);
      } catch (err) {
        // Fallback to opening login popup if even the backend fallback fails
        setAuthModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAuthSuccess = (loggedUser: User) => {
    setUser(loggedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('ecotrack_token');
    setUser(null);
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
    </>
  );
}

export default App;
