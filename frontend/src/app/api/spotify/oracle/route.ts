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

interface OracleResponse {
  success: boolean;
  data?: SpotifyArtistData;
  error?: string;
  timestamp: string;
  artist_id: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get('artist_id');

  if (!artistId) {
    return NextResponse.json(
      {
        success: false,
        error: 'artist_id parameter is required',
        timestamp: new Date().toISOString(),
      } as OracleResponse,
      { status: 400 }
    );
  }

  try {
    // Step 1: Authenticate the Application
    const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return NextResponse.json(
        {
          success: false,
          error: 'Spotify credentials not configured',
          timestamp: new Date().toISOString(),
          artist_id: artistId,
        } as OracleResponse,
        { status: 500 }
      );
    }

    // Step 2: Get Access Token using Client Credentials
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
      console.error(
        'Spotify client credentials authentication failed:',
        errorData
      );
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to authenticate with Spotify',
          timestamp: new Date().toISOString(),
          artist_id: artistId,
        } as OracleResponse,
        { status: 401 }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Step 3: Fetch Public Artist Data
    const artistResponse = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!artistResponse.ok) {
      const errorData = await artistResponse.json();
      console.error('Failed to fetch artist data:', errorData);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch artist data: ${
            errorData.error?.message || 'Unknown error'
          }`,
          timestamp: new Date().toISOString(),
          artist_id: artistId,
        } as OracleResponse,
        { status: artistResponse.status }
      );
    }

    // Step 4: Process the Data
    const artistData: SpotifyArtistData = await artistResponse.json();

    // Return processed data with Oracle metadata
    const oracleResponse: OracleResponse = {
      success: true,
      data: artistData,
      timestamp: new Date().toISOString(),
      artist_id: artistId,
    };

    return NextResponse.json(oracleResponse);
  } catch (error) {
    console.error('Oracle workflow error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during Oracle workflow',
        timestamp: new Date().toISOString(),
        artist_id: artistId,
      } as OracleResponse,
      { status: 500 }
    );
  }
}

// POST endpoint for batch processing multiple artists
export async function POST(request: NextRequest) {
  try {
    const { artist_ids } = await request.json();

    if (!artist_ids || !Array.isArray(artist_ids) || artist_ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'artist_ids array is required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    if (artist_ids.length > 10) {
      return NextResponse.json(
        {
          success: false,
          error: 'Maximum 10 artists allowed per batch request',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Step 1: Authenticate the Application
    const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return NextResponse.json(
        {
          success: false,
          error: 'Spotify credentials not configured',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Step 2: Get Access Token using Client Credentials
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
      console.error(
        'Spotify client credentials authentication failed:',
        errorData
      );
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to authenticate with Spotify',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Step 3 & 4: Fetch and Process Multiple Artists
    const results = await Promise.allSettled(
      artist_ids.map(async (artistId: string) => {
        const artistResponse = await fetch(
          `https://api.spotify.com/v1/artists/${artistId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!artistResponse.ok) {
          const errorData = await artistResponse.json();
          throw new Error(
            `${artistId}: ${errorData.error?.message || 'Unknown error'}`
          );
        }

        return {
          artist_id: artistId,
          data: (await artistResponse.json()) as SpotifyArtistData,
        };
      })
    );

    // Process results
    const processedResults = results.map((result, index) => ({
      artist_id: artist_ids[index],
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value.data : null,
      error: result.status === 'rejected' ? result.reason.message : null,
    }));

    return NextResponse.json({
      success: true,
      results: processedResults,
      timestamp: new Date().toISOString(),
      total_processed: artist_ids.length,
      successful: processedResults.filter((r) => r.success).length,
      failed: processedResults.filter((r) => !r.success).length,
    });
  } catch (error) {
    console.error('Oracle batch workflow error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during Oracle batch workflow',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
