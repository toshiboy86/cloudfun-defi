import { NextRequest, NextResponse } from 'next/server';

interface SpotifyArtistData {
  id: string;
  name: string;
  popularity: number;
  followers: {
    total: number;
  };
  genres: string[];
  external_urls: {
    spotify: string;
  };
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
}

interface FollowedArtistsResponse {
  artists: {
    href: string;
    limit: number;
    next: string | null;
    cursors: {
      after: string;
      before: string;
    };
    total: number;
    items: SpotifyArtistData[];
  };
}

interface OracleResponse {
  success: boolean;
  data?: SpotifyArtistData[];
  error?: string;
  timestamp: string;
  total?: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('access_token');
  const limit = searchParams.get('limit') || '20';

  if (!accessToken) {
    return NextResponse.json(
      {
        success: false,
        error: 'access_token parameter is required',
        timestamp: new Date().toISOString(),
      } as OracleResponse,
      { status: 400 }
    );
  }

  try {
    // Fetch followed artists from Spotify
    const followedArtistsResponse = await fetch(
      `https://api.spotify.com/v1/me/following?type=artist&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!followedArtistsResponse.ok) {
      const errorData = await followedArtistsResponse.json();
      console.error('Failed to fetch followed artists:', errorData);

      // Handle specific error cases
      if (followedArtistsResponse.status === 401) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid or expired access token',
            timestamp: new Date().toISOString(),
          } as OracleResponse,
          { status: 401 }
        );
      }

      if (followedArtistsResponse.status === 403) {
        // Fallback: Use client credentials to fetch popular artists
        console.log(
          'User token lacks user-follow-read scope, falling back to popular artists'
        );
        return await fetchPopularArtistsFallback();
      }

      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch followed artists: ${
            errorData.error?.message || 'Unknown error'
          }`,
          timestamp: new Date().toISOString(),
        } as OracleResponse,
        { status: followedArtistsResponse.status }
      );
    }

    const followedArtistsData: FollowedArtistsResponse =
      await followedArtistsResponse.json();

    // Return processed data with Oracle metadata
    const oracleResponse: OracleResponse = {
      success: true,
      data: followedArtistsData.artists.items,
      timestamp: new Date().toISOString(),
      total: followedArtistsData.artists.total,
    };

    return NextResponse.json(oracleResponse);
  } catch (error) {
    console.error('Followed artists workflow error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during followed artists workflow',
        timestamp: new Date().toISOString(),
      } as OracleResponse,
      { status: 500 }
    );
  }
}

// Fallback function to fetch popular artists using client credentials
async function fetchPopularArtistsFallback(): Promise<NextResponse> {
  try {
    const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return NextResponse.json(
        {
          success: false,
          error: 'Spotify credentials not configured',
          timestamp: new Date().toISOString(),
        } as OracleResponse,
        { status: 500 }
      );
    }

    // Get client credentials token
    const tokenResponse = await fetch(
      'https://accounts.spotify.com/api/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${CLIENT_ID}:${CLIENT_SECRET}`
          ).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Client credentials authentication failed:', errorData);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to authenticate with Spotify',
          timestamp: new Date().toISOString(),
        } as OracleResponse,
        { status: 401 }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch popular artists using search
    const searchResponse = await fetch(
      'https://api.spotify.com/v1/search?q=genre:pop&type=artist&limit=20',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      console.error('Failed to fetch popular artists:', errorData);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch popular artists: ${
            errorData.error?.message || 'Unknown error'
          }`,
          timestamp: new Date().toISOString(),
        } as OracleResponse,
        { status: searchResponse.status }
      );
    }

    const searchData = await searchResponse.json();
    const popularArtists = searchData.artists?.items || [];

    return NextResponse.json({
      success: true,
      data: popularArtists,
      timestamp: new Date().toISOString(),
      total: popularArtists.length,
      fallback: true, // Indicate this is fallback data
    } as OracleResponse & { fallback: boolean });
  } catch (error) {
    console.error('Popular artists fallback error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during popular artists fallback',
        timestamp: new Date().toISOString(),
      } as OracleResponse,
      { status: 500 }
    );
  }
}
