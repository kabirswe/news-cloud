import {MEMBER} from '../../constants/member';

export function fieldInitialization(body) {
  return {
    type: MEMBER.FIELD_INITIALIZATION,
    body
  };
}

export function getMemberList() {
  return {
    type: MEMBER.GET_MEMBER_LIST.MAIN
  };
}

export function saveMemberItem(body) {
  return {
    type: MEMBER.SAVE_MEMBER_ITEM.MAIN,
    body
  };
}

export function getMemberItemById(body) {
  return {
    type: MEMBER.GET_MEMBER_ITEM.MAIN,
    body
  };
}
export function memberItemDelete(body) {
  return {
    type: MEMBER.MEMBER_ITEM_DELETE.MAIN,
    body
  };
}
export function memberFileDownload() {
  return {
    type: MEMBER.MEMBER_FILE_DOWNLOAD.MAIN
  };
}

export function memberFileUpload(body) {
  return {
    type: MEMBER.MEMBER_FILE_UPLOAD.MAIN,
    body
  };
}

export function memberInvitation(body) {
  return {
    type: MEMBER.MEMBER_INVITATION.MAIN,
    body
  };
}
