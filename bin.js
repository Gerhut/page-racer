#!/usr/bin/env node

var command = require('electron')
var file = require('path').join(__dirname, 'electron.js')
var args = [file].concat(process.argv.slice(2))

require('child_process')
  .spawn(command, args, { stdio: 'inherit' })
  .on('close', code => process.exit(code))
