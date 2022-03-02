// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const DataStore = require('./rendener/MusicDataStore');
const myStore = new DataStore({ 'name': 'Music Data' });
// console.log(myStore)

// 热加载
// try {
//   require('electron-reloader')(module, {});
// } catch (_) {}

class AppWindow extends BrowserWindow {
  constructor(config, filelocation) {
    const basicConfig = {
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      icon: path.join(__dirname, './build/icon/icon.ico'),
    };

    const finalConfig = { ...basicConfig, ...config };
    super(finalConfig);
    this.loadFile(filelocation);
    this.once('ready-to-show', () => {
      this.show();
    });
  }
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new AppWindow({}, './rendener/index.html');
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('page did finish load');
    mainWindow.send('getTracks', myStore.getTracks());
  })
  ipcMain.on('add-music-window', () => {
    const addWindow = new AppWindow(
      {
        width: 500,
        height: 400,
        parent: mainWindow,
      },
      './rendener/add.html'
    );
  });

  ipcMain.on('add-tracks', (event, tracks) => {
    const updatedTracks = myStore.addTracks(tracks).getTracks();
    mainWindow.send('getTracks', updatedTracks)
  })

  ipcMain.on('delete-track', (event, id) => {
    const updatedTracks = myStore.deleteTrack(id).getTracks();
    mainWindow.send('getTracks', updatedTracks)
  })

  ipcMain.on('open-music-file', event => {
    dialog
      .showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [{ name: 'Music', extensions: ['mp3'] }],
      })
      .then(result => {
        const file = result.filePaths;
        if (file) {
          event.sender.send('selected-file', file);
        }
      })
      .catch(err => {
      });
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
