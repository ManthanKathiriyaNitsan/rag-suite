/**
 * Assets Index
 * Central export for all asset types
 */

// Icons
export * from './icons';

// Images
export * from './images';

// Fonts
export * from './fonts';

// Asset utilities
export const ASSET_TYPES = {
  ICON: 'icon',
  IMAGE: 'image',
  FONT: 'font',
  AUDIO: 'audio',
  VIDEO: 'video',
  DOCUMENT: 'document',
} as const;

export type AssetType = typeof ASSET_TYPES[keyof typeof ASSET_TYPES];

// Asset loading utilities
export const loadAsset = async (url: string, type: AssetType): Promise<any> => {
  switch (type) {
    case ASSET_TYPES.ICON:
    case ASSET_TYPES.IMAGE:
      return loadImage(url);
    case ASSET_TYPES.FONT:
      return loadFont(url);
    case ASSET_TYPES.AUDIO:
      return loadAudio(url);
    case ASSET_TYPES.VIDEO:
      return loadVideo(url);
    default:
      throw new Error(`Unsupported asset type: ${type}`);
  }
};

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

const loadFont = (url: string): Promise<FontFace> => {
  return new Promise((resolve, reject) => {
    const font = new FontFace('CustomFont', `url(${url})`);
    font.load()
      .then(loadedFont => {
        document.fonts.add(loadedFont);
        resolve(loadedFont);
      })
      .catch(reject);
  });
};

const loadAudio = (url: string): Promise<HTMLAudioElement> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.oncanplaythrough = () => resolve(audio);
    audio.onerror = reject;
    audio.src = url;
  });
};

const loadVideo = (url: string): Promise<HTMLVideoElement> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.oncanplaythrough = () => resolve(video);
    video.onerror = reject;
    video.src = url;
  });
};

// Asset optimization
export const optimizeAsset = (url: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
}): string => {
  // In a real implementation, this would use a CDN or image optimization service
  // For now, return the original URL
  return url;
};

// Asset preloading
export const preloadAsset = (url: string, type: AssetType): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  
  switch (type) {
    case ASSET_TYPES.ICON:
    case ASSET_TYPES.IMAGE:
      link.as = 'image';
      break;
    case ASSET_TYPES.FONT:
      link.as = 'font';
      link.crossOrigin = 'anonymous';
      break;
    case ASSET_TYPES.AUDIO:
      link.as = 'audio';
      break;
    case ASSET_TYPES.VIDEO:
      link.as = 'video';
      break;
  }
  
  document.head.appendChild(link);
};

// Asset bundling utilities
export const getAssetUrl = (path: string): string => {
  // In a real implementation, this would handle asset bundling and CDN URLs
  return `/assets/${path}`;
};

export const getIconUrl = (iconName: string): string => {
  return getAssetUrl(`icons/${iconName}.svg`);
};

export const getImageUrl = (imageName: string): string => {
  return getAssetUrl(`images/${imageName}.png`);
};

export const getFontUrl = (fontName: string): string => {
  return getAssetUrl(`fonts/${fontName}.woff2`);
};
