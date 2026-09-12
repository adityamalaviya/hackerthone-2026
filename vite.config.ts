import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Stub path — an empty JS module so Vite never resolves the real packages.
const emptyModule = path.resolve(__dirname, 'src/stubs/empty.ts');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Redirect every react-native / Expo import to an empty stub so that
      // rolldown never tries to parse their Flow-typed source code.
      'react-native': emptyModule,
      'react-native-appwrite': emptyModule,
      'react-native-url-polyfill': emptyModule,
      'react-native-url-polyfill/auto': emptyModule,
      'expo-auth-session': emptyModule,
      'expo-web-browser': emptyModule,
      'expo-modules-core': emptyModule,
      'expo-file-system': emptyModule,
    },
  },
  optimizeDeps: {
    exclude: [
      'react-native',
      'react-native-appwrite',
      'react-native-url-polyfill',
      'expo-auth-session',
      'expo-web-browser',
      'expo-modules-core',
      'expo-file-system',
    ],
  },
  server: {
    port: 5180,
    host: true,
  },
});


