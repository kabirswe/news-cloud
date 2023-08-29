
import Settings from "./Settings";
import path from "../../routes/path";
import SystemMediaSettings from "../Media/SystemMediaSettings"
import RoleSettings from "../RolePermission/RoleSettings"
import SnsSettings from "../Sns/SnsSettings"
export const SystemSettingsModule = [{
        path: path.systemSettings,
        component: Settings
    },{
            path: path.location,
            component: SystemMediaSettings
        },{
            path: path.role,
           component: RoleSettings
        },{
            path: path.sns,
            component: SnsSettings
        },]