import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: 'Adminite',
    executableName: 'Adminite',
    appBundleId: 'adminite',
    icon: './build/icon', // No extension - Electron will pick the right one
    protocols: [
      {
        name: 'Adminite OAuth',
        schemes: ['adminite']
      }
    ],
    osxSign: {
      optionsForFile: (filePath) => {
        return {
          entitlements: 'build/entitlements.mac.plist',
          'entitlements-inherit': 'build/entitlements.mac.plist',
          hardenedRuntime: true,
          gatekeeperAssess: false
        };
      }
    },
    osxNotarize: process.env.APPLEID ? {
      appleId: process.env.APPLEID,
      appleIdPassword: process.env.APPLEIDPASS,
      teamId: process.env.APPLE_TEAM_ID
    } : undefined
  },

  rebuildConfig: {},

  makers: [
    new MakerSquirrel({
      name: 'Adminite',
      authors: 'Matthew Mitchener',
      setupIcon: './build/icon.ico'
    }, ['win32']),

    new MakerZIP({
      macUpdateManifestBaseUrl: 'https://github.com/omniphx/adminite/releases/latest/download'
    }, ['darwin']),

    new MakerDMG({
      name: 'Adminite',
      icon: './build/icon.icns'
    }, ['darwin'])
  ],

  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'omniphx',
          name: 'adminite'
        },
        prerelease: false,
        draft: true
      }
    }
  ],

  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig,
        devContentSecurityPolicy: "default-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.salesforce.com https://*.force.com",
        renderer: {
          config: rendererConfig,
          nodeIntegration: true,
          entryPoints: [
            {
              html: './src/renderer/index.html',
              js: './src/renderer/index.tsx',
              name: 'main_window'
            }
          ]
        }
      }
    }
  ]
};

export default config;
