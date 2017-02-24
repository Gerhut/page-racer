const electron = require('electron')
electron.ipcRenderer.once('urls', (event, urls) => {
  const main = document.querySelector('main')
  const results = []
  const push = (url, result) => {
    result.url = url
    results.push(result)
    if (results.length === urls.length) {
      electron.ipcRenderer.send('results', results)
    }
  }

  for (const url of urls) {
    const webview = document.createElement('webview')
    webview.addEventListener('did-finish-load', () => {
      webview.executeJavaScript(`({
        domainLookup: performance.timing.domainLookupEnd - performance.timing.fetchStart,
        connect: performance.timing.connectEnd - performance.timing.fetchStart,
        domLoading: performance.timing.domLoading - performance.timing.fetchStart,
        response: performance.timing.responseEnd - performance.timing.fetchStart,
        domInteractive: performance.timing.domInteractive - performance.timing.fetchStart,
        domContentLoadedEvent: performance.timing.domContentLoadedEventEnd - performance.timing.fetchStart,
        domComplete: performance.timing.domComplete - performance.timing.fetchStart,
        loadEvent: performance.timing.loadEventEnd - performance.timing.fetchStart
      })`, timing => push(url, timing))
    })
    webview.addEventListener('did-fail-load', () => push(url, {}))
    webview.setAttribute('src', url)
    main.appendChild(webview)
  }
})
