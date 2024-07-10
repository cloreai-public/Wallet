const { app, BrowserWindow, Menu } = require('electron');
const serve = require('electron-serve');
const path = require('path');

const appServe = app.isPackaged
  ? serve({
      directory: path.join(__dirname, '..', 'out'),
    })
  : null;

const createWindow = () => {
  const win = new BrowserWindow({
    icon: path.join(__dirname, 'out/icon.png'),
    width: 575,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: !app.isPackaged,
    },
  });

  if (app.isPackaged) {
    appServe(win).then(() => {
      win.loadURL('clore-app://-');
    });

    // disable developer tools
    const menu = Menu.getApplicationMenu();
    const viewMenuIndex = menu.items.findIndex((menuItem) => menuItem.role === 'viewmenu');
    const viewMenuItems = menu.items[viewMenuIndex].submenu.items;
    for (const viewMenuItem of viewMenuItems) {
      if (viewMenuItem.role === 'toggledevtools') {
        viewMenuItem.enabled = false;
        viewMenuItem.visible = false;
        break;
      }
    }

  } else {
    win.loadURL('http://localhost:3000');
    win.webContents.on('did-fail-load', (e, code, desc) => {
      win.webContents.reloadIgnoringCache();
    });
  }
};

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    // console.log('parsedUrl.origin', parsedUrl.origin);
    if (app.isPackaged)
      if (parsedUrl.origin != 'clore-app://-') {
        event.preventDefault();
      }
  });
});
