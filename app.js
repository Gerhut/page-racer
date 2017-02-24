const electron = require('electron')
electron.ipcRenderer.once('urls', (event, urls) => {
  const main = document.querySelector('main')
  const results = {}
  const check = () => {
    for (const url of urls) {
      if (results[url].load == null) {
        return
      }
    }
    electron.ipcRenderer.send('results', results)
  }
  for (const url of urls) {
    const result = results[url] = {}
    const webview = document.createElement('webview')
    webview.addEventListener('did-navigate', () => {
      const startTime = Date.now()
      webview.addEventListener('dom-ready', () => {
        result.ready = Date.now() - startTime
      })
      webview.addEventListener('did-finish-load', () => {
        result.load = Date.now() - startTime
        check()
      })
      webview.addEventListener('did-fail-load', () => {
        result.load = -1
        check()
      })
    })
    webview.setAttribute('src', url)
    main.appendChild(webview)
  }
})
