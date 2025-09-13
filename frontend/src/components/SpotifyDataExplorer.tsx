'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { useSpotify } from '../contexts/SpotifyContext';

interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  country: string;
  followers: {
    total: number;
  };
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  product: string; // free or premium
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  public: boolean;
  tracks: {
    total: number;
  };
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  duration_ms: number;
  popularity: number;
}

interface SpotifyShow {
  id: string;
  name: string;
  description: string;
  images: Array<{
    url: string;
  }>;
}

interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: {
    total: number;
  };
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
}

export function SpotifyDataExplorer() {
  const { user } = usePrivy();
  const { accessToken, isConnected } = useSpotify();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [recentTracks, setRecentTracks] = useState<SpotifyTrack[]>([]);
  const [shows, setShows] = useState<SpotifyShow[]>([]);

  const spotifyUserId = user?.spotify?.subject;

  const makeSpotifyRequest = async (endpoint: string) => {
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Spotify API Error: ${errorData.error?.message || 'Unknown error'}`
      );
    }

    return response.json();
  };

  const fetchUserProfile = async () => {
    console.log('Fetching user profile...');
    console.log('Access token available:', !!accessToken);
    setLoading(true);
    setError(null);
    try {
      const data = await makeSpotifyRequest('/me');
      setProfile(data);
      console.log('User Profile:', data);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPlaylists = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await makeSpotifyRequest(
        '/me/top/artists?time_range=long_term&limit=20'
      );
      setPlaylists(data.items);
      console.log('User Playlists:', data.items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch playlists'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTopTracks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await makeSpotifyRequest(
        '/me/top/tracks?time_range=long_term&limit=20'
      );
      setTopTracks(data.items);
      console.log('Top Tracks:', data.items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch top tracks'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTopArtists = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await makeSpotifyRequest(
        '/me/top/artists?time_range=medium_term&limit=20'
      );
      setTopArtists(data.items);
      console.log('Top Artists:', data.items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch top artists'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTracks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await makeSpotifyRequest(
        '/me/player/recently-played?limit=20'
      );
      const tracks = data.items.map((item: any) => item.track);
      setRecentTracks(tracks);
      console.log('Recent Tracks:', tracks);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch recent tracks'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchShows = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await makeSpotifyRequest('/me/shows?limit=20');
      const tracks = data.items.map((item: any) => item.show);
      setShows(tracks);
      console.log('Recent Tracks:', data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch recent tracks'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchUserProfile(),
        fetchUserPlaylists(),
        fetchTopTracks(),
        fetchTopArtists(),
        fetchRecentTracks(),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const testSpotifyConnection = async () => {
    console.log('Testing Spotify connection...');
    try {
      // Try to make a simple request to see what happens
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Spotify API test successful:', data);
        alert('Spotify API connection successful!');
      } else {
        const errorData = await response.json();
        console.error('Spotify API test failed:', errorData);
        alert(
          `Spotify API test failed: ${
            errorData.error?.message || 'Unknown error'
          }`
        );
      }
    } catch (err) {
      console.error('Spotify API test error:', err);
      alert(
        `Spotify API test error: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      );
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Spotify Data Explorer
        </h2>
        <p className="text-gray-600 text-center">
          Please connect your Spotify account using the OAuth component above to
          explore your music data.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Spotify Data Explorer
      </h2>

      <div className="mb-6">
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="font-medium">✅ Connected to Spotify!</p>
          <p className="text-sm">
            Access token:{' '}
            {accessToken
              ? `${accessToken.substring(0, 20)}...`
              : 'Not available'}
          </p>
          {spotifyUserId && (
            <p className="text-sm">
              Privy Spotify User ID:{' '}
              <code className="bg-green-200 px-1 rounded">{spotifyUserId}</code>
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <button
          onClick={testSpotifyConnection}
          disabled={loading}
          className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold rounded"
        >
          Test API Connection
        </button>
        <button
          onClick={fetchUserProfile}
          disabled={loading}
          className="p-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold rounded"
        >
          Get Profile
        </button>
        <button
          onClick={fetchUserPlaylists}
          disabled={loading || !accessToken}
          className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold rounded"
        >
          Get Top Artists
        </button>
        <button
          onClick={fetchTopTracks}
          disabled={loading || !accessToken}
          className="p-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-bold rounded"
        >
          Get Top Tracks
        </button>
        <button
          onClick={fetchTopArtists}
          disabled={loading || !accessToken}
          className="p-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold rounded"
        >
          Get Top Artists
        </button>
        <button
          onClick={fetchRecentTracks}
          disabled={loading || !accessToken}
          className="p-3 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white font-bold rounded"
        >
          Get Recent Tracks
        </button>
        <button
          onClick={fetchShows}
          disabled={loading || !accessToken}
          className="p-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-bold rounded"
        >
          Get Shows
        </button>
        <button
          onClick={fetchAllData}
          disabled={loading || !accessToken}
          className="p-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white font-bold rounded"
        >
          Get All Data
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      )}

      {/* Profile Data */}
      {profile && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-black">
          <h3 className="text-lg font-semibold mb-3">User Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p>
                <strong>Name:</strong> {profile.display_name}
              </p>
              <p>
                <strong>Email:</strong> {profile.email}
              </p>
              <p>
                <strong>Country:</strong> {profile.country}
              </p>
              <p>
                <strong>Product:</strong> {profile.product}
              </p>
              <p>
                <strong>Followers:</strong> {profile.followers.total}
              </p>
            </div>
            {profile.images.length > 0 && (
              <div>
                <img
                  src={profile.images[0].url}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover"
                />
              </div>
            )}
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-blue-600">
              Raw Profile Data
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Playlists Data */}
      {playlists.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-black">
          <h3 className="text-lg font-semibold mb-3">
            Playlists ({playlists.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.slice(0, 6).map((playlist) => (
              <div key={playlist.id} className="p-3 bg-white rounded border">
                <h4 className="font-medium">{playlist.name}</h4>
                <p className="text-sm text-gray-600">{playlist.description}</p>
                <p className="text-sm text-gray-500">
                  Tracks: {playlist.tracks.total}
                </p>
                <p className="text-sm text-gray-500">
                  Public: {playlist.public ? 'Yes' : 'No'}
                </p>
              </div>
            ))}
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-blue-600">
              Raw Playlists Data
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(playlists, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Top Tracks Data */}
      {topTracks.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-black">
          <h3 className="text-lg font-semibold mb-3">
            Top Tracks ({topTracks.length})
          </h3>
          <div className="space-y-2">
            {topTracks.slice(0, 10).map((track, index) => (
              <div
                key={track.id}
                className="flex items-center p-2 bg-white rounded border"
              >
                <span className="w-8 text-sm text-gray-500">{index + 1}</span>
                {track.album.images.length > 0 && (
                  <img
                    src={track.album.images[0].url}
                    alt="Album"
                    className="w-12 h-12 rounded object-cover mx-3"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium">{track.name}</p>
                  <p className="text-sm text-gray-600">
                    {track.artists.map((a) => a.name).join(', ')}
                  </p>
                  <p className="text-sm text-gray-500">
                    Popularity: {track.popularity}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-blue-600">
              Raw Top Tracks Data
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(topTracks, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Top Artists Data */}
      {topArtists.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-black">
          <h3 className="text-lg font-semibold mb-3">
            Top Artists ({topArtists.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topArtists.slice(0, 9).map((artist, index) => (
              <div key={artist.id} className="p-3 bg-white rounded border">
                <div className="flex items-center mb-2">
                  <span className="w-6 text-sm text-gray-500">{index + 1}</span>
                  {artist.images.length > 0 && (
                    <img
                      src={artist.images[0].url}
                      alt="Artist"
                      className="w-12 h-12 rounded-full object-cover mx-2"
                    />
                  )}
                </div>
                <h4 className="font-medium">{artist.name}</h4>
                <p className="text-sm text-gray-600">
                  Followers: {artist.followers.total.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Popularity: {artist.popularity}
                </p>
                <p className="text-sm text-gray-500">
                  Genres: {artist.genres.slice(0, 2).join(', ')}
                </p>
              </div>
            ))}
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-blue-600">
              Raw Top Artists Data
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(topArtists, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Shows Data */}
      {shows.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-black">
          <h3 className="text-lg font-semibold mb-3">Shows ({shows.length})</h3>
          <div className="space-y-2">
            {shows.slice(0, 10).map((show, index) => (
              <div
                key={show.id}
                className="flex items-center p-2 bg-white rounded border"
              >
                <span className="w-8 text-sm text-gray-500">{index + 1}</span>
                {show.images.length > 0 && (
                  <img
                    src={show.images[0].url}
                    alt="Show"
                    className="w-12 h-12 rounded object-cover mx-3"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium">{show.name}</p>
                  <p className="text-sm text-gray-600">{show.description}</p>
                </div>
              </div>
            ))}
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-blue-600">
              Raw Shows Data
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(shows, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Recent Tracks Data */}
      {recentTracks.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-black">
          <h3 className="text-lg font-semibold mb-3">
            Recent Tracks ({recentTracks.length})
          </h3>
          <div className="space-y-2">
            {recentTracks.slice(0, 10).map((track, index) => (
              <div
                key={track.id}
                className="flex items-center p-2 bg-white rounded border"
              >
                <span className="w-8 text-sm text-gray-500">{index + 1}</span>
                {track.album.images.length > 0 && (
                  <img
                    src={track.album.images[0].url}
                    alt="Album"
                    className="w-12 h-12 rounded object-cover mx-3"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium">{track.name}</p>
                  <p className="text-sm text-gray-600">
                    {track.artists.map((a) => a.name).join(', ')}
                  </p>
                  <p className="text-sm text-gray-500">
                    Duration: {Math.floor(track.duration_ms / 60000)}:
                    {((track.duration_ms % 60000) / 1000)
                      .toFixed(0)
                      .padStart(2, '0')}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-blue-600">
              Raw Recent Tracks Data
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(recentTracks, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
