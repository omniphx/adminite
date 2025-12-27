/**
 * Type declarations for Electron API exposed via preload script
 */

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

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
