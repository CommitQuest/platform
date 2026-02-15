import React from 'react';
import { Box } from '@chakra-ui/react';

/** Object with optional background/foreground layer URL keys (e.g. from UserContext or inventory). */
export interface BackgroundLayersSource {
  background_1?: string;
  background_2?: string;
  background_3?: string;
  background_4?: string;
  foreground_1?: string;
  foreground_2?: string;
  /** Typo used in some inventory responses */
  foregound_1?: string;
}

const BACKGROUND_KEYS = ['background_1', 'background_2', 'background_3', 'background_4'] as const;
const FOREGROUND_KEYS = ['foreground_1', 'foreground_2'] as const;

function getForegroundUrl(
  bg: BackgroundLayersSource | null | undefined,
  key: 'foreground_1' | 'foreground_2'
): string | undefined {
  if (!bg) return undefined;
  if (key === 'foreground_1') {
    return bg.foreground_1 ?? bg.foregound_1;
  }
  return bg.foreground_2;
}

/**
 * Renders background layer boxes for a given background source (e.g. active background or inventory item).
 */
export function generateBackgroundLayers(
  bg: BackgroundLayersSource | null | undefined
): React.ReactNode {
  if (!bg) return null;
  return BACKGROUND_KEYS.map((key, index) => {
    const layerUrl = bg[key];
    if (layerUrl) {
      return (
        <Box
          key={key}
          position="absolute"
          bottom={0}
          left={0}
          width="100%"
          height="100%"
          backgroundImage={`url(${layerUrl})`}
          backgroundSize="cover"
          backgroundPosition="center top"
          backgroundRepeat="no-repeat"
          zIndex={index + 1}
        />
      );
    }
    return null;
  });
}

/**
 * Renders foreground layer boxes for a given background source.
 */
export function generateForegroundLayers(
  bg: BackgroundLayersSource | null | undefined
): React.ReactNode {
  if (!bg) return null;
  return FOREGROUND_KEYS.map((key, index) => {
    const layerUrl = getForegroundUrl(bg, key);
    if (layerUrl) {
      return (
        <Box
          key={key}
          position="absolute"
          bottom={0}
          left={0}
          width="100%"
          height="100%"
          backgroundImage={`url(${layerUrl})`}
          backgroundSize="cover"
          backgroundPosition="center top"
          backgroundRepeat="no-repeat"
          zIndex={6 + index}
        />
      );
    }
    return null;
  });
}
