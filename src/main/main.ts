/* eslint-disable camelcase */
/* eslint-disable consistent-return */
/* eslint-disable no-restricted-syntax */
/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/no-nesting */
/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import dotenv from 'dotenv';
import 'reflect-metadata';
import path, { join } from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { SqliteDataSource } from './datasource';
import { runSeeders } from 'typeorm-extension';
import runEvents from './events';
import Provider from '@IOC:Provider';
import requireAll from 'App/modules/require-all.module';
import stores from './stores';
import IAuthService from 'App/interfaces/service/service.auth.interface';
import executeBinaries from './binaries';
import dotenvExpand from 'dotenv-expand';
import IObjectStorageService from 'App/interfaces/service/service.object-storage.interface';
import bucketNames from 'src/globals/object-storage/bucket-names';
import initJobs from './jobs';
import policies from './data/defaults/object-storage/policies';

// Initializing .ENV
const myEnv = dotenv.config();
dotenvExpand(myEnv);

const providers = requireAll(join(__dirname, '/app/providers'), true);

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  console.log(app.isPackaged);
  mainWindow = new BrowserWindow({
    show: false,
    width: 1130,
    height: 850,
    minWidth: 1130,
    minHeight: 850,
    frame: true,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */
app.on('window-all-closed', async () => {
  // Log-outs the user first before closing
  const authService = Provider.ioc<IAuthService>('AuthProvider');
  const res = await authService.revoke();
  console.log('Window-close auto log-out response: ', res);

  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(async () => {
    // Initialize database
    try {
      initJobs();
      await SqliteDataSource.initialize();
      const shouldMigrate = await SqliteDataSource.showMigrations();

      if (shouldMigrate) {
        await SqliteDataSource.runMigrations();
      }

      console.log('[DB]: Initialized Successfully');
      try {
        await runSeeders(SqliteDataSource);
        console.log('[DB]: Seeded Successfully');
      } finally {
        executeBinaries();

        // Initialize Stores
        // Each events now has access to the Store
        stores(() => {
          if (providers) {
            console.log('[PROVIDERS]: Initializing...');
            Object.entries(providers).forEach(([name, AppProviderClass]) => {
              const appProvider = new AppProviderClass(Provider);

              try {
                // Saving this provider inside main IOC provider
                appProvider.run();
                console.log(`[PROVIDERS]: Provider ${name} ran successfully`);
              } catch (err) {
                console.log(`[PROVIDERS]: Provider ${name} failed to run`);
                console.log(err);
                throw err;
              }
            });
          }

          runEvents();
        });

        const objectStorageService = Provider.ioc<IObjectStorageService>(
          'ObjectStorageProvider'
        );

        // Creating all buckets after 5 seconds as early service call will throw connection error.
        setTimeout(() => {
          for (const bucketName of bucketNames) {
            objectStorageService.makeBucket({
              bucketName,
              callback: (err) => {
                if (err)
                  console.log(
                    `[ERROR CREATING ${bucketName.toUpperCase()} BUCKET]: `,
                    err
                  );
              },
            });

            objectStorageService.setBucketPolicy({
              bucketName,
              bucketPolicy: JSON.stringify(policies),
              callback: (err: any) => {
                if (err)
                  console.log(
                    `[ERROR SETTING ${bucketName.toUpperCase()} BUCKET POLICY]: `,
                    err
                  );
              },
            });
          }
        }, 5000);

        ipcMain.handle('get:master-key', async () => {
          const system = await SqliteDataSource.createEntityManager().query(
            'SELECT * FROM systems WHERE is_branch = 0'
          );

          if (!system[0]) return false;

          const { master_key: key } = system[0];

          if (key && key.length && key === process.env.MASTER_KEY) {
            return true;
          }

          return false;
        });

        ipcMain.handle('set:master-key', async (_, ...payload: any[]) => {
          const key = payload[0];

          if (key === process.env.MASTER_KEY) {
            try {
              await SqliteDataSource.createEntityManager().query(
                `UPDATE systems SET master_key = '${key}' WHERE is_branch = 0`
              );

              return true;
            } catch (err) {
              console.log('ERROR: ', err);
            }

            return true;
          }

          return false;
        });

        if (SqliteDataSource.isInitialized) {
          createWindow();
        }

        app.on('activate', () => {
          // On macOS it's common to re-create a window in the app when the
          // dock icon is clicked and there are no other windows open.
          if (mainWindow === null) createWindow();
        });
      }
    } catch (err) {
      console.log('[SYSTEM-ERROR]: ', err);
    }
  })
  .catch(console.log);
