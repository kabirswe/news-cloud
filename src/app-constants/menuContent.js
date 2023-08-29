import {
  NewspaperOutline,
  CalendarSharp,
  FolderOpen,
  Analytics,
  PeopleOutline,
  SystemSetting,
  MailOutline,
  PersonOutline
} from '../assets/svgComp';
import LayoutStyle from '../containers/DefaultLayout/defaultLayout.module.scss';

export const MENUS = [
  {
    value: 'コンテンツ',
    key: 'content',
    pageTitle: 'CONTENT',
    url: '/content',
    itemClass: '',
    iconClass: LayoutStyle.contentIcon,
    Icon: NewspaperOutline,
    display_name: 'Article Edit',
    module: 'Article'
  },
  {
    value: '素 材',
    key: 'raw_material',
    pageTitle: 'RAW_MATERIAL',
    url: '/raw-materials',
    itemClass: '',
    iconClass: '',
    Icon: FolderOpen,
    display_name: 'Raw Material',
    module: 'Video'
  },
  {
    value: '統　計',
    key: 'statistics',
    pageTitle: 'STATISTICS',
    itemClass: '',
    iconClass: '',
    url: '/statistics-ownmedia',
    Icon: Analytics,
    display_name: 'Statistics OwnMedia',
    module: 'Statistics'
  },
  {
    value: '統　計',
    key: 'statisticsVideo',
    pageTitle: 'STATISTICS',
    itemClass: '',
    iconClass: '',
    url: '/statistics-video',
    Icon: Analytics,
    display_name: 'Statistics OwnMedia',
    module: 'StatisticsVideo'
  },
  {
    value: 'ユーザー',
    url: '/users',
    key: 'user',
    pageTitle: 'USER',
    itemClass: '',
    iconClass: '',
    Icon: PersonOutline,
    display_name: 'User Management',
    module: 'Users'
  },
  {
    value: 'ユーザー1',
    url: '/member-lists',
    key: 'member',
    pageTitle: 'MEMBER',
    itemClass: '',
    iconClass: '',
    Icon: PeopleOutline,
    display_name: 'Member Management',
    module: 'Member'
  },
  {
    value: 'システム設定1',
    key: 'mail',
    pageTitle: 'MAIL_MAGAZINE',
    url: '/mail-group',
    iconClass: '',
    Icon: MailOutline,
    display_name: 'Mail Magazine',
    module: 'MailMagazine'
  },
  {
    value: 'システム設定1',
    key: 'MailHistory',
    pageTitle: 'MAIL_MAGAZINE',
    url: '/mail-history',
    iconClass: '',
    Icon: MailOutline,
    display_name: 'Mail Magazine',
    module: 'MailHistory'
  },

  {
    value: 'システム設定',
    key: 'system_setting',
    pageTitle: 'SYSTEM_SETTING',
    url: '/system-settings',
    iconClass: '',
    Icon: SystemSetting,
    display_name: 'System Setting',
    module: 'SystemSettings'
  }
  // {
  //   value: '公　開',
  //   key: 'public',
  //   pageTitle: 'PUBLIC',
  //   url: '/public',
  //   itemClass: '',
  //   iconClass: '',
  //   Icon: CalendarSharp,
  // }
];
