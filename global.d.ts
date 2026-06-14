// Define the shape of your Electron API
export interface IElectronAPI {
  closePopover: () => void;
  minimizePopover: () => void;
  regenerateText: () => void;
  onSelectedText: (callback: (selectedText: {message: string, loading: boolean}) => void) => void;
}


// Extend the global Window interface
declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}