var isDev = require('electron-is-dev')
if (isDev || process.env.DEV_SERVER) {
  var bundle = document.createElement('script')
  bundle.src = 'http://localhost:9966/bundle.js'
  document.body.appendChild(bundle)
} else {
  require('./bundle.js')
}
