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
import 'reflect-metadata';
import dotenv from 'dotenv';
import path, { join } from 'path';
import Electron, { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { SqliteDataSource } from './datasource';
import { runSeeders } from 'typeorm-extension';
import runEvents from './events';
import Provider from '@IOC:Provider';
import requireAll from 'App/modules/require-all.module';
import stores, { GlobalStorage } from './stores';
import executeBinaries from './binaries';
import dotenvExpand from 'dotenv-expand';
import IObjectStorageService from 'App/interfaces/service/service.object-storage.interface';
import bucketNames from 'src/globals/object-storage/bucket-names';
import initJobs, { Bull } from './jobs';
import policies from './data/defaults/object-storage/policies';
import HID from 'node-hid';
import './scheduler';
import IDeviceInfo from 'App/interfaces/barcode/barcode.device-info.interface';

const { setupSecurePOSPrinter } = require('electron-secure-pos-printer');

// Initializing .ENV
const myEnv = dotenv.config();
dotenvExpand(myEnv);

const IS_PROD = process.env.NODE_ENV === 'production';
const providers = requireAll(
  IS_PROD
    ? require?.context?.('./app/providers', true, /\.(js|ts|json)$/)
    : join(__dirname, '/app/providers')
);

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

export let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
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

  const RESOURCES_PATH = process.env.NODE_ENV === 'production'
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1200,
    height: 850,
    minWidth: 1200,
    minHeight: 850,
    autoHideMenuBar: true,
    frame: true,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false,
      preload: process.env.NODE_ENV === 'production'
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }

    setupSecurePOSPrinter(Electron);
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', async () => {
    console.log('CLOSING APP');
    const globalStorage = GlobalStorage();

    const cachedHIDInfo: IDeviceInfo = globalStorage.get('HID:SELECTED:BARCODE');

    if (cachedHIDInfo && cachedHIDInfo.id) {
      console.log('CLOSING DEVICE');

      const [vendorId, productId] = cachedHIDInfo.id.split(':');
      // const device = await HID.HIDAsync.open(Number(vendorId), Number(productId));

      try {
        cachedHIDInfo.status = 'WAIT';
        globalStorage.set('HID:SELECTED:BARCODE', cachedHIDInfo);

        // await device.close();
      } catch (err) {
        console.log('ERROR CLOSING THE HID DEVICE: ', err);
      }
    }

    if (global.binaryProcesses) {
      console.log('TERMINATING BINARY-PROCESS');
      global.binaryProcesses.killAll();
    }

    mainWindow = null;
  });

  app.commandLine.appendSwitch('disable-hid-blocklist');

  let grantedDeviceThroughPermHandler:
    | globalThis.Electron.USBDevice
    | globalThis.Electron.HIDDevice
    | globalThis.Electron.SerialPort
    | null;

  if (mainWindow) {
    mainWindow.webContents.session.on('select-usb-device', (event, details, callback) => {
      // Add events to handle devices being added or removed before the callback on
      // `select-usb-device` is called.
      mainWindow!.webContents.session.on('usb-device-added', (event, device) => {
        console.log('usb-device-added FIRED WITH', device)
        // Optionally update details.deviceList
      })

      mainWindow!.webContents.session.on('usb-device-removed', (event, device) => {
        console.log('usb-device-removed FIRED WITH', device)
        // Optionally update details.deviceList
      })

      event.preventDefault()
      if (details.deviceList && details.deviceList.length > 0) {
        const deviceToReturn = details.deviceList.find((device) => {
          return !grantedDeviceThroughPermHandler || (device.deviceId !== grantedDeviceThroughPermHandler.deviceId)
        })
        if (deviceToReturn) {
          callback(deviceToReturn.deviceId)
        } else {
          callback()
        }
      }
    });

    mainWindow.webContents.session.setPermissionCheckHandler((
      webContents,
      permission,
      requestingOrigin,
      details
    ) => {
      return true
      // if (permission === 'usb') {
      // }
    })

    mainWindow.webContents.session.setDevicePermissionHandler((details) => {
      return true;
      // if (details.deviceType === 'usb') {
      //   // if (!grantedDeviceThroughPermHandler) {
      //   //   grantedDeviceThroughPermHandler = details.device
      //   //   return true
      //   // } else {
      //   //   return false
      //   // }
      // }
    })

    mainWindow.webContents.session.setUSBProtectedClassesHandler((details) => {
      // return details.protectedClasses.filter((usbClass) => {
      //   // Exclude classes except for audio classes
      //   return usbClass.indexOf('audio') === -1
      // })

      return [];
    })
  }


  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  global.emitToRenderer = (channel, data) => {
    mainWindow?.webContents.send('main-message', { channel, data });
  }

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */
app.on('window-all-closed', async () => {
  const globalStorage = GlobalStorage();

  const cachedHIDInfo: IDeviceInfo = globalStorage.get('HID:SELECTED:BARCODE');

  if (cachedHIDInfo && cachedHIDInfo.id) {
    console.log('CLOSING DEVICE');

    const [vendorId, productId] = cachedHIDInfo.id.split(':');
    // const device = await HID.HIDAsync.open(Number(vendorId), Number(productId));

    try {
      cachedHIDInfo.status = 'WAIT';
      globalStorage.set('HID:SELECTED:BARCODE', cachedHIDInfo);

      // await device.close();
    } catch (err) {
      console.log('ERROR CLOSING THE HID DEVICE: ', err);
    }
  }

  // Log-outs the user first before closing
  // const authService = Provider.ioc<IAuthService>('AuthProvider');
  // const res = await authService.revoke();
  // console.log('Window-close auto log-out response: ', res);

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
      const storage = GlobalStorage();
      const datasource = await SqliteDataSource.initialize();
      console.log('[DB]: Initialized Successfully');

      const shouldMigrate = await datasource.showMigrations();

      console.log('[DB]: IS MIGRATING: ', shouldMigrate);
      if (shouldMigrate) {
        await datasource.runMigrations({
          transaction: 'all',
          fake: false,
        });
        console.log('[DB]: Migrated Successfully');
      }

      global.datasource = datasource;
      initJobs();

      try {
        await runSeeders(datasource);
        console.log('[DB]: Seeded Successfully');
      } finally {
        const binaryProcesses = executeBinaries();

        if (binaryProcesses) {
          global.binaryProcesses = binaryProcesses;
        }

        // Initialize Stores
        // Each events now has access to the Store
        stores(() => {
          if (providers) {
            console.log('[PROVIDERS]: Initializing...');
            Object.entries(providers).forEach(([name, AppProviderClass]) => {
              try {
                const appProvider = new AppProviderClass(Provider);

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

        // STORAGE HANDLERS
        ipcMain.on('storage:set', (event, ...payload: any[]) => {
          const key = payload[0];
          const value = payload[1];

          try {
            storage.set(key, value);
            event.returnValue = null;
          } catch (err: any) {
            console.log('STORAGE:SET:ERROR: ', err);
            event.returnValue = err?.message ?? 'Error occured in Storage-set';
          }
        });

        ipcMain.on('storage:get', (event, ...payload: any[]) => {
          const key = payload[0];

          try {
            event.returnValue = storage.get(key);
          } catch (err: any) {
            console.log('STORAGE:GET:ERROR: ', err);
            event.returnValue = err?.message ?? 'Error occured in Storage-set';
          }
        });

        ipcMain.on('storage:remove', (event, ...payload: any[]) => {
          const key = payload[0];

          try {
            storage.delete(key);
            event.returnValue = null;
          } catch (err: any) {
            console.log('STORAGE:DELETE:ERROR: ', err);
            event.returnValue = err?.message ?? 'Error occured in Storage-set';
          }
        });

        ipcMain.on('storage:clear', (event) => {
          try {
            storage.clear();
            event.returnValue = null;
          }  catch (err: any) {
            console.log('STORAGE:CLEAR:ERROR: ', err);
            event.returnValue = err?.message ?? 'Error occured in Storage-set';
          }
        });

        await Bull('DISCOUNT_JOB', {});
        await Bull('EXPIRATION_JOB', {});
        await createWindow();

        app.on('activate', async () => {
          console.log('APP IS ACTIVE');

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
