'use client';

import { useState, useEffect } from 'react';
import { useSpotify } from '../contexts/SpotifyContext';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
}

export function SpotifyOAuth() {
  const { accessToken, setAccessToken } = useSpotify();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Spotify OAuth configuration
  const CLIENT_ID =
    process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || 'your-spotify-client-id';
  const REDIRECT_URI = typeof window !== 'undefined' ? window.location.origin : 'https://local.cloudfund.fi:8023';
  const SCOPE =
    'user-read-private user-read-email user-library-read user-top-read user-read-recently-played user-read-playback-state user-modify-playback-state playlist-read-private playlist-read-collaborative user-follow-read';

  // Check if we're returning from Spotify OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state === 'spotify_oauth') {
      handleSpotifyCallback(code);
    }
  }, []);

  const handleSpotifyCallback = async (code: string) => {
    setLoading(true);
    setError(null);

    try {
      // Exchange code for access token
      const response = await fetch('/api/spotify/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, redirect_uri: REDIRECT_URI }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokenData: SpotifyTokenResponse = await response.json();

      // Store tokens
      setAccessToken(tokenData.access_token);
      localStorage.setItem('spotify_access_token', tokenData.access_token);
      localStorage.setItem(
        'spotify_token_expiry',
        (Date.now() + tokenData.expires_in * 1000).toString()
      );

      if (tokenData.refresh_token) {
        localStorage.setItem('spotify_refresh_token', tokenData.refresh_token);
      }

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);

      console.log('Spotify OAuth successful!');
    } catch (err) {
      console.error('Spotify OAuth error:', err);
      setError(err instanceof Error ? err.message : 'OAuth failed');
    } finally {
      setLoading(false);
    }
  };

  const initiateSpotifyOAuth = () => {
    const state = 'spotify_oauth';
    const authUrl =
      `https://accounts.spotify.com/authorize?` +
      `client_id=${CLIENT_ID}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(SCOPE)}&` +
      `state=${state}`;

    window.location.href = authUrl;
  };

  const logout = () => {
    setAccessToken(null);
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_token_expiry');
    localStorage.removeItem('spotify_refresh_token');
  };

  const testSpotifyAPI = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Spotify API test successful:', data);
        alert(`Hello ${data.display_name}! Spotify API is working.`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API call failed');
      }
    } catch (err) {
      console.error('Spotify API test failed:', err);
      setError(err instanceof Error ? err.message : 'API test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-gray-800 text-2xl font-bold mb-4 text-center">Spotify OAuth</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      )}

      {accessToken ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <p className="font-medium">✅ Connected to Spotify!</p>
            <p className="text-sm">
              Access token: {accessToken.substring(0, 20)}...
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          <p className="text-gray-600 mb-4">
            Connect your Spotify account to access your music data
          </p>
          <button
            onClick={initiateSpotifyOAuth}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <span>Connect Spotify</span>
          </button>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500">
        <p>
          <strong>Note:</strong> This uses direct Spotify OAuth, not Privy's
          integration.
        </p>
        <p>
          You'll need to set up a Spotify app and configure the environment
          variables.
        </p>
      </div>
    </div>
  );
}
