# Spotify Oracle API Endpoint

This endpoint implements the Oracle workflow for accessing Spotify's public API using client credentials authentication.

## Overview

The Oracle workflow follows these steps:

1. **Authenticate the Application** - Uses client credentials to get an access token
2. **Receive an Access Token** - Gets a temporary token valid for ~1 hour
3. **Fetch Public Artist Data** - Makes requests to Spotify's public artist endpoints
4. **Process the Data** - Returns structured data ready for on-chain use

## Endpoints

### GET `/api/spotify/oracle?artist_id={artist_id}`

Fetches public data for a single artist.

**Parameters:**

- `artist_id` (required): Spotify artist ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "4Z8W4fKeB5YxbusRsdQVPb",
    "name": "Radiohead",
    "popularity": 80,
    "followers": {
      "total": 12345678
    },
    "genres": ["alternative rock", "art rock"],
    "external_urls": {
      "spotify": "https://open.spotify.com/artist/4Z8W4fKeB5YxbusRsdQVPb"
    },
    "images": [...]
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "artist_id": "4Z8W4fKeB5YxbusRsdQVPb"
}
```

### POST `/api/spotify/oracle`

Fetches public data for multiple artists in a single request.

**Request Body:**

```json
{
  "artist_ids": ["4Z8W4fKeB5YxbusRsdQVPb", "1dfeR4HaWDbWqFHLkxsg1d"]
}
```

**Response:**

```json
{
  "success": true,
  "results": [
    {
      "artist_id": "4Z8W4fKeB5YxbusRsdQVPb",
      "success": true,
      "data": {
        /* artist data */
      },
      "error": null
    },
    {
      "artist_id": "1dfeR4HaWDbWqFHLkxsg1d",
      "success": true,
      "data": {
        /* artist data */
      },
      "error": null
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z",
  "total_processed": 2,
  "successful": 2,
  "failed": 0
}
```

## Usage Examples

### Single Artist Request

```bash
curl "http://localhost:3000/api/spotify/oracle?artist_id=4Z8W4fKeB5YxbusRsdQVPb"
```

### Batch Artist Request

```bash
curl -X POST "http://localhost:3000/api/spotify/oracle" \
  -H "Content-Type: application/json" \
  -d '{"artist_ids": ["4Z8W4fKeB5YxbusRsdQVPb", "1dfeR4HaWDbWqFHLkxsg1d"]}'
```

### JavaScript/TypeScript

```typescript
// Single artist
const response = await fetch(
  '/api/spotify/oracle?artist_id=4Z8W4fKeB5YxbusRsdQVPb'
);
const data = await response.json();

// Multiple artists
const response = await fetch('/api/spotify/oracle', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    artist_ids: ['4Z8W4fKeB5YxbusRsdQVPb', '1dfeR4HaWDbWqFHLkxsg1d'],
  }),
});
const data = await response.json();
```

## Environment Variables Required

Make sure these environment variables are set in your `.env.local`:

```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

## Error Handling

The API returns structured error responses:

```json
{
  "success": false,
  "error": "Error description",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "artist_id": "artist_id_if_applicable"
}
```

Common error scenarios:

- Missing `artist_id` parameter
- Invalid Spotify credentials
- Artist not found
- Rate limiting
- Network errors

## Rate Limiting

- Uses Spotify's client credentials flow (no user authentication required)
- Access tokens are valid for ~1 hour
- Batch requests limited to 10 artists maximum
- Consider implementing caching for production use

## Oracle Integration

This endpoint is designed to be called by off-chain oracle scripts that can:

1. Periodically fetch artist data (e.g., every hour)
2. Process the popularity scores and other metrics
3. Push the data on-chain for smart contract consumption
4. Handle batch processing for multiple artists efficiently
