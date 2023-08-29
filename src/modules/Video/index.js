import RawMaterial from './Material';
import path from '../../routes/path';
import VideoManagement from './VideoManagement';

export const VideoModule = [
  {
    path: path.rawMaterials,
    component: RawMaterial
  },

  {
    path: path.videoManagement,
    component: VideoManagement
  }
 
];
