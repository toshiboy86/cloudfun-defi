const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const proxy = require('http-proxy')

const cert = path.join(process.cwd(), 'local.cloudfund.fi.pem')
const key = path.join(process.cwd(), 'local.cloudfund.fi-key.pem')

proxy
  .createServer({
    xfwd: true,
    ws: true,
    target: {
      host: 'local.cloudfund.fi',
      port: 3000,
    },
    secure: true,
    ssl: {
      key: fs.readFileSync(key, 'utf8'),
      cert: fs.readFileSync(cert, 'utf8'),
    },
  })
  .on('error', function (e) {
    console.error(chalk.red(`Request failed to proxy: ${chalk.bold(e.code)}`))
  })
  .listen(8023)