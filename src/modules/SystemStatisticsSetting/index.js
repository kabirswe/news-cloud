import SystemStatisticsSettings from "./Statistics"
import path from '../../routes/path'

export const SystemStatisticsSettingModule = [
    {
        path: path.systemStatistics,
        component: SystemStatisticsSettings
    }
]