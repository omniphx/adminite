/**
 * Entry point of the Election app.
 */
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as jsforce from 'jsforce';
import * as express from 'express';
import { autoUpdater } from 'electron-updater';
import * as log from 'electron-log';
import * as tcpPortUsed from 'tcp-port-used';
// import installExtension, { REDUX_DEVTOOLS } from 'electron-devtools-installer'
// import * as Sentry from '@sentry/electron';

// Sentry.init({
//   dsn:
//     'https://3bbc61260e4c425c8c3515afcc62d67f@o398570.ingest.sentry.io/5254517'
// })

autoUpdater.logger = log;
log.info('App starting');

autoUpdater.logger = log;
log.info('App starting');

declare const __static: string;

let mainWindow: any;

const isDevelopment = process.env.NODE_ENV !== 'production';

async function createWindow(): Promise<void> {
  try {
    //Not that this is working
    const iconUrl = url.format({
      pathname: path.join(__static, 'AppIcon.icns'),
      protocol: 'file:',
      slashes: true
    });

    // Create the browser window.
    mainWindow = new BrowserWindow({
      height: 800,
      width: 1425,
      minWidth: 800,
      webPreferences: {
        // devTools: isDevelopment,
        nodeIntegration: true,
        contextIsolation: false
      },
      icon: iconUrl,
      title: 'Adminite',
      titleBarStyle: 'hidden'
    });

    if (isDevelopment) {
      mainWindow.webContents.openDevTools();
      // mainWindow.webContents.on("devtools-opened", () => {
      //     mainWindow.webContents.closeDevTools();
      // });
      mainWindow.loadURL(
        `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
      );
    } else {
      // Useful to debug compile issues
      // mainWindow.webContents.openDevTools()
      mainWindow.loadURL(`file://${__dirname}/../renderer/index.html`);
    }

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null;
    });

    mainWindow.webContents.session.on(
      'will-download',
      (event, item, webContents) => {
        item.once('done', (event, state) => {
          if (state === 'completed') {
            mainWindow.webContents.send(
              'download-complete',
              item.getSavePath()
            );
          } else {
            console.log(`Download failed: ${state}`);
          }
        });
      }
    );
  } catch (error) {
    console.log(error);
  }
}

async function createServer(): Promise<void> {
  try {
    const app = express();

    let listener;
    let oauth2;
    let connectionName;

    ipcMain.on('create-new-connection', (event, arg) => {
      connectionName = arg.name;
      oauth2 = new jsforce.OAuth2({
        loginUrl: arg.url,
        clientId: process.env.ELECTRON_WEBPACK_APP_SALESFORCE_CLIENT_ID,
        clientSecret: process.env.ELECTRON_WEBPACK_APP_SALESFORCE_CLIENT_SECRET,
        redirectUri: `https://localhost:${listener.address().port}/callback`
      });
      createAuthenticationWindow(
        oauth2.getAuthorizationUrl({ connectionName })
      );
    });

    app.get('/callback', async (request, response) => {
      try {
        const connection = new jsforce.Connection({ oauth2: oauth2 });
        const code = request.param('code');
        await connection.authorize(code);
        const { accessToken, instanceUrl, refreshToken } = connection;

        //Extra API call but gives us more information
        const identity = await connection.identity();
        const {
          username,
          first_name,
          last_name,
          email,
          display_name,
          timezone,
          user_id,
          user_type,
          organization_id,
          locale,
          language
        } = identity;
        const { loginUrl, redirectUri } = oauth2;

        mainWindow.webContents.send('new-connection', {
          name: connectionName,
          accessToken,
          instanceUrl,
          refreshToken,
          loginUrl,
          redirectUri,
          username,
          first_name,
          last_name,
          email,
          display_name,
          timezone,
          user_id,
          user_type,
          organization_id,
          locale,
          language
        });

        response.set(
          'location',
          `https://adminite.app/landing/${connectionName}`
        );
        response.status(301).send();
      } catch (error) {
        console.log(error);
      }
    });

    const freePort = await getFreePort();
    console.log(`Port: ${freePort}`);
    listener = app.listen(freePort);
  } catch (error) {
    console.error(error);
  }
}

async function getFreePort() {
  // https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.txt
  const ports = [42834, 29562, 38853, 40011, 44774, 47599];

  for (let i = 0; i < ports.length; i++) {
    const used = await tcpPortUsed.check(ports[i]);
    if (used) continue;
    return ports[i];
  }

  throw 'No ports are available';
}

function createAuthenticationWindow(url: string): void {
  shell.openExternal(url);
}

//Prevents issues with self-signed certificates
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

//Prevents multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      // if (mainWindow.isMinimized()) mainWindow.restore()
      // mainWindow.focus()
    }
  });
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);
  app.on('ready', createServer);

  // Quit when all windows are closed.
  app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow();
    }
  });

  // Auto-update features
  app.on('ready', function() {
    autoUpdater.checkForUpdatesAndNotify();

    //Every 5 minutes
    setInterval(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 300000);
  });

  autoUpdater.on('checking-for-update', function() {
    sendStatusToWindow('Checking for update...');
  });

  autoUpdater.on('update-available', function(info) {
    sendStatusToWindow('Update available.');
  });

  autoUpdater.on('update-not-available', function(info) {
    sendStatusToWindow('Update not available.');
  });

  autoUpdater.on('error', function(err) {
    sendStatusToWindow('Error in auto-updater. ' + err);
  });

  autoUpdater.on('download-progress', function(progressObj) {
    const log_message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
    sendStatusToWindow(log_message);
  });

  autoUpdater.on('update-downloaded', function(info) {
    sendStatusToWindow('Update downloaded');
    mainWindow.webContents.send('update-downloaded');
  });

  ipcMain.on('start-update', function(event, arg) {
    sendStatusToWindow('Quit and install');
    autoUpdater.quitAndInstall();
  });

  ipcMain.on('refresh', function(event, arg) {
    mainWindow.reload();
  });

  ipcMain.on('error', function(event, arg) {
    console.log('Main error');
    console.log(arg);
    log.error(arg);
  });
}

function sendStatusToWindow(text) {
  log.info(text);
  mainWindow.webContents.send('message', text);
}

// app.whenReady().then(() => {
//   installExtension(REDUX_DEVTOOLS)
//     .then(name => console.log(`Added Extension:  ${name}`))
//     .catch(err => console.log('An error occurred: ', err))
// })
