// Preload script to set up communication between the main and renderer processes
import { contextBridge, ipcRenderer } from 'electron';

// Expose a safe API to the renderer process for receiving the selected text from the main process
contextBridge.exposeInMainWorld('electronAPI', {

    // Main to Renderer Communication: Listen for the 'selected-text' event from the main process and execute the provided callback with the selected text
    onSelectedText: (callback: (selectedText: string) => void) => {
        ipcRenderer.on('selected-text', (event, selectedText) => {
            callback(selectedText);
        });
    },

    // Renderer to Main Communication: Send the selected text to the main process
    minimizePopover: () => {
        ipcRenderer.invoke('minimize-popover');
    },

    // Renderer to Main Communication: Send the selected text to the main process
    closePopover: () => {
        ipcRenderer.invoke('close-popover');
    },

    // Renderer to Main Communication: Send the selected text to the main process
    regenerateText: () => {
        ipcRenderer.invoke('regenerate-text');
    }
});