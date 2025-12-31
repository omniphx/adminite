/**
 * Entry point of the Election app.
 */
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as jsforce from 'jsforce';
import * as log from 'electron-log';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Handle Squirrel events on Windows
if (require('electron-squirrel-startup')) {
  app.quit();
}

log.info('App starting');

let mainWindow: any;

// Helper to create a Salesforce connection with OAuth2 for token refresh
interface ConnectionParams {
  accessToken: string;
  instanceUrl: string;
  refreshToken: string;
  loginUrl: string;
  connectionId?: string;
}

function createSalesforceConnection(params: ConnectionParams): jsforce.Connection {
  const { accessToken, instanceUrl, refreshToken, loginUrl, connectionId } = params;

  // Create OAuth2 object for token refresh capability
  const oauth2 = new jsforce.OAuth2({
    loginUrl,
    clientId: process.env.SALESFORCE_CLIENT_ID,
    clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
    redirectUri: `${PROTOCOL_NAME}://oauth/callback`,
  });

  const connection = new jsforce.Connection({
    oauth2,
    instanceUrl,
    accessToken,
    refreshToken,
  });

  // Listen for token refresh events and notify the renderer
  connection.on('refresh', (newAccessToken: string, res: any) => {
    log.info('Token refreshed automatically for connection:', connectionId);
    if (mainWindow && connectionId) {
      mainWindow.webContents.send('token-refreshed', {
        connectionId,
        accessToken: newAccessToken,
      });
    }
  });

  return connection;
}

// Helper to check if an error indicates the refresh token itself is invalid/expired
function isRefreshTokenInvalidError(error: any): boolean {
  const message = error?.message || error?.toString() || '';
  return (
    message.includes('invalid_grant') ||
    message.includes('expired access/refresh token') ||
    message.includes('refresh token is expired') ||
    message.includes('authentication failure')
  );
}

const isDevelopment = process.env.NODE_ENV !== 'production';
const PROTOCOL_NAME = 'adminite';

// Only initialize auto-updater in production mode
let autoUpdater: any;
if (!isDevelopment) {
  const { autoUpdater: updater } = require('electron-updater');
  autoUpdater = updater;
  autoUpdater.logger = log;
}

async function createWindow(): Promise<void> {
  try {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      height: 800,
      width: 1425,
      minWidth: 800,
      webPreferences: {
        // devTools: isDevelopment,
        nodeIntegration: true,
        contextIsolation: false,
      },
      title: 'Adminite',
      titleBarStyle: 'hidden',
    });

    if (isDevelopment) {
      mainWindow.webContents.openDevTools();
      // mainWindow.webContents.on("devtools-opened", () => {
      //     mainWindow.webContents.closeDevTools();
      // });
    }

    // Load the app using Webpack magic constant
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null;
    });

    mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
      item.once('done', (event, state) => {
        if (state === 'completed') {
          mainWindow.webContents.send('download-complete', item.getSavePath());
        } else {
          console.log(`Download failed: ${state}`);
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
}

// Store OAuth state for callback handling
let pendingOAuth: {
  oauth2: any;
  connectionName: string;
} | null = null;

async function handleOAuthCallback(callbackUrl: string): Promise<void> {
  try {
    log.info('handleOAuthCallback called with URL:', callbackUrl);

    if (!pendingOAuth) {
      log.error('No pending OAuth request');
      return;
    }

    const { oauth2, connectionName } = pendingOAuth;

    // Parse the callback URL to extract the authorization code
    const urlObj = new URL(callbackUrl);
    const code = urlObj.searchParams.get('code');

    log.info('Authorization code:', code ? 'received' : 'missing');

    if (!code) {
      console.error('No authorization code in callback URL');
      return;
    }

    const connection = new jsforce.Connection({ oauth2 });
    await connection.authorize(code);
    const { accessToken, instanceUrl, refreshToken } = connection;

    log.info('OAuth successful:', {
      instanceUrl,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
    });

    // Extra API call but gives us more information
    const identity = await connection.identity();
    const {
      username,
      email,
      display_name,
      nick_name,
      user_id,
      user_type,
      organization_id,
      language,
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
      email,
      display_name,
      nick_name,
      user_id,
      user_type,
      organization_id,
      language,
    });

    // Clear pending OAuth
    pendingOAuth = null;

    // Focus the main window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
    pendingOAuth = null;
  }
}

async function createServer(): Promise<void> {
  try {
    ipcMain.on('create-new-connection', (event, arg) => {
      const oauth2 = new jsforce.OAuth2({
        loginUrl: arg.url,
        clientId: process.env.SALESFORCE_CLIENT_ID,
        clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
        redirectUri: `${PROTOCOL_NAME}://oauth/callback`,
      });

      pendingOAuth = {
        oauth2,
        connectionName: arg.name,
      };

      createAuthenticationWindow(oauth2.getAuthorizationUrl({ scope: 'api id web refresh_token' }));
    });

    // IPC handler for Salesforce API calls (avoids CORS issues in renderer)
    // Explicit token refresh handler - manually refresh the access token using refresh token
    ipcMain.handle(
      'salesforce:refreshToken',
      async (event, { instanceUrl, refreshToken, loginUrl, connectionId }) => {
        try {
          log.info('Manual token refresh requested for connection:', connectionId);

          const oauth2 = new jsforce.OAuth2({
            loginUrl,
            clientId: process.env.SALESFORCE_CLIENT_ID,
            clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
            redirectUri: `${PROTOCOL_NAME}://oauth/callback`,
          });

          // Use the oauth2.refreshToken method as per jsforce documentation
          const res = await oauth2.refreshToken(refreshToken);
          const newAccessToken = res.access_token;

          log.info('Manual token refresh successful for connection:', connectionId);

          // Notify the renderer of the new token
          if (mainWindow && connectionId && newAccessToken) {
            mainWindow.webContents.send('token-refreshed', {
              connectionId,
              accessToken: newAccessToken,
            });
          }

          return { success: true, data: { accessToken: newAccessToken } };
        } catch (error) {
          log.error('salesforce:refreshToken error:', error);

          // Check if this is a refresh token expiration (requires re-authentication)
          if (isRefreshTokenInvalidError(error)) {
            return {
              success: false,
              error: 'Your session has expired. Please reconnect to this org.',
              requiresReauth: true,
            };
          }

          return { success: false, error: error.message };
        }
      }
    );

    ipcMain.handle(
      'salesforce:identity',
      async (event, { accessToken, instanceUrl, refreshToken, loginUrl, connectionId }) => {
        try {
          log.debug('refresh token', refreshToken);
          const connection = createSalesforceConnection({
            accessToken,
            instanceUrl,
            refreshToken,
            loginUrl,
            connectionId,
          });
          const identity = await connection.identity();
          return { success: true, data: identity };
        } catch (error) {
          log.error('salesforce:identity error:', error);
          return { success: false, error: error.message };
        }
      }
    );

    ipcMain.handle(
      'salesforce:getUserInfo',
      async (event, { accessToken, instanceUrl, refreshToken, loginUrl, connectionId }) => {
        try {
          const connection = createSalesforceConnection({
            accessToken,
            instanceUrl,
            refreshToken,
            loginUrl,
            connectionId,
          });
          const userInfo = await connection.soap.getUserInfo();
          return { success: true, data: userInfo };
        } catch (error) {
          log.error('salesforce:getUserInfo error:', error);
          return { success: false, error: error.message };
        }
      }
    );

    ipcMain.handle(
      'salesforce:describeGlobal',
      async (event, { accessToken, instanceUrl, refreshToken, loginUrl, connectionId }) => {
        try {
          const connection = createSalesforceConnection({
            accessToken,
            instanceUrl,
            refreshToken,
            loginUrl,
            connectionId,
          });
          const result = await connection.describeGlobal();
          return { success: true, data: result };
        } catch (error) {
          log.error('salesforce:describeGlobal error:', error);
          return { success: false, error: error.message };
        }
      }
    );

    ipcMain.handle(
      'salesforce:toolingDescribeGlobal',
      async (event, { accessToken, instanceUrl, refreshToken, loginUrl, connectionId }) => {
        try {
          const connection = createSalesforceConnection({
            accessToken,
            instanceUrl,
            refreshToken,
            loginUrl,
            connectionId,
          });
          const result = await connection.tooling.describeGlobal();
          return { success: true, data: result };
        } catch (error) {
          log.error('salesforce:toolingDescribeGlobal error:', error);
          return { success: false, error: error.message };
        }
      }
    );

    ipcMain.handle(
      'salesforce:describe',
      async (
        event,
        { accessToken, instanceUrl, refreshToken, loginUrl, connectionId, sObjectName, toolingMode }
      ) => {
        try {
          const connection = createSalesforceConnection({
            accessToken,
            instanceUrl,
            refreshToken,
            loginUrl,
            connectionId,
          });
          const result = toolingMode
            ? await connection.tooling.describe(sObjectName)
            : await connection.describe(sObjectName);
          return { success: true, data: result };
        } catch (error) {
          log.error('salesforce:describe error:', error);
          return { success: false, error: error.message };
        }
      }
    );

    ipcMain.handle(
      'salesforce:query',
      async (
        event,
        { accessToken, instanceUrl, refreshToken, loginUrl, connectionId, queryString, toolingMode }
      ) => {
        try {
          const connection = createSalesforceConnection({
            accessToken,
            instanceUrl,
            refreshToken,
            loginUrl,
            connectionId,
          });
          const result = toolingMode
            ? await connection.tooling.query(queryString)
            : await connection.query(queryString);
          return { success: true, data: result };
        } catch (error) {
          log.error('salesforce:query error:', error);
          return { success: false, error: error.message };
        }
      }
    );

    ipcMain.handle(
      'salesforce:queryAll',
      async (
        event,
        { accessToken, instanceUrl, refreshToken, loginUrl, connectionId, queryString }
      ) => {
        try {
          const connection = createSalesforceConnection({
            accessToken,
            instanceUrl,
            refreshToken,
            loginUrl,
            connectionId,
          });
          // In jsforce v3, queryAll is replaced with query() using scanAll option
          const result = await connection.query(queryString, { scanAll: true });
          return { success: true, data: result };
        } catch (error) {
          log.error('salesforce:queryAll error:', error);
          return { success: false, error: error.message };
        }
      }
    );

    ipcMain.handle(
      'salesforce:search',
      async (
        event,
        { accessToken, instanceUrl, refreshToken, loginUrl, connectionId, queryString }
      ) => {
        try {
          const connection = createSalesforceConnection({
            accessToken,
            instanceUrl,
            refreshToken,
            loginUrl,
            connectionId,
          });
          const result = await connection.search(queryString);
          return { success: true, data: result };
        } catch (error) {
          log.error('salesforce:search error:', error);
          return { success: false, error: error.message };
        }
      }
    );

    ipcMain.handle(
      'salesforce:queryMore',
      async (
        event,
        {
          accessToken,
          instanceUrl,
          refreshToken,
          loginUrl,
          connectionId,
          nextRecordsUrl,
          toolingMode,
        }
      ) => {
        try {
          const connection = createSalesforceConnection({
            accessToken,
            instanceUrl,
            refreshToken,
            loginUrl,
            connectionId,
          });
          const result = toolingMode
            ? await connection.tooling.queryMore(nextRecordsUrl)
            : await connection.queryMore(nextRecordsUrl);
          return { success: true, data: result };
        } catch (error) {
          log.error('salesforce:queryMore error:', error);
          return { success: false, error: error.message };
        }
      }
    );

    ipcMain.handle(
      'salesforce:insert',
      async (
        event,
        {
          accessToken,
          instanceUrl,
          refreshToken,
          loginUrl,
          connectionId,
          sobjectType,
          records,
          toolingMode,
        }
      ) => {
        try {
          const connection = createSalesforceConnection({
            accessToken,
            instanceUrl,
            refreshToken,
            loginUrl,
            connectionId,
          });
          const result = toolingMode
            ? await connection.tooling.sobject(sobjectType).insert(records)
            : await connection.sobject(sobjectType).insert(records);
          return { success: true, data: result };
        } catch (error) {
          log.error('salesforce:insert error:', error);
          return { success: false, error: error.message };
        }
      }
    );

    ipcMain.handle(
      'salesforce:update',
      async (
        event,
        {
          accessToken,
          instanceUrl,
          refreshToken,
          loginUrl,
          connectionId,
          sobjectType,
          records,
          toolingMode,
        }
      ) => {
        try {
          const connection = createSalesforceConnection({
            accessToken,
            instanceUrl,
            refreshToken,
            loginUrl,
            connectionId,
          });
          const result = toolingMode
            ? await connection.tooling.sobject(sobjectType).update(records)
            : await connection.sobject(sobjectType).update(records);
          return { success: true, data: result };
        } catch (error) {
          log.error('salesforce:update error:', error);
          return { success: false, error: error.message };
        }
      }
    );

    ipcMain.handle(
      'salesforce:delete',
      async (
        event,
        {
          accessToken,
          instanceUrl,
          refreshToken,
          loginUrl,
          connectionId,
          sobjectType,
          ids,
          toolingMode,
        }
      ) => {
        try {
          const connection = createSalesforceConnection({
            accessToken,
            instanceUrl,
            refreshToken,
            loginUrl,
            connectionId,
          });
          const result = toolingMode
            ? await connection.tooling.sobject(sobjectType).del(ids)
            : await connection.sobject(sobjectType).del(ids);
          return { success: true, data: result };
        } catch (error) {
          log.error('salesforce:delete error:', error);
          return { success: false, error: error.message };
        }
      }
    );
  } catch (error) {
    console.error(error);
  }
}

function createAuthenticationWindow(url: string): void {
  shell.openExternal(url);
}

//Prevents issues with self-signed certificates
if (app && app.commandLine) {
  app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
}

//Prevents multiple instances and handles protocol on Windows/Linux
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  // Register custom protocol - works for both dev and production
  // Must be called after single-instance lock is established
  app.setAsDefaultProtocolClient(PROTOCOL_NAME);
  log.info(`Custom protocol '${PROTOCOL_NAME}' registered`);

  // Handle protocol on Windows/Linux when app is already running
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    log.info('second-instance event received');
    log.info('Command line:', commandLine);

    // Check if there's a protocol URL in the command line
    const url = commandLine.find((arg) => arg.startsWith(`${PROTOCOL_NAME}://`));
    if (url) {
      log.info('Protocol URL found in command line:', url);
      handleOAuthCallback(url);
    }

    // Focus the main window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);
  app.on('ready', createServer);

  // Quit when all windows are closed.
  app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow();
    }
  });

  // Handle protocol on macOS
  app.on('open-url', (event, url) => {
    event.preventDefault();
    log.info('open-url event received:', url);
    if (url.startsWith(`${PROTOCOL_NAME}://`)) {
      handleOAuthCallback(url);
    }
  });

  // Auto-update features (production only)
  if (!isDevelopment && autoUpdater) {
    app.on('ready', function () {
      autoUpdater.checkForUpdatesAndNotify();

      //Every 5 minutes
      setInterval(() => {
        autoUpdater.checkForUpdatesAndNotify();
      }, 300000);
    });

    autoUpdater.on('checking-for-update', function () {
      sendStatusToWindow('Checking for update...');
    });

    autoUpdater.on('update-available', function (info) {
      sendStatusToWindow('Update available.');
    });

    autoUpdater.on('update-not-available', function (info) {
      sendStatusToWindow('Update not available.');
    });

    autoUpdater.on('error', function (err) {
      sendStatusToWindow('Error in auto-updater. ' + err);
    });

    autoUpdater.on('download-progress', function (progressObj) {
      const log_message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
      sendStatusToWindow(log_message);
    });

    autoUpdater.on('update-downloaded', function (info) {
      sendStatusToWindow('Update downloaded');
      mainWindow.webContents.send('update-downloaded');
    });

    ipcMain.on('start-update', function (event, arg) {
      sendStatusToWindow('Quit and install');
      autoUpdater.quitAndInstall();
    });
  }

  ipcMain.on('refresh', function (event, arg) {
    mainWindow.reload();
  });

  ipcMain.on('error', function (event, arg) {
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
