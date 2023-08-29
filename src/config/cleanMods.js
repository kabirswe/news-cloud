const path = require('path')
const fs = require('fs')
const rimraf = require('rimraf')

let activeModules = process.env.ALLOWED_MODULES  || []
const modDir = '../modules';

const dirs = fs.readdirSync(path.join(__dirname, modDir))
let removeMods = dirs.filter(mod => !activeModules.includes(mod))
removeMods.forEach(dir => {
    rimraf.sync(path.join(__dirname, `${modDir}/${dir}`), {recursive: true})
})





