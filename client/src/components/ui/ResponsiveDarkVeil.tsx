import { useState, useEffect } from 'react';
import ThemeAwareDarkVeil from './ThemeAwareDarkVeil';

interface ResponsiveDarkVeilProps {
  className?: string;
  hueShift?: number;
  speed?: number;
  warpAmount?: number;
  noiseIntensity?: number;
  scanlineIntensity?: number;
  scanlineFrequency?: number;
  resolutionScale?: number;
}

export default function ResponsiveDarkVeil({ 
  className = "",
  hueShift,
  speed,
  warpAmount,
  noiseIntensity,
  scanlineIntensity,
  scanlineFrequency,
  resolutionScale,
  ...props
}: ResponsiveDarkVeilProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Adjust settings based on screen size for performance
  const getResponsiveSettings = () => {
    if (isMobile) {
      return {
        resolutionScale: 0.5,
        speed: 0.3,
        warpAmount: 0.2,
        noiseIntensity: 0.02,
        scanlineIntensity: 0.1,
        scanlineFrequency: 0.8,
        hueShift: 0
      };
    } else if (isTablet) {
      return {
        resolutionScale: 0.7,
        speed: 0.4,
        warpAmount: 0.3,
        noiseIntensity: 0.03,
        scanlineIntensity: 0.15,
        scanlineFrequency: 1.0,
        hueShift: 0
      };
    } else {
      return {
        resolutionScale: 1,
        speed: 0.5,
        warpAmount: 0.5,
        noiseIntensity: 0.05,
        scanlineIntensity: 0.2,
        scanlineFrequency: 1.2,
        hueShift: 0
      };
    }
  };

  const responsiveSettings = getResponsiveSettings();

  return (
    <div className="mobile-bg-fix">
      <ThemeAwareDarkVeil
        {...responsiveSettings}
        {...props}
        hueShift={hueShift !== undefined ? hueShift : responsiveSettings.hueShift}
        speed={speed !== undefined ? speed : responsiveSettings.speed}
        warpAmount={warpAmount !== undefined ? warpAmount : responsiveSettings.warpAmount}
        noiseIntensity={noiseIntensity !== undefined ? noiseIntensity : responsiveSettings.noiseIntensity}
        scanlineIntensity={scanlineIntensity !== undefined ? scanlineIntensity : responsiveSettings.scanlineIntensity}
        scanlineFrequency={scanlineFrequency !== undefined ? scanlineFrequency : responsiveSettings.scanlineFrequency}
        resolutionScale={resolutionScale !== undefined ? resolutionScale : responsiveSettings.resolutionScale}
        className={className}
      />
    </div>
  );
}
