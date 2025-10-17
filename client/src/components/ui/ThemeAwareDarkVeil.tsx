import { useTheme } from '@/contexts/ThemeContext';
import DarkVeil from './DarkVeil';

interface ThemeAwareDarkVeilProps {
  hueShift?: number;
  noiseIntensity?: number;
  scanlineIntensity?: number;
  speed?: number;
  scanlineFrequency?: number;
  warpAmount?: number;
  resolutionScale?: number;
  className?: string;
}

export default function ThemeAwareDarkVeil(props: ThemeAwareDarkVeilProps) {
  const { theme } = useTheme();
  
  // Theme-specific defaults
  const getThemeDefaults = () => {
    if (theme === 'light') {
      return {
        hueShift: 0, // No hue shift
        noiseIntensity: 0.02,
        scanlineIntensity: 0.1,
        speed: 0.3,
        scanlineFrequency: 0.8,
        warpAmount: 0.3,
        resolutionScale: 0.8,
        invertColors: true // Custom prop to invert colors
      };
    } else {
      return {
        hueShift: 0, // Keep original black + purple colors
        noiseIntensity: 0.05,
        scanlineIntensity: 0.2,
        speed: 0.5,
        scanlineFrequency: 1.2,
        warpAmount: 0.5,
        resolutionScale: 1,
        invertColors: false
      };
    }
  };

  const themeDefaults = getThemeDefaults();

  return (
    <DarkVeil
      {...themeDefaults}
      {...props}
    />
  );
}
