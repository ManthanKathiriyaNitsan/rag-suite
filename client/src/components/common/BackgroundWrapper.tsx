import React from 'react';
import { useBackground } from '@/contexts/BackgroundContext';
import { HeroGeometric } from '@/components/ui/HeroGeometric';
import { SimpleBackground } from '@/components/ui/SimpleBackground';

export function BackgroundWrapper() {
  const { backgroundTheme } = useBackground();

  return (
    <>
      {backgroundTheme === 'geometric' && <HeroGeometric />}
      {backgroundTheme === 'simple' && <SimpleBackground />}
    </>
  );
}

