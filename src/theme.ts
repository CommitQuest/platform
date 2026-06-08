import { extendTheme } from '@chakra-ui/react';

const commitQuestGreen = {
  50: '#e6ffec',
  100: '#b8ffc9',
  200: '#8affa6',
  300: '#5cff83',
  400: '#00ff41',
  500: '#00d936',
  600: '#00b32d',
  700: '#008c23',
  800: '#006619',
  900: '#003f10',
};

const theme = extendTheme({
  colors: {
    green: commitQuestGreen,
    commitQuest: {
      green: '#00ff41',
      background: '#050a05',
      panel: '#0a1a0a',
      surface: '#0a120a',
      border: '#00ff41',
      muted: '#2d6e2d',
    },
  },
  fonts: {
    body: "'Space Mono', monospace",
    heading: "'Press Start 2P', monospace",
    mono: "'Space Mono', monospace",
  },
  styles: {
    global: {
      html: {
        scrollBehavior: 'smooth',
      },
      body: {
        bg: '#050a05',
        color: '#00ff41',
        fontFamily: "'Space Mono', monospace",
      },
    },
  },
});

export default theme;
