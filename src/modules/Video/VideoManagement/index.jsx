import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import DefaultLayout from '../../../containers/DefaultLayout';
import style from './videoManagement.module.scss';
import YoutubePlayer from '../components/Player/youtubePlayer';
import HtmlPlayer from '../components/Player/htmlPlayer';
import Tab from '../../../common-components/tab/Tab';
import TabPane from '../../../common-components/tab/TabPane';
import VideoForm from './components/videoForm';
import {rawMaterialModtranslator} from '../modLocalization';
import {CheckmarkDoneSharp, CreateOutline} from '../mod-assets/svgComp';
import {
  fieldInitialization,
  getMaterialVideoItem,
  videoTitleUpdate
} from '../../../redux/actions/video';
import Loader from '../../../common-components/Loader';
import VideoFormVimeo from './components/videoFormVimeo';
import {NEWSCLOUD, VIMEO, YOUTUBE} from '../../../app-constants/rawContent';
import VimeoPlayer from '../components/Player/vimeoPlayer';
import Toast from '../../../common-components/Toast';
import path from '../../../routes/path';
import {INPUT_MAX_LENGTH_100} from '../../../app-constants/characterLength';
import NcBreadcrumbs from '../../../common-components/NcBreadcrumbs/ncBreadcrumbs';

class VideoManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab:
        props.selectedPlatform === NEWSCLOUD ? 1 : Number(props.selectedPlatform),
      name: '',
      apiError: '',
      apiSuccessMsg: '',
      isTitleEdit: false
    };
  }

  static getDerivedStateFromProps(props, state) {
    const data = {};
    if (props.apiError !== state.apiError) {
      data.apiError = props.apiError;
    }
    return data;
  }

  componentDidMount() {
    this.props.fieldInitialization({
      apiError: '',
      youtubeThumb: '',
      vimeoThumb: '',
      rawTitleupdate: '',
      isAPICall: false
      // channels: '',
      // categories: ''
    });
    this.props.getMaterialVideoItem({
      id: this.props.selectedVideoId,
      type: this.props.selectedPlatform
    });
    Toast.clear();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.activeTab === 2 &&
      this.props.videoAuth.vimeo_unauthenticated_msg &&
      !this.props.isAPICall
    ) {
      // Toast.clear();
      Toast.error(this.props.videoAuth.vimeo_unauthenticated_msg);
      window.scrollTo(0, 0);
    } else if (
      this.state.activeTab === 1 &&
      this.props.videoAuth.youtube_unauthenticated_msg &&
      !this.props.isAPICall
    ) {
      // Toast.clear();
      Toast.error(this.props.videoAuth.youtube_unauthenticated_msg);
    } else {
      // Toast.clear();
    }
  }

  getActiveIndex = (index) => {
    Toast.clear();
    this.setState({activeTab: index});
    this.props.fieldInitialization({isAPICall: false});
  };

  onChangeValue = (e) => {
    const {value} = e.target;
    this.setState({name: value});
  };

  handleInputFocusBlur = (val) => {
    this.setState({focus: val});
  };

  handleTitleUpdate = () => {
    const {selectedVideoId} = this.props;
    const {name} = this.state;
    const selectedVideo = JSON.parse(JSON.stringify({...this.props.selectedVideo}));
    if (!!name) {
      this.props.fieldInitialization({isAPICall: true});
      this.props.videoTitleUpdate({
        id: selectedVideoId,
        title: name
      });
    }
    this.setState({isTitleEdit: false, name: ''});
  };

  handleEditToggle = () => {
    this.setState({isTitleEdit: true});
  };

  render() {
    const {activeTab, isTitleEdit, name} = this.state;
    const {
      selectedVideo,
      vimeoDetail,
      apiError,
      youtubeDetail,
      selectedPlatform,
      rawTitleupdate
    } = this.props;
    const breadcrumbs = [
      {
        title: rawMaterialModtranslator('RAW_MATERIAL.RAW_PAGE_LINK'),
        link: path.rawMaterials
      },
      {
        title: rawMaterialModtranslator('RAW_MATERIAL.VIDEO_PAGE_TITLE'),
        link: '',
        active: true
      }
    ];
    return (
      <DefaultLayout>
        {!this.props.loading ? (
          <div className={style.VMContainer}>
            {/* <h2>{!!apiError && <RequiredMessage text={apiError.message} />}</h2> */}
            <NcBreadcrumbs breadcrumbs={breadcrumbs} />
            <Toast />
            {!!selectedVideo && (
              <div className={style.pageTitle}>
                <span>
                  {rawMaterialModtranslator('RAW_MATERIAL.VIDEO_PAGE_TITLE')}:{' '}
                </span>

                {!isTitleEdit ? (
                  <span className={style.rawTitleLeftGap}>
                    {!!rawTitleupdate ? rawTitleupdate : selectedVideo.title}
                  </span>
                ) : (
                  <input
                    type="text"
                    name="channel"
                    className={style.titleInputFocus}
                    defaultValue={selectedVideo.title}
                    maxLength={INPUT_MAX_LENGTH_100}
                    onChange={(e) => this.onChangeValue(e)}
                  />
                )}
                {selectedPlatform === NEWSCLOUD && (
                  <>
                    {!isTitleEdit ? (
                      <div
                        role="button"
                        tabIndex="0"
                        className={style.titleAttr}
                        onClick={() => this.handleEditToggle()}
                      >
                        <CreateOutline fill="#008ecd" className={style.svgIcon} />
                        <span> {rawMaterialModtranslator('VIDEO_MANAGE.EDIT')}</span>
                      </div>
                    ) : (
                      <div
                        role="button"
                        tabIndex="0"
                        className={style.titleAttr}
                        onClick={() => this.handleTitleUpdate()}
                      >
                        <CheckmarkDoneSharp className={style.svgIcon} />
                        <span> {rawMaterialModtranslator('VIDEO_MANAGE.EDIT')}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            <div className={style.sectionWrap}>
              <div className={style.upperSection}>
                <div className={style.player}>
                  {!!youtubeDetail &&
                  youtubeDetail.media_id &&
                  activeTab === Number(YOUTUBE) ? (
                    <YoutubePlayer
                      video={youtubeDetail.media_id}
                      title={youtubeDetail.title}
                      autoplay="0"
                      rel="0"
                      modest="1"
                    />
                  ) : !!vimeoDetail &&
                    vimeoDetail.media_id &&
                    activeTab === Number(VIMEO) ? (
                    <VimeoPlayer
                        video={vimeoDetail.media_id}
                        title={vimeoDetail.title}
                      />
                  ) : (
                    !!selectedVideo && (
                      <HtmlPlayer
                        video={selectedVideo.video_link}
                        videoId={selectedVideo.id}
                      />
                    )
                  )}
                </div>
              </div>
              <div className={style.lowerSection}>
                <Tab
                  activeTab={activeTab}
                  // activeTab={selectedVideo.isUploadedYoutube === 1 ? 2 : activeTab}
                  tabActiveItem={this.getActiveIndex}
                >
                  <TabPane
                    tab={1}
                    title="Youtube"
                    isEnable={
                      selectedPlatform === VIMEO
                      // || selectedVideo.isUploadedYoutube === 1
                    }
                  >
                    <VideoForm activeTab={activeTab} videoItem={selectedVideo} />
                  </TabPane>
                  <TabPane
                    tab={2}
                    title="Vimeo"
                    isEnable={
                      selectedPlatform === YOUTUBE
                      // || selectedVideo.isUploadedVimeo === 1
                    }
                  >
                    <VideoFormVimeo
                      activeTab={activeTab}
                      videoItem={selectedVideo}
                    />
                  </TabPane>
                </Tab>
              </div>
              <div className={style.btnSection}></div>
            </div>
          </div>
        ) : (
          <Loader />
        )}
      </DefaultLayout>
    );
  }
}

function mapStateToProps(state) {
  return {
    selectedVideo: state.videoReducer.selectedVideo,
    apiError: state.videoReducer.apiError,
    loading: state.videoReducer.loading,
    selectedVideoId: state.videoReducer.selectedVideoId,
    selectedPlatform: state.videoReducer.selectedPlatform,
    youtubeDetail: state.videoReducer.youtubeDetail,
    vimeoDetail: state.videoReducer.vimeoDetail,
    apiSuccess: state.videoReducer.apiSuccess,
    videoAuth: state.videoReducer.videoAuth,
    rawTitleupdate: state.videoReducer.rawTitleupdate,
    isAPICall: state.videoReducer.isAPICall
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getMaterialVideoItem: (data) => dispatch(getMaterialVideoItem(data)),
    videoTitleUpdate: (data) => dispatch(videoTitleUpdate(data)),
    fieldInitialization: (data) => dispatch(fieldInitialization(data))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(VideoManagement));
