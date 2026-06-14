import 'dotenv/config';
import { app, globalShortcut, clipboard, BrowserWindow, ipcMain } from 'electron';
import robot from 'robotjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { proofRead } from './proofread.js';

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// We will use RobotJS to simulate native keystrokes for copying the selected text to the clipboard.
const { keyTap } = robot;

// Simulate native Copy keystroke using RobotJS
const IS_MAC = process.platform === 'darwin';

// Declare popoverWindow in the global scope to manage its lifecycle across different functions
let popoverWindow: BrowserWindow | null = null;


/**
 * Helper to process text via AI and send it to the renderer
 */
async function processAndSendText(textToProcess: string) {

    // Initialize resultText
    let selectedText = {
        message: textToProcess,
        loading: false,
    }

    // Call proofRead function
    try {

        // Send a "loading" state to your UI if you want (optional)
        selectedText = {
            ...selectedText,
            loading: true
        }
        popoverWindow?.webContents.send('selected-text', selectedText);

        // Call proofRead function
        const { choices } = await proofRead(textToProcess);

        // Get the proofread text
        selectedText = {
            message: choices[0].message.content || "Unable to proofread : " + textToProcess,
            loading: false,
        };
    } catch (err) {

        // If there is an error, return the original text
        selectedText = {
            message: "Unable to proofread : " + textToProcess,
            loading: false,
        };
    }

    // Send the final text to the renderer
    popoverWindow?.webContents.send('selected-text', selectedText);
}

/**
 * Open a popover window to display the selected text.
 * @param selectedText The text that was selected by the user.
 */
function openPopover(selectedText: string) {


    // 1. IF WINDOW EXISTS: Just show it and update the text
    if (popoverWindow && !popoverWindow.isDestroyed()) {

        // Bring it to the front if minimized or hidden
        if (popoverWindow.isMinimized()) popoverWindow.restore();
        popoverWindow.show();
        popoverWindow.focus();

        // Process text and send it directly to the already open window
        processAndSendText(selectedText);

        // Exit early, do not create a new window
        return;
    }

    // Create a new BrowserWindow to display the selected text
    popoverWindow = new BrowserWindow({
        // Set the dimensions of the popover window
        width: 300,
        minWidth: 300,
        maxWidth: 300,
        height: 182,
        minHeight: 182,
        maxHeight: 182,
        // Remove the native OS title bar and borders to create a clean popover appearance
        frame: false,
        // Make the popover appear on top of all other windows
        alwaysOnTop: true,
        // Prevents a separate icon from cluttering the OS taskbar    
        skipTaskbar: false,
        // Keeps the layout locked down
        resizable: true,
        // Allows for curved corners or custom-shaped designs     
        transparent: true,
        // Make the popover window draggable
        movable: true,
        // Enable rounded corners for a more modern and visually appealing look
        roundedCorners: false,
        // Prevent the popover window from having a shadow
        hasShadow: false,
        // Declare title
        title: 'Proofread',
        // Enable Node.js integration in the popover window to allow us to use Electron's APIs for clipboard access and other functionalities.
        webPreferences: {
            nodeIntegration: true,
            // Prevent po
            contextIsolation: true,
            // Preload script to set up communication between the main and renderer processes
            preload: path.join(__dirname, 'popover-preload.js'),
        },
    })

    // Load a local HTML file to display the selected text
    popoverWindow.loadFile(path.join(__dirname, '../popover.html'));

    // Once the popover window is ready, send the selected text to the renderer process to be displayed in the popover
    // popoverWindow.webContents.openDevTools({ mode: 'detach' });

    // If is mac force the popover to be visible on all workspaces and hide the window buttons for a cleaner look
    if (IS_MAC) {
        popoverWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
        popoverWindow.setWindowButtonVisibility(false);
    }

    // Send the selected text to the popover window after it has finished loading
    popoverWindow.webContents.on('did-finish-load', async () => {
        // Process text and send it directly to the already open window
        processAndSendText(selectedText);
    });

}

/**
 * Read the clipboard and open the popover with the selected text
 * @returns 
 */
function readClipboardTextAndOpenPopover() {

    // Get the appropriate modifier key
    const modifier = IS_MAC ? 'command' : 'control';

    // Simulates pressing Cmd+C or Ctrl+C
    keyTap('c', modifier);

    // Delay the execution to ensure the clipboard has the latest selected text
    setTimeout(() => {
        // Get the selected text
        const selectedText = (clipboard.readText()).trim();

        // If there is no selected text, return early
        if (!selectedText) return;

        // Open the popover with the selected text
        openPopover(selectedText);

    }, 100);
}




/**
 * Read the clipboard and open the popover with the selected text
 * @returns 
 */
function readClipboardTextWithRegenerationAndOpenPopover() {

    // Get the appropriate modifier key
    const modifier = IS_MAC ? 'command' : 'control';

    // Simulates pressing Cmd+C or Ctrl+C
    keyTap('c', modifier);

    // Delay the execution to ensure the clipboard has the latest selected text
    setTimeout(() => {
        // Get the selected text
        const selectedText = (clipboard.readText()).trim();

        // If there is no selected text, return early
        if (!selectedText) return;

        // Open the popover with the selected text
        openPopover("#ACTION_REGENERATE " + selectedText);

    }, 100);
}


/**
 * Handle the execution of the "CommandOrControl+Shift+R" shortcut.
 * This will be called when the user presses the shortcut.
 */
function onExecuteCommandOrControlShiftR() {

    // Read the clipboard and open the popover with the selected text
    readClipboardTextAndOpenPopover();
}

/**
 * Global shortcuts mapping. This object maps specific key combinations to their corresponding functions.
 * When a user presses a key combination, the associated function will be executed.
 */
const GLOBAL_SHORTCUTS: {
    [shortcut: string]: () => void
} = {
    'CommandOrControl+Shift+R': onExecuteCommandOrControlShiftR
}

/**
 * Register global shortcuts for the application.
 * This will allow us to listen for specific key combinations and execute corresponding functions.
 */
function registerGlobalShortcuts() {
    for (const shortcut in GLOBAL_SHORTCUTS) {
        globalShortcut.register(shortcut, GLOBAL_SHORTCUTS[shortcut]);
    }
}


/**
 * Handle the minimize popover event from the renderer process. 
 * This will minimize the popover window when the user clicks the minimize button in the popover.
 */
function onMinimizePopover() {
    if (popoverWindow) {
        popoverWindow.minimize();
    }
}


/**
 * Handle the close popover event from the renderer process. 
 * This will close the popover window when the user clicks the close button in the popover.
 */
function onClosePopover() {
    if (popoverWindow) {
        popoverWindow.close();
        popoverWindow = null;
    }
}


/**
 * Handle the regenerate text event from the renderer process.
 * This will regenerate the selected text in the original application when the user clicks the regenerate button in the popover.
 */
function onRegenerateText() {
    // Read the clipboard and open the popover with the selected text
    readClipboardTextWithRegenerationAndOpenPopover();
}

/**
 * IPC main handlers mapping. This object maps specific IPC channels to their corresponding functions.
 * When a message is sent from the renderer process to the main process on a specific channel, the associated function will be executed.
 */
const IPC_MAIN_HANDLERS: {
    [channel: string]: (...args: any[]) => void
} = {
    'minimize-popover': onMinimizePopover,
    'close-popover': onClosePopover,
    'regenerate-text': onRegenerateText
}


/**
 * Register IPC main handlers for the application.
 * This will allow us to listen for specific messages from the renderer process and execute corresponding functions.
 */
function registerIpcMainHandlers() {
    for (const channel in IPC_MAIN_HANDLERS) {
        ipcMain.handle(channel, IPC_MAIN_HANDLERS[channel]);
    }
}


/**
 * Initialize the application callback function.
 * This will be called when the app is ready.
 */
function init() {
    registerGlobalShortcuts();
    registerIpcMainHandlers();
}

// Initialize the app
app.on('ready', init);
