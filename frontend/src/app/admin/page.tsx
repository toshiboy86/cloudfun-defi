'use client';

import { LoginPage } from '../../components/LoginPage';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const searchParams = useSearchParams();
  const [artistId, setArtistId] = useState<string | null>(null);

  useEffect(() => {
    // Get artistId from query parameters
    const artistIdParam = searchParams.get('id');
    if (artistIdParam) {
      setArtistId(artistIdParam);
    }
  }, [searchParams]);

  console.log('artistId', artistId);
  return <LoginPage artistId={artistId || undefined} />;
}
