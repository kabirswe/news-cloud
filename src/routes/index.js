
import {ArticleModule} from '../modules/Article';
import {AuthModule} from '../modules/Auth';
import {HomeModule} from '../modules/Home';
import {MailMagazineModule} from '../modules/MailMagazine';
import {MemberModule} from '../modules/Member';
import {PublicModule} from '../modules/Public';
import {StatisticsModule} from '../modules/Statistics';
import {SystemSettingsModule} from '../modules/SystemSettings';
import {SystemStatisticsSettingModule} from '../modules/SystemStatisticsSetting';
import {UsersModule} from '../modules/Users';
import {VideoModule} from '../modules/Video';
export const routes = [...ArticleModule,...AuthModule,...HomeModule,...MailMagazineModule,...MemberModule,...PublicModule,...StatisticsModule,...SystemSettingsModule,...SystemStatisticsSettingModule,...UsersModule,...VideoModule]
export const mainMenus = ["Article","Auth","Home","MailMagazine","Member","Public","Statistics","SystemSettings","SystemStatisticsSetting","Users","Video"]
export const systemMenus = ["Media","RolePermission","Sns","StatisticsSetting"]