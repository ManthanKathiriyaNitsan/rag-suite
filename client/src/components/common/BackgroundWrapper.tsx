import React from 'react';
import { useBackground } from '@/contexts/BackgroundContext';
import ResponsiveDarkVeil from '@/components/ui/ResponsiveDarkVeil';
import { HeroGeometric } from '@/components/ui/HeroGeometric';

export function BackgroundWrapper() {
  const { backgroundTheme } = useBackground();

  return (
    <>
      {backgroundTheme === 'veil' && <ResponsiveDarkVeil />}
      {backgroundTheme === 'geometric' && <HeroGeometric />}
    </>
  );
}

