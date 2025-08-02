const { app, BrowserWindow, Menu, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('disable-web-security');
app.commandLine.appendSwitch('allow-running-insecure-content');
app.commandLine.appendSwitch('disable-features', 'VizDisplayCompositor');

Menu.setApplicationMenu(null);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      webSecurity: false,
      allowRunningInsecureContent: true
    },
    show: false,
    backgroundColor: '#1e1e1e'
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('get-session-data', async () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'session.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { tabs: [], bookmarks: [], theme: 'dark' };
  }
});

ipcMain.handle('save-session-data', async (event, data) => {
  try {
    fs.writeFileSync(path.join(__dirname, 'session.json'), JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to save session:', error);
    return false;
  }
});

ipcMain.handle('toggle-devtools', async (event, webviewId) => {
  if (mainWindow) {
    const webview = mainWindow.webContents.fromId(webviewId);
    if (webview && webview.isDevToolsOpened()) {
      webview.closeDevTools();
    } else if (webview) {
      webview.openDevTools();
    }
  }
});

ipcMain.handle('download-file', async (event, url, filename) => {
  const { dialog } = require('electron');
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: filename || 'download'
  });
  
  if (!result.canceled) {
      }
  
  if (!result.canceled) {
    return result.filePath;
  }
  return null;
});

ipcMain.handle('window-close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});
