'use client';

import { LoginPage } from '../../components/LoginPage';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function AdminPageContent() {
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

export default function AdminPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminPageContent />
    </Suspense>
  );
}
