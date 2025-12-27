/**
 * Preload script for Electron
 * Provides secure bridge between main and renderer processes using contextBridge
 */
import { contextBridge, ipcRenderer, shell } from 'electron';

// Define the API shape for type safety
export interface ElectronAPI {
  // Shell operations
  openExternal: (url: string) => Promise<void>;
  showItemInFolder: (path: string) => void;

  // OAuth/Connection management
  createNewConnection: (data: { url: string; name: string }) => void;
  onNewConnection: (callback: (data: any) => void) => () => void;

  // Update notifications
  onUpdateDownloaded: (callback: () => void) => () => void;
  startUpdate: () => void;

  // Download events
  onDownloadComplete: (callback: (path: string) => void) => () => void;

  // Error handling
  sendError: (error: string) => void;
  refresh: () => void;
}

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Shell operations
  openExternal: (url: string) => shell.openExternal(url),
  showItemInFolder: (path: string) => shell.showItemInFolder(path),

  // OAuth/Connection management
  createNewConnection: (data: { url: string; name: string }) => {
    ipcRenderer.send('create-new-connection', data);
  },

  onNewConnection: (callback: (data: any) => void) => {
    const subscription = (_event: any, data: any) => callback(data);
    ipcRenderer.on('new-connection', subscription);
    // Return cleanup function
    return () => {
      ipcRenderer.removeListener('new-connection', subscription);
    };
  },

  // Update notifications
  onUpdateDownloaded: (callback: () => void) => {
    const subscription = () => callback();
    ipcRenderer.on('update-downloaded', subscription);
    return () => {
      ipcRenderer.removeListener('update-downloaded', subscription);
    };
  },

  startUpdate: () => {
    ipcRenderer.send('start-update');
  },

  // Download events
  onDownloadComplete: (callback: (path: string) => void) => {
    const subscription = (_event: any, path: string) => callback(path);
    ipcRenderer.on('download-complete', subscription);
    return () => {
      ipcRenderer.removeListener('download-complete', subscription);
    };
  },

  // Error handling
  sendError: (error: string) => {
    ipcRenderer.send('error', error);
  },

  refresh: () => {
    ipcRenderer.send('refresh');
  }
} as ElectronAPI);
