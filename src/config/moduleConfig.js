const path = require('path')
const fs = require('fs')
const systemMenus = require('../app-constants/systemSettings')
const allowedSubMenus = process.env.ALLOWED_MODULES  || []

const routePath = '../routes/index.js'
const snsRoutePath = "../modules/SystemSettings/index.js"
let activeModules = JSON.parse(process.env.ALLOWED_MODULES ) || []
const modDir = '../modules';
const dirs = fs.readdirSync(path.join(__dirname, modDir))

// flush files
fs.writeFileSync(path.join(__dirname, routePath), '\n')
fs.writeFileSync(path.join(__dirname, snsRoutePath), '\n')


let routes = []

// if parent system menu does not exist stripe off all its sub menus

let allMenus = activeModules.filter(m => !systemMenus.includes(m))

dirs.forEach(name => {

    if (allMenus.includes(name)) {
        let imp = `import {${name}Module} from '../modules/${name}';\n`
        routes.push(`...${name}Module`)
        fs.appendFileSync(path.join(__dirname, routePath), imp);
    }
})


let exp = `export const routes = [${[...routes]}]`
fs.appendFileSync(path.join(__dirname, routePath), exp);

let systemSettingsMenus = systemMenus.filter(m => allowedSubMenus.includes(m))

// separate sub menus from main menus ex (role, sns and location sub menu)
let mainSideNavMenus = activeModules.filter(m => !systemSettingsMenus.includes(m))
let mainMenuExp = `\nexport const mainMenus = ${JSON.stringify(mainSideNavMenus)}`
fs.appendFileSync(path.join(__dirname, routePath), mainMenuExp);

// gen role,sns and location if parrent module exists
if (activeModules.includes("SystemSettings")) {
    let systemExp = `\nexport const systemMenus = ${JSON.stringify(systemSettingsMenus)}`
    fs.appendFileSync(path.join(__dirname, routePath), systemExp);
    configSystemSettingRoutes()
} else {
    let systemExp = `\nexport const systemMenus = []`
    fs.appendFileSync(path.join(__dirname, routePath), systemExp);
}


function configSystemSettingRoutes () {

// dynamic route configure for system settings

let systemImportPath = {
    RolePermission: {
        imp: `import RoleSettings from "../RolePermission/RoleSettings"`,
        route: `{
            path: path.role,
           component: RoleSettings
        },`
    },
    Sns: {
        imp: `import SnsSettings from "../Sns/SnsSettings"`,
        route: `{
            path: path.sns,
            component: SnsSettings
        },`
    },
    Media: {
        imp: `import SystemMediaSettings from "../Media/SystemMediaSettings"`,
        route: `{
            path: path.location,
            component: SystemMediaSettings
        },`
    },
    StatisticSetting: {
        imp: `import SystemStatisticsSetting from "../SystemStatisticsSetting"`,
        route: `{
            path: path.systemStatistics,
            component: SystemStatisticsSetting
        },`
    }
}

let sysImp = [`import Settings from "./Settings";`, `import path from "../../routes/path";`]

let snsRoutes = []




systemSettingsMenus.forEach(menu => {
    systemImportPath[menu] && sysImp.push(systemImportPath[menu].imp)
    systemImportPath[menu] && snsRoutes.push(systemImportPath[menu].route)
})

// SNS IMPORT CONFIGURATION

sysImp.forEach(imp => {
    fs.appendFileSync(path.join(__dirname, snsRoutePath), `${imp}\n`);
})

// SNS ROUTE CONFIGURATION

// do not remove this next line
snsRoutes.push("]")

let sysDefaultRoutes = `{
        path: path.systemSettings,
        component: Settings
    },`

let snsRouteConfig = `export const SystemSettingsModule = [${sysDefaultRoutes}`
fs.appendFileSync(path.join(__dirname, snsRoutePath), snsRouteConfig);

snsRoutes.forEach(t => {
    fs.appendFileSync(path.join(__dirname, snsRoutePath), t);
})

}




