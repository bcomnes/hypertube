const { BrowserWindow, app } = require('electron')
const windowStateKeeper = require('electron-window-state')
const path = require('path')
const PLAYER_WINDOW = 'file://' + path.resolve(__dirname, 'index.html')

const player = module.exports = {
  init,
  win: null,
  windowState: null
}

require('electron-debug')({ showDevTools: 'undocked' })
require('electron-context-menu')()

function init () {
  player.windowState = windowStateKeeper({ width: 800, height: 600 })
  const win = player.win = new BrowserWindow({
    title: 'Hypertube',
    x: player.windowState.x,
    y: player.windowState.y,
    width: player.windowState.width,
    height: player.windowState.height,
    minWidth: 580,
    minHeight: 76,
    titleBarStyle: 'hiddenInset',
    useContentSize: true,
    show: false,
    backgroundColor: '#fff',
    thickFrame: true,
    alwaysOnTop: false,
    contextIsolation: true,
    webPreferences: {
      nodeIntegration: true
    },
    webSecurity: true
  })

  player.windowState.manage(win)

  win.loadURL(PLAYER_WINDOW)

  win.once('ready-to-show', win.show)

  win.on('closed', () => {
    player.win = null
  })

  if (process.platform !== 'darwin') { // TODO System tray on windows (maybe linux)
    // since window-all-closed doesn't fire with our hidden audio process
    player.win.once('closed', () => {
      app.quit()
    })
  }
}
