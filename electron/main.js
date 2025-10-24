const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('path')
const fs = require('fs');

const createWindow = () => {
  const win = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  win.loadFile('index.html')
  win.maximize();
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0 ) createWindow()
  })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('load:variables', (event, simulation) => {
  try {
    const filePath = path.resolve(__dirname, '..', 'src', 'components', 'data', `${simulation}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return data;
  } catch (error) {
    console.error('Error loading simulation:', error);
    return { error: 'Failed to load simulation data' };
  }
});

ipcMain.on('submitForm', (event, formData) => {
  console.log('Form Data Received:', formData);
  // TODO: process or trigger simulation send data to function to process into graphics
});