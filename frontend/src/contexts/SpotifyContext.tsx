'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface SpotifyContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  isConnected: boolean;
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

export function SpotifyProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Load access token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('spotify_access_token');
    const tokenExpiry = localStorage.getItem('spotify_token_expiry');

    if (storedToken && tokenExpiry) {
      const now = Date.now();
      const expiry = parseInt(tokenExpiry);

      if (now < expiry) {
        setAccessToken(storedToken);
        console.log('Loaded valid Spotify access token from storage');
      } else {
        console.log('Stored Spotify token expired, clearing...');
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_token_expiry');
        localStorage.removeItem('spotify_refresh_token');
      }
    }
  }, []);

  // Listen for storage changes (when token is updated in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'spotify_access_token') {
        setAccessToken(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    accessToken,
    setAccessToken,
    isConnected: !!accessToken,
  };

  return (
    <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>
  );
}

export function useSpotify() {
  const context = useContext(SpotifyContext);
  if (context === undefined) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
}
