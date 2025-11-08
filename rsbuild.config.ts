import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '.env') });

const defaultAllowedOrigins =
  /^https?:\/\/(?:(?:[^:]+\.)?localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/;

export default defineConfig({
  server: {
    port: 3000,
    strictPort: true, // Fail if port is already in use instead of using another port
    cors: {
      origin: [defaultAllowedOrigins, /^https?:\/\/.*\.cloudinary\.com$/],
    },
  },

  output: {
    // Please replace <REPO_NAME> with the repository name.
    // For example, "/my-project/"
    assetPrefix:
      process.env.NODE_ENV === 'production' ? '/se400_home/' : 'auto',
  },

  dev: {
    assetPrefix: 'http://localhost:3000/', // Explicitly set dev asset prefix
    lazyCompilation: false, // Disable lazy compilation to fix Module Federation issues
  },

  source: {
    define: {
      'process.env.BACKEND_URL': JSON.stringify(process.env.BACKEND_URL),
    },
  },

  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'home',
      filename: 'remoteEntry.js',
      remotes: {
        auth: 'auth@http://localhost:3001/remoteEntry.js',
        member: 'member@http://localhost:3004/remoteEntry.js',
      },
      exposes: {
        './MainLayout': './src/components/MainLayout.tsx',
        './SafeComponent': './src/components/SafeComponent.tsx',
        './store': './src/stores/index.ts',
        './styles': './src/App.css',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^19.2.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^19.2.0',
        },
        'react-router-dom': {
          singleton: true,
        },
        'react-redux': {
          singleton: true,
        },
        '@reduxjs/toolkit': {
          singleton: true,
        },
      },
      dts: false, // Disable TypeScript declaration generation
    }),
  ],
});
