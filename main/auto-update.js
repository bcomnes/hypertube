const autoUpdater = require('electron-updater').autoUpdater
const log = require('electron-log')

module.exports = {
  init
}

function init (windows) {
  // register autoUpdater
  const { broadcast } = windows
  if (!process.env.DEV_SERVER) {
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify()
    }, 500)

    autoUpdater.on('error', (err) => {
      broadcast('au:error', err)
      // if (sentry) sentry.captureException(err)
    })

    autoUpdater.on('checking-for-update', () => {
      log.info('autoUpdater: Checking for update...')
      broadcast('au:checking-for-update')
    })

    autoUpdater.on('update-available', (info) => {
      log.info(`autoUpdater: Update available!`)
      broadcast('au:update-available', info)
    })

    autoUpdater.on('update-not-available', (info) => {
      log.info(`autoUpdater: No update available`)
      broadcast('au:update-not-available', info)
    })

    autoUpdater.on('download-progress', (progress) => {
      broadcast('au:progress', progress)
    })

    autoUpdater.on('update-downloaded', (info) => {
      log.info(`autoUpdater: Update downloaded`)
      broadcast('au:update-downloaded', info)
    })
  }
}
