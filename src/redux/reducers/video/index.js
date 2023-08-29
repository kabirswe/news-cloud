import update from 'immutability-helper';
import {VIDEO} from '../../constants/video';
import {
  getObjectFromArrComparedByAttr,
  getObjectFromArrComparedById,
  isObjectEmpty
} from '../../../helper';

export const initialState = {
  selectedVideoId: '',
  selectedPlatform: '',
  apiError: '',
  selectedVideo: {},
  loading: false,
  categories: [],
  channels: [],
  youtubeDetail: {},
  vimeoDetail: {},
  apiSuccess: '',
  viewCoverage: [],
  commentPermission: [],
  embedCoverage: [],
  authUrl: '',
  youtubeThumb: '',
  vimeoThumb: '',
  videoAuth: {},
  rawTitleupdate: '',
  isAPICall: false,
  rawFilterData: {}
};

export default function videoReducer(state = initialState, action) {
  switch (action.type) {
    case VIDEO.FIELD_INITIALIZER:
      return {
        ...state,
        ...action.body
      };
    case VIDEO.GET_MATERIAL_VIDEO_ITEM.MAIN:
      return {
        ...state,
        apiError: '',
        selectedVideo: {},
        youtubeDetail: {},
        vimeoDetail: {},
        videoAuth: {},
        channels: [],
        categories: [],
        viewCoverage: [],
        commentPermission: [],
        embedCoverage: [],
        loading: true
      };
    case VIDEO.GET_MATERIAL_VIDEO_ITEM.SUCCESS:
      return {
        ...state,
        apiError: '',
        selectedVideo: action.result.data,
        loading: false
      };

    case VIDEO.GET_MATERIAL_VIDEO_ITEM.MEDIA:
      const youtubeObj = action.result.data.youtube;
      const vimeoObj = action.result.data.vimeo;
      let dataset = {};
      let datasetVimeo = {};
      // const selectedVideoResult = {
      //   id: action.result.data.id,
      //   is_published: action.result.data.is_published,
      //   is_uploaded: action.result.data.is_uploaded,
      //   is_uploaded_vimeo: action.result.data.is_uploaded_vimeo,
      //   is_uploaded_youtube: action.result.data.is_uploaded_youtube,
      //   thumbnail: action.result.data.thumbnail,
      //   thumbnail_sm: action.result.data.thumbnail_sm,
      //   title: action.result.data.title,
      //   video_link: action.result.data.video_link
      // };
      if (!!youtubeObj) {
        dataset = {
          ...youtubeObj,
          status:
            !!youtubeObj.is_published && youtubeObj.is_published === 1
              ? true
              : false,
          category: !isObjectEmpty(state.categories)
            ? getObjectFromArrComparedById(state.categories, youtubeObj.category_id)
            : {},
          channel: !isObjectEmpty(state.channels)
            ? getObjectFromArrComparedById(state.channels, youtubeObj.channel_id)
            : {}
        };
      }
      if (!!vimeoObj) {
        datasetVimeo = {
          ...vimeoObj,
          selectedView: !isObjectEmpty(state.viewCoverage)
            ? getObjectFromArrComparedByAttr(
                state.viewCoverage,
                vimeoObj.view_coverage
              )
            : {},
          selectedEmbed: !isObjectEmpty(state.embedCoverage)
            ? getObjectFromArrComparedByAttr(
                state.embedCoverage,
                vimeoObj.embed_code_access
              )
            : {},
          selectedComment: !isObjectEmpty(state.commentPermission)
            ? getObjectFromArrComparedByAttr(
                state.commentPermission,
                vimeoObj.comment_coverage
              )
            : {}
        };
      }
      return update(state, {
        youtubeDetail: {$set: dataset},
        vimeoDetail: {$set: datasetVimeo},
        loading: {$set: false},
        apiError: {$set: ''},
        selectedVideo: {$set: action.result.data.video},
        // selectedVideo: {$set: selectedVideoResult},
        videoAuth: {$set: action.result.data.video_auth}
      });
    case VIDEO.GET_MATERIAL_VIDEO_ITEM.FAILURE:
      return {
        ...state,
        apiError: action.error,
        loading: false
      };
    case VIDEO.YOUTUBE_CHANNELS_CATEGORIES.MAIN:
      return update(state, {
        apiError: {$set: ''}
      });

    case VIDEO.YOUTUBE_CHANNELS_CATEGORIES.SUCCESS:
      return update(state, {
        apiError: {$set: ''},
        authUrl: {$set: ''},
        channels: {
          $set: action.result.data.channels.map((row) => ({
            id: row.id,
            value: row.title,
            label: row.title
          }))
        },
        categories: {
          $set: action.result.data.categories.map((row) => ({
            id: row.id,
            value: row.title,
            label: row.title
          }))
        }
      });
    case VIDEO.YOUTUBE_CHANNELS_CATEGORIES.FAILURE:
      return {
        ...state,
        apiError: action.error
      };
    case VIDEO.VIDEO_SAVE_YOUTUBE.MAIN:
      return {
        ...state,
        apiError: '',
        // youtubeDetail: initialState.youtubeDetail,
        loading: true
      };
    case VIDEO.VIDEO_SAVE_YOUTUBE.SUCCESS:
      const row = action.result.data;
      let youtube = {};
      if (!!row) {
        youtube = {
          ...row,
          status: !!row.is_published && row.is_published === 1 ? true : false,
          category: !isObjectEmpty(state.categories)
            ? getObjectFromArrComparedById(state.categories, row.category_id)
            : {},
          channel: !isObjectEmpty(state.channels)
            ? getObjectFromArrComparedById(state.channels, row.channel_id)
            : {}
        };
      }
      const {selectedVideo} = state;
      const selectedVideoData = selectedVideo.hasOwnProperty('is_uploaded_youtube')
        ? {...selectedVideo, is_uploaded_youtube: 1}
        : selectedVideo;
      return update(state, {
        youtubeDetail: {$set: youtube},
        selectedVideo: {$set: selectedVideoData},
        loading: {$set: false},
        youtubeThumb: {$set: ''},
        apiError: {$set: ''}
      });

    case VIDEO.VIDEO_SAVE_YOUTUBE.FAILURE:
      return {
        ...state,
        apiError: action.error,
        loading: false
      };

    case VIDEO.UPDATE_VIDEO_TITLE.MAIN:
      return {
        ...state,
        apiError: ''
      };

    case VIDEO.UPDATE_VIDEO_TITLE.SUCCESS:
      const videoObj = state.selectedVideo;
      videoObj.title = action.param.title;

      return update(state, {
        selectedVideo: {$set: videoObj},
        rawTitleupdate: {$set: action.param.title},
        apiError: {$set: ''}
      });
    case VIDEO.UPDATE_VIDEO_TITLE.FAILURE:
      return {
        ...state,
        apiError: action.error
      };

    case VIDEO.GET_YOUTUBE_ITEM.MAIN:
      return {
        ...state,
        apiError: '',
        loading: true
        // youtubeDetail: initialState.youtubeDetail
      };

    case VIDEO.GET_YOUTUBE_ITEM.FAILURE:
      return {
        ...state,
        apiError: action.error,
        loading: false
      };

    case VIDEO.DELETE_VIDEO_CONTENT.MAIN:
      return update(state, {
        apiError: {$set: ''},
        apiSuccess: {$set: ''}
      });

    case VIDEO.DELETE_VIDEO_CONTENT.SUCCESS:
      return update(state, {
        apiError: {$set: ''},
        apiSuccess: {$set: action.result.message}
      });

    case VIDEO.DELETE_VIDEO_CONTENT.FAILURE:
      return update(state, {
        apiError: {$set: action.error}
      });

    case VIDEO.VIMEO_PRIVACY_LIST.MAIN:
      return {
        ...state,
        apiError: ''
      };
    case VIDEO.VIMEO_PRIVACY_LIST.SUCCESS:
      const embedCoverage = [];
      const viewCoverage = [];
      const commentPermission = [];

      if (!!action.result.data.privacy_embed) {
        Object.entries(action.result.data.privacy_embed).forEach(([key, value]) => {
          embedCoverage.push({value: key, label: value});
        });
      }
      if (!!action.result.data.privacy_view) {
        Object.entries(action.result.data.privacy_view).forEach(([key, value]) => {
          viewCoverage.push({value: key, label: value});
        });
      }
      if (!!action.result.data.privacy_comments) {
        Object.entries(action.result.data.privacy_comments).forEach(
          ([key, value]) => {
            commentPermission.push({value: key, label: value});
          }
        );
      }
      return update(state, {
        apiError: {$set: ''},
        embedCoverage: {$set: embedCoverage},
        viewCoverage: {$set: viewCoverage},
        commentPermission: {$set: commentPermission}
      });
    case VIDEO.VIMEO_PRIVACY_LIST.FAILURE:
      return {
        ...state,
        apiError: action.error
      };
    case VIDEO.VIDEO_SAVE_VIMEO.MAIN:
      return {
        ...state,
        apiError: '',
        loading: true
      };
    case VIDEO.VIDEO_SAVE_VIMEO.SUCCESS:
      const vimeo = action.result.data;
      let vimeoData = {};
      if (!!vimeo) {
        vimeoData = {
          ...vimeo,
          selectedView: !isObjectEmpty(state.viewCoverage)
            ? getObjectFromArrComparedByAttr(state.viewCoverage, vimeo.view_coverage)
            : {},
          selectedEmbed: !isObjectEmpty(state.embedCoverage)
            ? getObjectFromArrComparedByAttr(
                state.embedCoverage,
                vimeo.embed_code_access
              )
            : {},
          selectedComment: !isObjectEmpty(state.commentPermission)
            ? getObjectFromArrComparedByAttr(
                state.commentPermission,
                vimeo.comment_coverage
              )
            : {}
        };
      }
      const selectedVideoObj = state.selectedVideo;
      const selectedVideoUpdate = selectedVideoObj.hasOwnProperty(
        'is_uploaded_vimeo'
      )
        ? {...selectedVideoObj, is_uploaded_vimeo: 1}
        : selectedVideoObj;

      console.log('selectedVideoUpdate', selectedVideoUpdate);
      return update(state, {
        vimeoDetail: {$set: vimeoData},
        selectedVideo: {$set: selectedVideoUpdate},
        loading: {$set: false},
        apiError: {$set: ''}
      });

    case VIDEO.VIDEO_SAVE_VIMEO.FAILURE:
      return {
        ...state,
        apiError: action.error,
        loading: false
      };

    case VIDEO.GET_VIMEO_ITEM.MAIN:
      return {
        ...state,
        apiError: action.error,
        loading: true
      };
    case VIDEO.GET_VIMEO_ITEM.FAILURE:
      return {
        ...state,
        apiError: action.error,
        loading: false
      };

    default:
      return state;
  }
}
