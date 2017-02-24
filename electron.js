#!/usr/bin/env electron

const { join } = require('path')
const { format } = require('url')
const { Command } = require('commander')
const { app, BrowserWindow, ipcMain } = require('electron')
const Table = require('cli-table')

const packageInfo = require('./package.json')

const commander = new Command(packageInfo.name)
  .version(packageInfo.version)
  .description(packageInfo.description)
  .option('-k, --keep', 'keep pages open.')
  .arguments('<urls...>')
  .parse(process.argv)

const urls = commander.args

if (urls.length === 0) commander.help()

const page = format({
  protocol: 'file:',
  pathname: join(__dirname, 'index.html'),
  slashes: true
})

const bootstrap = () => {
  const window = new BrowserWindow({
    webPreferences: {
      offscreen: true
    }
  })
  window.webContents.once('did-finish-load',
    () => window.webContents.send('urls', urls))
  window.loadURL(page)
}

ipcMain.once('results', (event, results) => {
  const table = new Table({
    head: ['',
      'DomainLookup',
      'Connect',
      'DOMLoading',
      'Response',
      'DOMInteractive',
      'DOMContentLoaded',
      'DOMComplete',
      'Load'
    ]
  })
  for (const result of results) {
    table.push({
      [result.url]: [
        String(result.domainLookup),
        String(result.connect),
        String(result.domLoading),
        String(result.response),
        String(result.domInteractive),
        String(result.domContentLoadedEvent),
        String(result.domComplete),
        String(result.loadEvent)
      ]
    })
  }
  console.log(table.toString())
  if (!commander.keep) app.exit()
})

app.once('ready', bootstrap)
