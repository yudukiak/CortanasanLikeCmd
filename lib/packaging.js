const {compile} = require('nexe')

// https://github.com/nexe/nexe
compile({
  input: '../src/index.js',
  output: '../packaging',
  target: 'win-ia32-6.11.2',
  build: true
}).then(() => {
  console.log('success')
})