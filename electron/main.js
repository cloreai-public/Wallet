const { app, BrowserWindow, Menu, ipcMain } = require('electron/main');
const serve = require('electron-serve');
const path = require('path');
const axios = require('axios');

const appServe = app.isPackaged
  ? serve({ directory: path.join(__dirname, '..', 'out') })
  : null;

console.log('[DEBUG] isPackaged:', app.isPackaged);

const createWindow = () => {
  console.log('[PRELOAD PATH]', path.join(__dirname, 'preload.js'));
  const win = new BrowserWindow({
    icon: path.join(__dirname, 'out/icon.png'),
    width: 575,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.webContents.openDevTools(); // force open DevTools

  if (app.isPackaged) {
    appServe(win).then(() => {
      win.loadURL('clore-app://-');
    });

    // disable developer tools
    const menu = Menu.getApplicationMenu();
    const viewMenuIndex = menu.items.findIndex(m => m.role === 'viewmenu');
    const viewMenuItems = menu.items[viewMenuIndex]?.submenu?.items || [];
    for (const item of viewMenuItems) {
      if (item.role === 'toggledevtools') {
        item.enabled = false;
        item.visible = false;
      }
    }
  } else {
    win.loadURL('http://localhost:3000');
    win.webContents.on('did-fail-load', () => {
      win.webContents.reloadIgnoringCache();
    });
  }
};

app.whenReady().then(() => {
  ipcMain.handle('listColdUtxos', async () => {
    console.log('[MAIN] Received listColdUtxos call');
    try {
      const response = await axios.post('http://155.138.230.177:4568/', {
        jsonrpc: '1.0',
        id: 'wallet',
        method: 'listcoldutxos',
        params: [],
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + Buffer.from('abc:abc').toString('base64'),
        }
      });

      console.log('[MAIN] RPC result:', response.data.result);
      return response.data.result;
    } catch (error) {
      console.error('[MAIN] RPC error:', error);
      return null;
    }
  });

  ipcMain.handle('getAccountAddress', async (event, params) => {
    console.log('[MAIN] Received getAccountAddress call');
    try {
      const response = await axios.post('http://155.138.230.177:4568/', {
        jsonrpc: '1.0',
        id: 'wallet',
        method: 'getaccountaddress',
        params: params,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + Buffer.from('abc:abc').toString('base64'),
        }
      });

      console.log('[MAIN] RPC result:', response.data.result);
      return response.data.result;
    } catch (error) {
      console.error('[MAIN] RPC error:', error);
      return null;
    }
  });

  ipcMain.handle('delegateStake', async (event, params) => {
    console.log('[MAIN] Received delegate call');
    try {
      const response = await axios.post('http://155.138.230.177:4568/', {
        jsonrpc: '1.0',
        id: 'delegatestake',
        method: 'delegatestake',
        params: params,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + Buffer.from('abc:abc').toString('base64'),
        }
      });

      console.log('[MAIN] RPC result:', response.data.result);
      return response.data.result;
    } catch (err) {
      const rpcError = err.response?.data?.error || err.message;
      console.error('[MAIN] RPC error:', rpcError);
      return { error: rpcError };
    }
  });

  ipcMain.handle('sendToAddress', async (event, params) => {
    console.log('[MAIN] Received sendToAddress');
    try {
      const response = await axios.post('http://155.138.230.177:4568/', {
        jsonrpc: '1.0',
        id: 'sendtoaddress',
        method: 'sendtoaddress',
        params: params,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + Buffer.from('abc:abc').toString('base64'),
        }
      });

      console.log('[MAIN] RPC result:', response.data.result);
      return response.data.result;
    } catch (err) {
      const rpcError = err.response?.data?.error || err.message;
      console.error('[MAIN] RPC error:', rpcError);
      return { error: rpcError };
    }
  });
  createWindow();
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (event, url) => {
    if (app.isPackaged && new URL(url).origin !== 'clore-app://-') {
      event.preventDefault();
    }
  });
});

