const path = require('path')
const fs = require('fs')

let activeModules = process.env.MODS || []
const modDir = '../modules';
const envPath = '../../build.mod.env'
const dirs = fs.readdirSync(path.join(__dirname, modDir))

fs.writeFileSync(path.join(__dirname, envPath), '\n')

let modules = []
dirs.forEach(name => {
    modules.push(name)
})

let writeInEnv = `ALLOWED_MODULES = ${JSON.stringify(modules)}`
fs.appendFileSync(path.join(__dirname, envPath), writeInEnv);
