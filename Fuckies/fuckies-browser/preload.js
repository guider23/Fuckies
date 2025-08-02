const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSessionData: () => ipcRenderer.invoke('get-session-data'),
  saveSessionData: (data) => ipcRenderer.invoke('save-session-data', data),
  
  toggleDevTools: (webviewId) => ipcRenderer.invoke('toggle-devtools', webviewId),
  
  downloadFile: (url, filename) => ipcRenderer.invoke('download-file', url, filename),
  
  closeWindow: () => ipcRenderer.invoke('window-close'),
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  
  webview: {
    onNewWindow: (callback) => {
      ipcRenderer.on('webview-new-window', callback);
    },
    onLoadStart: (callback) => {
      ipcRenderer.on('webview-load-start', callback);
    },
    onLoadStop: (callback) => {
      ipcRenderer.on('webview-load-stop', callback);
    },
    onTitleChange: (callback) => {
      ipcRenderer.on('webview-title-change', callback);
    },
    onFaviconChange: (callback) => {
      ipcRenderer.on('webview-favicon-change', callback);
    }
  }
});

window.executeInWebview = (webview, script) => {
  if (webview && webview.executeJavaScript) {
    return webview.executeJavaScript(script);
  }
  return Promise.reject(new Error('Webview not available'));
};

window.getWebviewInfo = (webview) => {
  if (!webview) return null;
  
  return {
    id: webview.id,
    url: webview.getURL(),
    title: webview.getTitle(),
    isLoading: webview.isLoading(),
    canGoBack: webview.canGoBack(),
    canGoForward: webview.canGoForward()
  };
};
