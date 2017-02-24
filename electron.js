#!/usr/bin/env electron

const path = require('path')
const url = require('url')
const commander = require('commander')
const electron = require('electron')
const EasyTable = require('easy-table')

const urls = commander.parse(process.argv).args

if (urls.length === 0) throw Error('Give one test URL at least.')

const page = url.format({
  protocol: 'file:',
  pathname: path.join(__dirname, 'index.html'),
  slashes: true
})

const bootstrap = () => {
  const window = new electron.BrowserWindow({
    webPreferences: {
      offscreen: true
    }
  })
  window.webContents.once('did-finish-load', () => {
    window.webContents.send('urls', urls)
  })
  window.loadURL(page)
}

electron.ipcMain.once('results', (event, results) => {
  const table = new EasyTable()
  for (const url in results) {
    table.cell('URL', url)
    table.cell('Ready', results[url].ready, EasyTable.number())
    table.cell('Load', results[url].load, EasyTable.number())
    table.newRow()
  }
  table.sort(['Load, Ready'])
  console.log(table.toString())
  electron.app.exit()
})

electron.app.once('ready', bootstrap)
