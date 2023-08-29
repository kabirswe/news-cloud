import {takeLatest, takeEvery, put, call, select} from 'redux-saga/effects';
import Logger from '../../../helper/logger';
import AxiosServices from '../../../networks/AxiosService';
import ApiServices from '../../../networks/ApiServices';
import ResponseCode from '../../../networks/ResponseCode';
import {VIDEO} from '../../constants/video';
import getErrorMessage from '../../../app-constants/ServerErrorInfo';
import {isObjectEmpty} from '../../../helper';
import {NEWSCLOUD, VIMEO, YOUTUBE} from '../../../app-constants/rawContent';
import Toast from '../../../common-components/Toast';

function* youtubeCatChannels() {
  try {
    const response = yield call(
      AxiosServices.get,
      ApiServices.YOUTUBE_CHANNELS_CATEGORIES_PATH,
      {},
      false
    ); // true when Json Server
    console.log('authUrl', response.data.data.authUrl);
    if (response.status === ResponseCode.OK) {
      if (!!response.data.data.authUrl) {
        // window.open(
        //   response.data.data.authUrl,
        //   '_blank',
        //   'top=100,bottom=100,left=50,right=50,width=1020,height=600'
        // );
      } else {
        yield put({
          type: VIDEO.YOUTUBE_CHANNELS_CATEGORIES.SUCCESS,
          result: response.data
        });
      }
    } else {
      yield put({type: VIDEO.YOUTUBE_CHANNELS_CATEGORIES.FAILURE});
    }
  } catch (err) {
    Logger(err);
    if (err) {
      const errorMessage = getErrorMessage(err); // err.response.data
      // Toast.error(errorMessage.message);
      yield put({
        type: VIDEO.YOUTUBE_CHANNELS_CATEGORIES.FAILURE,
        error: errorMessage
      });
    }
  }
}
function* vimeoPrivacyList() {
  try {
    const response = yield call(
      AxiosServices.get,
      ApiServices.VIMEO_PRIVACY_LIST_PATH,
      {},
      false
    ); // true when Json Server
    if (response.status === ResponseCode.OK) {
      yield put({
        type: VIDEO.VIMEO_PRIVACY_LIST.SUCCESS,
        result: response.data
      });
    } else {
      yield put({type: VIDEO.VIMEO_PRIVACY_LIST.FAILURE});
    }
  } catch (err) {
    Logger(err);
    if (err) {
      const errorMessage = getErrorMessage(err); // err.response.data
      Toast.error(errorMessage.message);
      yield put({
        type: VIDEO.VIMEO_PRIVACY_LIST.FAILURE,
        error: errorMessage
      });
    }
  }
}

function* getYoutubeDataItem(actions) {
  try {
    const response = yield call(
      AxiosServices.get,
      `${ApiServices.SHOW_VIDEO_YOUTUBE_PATH}/${actions.body}`,
      {},
      false
    ); // true when Json Server
    if (response.status === ResponseCode.OK) {
      yield put({
        type: VIDEO.VIDEO_SAVE_YOUTUBE.SUCCESS,
        result: response.data
      });
      Toast.success(response.data.message);
    } else {
      yield put({type: VIDEO.GET_YOUTUBE_ITEM.FAILURE});
    }
  } catch (err) {
    Logger(err);
    if (err) {
      const errorMessage = getErrorMessage(err); // err.response.data
      Toast.error(errorMessage.message);
      yield put({type: VIDEO.GET_YOUTUBE_ITEM.FAILURE, error: errorMessage});
    }
  }
}

function* getVimeoDataItem(actions) {
  try {
    const response = yield call(
      AxiosServices.get,
      `${ApiServices.SHOW_VIDEO_VIMEO_PATH}/${actions.body}`,
      {},
      false
    ); // true when Json Server
    if (response.status === ResponseCode.OK) {
      yield put({
        type: VIDEO.VIDEO_SAVE_VIMEO.SUCCESS,
        result: response.data
      });
      Toast.success(response.data.message);
    } else {
      yield put({type: VIDEO.GET_VIMEO_ITEM.FAILURE});
    }
  } catch (err) {
    Logger(err);
    if (err) {
      const errorMessage = getErrorMessage(err); // err.response.data
      Toast.error(errorMessage.message);
      yield put({type: VIDEO.GET_VIMEO_ITEM.FAILURE, error: errorMessage});
    }
  }
}

function* fetchMaterialVideoItemApi(actions) {
  try {
    yield youtubeCatChannels();
    yield vimeoPrivacyList();
    const PATH =
      actions.body.type === NEWSCLOUD
        ? `${ApiServices.GET_MATERIAL_VIDEO_ITEM}/${actions.body.id}`
        : `${ApiServices.GET_MATERIAL_MEDIA}/${actions.body.id}`;

    const response = yield call(
      AxiosServices.get,
      // `${ApiServices.GET_MATERIAL_VIDEO_ITEM}/${actions.body.id}`,
      PATH,
      {},
      false
    ); // true when Json Server
    if (response.status === ResponseCode.OK) {
      // if (actions.body.type === NEWSCLOUD) {
      //   yield put({
      //     type: VIDEO.GET_MATERIAL_VIDEO_ITEM.SUCCESS,
      //     result: response.data
      //   });
      // } else {
      //   yield put({
      //     type: VIDEO.GET_MATERIAL_VIDEO_ITEM.MEDIA,
      //     result: response.data
      //   });
      // }
      yield put({
        type: VIDEO.GET_MATERIAL_VIDEO_ITEM.MEDIA,
        result: response.data
      });

      // yield getYoutubeDataItem();
    } else {
      yield put({type: VIDEO.GET_MATERIAL_VIDEO_ITEM.FAILURE});
    }
  } catch (err) {
    Logger(err);
    if (err) {
      const errorMessage = getErrorMessage(err); // err.response.data
      Toast.error(errorMessage.message);
      yield put({type: VIDEO.GET_MATERIAL_VIDEO_ITEM.FAILURE, error: errorMessage});
    }
  }
}

function* deleteItemAPI(actions) {
  try {
    let PATH = '';
    if (actions.body.type === NEWSCLOUD) {
      PATH = `${ApiServices.DELETE_NEWSCLOUD_VIDEO_PATH}/${actions.body.itemID}`;
    }
    if (actions.body.type === YOUTUBE) {
      PATH = `${ApiServices.DELETE_YOUTUBE_VIDEO_PATH}/${actions.body.itemID}`;
    }
    if (actions.body.type === VIMEO) {
      PATH = `${ApiServices.DELETE_VIMEO_VIDEO_PATH}/${actions.body.itemID}`;
    }
    const response = yield call(
      //actions.body.type === VIMEO ? AxiosServices.get : AxiosServices.post,
      AxiosServices.remove,
      PATH,
      {},
      false
    ); // true when Json Server
    if (response.status === ResponseCode.OK && !!response.status) {
      yield put({
        type: VIDEO.DELETE_VIDEO_CONTENT.SUCCESS,
        result: response.data,
        param: actions.body
      });
      Toast.success(response.data.message);
    } else {
      yield put({type: VIDEO.DELETE_VIDEO_CONTENT.FAILURE});
    }
  } catch (err) {
    Logger(err);
    if (err) {
      const errorMessage = getErrorMessage(err); // err.response.data
      Toast.error(errorMessage.message);
      yield put({type: VIDEO.DELETE_VIDEO_CONTENT.FAILURE, error: errorMessage});
    }
  }
}

function* videoTitileUpdateAPI(actions) {
  try {
    const response = yield call(
      AxiosServices.put,
      `${ApiServices.UPDATE_URL_VIDEO_TITLE}/${actions.body.id}`,
      actions.body,
      false
    ); // true when Json Server
    if (response.status === ResponseCode.OK) {
      yield put({
        type: VIDEO.UPDATE_VIDEO_TITLE.SUCCESS,
        result: response.data,
        param: actions.body
      });
      Toast.success(response.data.message);
    } else {
      yield put({type: VIDEO.UPDATE_VIDEO_TITLE.FAILURE});
    }
  } catch (err) {
    Logger(err);
    if (err) {
      const errorMessage = getErrorMessage(err); // err.response.data
      Toast.error(errorMessage.message);
      yield put({type: VIDEO.UPDATE_VIDEO_TITLE.FAILURE, error: errorMessage});
    }
  }
}

function* saveDataYoutube(actions) {
  const PATH = !!actions.body.id
    ? `${ApiServices.UPDATE_VIDEO_YOUTUBE_PATH}/${actions.body.id}`
    : ApiServices.VIDEO_SAVE_YOUTUBE_PATH;
  try {
    const response = yield call(
      AxiosServices.post,
      PATH,
      actions.body.param,
      false,
      true
    ); // true when Json Serve
    if (response.status === ResponseCode.OK) {
      yield put({
        type: VIDEO.VIDEO_SAVE_YOUTUBE.SUCCESS,
        result: response.data
      });
      Toast.success(response.data.message);
    } else {
      yield put({type: VIDEO.VIDEO_SAVE_YOUTUBE.FAILURE});
    }
  } catch (err) {
    Logger(err);
    if (err) {
      const errorMessage = getErrorMessage(err); // err.response.data
      Toast.error(errorMessage.message);
      yield put({type: VIDEO.VIDEO_SAVE_YOUTUBE.FAILURE, error: errorMessage});
    }
  }
}

function* saveDataVimeo(actions) {
  const PATH = !!actions.body.id
    ? `${ApiServices.UPDATE_VIMEO_DATA_PATH}/${actions.body.id}`
    : ApiServices.SAVE_VIMEO_DATA_PATH;
  try {
    const response = yield call(
      AxiosServices.post,
      PATH,
      actions.body.param,
      false,
      true
    ); // true when Json Server
    if (response.status === ResponseCode.OK) {
      if (!!actions.body.id) {
        yield put({
          type: VIDEO.VIDEO_SAVE_VIMEO.SUCCESS,
          result: response.data
        });
      } else if (!!response.data && response.status) {
        yield getVimeoDataItem({body: response.data.data.media_id});
      }
      Toast.success(response.data.message);
    } else {
      yield put({type: VIDEO.VIDEO_SAVE_VIMEO.FAILURE});
    }
  } catch (err) {
    Logger(err);
    if (err) {
      const errorMessage = getErrorMessage(err); // err.response.data
      Toast.error(errorMessage.message);
      yield put({type: VIDEO.VIDEO_SAVE_VIMEO.FAILURE, error: errorMessage});
    }
  }
}

export default function* videoSaga() {
  yield takeLatest(VIDEO.GET_MATERIAL_VIDEO_ITEM.MAIN, fetchMaterialVideoItemApi);
  yield takeLatest(VIDEO.UPDATE_VIDEO_TITLE.MAIN, videoTitileUpdateAPI);
  yield takeLatest(VIDEO.YOUTUBE_CHANNELS_CATEGORIES.MAIN, youtubeCatChannels);
  yield takeLatest(VIDEO.VIDEO_SAVE_YOUTUBE.MAIN, saveDataYoutube);
  yield takeLatest(VIDEO.GET_YOUTUBE_ITEM.MAIN, getYoutubeDataItem);
  yield takeLatest(VIDEO.DELETE_VIDEO_CONTENT.MAIN, deleteItemAPI);
  yield takeLatest(VIDEO.VIMEO_PRIVACY_LIST.MAIN, vimeoPrivacyList);
  yield takeLatest(VIDEO.VIDEO_SAVE_VIMEO.MAIN, saveDataVimeo);
  yield takeLatest(VIDEO.GET_VIMEO_ITEM.MAIN, getVimeoDataItem);
}
