'use client';

import { usePathname } from 'next/navigation';
import { SharedHeader } from './SharedHeader';

export function HeaderWrapper() {
  const pathname = usePathname();

  // Show back button on all pages except login page
  const showBackButton = pathname !== '/';

  return <SharedHeader showBackButton={showBackButton} />;
}
