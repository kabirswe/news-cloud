import {VIDEO} from '../../constants/video';

export function getMaterialVideoItem(body) {
  return {
    type: VIDEO.GET_MATERIAL_VIDEO_ITEM.MAIN,
    body
  };
}
export function fieldInitialization(body) {
  return {
    type: VIDEO.FIELD_INITIALIZER,
    body
  };
}

export function videoTitleUpdate(body) {
  return {
    type: VIDEO.UPDATE_VIDEO_TITLE.MAIN,
    body
  };
}
export function saveVideoYoutube(body) {
  return {
    type: VIDEO.VIDEO_SAVE_YOUTUBE.MAIN,
    body
  };
}

export function showVideoYoutube(body) {
  return {
    type: VIDEO.GET_YOUTUBE_ITEM.MAIN,
    body
  };
}

export function deleteVideoContent(body) {
  return {
    type: VIDEO.DELETE_VIDEO_CONTENT.MAIN,
    body
  };
}

export function saveVimeoVideo(body) {
  return {
    type: VIDEO.VIDEO_SAVE_VIMEO.MAIN,
    body
  };
}

export function showVimeoVideo(body) {
  return {
    type: VIDEO.GET_VIMEO_ITEM.MAIN,
    body
  };
}
