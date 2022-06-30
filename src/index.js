// https://www.npmjs.com/package/keysender
// https://qiita.com/south37/items/c8d20a069fcbfe4fce85
'use strict'

const fs = require('fs')
const http = require('http')
const os = require('os')
const {Hardware} = require('keysender')
const {execFile} = require('child_process')

const isValidJson = str => {
  const isAry = /\[.+\]/.test(str)
  if (!isAry) return false
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}
const startKey = ary => hardware.keyboard.sendKeyAsync(ary, 50)
const startExe = dir => {
  const dirRep = dir.replace(/([%&(,\-;=^ ])/g, '^$1')
  const option = {
    encoding: 'Shift_JIS',
    env: {
      'Path': 'C:\\Windows\\system32\\'
    }
  }
  const child = execFile('cmd', ['/c', dirRep], option, (e) => {
    if (e) {
      console.error(`\u001b[31m[ERROR] 正しく起動できませんでした`)
      console.error(`\u001b[37m[ERROR]`, e)
    }
  })
}
const startCmd = req => {
  const cmd = SETTING.command[req]
  const isJSON = isValidJson(req)
  const toString = Object.prototype.toString
  const isType = toString.call(cmd)
  const date = getWhatTimeIsIt()
  console.log(`\n--- ${date} --------------------------------`)
  console.log(`送信されたコマンド:   ${req}`)
  console.log(`JSONが送信されたか:   ${isJSON}`)
  console.log(`実行されたコマンド:   ${cmd}`)
  console.log(`実行されたタイプ:     ${isType}`)
  if (isJSON) startKey(JSON.parse(req))
  if (isType === '[object Null]') return
  if (isType === '[object Array]') startKey(cmd)
  if (isType === '[object String]') startExe(cmd)
}
const getLocalAddress = _ => {
  const ary = []
  const interfaces = os.networkInterfaces()
  for (var dev in interfaces) {
    interfaces[dev].forEach((details) => {
      if (details.family === 'IPv4' && !details.internal) ary.push(details.address)
    })
  }
  const txt = ary.join(', ')
  return txt
}
const getLocalFile = fileName => {
  const path = process.env.APPDATA + '\\CortanasanLikeCmd'
  const dir = `${path}\\${fileName}`
  const date = getWhatTimeIsIt()
  console.log(`\n--- ${date} --------------------------------`)
  let fileData
  if (fs.existsSync(dir)) {
    fileData = fs.readFileSync(dir)
    console.log(`設定ファイルを読み込みました\n${dir}`)
  } else {
    fileData = fs.readFileSync(`${__dirname}\\default-setting.json`)
    if (!fs.existsSync(path)) fs.mkdirSync(path)
    fs.writeFileSync(dir, fileData)
    console.log(`設定ファイルを作成しました\n${dir}`)
  }
  try {
    const fileDataAry = JSON.parse(fileData)
    return fileDataAry
  } catch (e) {
    console.error(`\u001b[31m[ERROR] JSONが正しくありません`)
    console.error(`\u001b[37m[ERROR] 処理を終了させます……`)
    process.exit(1)
  }
}
const getWhatTimeIsIt = _ => {
  const date = new Date()
  const year = date.getFullYear()
  const month = zeroPadding(date.getMonth() + 1)
  const day = zeroPadding(date.getDate())
  const hours = zeroPadding(date.getHours())
  const minutes = zeroPadding(date.getMinutes())
  const seconds = zeroPadding(date.getSeconds())
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
}
const zeroPadding = num => {
  if (String(num).length == 1) return `0${num}`
  return num
}
const server = http.createServer((req, res) => {
  const option = {
    'Content-Type': 'text/html; charset=utf-8'
  }
  res.writeHead(200, option)
  res.write('Cortanasan Like Cmd')
  res.end()
  const cmd = req.headers.cmd
  startCmd(cmd)
})

const SETTING = getLocalFile('setting.json')
const hardware = new Hardware('CortanasanLikeCmd')
const localIp = getLocalAddress()
const port = SETTING.port
server.listen(port)

console.log(`サーバーのIPアドレス: ${localIp}`)
console.log(`サーバーのポート:     ${port}`)