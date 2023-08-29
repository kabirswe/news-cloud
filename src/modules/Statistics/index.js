import StatisticsOwnMedia from './StatisticsOwnMedia';
import StatisticsVideo from './StatisticsVideo';
import path from '../../routes/path';

export const StatisticsModule = [
  {
    path: path.statisticsVideo,
    component: StatisticsVideo
  },
  {
    path: path.statisticsOwnMedia,
    component: StatisticsOwnMedia
  }
];
