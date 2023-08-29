import MailHistory from './History';
import MailHistoryDetails from './HistoryDetails';
import MailGroup from './Group';
import MailGroupDetails from './GroupDetails';
import path from '../../routes/path';

export const MailMagazineModule = [
  {
    path: path.mailHistory,
    component: MailHistory
  },
  {
    path: path.mailHistoryDetails,
    component: MailHistoryDetails
  },
  {
    path: path.mailGroup,
    component: MailGroup
  },
  {
    path: path.groupMailList,
    component: MailGroupDetails
  }
];
