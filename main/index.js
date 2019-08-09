const electron = require('electron')
const Config = require('electron-store')
const path = require('path')
const pkg = require('../package.json')
const menu = require('./menu')
const player = require('../windows/player')
const electronIpcLog = require('electron-ipc-log')
const GlobalShortcuts = require('./global-shortcuts')
const log = require('electron-log')
const autoUpdater = require('./auto-update')

const { app } = electron

const userConfig = new Config({
  name: `${pkg.name}-user-config`,
  defaults: {
    dataPath: [path.resolve(app.getPath('videos'), 'Hypertube')]
  }
})
const persist = new Config({
  name: `${pkg.name}-persist`,
  defaults: {
    volume: 0.50,
    muted: false
  }
})
exports.userConfig = userConfig
exports.persist = persist

electronIpcLog(event => {
  var { channel, data, sent, sync } = event
  var args = [sent ? '⬆️' : '⬇️', channel, ...data]
  if (sync) args.unshift('ipc:sync')
  else args.unshift('ipc')
  console.log(...args)
})

const globalShortcuts = new GlobalShortcuts()
const windows = [player]
windows.broadcast = function broadcast (/* args */) {
  var args = [].slice.call(arguments, 0)
  windows.forEach((winObj) => {
    if (winObj.win) winObj.win.send.apply(winObj.win, args)
  })
}

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}

app.on('second-instance', (commandLine, workingDirectory) => {
  //
  // Someone tried to run a second instance, we should focus our window.
  if (player.win) {
    if (player.win.isMinimized()) player.win.restore()
    player.win.focus()
  } else {
    // Create the window
    player.init()
  }
})

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

app.on('ready', function appReady () {
  menu.init()
  player.init()
  autoUpdater.init(windows)

  globalShortcuts.init({
    MediaPlayPause: playPause
  })

  electron.powerMonitor.on('suspend', function pauseOnWake () {
    log.info('Entering sleep, pausing')
    pause()
  })

  function playPause () {
    windows.broadcast('play-pause')
  }

  function pause () {
    windows.broadcast('pause')
  }
})

app.on('activate', function activate () {
  if (player.win === null) {
    player.init()
  }
  globalShortcuts.reregister()
})

app.on('will-quit', function (e) {
  globalShortcuts.unregisterAll()
})

app.on('before-quit', function beforeQuit (e) {
  if (app.isQuitting) return

  app.isQuitting = true
  e.preventDefault()
  setTimeout(function () {
    log.error('Saving state took too long. Quitting.')
    app.quit()
  }, 20000) // quit after 20 secs, at most

  // Cleanup anything here
  app.quit()
})
