import {MEMBER} from '../../constants/member';

export const initialState = {
  selectedMemberId: '',
  selectedMember: {},
  memberList: [],
  apiError: '',
  apiSuccess: '',
  currentEmail: '',
  currentUserName: '',
  loading: false,
  isBtnActive: false
};

export default function videoReducer(state = initialState, action) {
  switch (action.type) {
    case MEMBER.FIELD_INITIALIZATION:
      return {
        ...state,
        ...action.body
      };
    case MEMBER.GET_MEMBER_LIST.MAIN:
      return {
        ...state,
        apiError: '',
        memberList: [],
        loading: true
      };
    case MEMBER.GET_MEMBER_LIST.SUCCESS:
      return {
        ...state,
        apiError: '',
        memberList: action.result,
        loading: false
      };
    case MEMBER.GET_MEMBER_LIST.FAILURE:
      return {
        ...state,
        apiError: action.error,
        loading: false
      };
    case MEMBER.SAVE_MEMBER_ITEM.MAIN:
      return {
        ...state,
        apiError: '',
        isBtnActive: true,
        apiSuccess: ''
      };
    case MEMBER.SAVE_MEMBER_ITEM.SUCCESS:
      return {
        ...state,
        apiError: '',
        isBtnActive: false,
        apiSuccess: action.result.message
      };
    case MEMBER.SAVE_MEMBER_ITEM.FAILURE:
      return {
        ...state,
        apiError: action.error,
        isBtnActive: false
      };

    case MEMBER.GET_MEMBER_ITEM.MAIN:
      return {
        ...state,
        apiError: '',
        loading: true,
        currentEmail: '',
        currentUserName: ''
      };
    case MEMBER.GET_MEMBER_ITEM.SUCCESS:
      return {
        ...state,
        apiError: '',
        loading: false,
        selectedMember: action.result.data,
        currentEmail: !!action.result.data ? action.result.data.email : '',
        currentUserName: !!action.result.data ? action.result.data.username : ''
      };
    case MEMBER.GET_MEMBER_ITEM.FAILURE:
      return {
        ...state,
        apiError: action.error,
        loading: false
      };
    case MEMBER.MEMBER_ITEM_DELETE.MAIN:
      return {
        ...state,
        apiError: '',
        loading: true
      };
    case MEMBER.MEMBER_ITEM_DELETE.SUCCESS:
      return {
        ...state,
        apiError: '',
        loading: false,
        apiSuccess: action.result.message
      };
    case MEMBER.MEMBER_ITEM_DELETE.FAILURE:
      return {
        ...state,
        //apiError: action.error,
        loading: false
      };

    case MEMBER.MEMBER_FILE_UPLOAD.MAIN:
      return {
        ...state,
        isBtnActive: true
      };
    case MEMBER.MEMBER_FILE_UPLOAD.SUCCESS:
      return {
        ...state,
        isBtnActive: false
      };
    case MEMBER.MEMBER_FILE_UPLOAD.FAILURE:
      return {
        ...state,
        isBtnActive: false
      };

    case MEMBER.MEMBER_FILE_DOWNLOAD.MAIN:
      return {
        ...state,
        isBtnActive: true
      };
    case MEMBER.MEMBER_FILE_DOWNLOAD.SUCCESS:
      return {
        ...state,
        isBtnActive: false
      };
    case MEMBER.MEMBER_FILE_DOWNLOAD.FAILURE:
      return {
        ...state,
        isBtnActive: false
      };
    default:
      return state;
  }
}
