import {takeLatest, takeEvery, put, call} from 'redux-saga/effects';
import Logger from '../../../helper/logger';
import AxiosServices from '../../../networks/AxiosService';
import ApiServices from '../../../networks/ApiServices';
import ResponseCode from '../../../networks/ResponseCode';
import {MEMBER} from '../../constants/member';
import getErrorMessage from '../../../app-constants/ServerErrorInfo';
import Toast from '../../../common-components/Toast';

function* memberListAPI() {
  try {
    const response = yield call(
      AxiosServices.get,
      ApiServices.GET_MEMBER_LIST_PATH,
      {},
      false
    ); // true when Json Server
    if (response.status === ResponseCode.OK) {
      yield put({
        type: MEMBER.GET_MEMBER_LIST.SUCCESS,
        result: response.data.data.list
      });
      // Toast.success(response.data.message);
    } else {
      yield put({type: MEMBER.GET_MEMBER_LIST.FAILURE});
    }
  } catch (err) {
    Logger(err);
    if (err) {
      const errorMessage = getErrorMessage(err); // err.response.data
      Toast.error(errorMessage.message);
      yield put({type: MEMBER.GET_MEMBER_LIST.FAILURE, error: errorMessage});
    }
  }
}

function* memberFileDownloadAPI() {
  try {
    const response = yield call(
      AxiosServices.get,
      ApiServices.MEMBER_FILE_DOWNLOAD_PATH,
      {},
      false
    ); // true when Json Server
    if (response.status === ResponseCode.OK) {
      yield put({
        type: MEMBER.MEMBER_FILE_DOWNLOAD.SUCCESS,
        result: response.data
      });

      const link = document.createElement('a');
      link.download = 'download';
      link.href = response.data.data.file;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Toast.success(response.data.message);
    } else {
      yield put({type: MEMBER.MEMBER_FILE_DOWNLOAD.FAILURE});
    }
  } catch (err) {
    Logger(err);
    if (err) {
      const errorMessage = getErrorMessage(err); // err.response.data
      Toast.error(errorMessage.message);
      yield put({type: MEMBER.MEMBER_FILE_DOWNLOAD.FAILURE, error: errorMessage});
    }
  }
}

function* memberFileUploadAPI(actions) {
  try {
    const PATH =
      actions.body.type === 'upload'
        ? ApiServices.CSV_UPLOAD_PATH
        : ApiServices.CSV_DELETE_PATH;
    // const METHOD =
    //   actions.body.type === 'upload' ? AxiosServices.post : AxiosServices.post;
    // const formData =
    //   actions.body.type === 'upload'
    //     ? actions.body.param
    //     : actions.body.param.append('_method', 'DELETE');
    const response = yield call(AxiosServices.post, PATH, actions.body.param, false); // true when Json Server
    console.log(response.status);
    if (response.status === ResponseCode.OK) {
      yield put({
        type: MEMBER.MEMBER_FILE_UPLOAD.SUCCESS,
        result: response.data.data.list
      });
      if ('state' in response.data.data && response.data.data.state) {
        Toast.success(response.data.message);
        yield memberListAPI();
      } else {
        Toast.error(response.data.message);
      }
      if ('invalid_members' in response.data.data) {
        // window.open(response.data.data.invalid_members, 'download');
        const link = document.createElement('a');
        link.download = 'download';
        link.href = response.data.data.invalid_members;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Toast.error(response.data.message);
      }
      //yield memberListAPI();
    }
    // else {
    //   yield put({type: MEMBER.MEMBER_FILE_UPLOAD.FAILURE});
    // }
  } catch (err) {
    Logger(err);
    if (err) {
      const errorMessage = getErrorMessage(err); // err.response.data
      if (
        !!err.response &&
        !!err.response.data.data &&
        'invalid_members' in err.response.data.data
      ) {
        const link = document.createElement('a');
        link.download = 'download';
        link.href = err.response.data.data.invalid_members;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      Toast.error(errorMessage.message);
      yield put({type: MEMBER.MEMBER_FILE_UPLOAD.FAILURE, error: errorMessage});
    }
  }
}

function* memberItemAPI(actions) {
  try {
    const response = yield call(
      AxiosServices.get,
      `${ApiServices.GET_MEMBER_ITEM_PATH}/${actions.body.id}`,
      {},
      false
    ); // true when Json Server
    if (response.status === ResponseCode.OK) {
      yield put({
        type: MEMBER.GET_MEMBER_ITEM.SUCCESS,
        result: response.data
      });
      // Toast.success(response.data.message);
    } else {
      yield put({type: MEMBER.GET_MEMBER_ITEM.FAILURE});
    }
  } catch (err) {
    Logger(err);
    if (err) {
      const errorMessage = getErrorMessage(err); // err.response.data
      Toast.error(errorMessage.message);
      yield put({type: MEMBER.GET_MEMBER_ITEM.FAILURE, error: errorMessage});
    }
  }
}

function* memberItemDeleteAPI(actions) {
  try {
    const response = yield call(
      AxiosServices.remove,
      `${ApiServices.DELETE_MEMBER_ITEM_PATH}/${actions.body.id}`,
      actions.body,
      false
    ); // true when Json Server
    if (response.status === ResponseCode.OK) {
      yield put({
        type: MEMBER.MEMBER_ITEM_DELETE.SUCCESS,
        result: response.data
      });
      Toast.success(response.data.message);
    } else {
      yield put({type: MEMBER.MEMBER_ITEM_DELETE.FAILURE});
    }
  } catch (err) {
    Logger(err);
    if (err) {
      const errorMessage = getErrorMessage(err); // err.response.data
      Toast.error(errorMessage.message);
      yield put({type: MEMBER.MEMBER_ITEM_DELETE.FAILURE});
    }
  }
}

function* saveMemberData(actions) {
  try {
    const PATH = !!actions.body.id
      ? `${ApiServices.UPDATE_MEMBER_PATH}/${actions.body.id}`
      : ApiServices.ADD_MEMBER_PATH;
    const METHOD = !!actions.body.id ? AxiosServices.put : AxiosServices.post;
    const response = yield call(METHOD, PATH, actions.body.param, false); // true when Json Server
    if (response.status === ResponseCode.OK) {
      yield put({
        type: MEMBER.SAVE_MEMBER_ITEM.SUCCESS,
        result: response.data
      });
      Toast.success(response.data.message);
    } else {
      yield put({type: MEMBER.SAVE_MEMBER_ITEM.FAILURE});
    }
  } catch (err) {
    Logger(err);
    if (err) {
      const errorMessage = getErrorMessage(err); // err.response.data
      Toast.error(errorMessage.message);
      yield put({type: MEMBER.SAVE_MEMBER_ITEM.FAILURE, error: errorMessage});
    }
  }
}

function* invitationAPI(actions) {
  try {
    const response = yield call(
      AxiosServices.post,
      ApiServices.INVITE_MEMBER_PATH,
      actions.body,
      false
    ); // true when Json Server
    if (response.status === ResponseCode.OK) {
      yield put({
        type: MEMBER.MEMBER_INVITATION.SUCCESS,
        result: response.data
      });
      Toast.success(response.data.message);
      yield memberListAPI();
    } else {
      yield put({type: MEMBER.MEMBER_INVITATION.FAILURE});
    }
  } catch (err) {
    Logger(err);
    if (err) {
      const errorMessage = getErrorMessage(err); // err.response.data
      Toast.error(errorMessage.message);
      yield put({type: MEMBER.MEMBER_INVITATION.FAILURE, error: errorMessage});
    }
  }
}

export default function* memberSaga() {
  yield takeLatest(MEMBER.GET_MEMBER_LIST.MAIN, memberListAPI);
  yield takeLatest(MEMBER.GET_MEMBER_ITEM.MAIN, memberItemAPI);
  yield takeLatest(MEMBER.SAVE_MEMBER_ITEM.MAIN, saveMemberData);
  yield takeEvery(MEMBER.MEMBER_INVITATION.MAIN, invitationAPI);
  yield takeLatest(MEMBER.MEMBER_ITEM_DELETE.MAIN, memberItemDeleteAPI);
  yield takeLatest(MEMBER.MEMBER_FILE_DOWNLOAD.MAIN, memberFileDownloadAPI);
  yield takeLatest(MEMBER.MEMBER_FILE_UPLOAD.MAIN, memberFileUploadAPI);
}
