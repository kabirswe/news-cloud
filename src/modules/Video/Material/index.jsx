import React, {Component, useCallback} from 'react';
import {connect} from 'react-redux';
import moment from 'moment';
import axios from 'axios';
import {withRouter} from 'react-router-dom';
import {
  Progress,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Alert
} from 'reactstrap';
import InifiniteScroll from 'react-infinite-scroller';
import config from '../../../config';
import DefaultLayout from '../../../containers/DefaultLayout';
import FilterBar from '../components/filterBar';
import Commonbutton from '../../../common-components/button/Button';
import Inputfield from '../../../common-components/inputfield/Inputfield';
import getErrorMessage from '../../../app-constants/ServerErrorInfo';
import AxiosService from '../../../networks/AxiosService';
import ApiServices from '../../../networks/ApiServices';
import style from './rawMaterial.module.scss';
import {images} from '../../../app-constants/images';
import {
  CloudUploadSharp,
  FolderOpen,
  CloseCircleSharp,
  LogoYoutube,
  LogoVimeo,
  CheckmarkDoneCircle,
  TrashSharp,
  AlertShape,
  CloudUploadOutline
} from '../mod-assets/svgComp';
import {rawMaterialModtranslator} from '../modLocalization';
import {
  KILO_BYTE,
  MAX_VIDEO_IN_GB,
  RAW_MATERIAL_SEPARETOR,
  rawMaterialPage,
  contentPage,
  FILE_UPLOAD_FORM_AWAIT
} from '../../../app-constants/usersConstant';
import path from '../../../routes/path';
import Loader from '../../../common-components/Loader';
import InfiniteLoader from '../../../common-components/InfiniteLoader';
import {
  fieldInitialization,
  getMaterialVideoItem
} from '../../../redux/actions/video';
import {VIMEO, YOUTUBE, NEWSCLOUD} from '../../../app-constants/rawContent';
import Toast from '../../../common-components/Toast';
import NcBreadcrumbs from '../../../common-components/NcBreadcrumbs/ncBreadcrumbs';
import {generateKey} from "../../../helper";

const {CancelToken} = axios;
class RawMaterial extends Component {
  constructor(props) {
    super(props);
    this.formData = new FormData();
    this.cancel = null;
    this.state = {
      nextPage: null,
      apiFailed: false,
      hasMore: true,
      infiniteLoader: false,
      videoList: [],
      video: null,
      videoTitle: null,
      loaded: 0,
      modalOpen: false,
      isAllValid: false,
      isOpenAlert: false,
      serverMessage: '',
      isLoading: false,
      isValidVideo: false,
      isLoader: true,
      videosFile: [],
      videoLoad: [0, 0, 0, 0, 0],
      isVideoActive: 0,
      uploadServerMsg: [],
      isOpenVideoPlatformModal: false,
      failedUpload: [],
      cancelVideoList: [],
      searchText: this.props.globalSearchText,
      file_url: ''
    };
    this.toggleModal = this.toggleModal.bind(this);
    this.getVideoList = this.getVideoList.bind(this);
    this.postVideo = this.postVideo.bind(this);
    this.deleteSelectedVideo = this.deleteSelectedVideo.bind(this);
    this.iconGenerate = this.iconGenerate.bind(this);
    this.selectInput = this.selectInput.bind(this);
  }

  componentDidMount() {
    this.props.fieldInitialization({
      selectedVideoId: '',
      selectedPlatform: '',
      youtubeDetail: {},
      selectedVideo: {},
      vimeoDetail: {}
    });
    const URL = window.location.href;
    const param = URL.split(RAW_MATERIAL_SEPARETOR);
    if (param.length > 1) {
      this.setState({isRawMaterialPage: true});
    }
    Toast.clear();
  }

  componentDidUpdate = (prevProps) => {
    const {globalSearchText} = prevProps;
    if (globalSearchText !== this.props.globalSearchText) {
      this.setState(
        {
          searchText: this.props.globalSearchText
        },
        () => this.getVideoList(this.state.videoApiParam, false)
      );
    }
  };

  componentWillUnmount = () => {
    this.toggleModal = undefined;
    this.getVideoList = undefined;
    this.postVideo = undefined;
    this.deleteSelectedVideo = undefined;
    this.iconGenerate = undefined;
    this.selectInput = undefined;
  };

  getVideoList(param = '', isDataProcessing) {
    this.props.fieldInitialization({rawFilterData: param});
    param = {
      ...param,
      publicationPeriodStart: !!param.publicationPeriodStart
        ? moment(param.publicationPeriodStart).format('YYYY-MM-DD')
        : '',
      publicationPeriodEnd: !!param.publicationPeriodEnd
        ? moment(param.publicationPeriodEnd).format('YYYY-MM-DD')
        : '',
      page: 1,
      searchText: this.state.searchText
    };
    this.setState({isLoader: true, isDataProcessing: isDataProcessing});
    AxiosService.get(ApiServices.GET_RAW_MATERIAL_VIDEO_LIST, param, false)
      .then((response) => {
        const data = response.data.data.list;
        this.setState({
          videoList: [...data.data],
          isLoader: false,
          apiFailed: false,
          videoMessage: response.data.message,
          videoStatus: response.data.status,
          isDataProcessing: false,
          hasMore: data.current_page < data.last_page ? true : false,
          nextPage: data.next_page_url ? 2 : 1,
          videoApiParam: param,
          file_url: response.data.data.file_url
        });
      })
      .catch((err) => {
        const apiError = getErrorMessage(err);
        this.setState({
          isLoader: false,
          videoList: [],
          apiFailed: true,
          videoMessage: apiError.message,
          videoStatus: false,
          isDataProcessing: false,
          videoApiParam: param
        });
      });
  }

  videoUpload = (e) => {
    const {videosFile} = this.state;
    if (videosFile.length < 5) {
      const {files} = e.target;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = this.isVideo(file.name);
        if (isVideo) {
          this.setState({isNotVideo: false});
          if (file.size / (KILO_BYTE * KILO_BYTE * KILO_BYTE) > MAX_VIDEO_IN_GB) {
            this.setState({
              isVideoError: true,
              videoErrorMsg: rawMaterialModtranslator(
                'RAW_MATERIAL.VIDEO_SIZE_ERROR'
              ),
              isValidVideo: false,
              isOpenAlert: false,
              isAttempToUpload: true
            });
          } else {
            this.setState({
              isValidVideo: true,
              videoErrorMsg: '',
              isVideoError: false,
              isOpenAlert: false,
              isAttempToUpload: true
            });
            const {videosFile} = this.state;
            if (videosFile.length < 5) {
              this.formData.append(`videos[]`, files[i]);
              videosFile.push(files[i]);
              this.setState({videosFile: videosFile});
            }
          }
        } else {
          this.setState({
            isVideoError: true,
            videoErrorMsg: rawMaterialModtranslator('RAW_MATERIAL.VIDEO_TYPE_ERROR'),
            isValidVideo: false,
            isOpenAlert: false,
            isAttempToUpload: true
          });
        }
      }
    } else {
      this.setState({
        isAllValid: false,
        serverMessage: rawMaterialModtranslator('VIDEO_MANAGE.MAX_VIDEO_ERROR'),
        isOpenAlert: true
      });
    }
    this.videoInput.value = '';
  };

  getExtension(filename) {
    const parts = filename.split('.');
    return parts[parts.length - 1];
  }

  isVideo(filename) {
    const ext = this.getExtension(filename);
    switch (ext.toLowerCase()) {
      case 'mov':
      case 'mpeg4':
      case 'avi':
      case 'mp4':
        return true;
    }
    return false;
  }

  cancelRequest = (index) => {
    const cancelMessage = rawMaterialModtranslator(
      'RAW_MATERIAL.VIDEO_UPLOAD_CANCEL_MESSAGE'
    );
    this.cancel(cancelMessage);
    const {cancelVideoList, isVideoActive} = this.state;
    if (isVideoActive == index) {
      cancelVideoList.push(index);
    }
    this.setState({isUploadProcessing: false, cancelVideoList});
  };

  handleVideoItem = async (id, platform) => {
    await this.props.fieldInitialization({
      selectedVideoId: id,
      selectedPlatform: platform,
      apiSuccess: '',
      youtubeDetail: {},
      selectedVideo: {},
      vimeoDetail: {}
    });
    // this.props.getMaterialVideoItem(id);
    this.props.history.push(path.videoManagement);
  };

  async postVideo(e) {
    this.setState({isUploadProcessing: true});
    const {isValidVideo, videoLoad, videosFile} = this.state;
    if (!videosFile.length) {
      this.setState({
        isValidVideo: false,
        isUploadProcessing: false,
        videoErrorMsg: rawMaterialModtranslator('RAW_MATERIAL.SELECT_VIDEO_FILE')
      });
    }
    if (isValidVideo) {
      for (var i = 0; i < videosFile.length; i++) {
        this.setState({
          loaded: 0,
          isAttempToUpload: true,
          isValidAttempToUpload: true
        });
        const {modalOpen} = this.state;
        if (!modalOpen) {
          this.cancelRequest();
          return false;
        }
        const serverUrl = config.API_URL;
        const token = JSON.parse(localStorage.getItem('accessToken'));
        const formVideo = new FormData();
        formVideo.append(`videos[${i}]`, videosFile[i]);

        const uploadFile = await axios
          .post(serverUrl + ApiServices.POST_VIDEO_MULTIPLE, formVideo, {
            onUploadProgress: (ProgressEvent) => {
              const totalLength = ProgressEvent.lengthComputable
                ? ProgressEvent.total
                : ProgressEvent.target.getResponseHeader('content-length') ||
                  ProgressEvent.target.getResponseHeader(
                    'x-decompressed-content-length'
                  );
              videoLoad[i] = Math.round((ProgressEvent.loaded * 100) / totalLength);
              this.setState({
                loaded: Math.round((ProgressEvent.loaded * 100) / totalLength),
                videoLoad: videoLoad,
                isVideoActive: i
              });
            },
            cancelToken: new CancelToken((c) => {
              this.cancel = c;
              const {uploadServerMsg} = this.state;
              if (uploadServerMsg[i]) {
                uploadServerMsg[i].status = false;
                uploadServerMsg[i].message = '';
              } else {
                const msgItem = {status: false, message: ''};
                uploadServerMsg.push(msgItem);
              }
              this.setState({
                uploadServerMsg: uploadServerMsg
              });
            }),
            headers: {
              'Content-Type': 'multipart/form-data',
              'Accept-Language': config.DEFAULT_LANGUAGE,
              Authorization: `Bearer ${token}`
            }
          })
          .then((res) => {
            const {uploadServerMsg, failedUpload} = this.state;
            if (uploadServerMsg[i]) {
              uploadServerMsg[i].status = res.data.status;
              uploadServerMsg[i].message = res.data.message;
            } else {
              const msgItem = {status: res.data.status, message: res.data.message};
              uploadServerMsg.push(msgItem);
            }
            let isOpenVideoPlatformModal = false;
            if (videosFile.length == 1) {
              if (res.data.status) {
                Toast.success(res.data.message);
                const {loaded} = this.state;
                if (loaded == 100) {
                  isOpenVideoPlatformModal = true;
                  // const uploaded_video_id = res.data.data.uploaded_video_id || [];
                  // const uploadedVideoId = uploaded_video_id.length
                  //   ? uploaded_video_id[0]
                  //   : null;
                  this.setState({uploadedVideoId: res.data.data.list[0]});
                }
              } else {
                failedUpload.push(i);
              }
            } else if (i === videosFile.length - 1) {
              const {loaded} = this.state;
              if (loaded == 100) {
                Toast.success(res.data.message);
                setTimeout(() => {
                  this.setState(() => ({
                    isOpenAlert: false,
                    loaded: 0,
                    isAttempToUpload: false,
                    isUploadProcessing: false,
                    videosFile: [],
                    videoLoad: [0, 0, 0, 0, 0],
                    isValidAttempToUpload: false,
                    uploadServerMsg: [],
                    isValidVideo: false,
                    isOpenVideoPlatformModal: false,
                    failedUpload: [],
                    cancelVideoList: [],
                    isVideoActive: 0
                  }));
                }, FILE_UPLOAD_FORM_AWAIT);
              }
            }
            this.setState({
              isAllValid: true,
              isLoading: false,
              isUploadProcessing: false,
              uploadServerMsg: uploadServerMsg,
              isOpenVideoPlatformModal,
              failedUpload
            });
            this.getVideoList(this.state.videoApiParam, false);
          })
          .catch((err) => {
            const apiError = getErrorMessage(err);

            if (axios.isCancel(err)) {
              const {uploadServerMsg} = this.state;
              if (uploadServerMsg[i]) {
                uploadServerMsg[i].status = false;
                uploadServerMsg[i].message = rawMaterialModtranslator(
                  'VIDEO_MANAGE.VIDEO_WAS_CANCELED'
                );
              } else {
                const msgItem = {
                  status: false,
                  message: rawMaterialModtranslator(
                    'VIDEO_MANAGE.VIDEO_WAS_CANCELED'
                  )
                };
                uploadServerMsg.push(msgItem);
              }
              this.setState({uploadServerMsg: uploadServerMsg});
              this.setState({
                isAllValid: false,
                isLoading: false,
                loaded: 0
              });
            } else {
              const {uploadServerMsg, failedUpload} = this.state;
              if (uploadServerMsg[i]) {
                uploadServerMsg[i].status = false;
                uploadServerMsg[i].message = apiError.message;
              } else {
                const msgItem = {status: false, message: apiError.message};
                uploadServerMsg.push(msgItem);
              }
              failedUpload.push(i);
              this.setState({
                isAllValid: false,
                isLoading: false,
                uploadServerMsg: uploadServerMsg,
                failedUpload
              });
            }
            if (i === videosFile.length - 1) {
              setTimeout(() => {
                this.setState(() => ({
                  isOpenAlert: false,
                  loaded: 0,
                  isAttempToUpload: false,
                  isUploadProcessing: false,
                  videosFile: [],
                  videoLoad: [0, 0, 0, 0, 0],
                  isValidAttempToUpload: false,
                  uploadServerMsg: [],
                  isValidVideo: false,
                  isOpenVideoPlatformModal: false,
                  failedUpload: [],
                  cancelVideoList: [],
                  isVideoActive: 0
                }));
              }, FILE_UPLOAD_FORM_AWAIT);
            }
          });
      }
    } else {
      const {videoErrorMsg} = this.state;
      this.setState({
        isAttempToUpload: true,
        videoErrorMsg: rawMaterialModtranslator('RAW_MATERIAL.SELECT_VIDEO_FILE'),
        isUploadProcessing: false,
        isOpenAlert: true
      });
    }
    e.preventDefault();
  }

  deleteSelectedVideo(index) {
    const {videosFile, videoLoad} = this.state;
    videosFile.splice(index, 1);
    videoLoad[index] = 0;
    this.setState({videosFile: videosFile, videoLoad: videoLoad});
  }

  toggleModal() {
    const cancelMessage = rawMaterialModtranslator(
      'RAW_MATERIAL.VIDEO_UPLOAD_CANCEL_MESSAGE'
    );
    const {loaded} = this.state;
    if (loaded > 0) {
      this.cancel(cancelMessage);
    }

    this.setState((prevState) => ({
      modalOpen: !prevState.modalOpen,
      isOpenAlert: false,
      loaded: 0,
      isAttempToUpload: false,
      isUploadProcessing: false,
      videosFile: [],
      videoLoad: [0, 0, 0, 0, 0],
      isValidAttempToUpload: false,
      uploadServerMsg: [],
      isValidVideo: false,
      isOpenVideoPlatformModal: false,
      failedUpload: [],
      cancelVideoList: [],
      isVideoActive: 0
    }));
  }

  iconGenerate(index) {
    const {
      isValidAttempToUpload,
      isValidVideo,
      uploadServerMsg,
      videoLoad,
      failedUpload,
      isVideoActive
    } = this.state;
    if (isValidAttempToUpload && isValidVideo) {
      if (videoLoad[index] == 100) {
        if (uploadServerMsg[index] && uploadServerMsg[index].status) {
          return <CheckmarkDoneCircle />;
        }
        if (failedUpload.includes(index)) {
          return (
            <div className={style.error}>
              <AlertShape />
            </div>
          );
        }
        return <CloseCircleSharp />;
      }
      const {cancelVideoList} = this.state;
      if (cancelVideoList.includes(index)) {
        return (
          <div className={style.error}>
            <AlertShape />
          </div>
        );
      }
      if (isVideoActive == index) {
        return <CloseCircleSharp onClick={() => this.cancelRequest(index)} />;
      }
    } else {
      return <TrashSharp onClick={() => this.deleteSelectedVideo(index)} />;
    }
  }

  yesBtnProcess(id, platform) {
    this.handleVideoItem(id, platform);
  }

  noBtnProcess() {
    this.toggleModal();
  }

  selectInput() {
    this.videoInput.click();
  }

  loadMore = () => {
    const {infiniteLoader, nextPage, apiFailed} = this.state;
    if (apiFailed) {
      return;
    }
    if (!infiniteLoader) {
      this.setState({
        infiniteLoader: true
      });
    }
    const param = {
      ...this.state.videoApiParam,
      page: nextPage,
      searchText: this.state.searchText || ''
    };

    AxiosService.get(ApiServices.GET_RAW_MATERIAL_VIDEO_LIST, param, false)
      .then((response) => {
        const data = response.data.data.list;
        this.setState({
          videoList: [...this.state.videoList, ...data.data],
          infiniteLoader: false,
          videoMessage: response.data.message,
          videoStatus: response.data.status,
          isDataProcessing: false,
          hasMore: data.current_page < data.last_page ? true : false,
          nextPage: data.next_page_url ? nextPage + 1 : nextPage,
          videoApiParam: param
        });
      })
      .catch((err) => {
        const apiError = getErrorMessage(err);
        this.setState({
          infiniteLoader: false,
          videoList: [],
          videoMessage: apiError.message,
          videoStatus: false,
          isDataProcessing: false,
          videoApiParam: param
        });
      });
  };

  render() {
    const {
      videoList,
      loaded,
      modalOpen,
      isAllValid,
      isOpenAlert,
      serverMessage,
      isValidName,
      isAttempToUpload,
      isValidVideo,
      videoErrorMsg,
      isLoader,
      isRawMaterialPage,
      videoStatus,
      videoMessage,
      isDataProcessing,
      isUploadProcessing,
      videosFile,
      videoLoad,
      isValidAttempToUpload,
      uploadServerMsg,
      isOpenVideoPlatformModal,
      failedUpload,
      cancelVideoList,
      isVideoActive,
      uploadedVideoId,
      hasMore,
      infiniteLoader
    } = this.state;
    // const dataList = _.chunk(videoList, 4);
    // const dataList = videoList;
    const {apiSuccess} = this.props;
    const breadcrumbs = [
      {
        title: rawMaterialModtranslator('RAW_MATERIAL.RAW_PAGE_LINK'),
        link: path.rawMaterials,
        active: true
      },
      {
        title: '',
        link: '',
        active: true
      }
    ];
    return (
      <DefaultLayout>
        <div className={style.container}>
          <Modal
            isOpen={modalOpen}
            toggle={this.toggleModal}
            modalClassName={style.videoUploadModal}
            contentClassName={style.videoUploadModalContent}
            backdropClassName={style.backDrop}
            centered
            backdrop="static"
          >
            {isOpenVideoPlatformModal ? (
              <>
                <ModalHeader
                  className={style.modalHeaderConfirm}
                  toggle={this.toggleModal}
                >
                  {rawMaterialModtranslator('RAW_MATERIAL.CONFIRM_MODAL_TITLE')}
                  <div
                    className={style.customClose}
                    tabIndex={0}
                    role="button"
                    onClick={() => {
                      this.toggleModal();
                    }}
                  >
                    <CloseCircleSharp />
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div className={style.confirmModalMessage}>
                    {rawMaterialModtranslator('RAW_MATERIAL.CONFIRM_MODAL_MSG1')}{' '}
                    <br />
                    {rawMaterialModtranslator('RAW_MATERIAL.CONFIRM_MODAL_MSG2')}
                  </div>
                  <div className={style.modalFooterConfirm}>
                    <Button
                      className={style.commonButton}
                      color="primary"
                      onClick={() => this.yesBtnProcess(uploadedVideoId, NEWSCLOUD)}
                    >
                      {rawMaterialModtranslator('RAW_MATERIAL.YES_BTN')}
                    </Button>{' '}
                    <Button
                      className={style.commonButton}
                      color="secondary"
                      onClick={() => this.noBtnProcess()}
                    >
                      {rawMaterialModtranslator('RAW_MATERIAL.NO_BTN')}
                    </Button>
                  </div>
                </ModalBody>
              </>
            ) : (
              <>
                <ModalHeader
                  className={style.modalHeader}
                  toggle={this.toggleModal}
                  contentClassName={style.uploadModal}
                >
                  {rawMaterialModtranslator('RAW_MATERIAL.UPLOAD_VIDEO_TITLE')}
                  <div
                    className={style.customClose}
                    tabIndex={0}
                    role="button"
                    onClick={() => {
                      this.toggleModal();
                    }}
                  >
                    <CloseCircleSharp />
                  </div>
                </ModalHeader>
                <ModalBody>
                  <form className={style.videoInputForm}>
                    <FormGroup className={style.formGroup}>
                      <Inputfield
                        inputRef={(ref) => {
                          this.videoInput = ref;
                        }}
                        textType="file"
                        inputName="videofile"
                        onchangeCallback={(e) => this.videoUpload(e)}
                        isMultiple
                        isHidden
                      />

                      {!isValidAttempToUpload && (
                        <div
                          className={`${style.selectFile}`}
                          onClick={() => this.selectInput()}
                        >
                          <CloudUploadOutline />
                          <div className={style.chooseText}>
                            {rawMaterialModtranslator('VIDEO_MANAGE.CHOOSE_FILE')}
                          </div>
                        </div>
                      )}

                      {isAttempToUpload && !isValidVideo && (
                        <div className={`${style.marginButton} text-msg`}>
                          {videoErrorMsg}
                        </div>
                      )}
                      {videosFile &&
                        videosFile.map((item, index) => (
                          <div
                            key={`progress${index}`}
                            className={style.videoProgressBar}
                          >
                            <div className={style.videoName}>{item.name}</div>
                            <Progress
                              className={style.progress}
                              max="100"
                              color={
                                failedUpload.includes(index) ? 'danger' : 'success'
                              }
                              value={videoLoad[index]}
                            >
                              {!failedUpload.includes(index) &&
                                `${Math.round(videoLoad[index], 2)}%`}
                            </Progress>
                            <div
                              className={style.uploadCancel}
                              tabIndex={0}
                              role="button"
                            >
                              {this.iconGenerate(index)}
                            </div>
                            {uploadServerMsg[index] &&
                              !uploadServerMsg[index].status &&
                              uploadServerMsg[index].message && (
                                <div className={style.uploadErrorMessage}>
                                  {uploadServerMsg[index].message}
                                </div>
                              )}
                          </div>
                        ))}
                    </FormGroup>
                  </form>
                </ModalBody>
                <ModalFooter className={style.modalFooter}>
                  <Commonbutton
                    className="primary"
                    onClick={(e) =>
                      !isValidAttempToUpload ? this.postVideo(e) : {}
                    }
                  >
                    {rawMaterialModtranslator('RAW_MATERIAL.VIDEO_UPLOAD_BUTTON')}
                  </Commonbutton>
                  <Commonbutton
                    className="danger"
                    onClick={() => {
                      this.toggleModal();
                    }}
                  >
                    {rawMaterialModtranslator('RAW_MATERIAL.CANCEL')}
                  </Commonbutton>
                </ModalFooter>
              </>
            )}
          </Modal>
          <FilterBar
            getVideoList={this.getVideoList}
            rawFilterData={this.props.rawFilterData}
            pageType={isRawMaterialPage ? rawMaterialPage : contentPage}
            isDataProcessing={isDataProcessing}
          />
          {isLoader ? (
            <Loader />
          ) : (
            <div className={style.RMcontainer}>
              <Toast />
              <div className={style.Breadcrumbs}>
                <NcBreadcrumbs breadcrumbs={breadcrumbs} />
              </div>
              <div className={style.RMTitle}>
                <span></span>
                <div className={style.uploadBtn}>
                  <Commonbutton className="primary" onClick={this.toggleModal}>
                    <CloudUploadSharp />
                    {rawMaterialModtranslator('RAW_MATERIAL.VIDEO_UPLOAD_BUTTON')}
                  </Commonbutton>
                </div>
              </div>

              {videoMessage && <h4> {videoMessage}</h4>}
              <div className={style.RMcontainerDataList}>
                <InifiniteScroll
                  initialLoad
                  key={generateKey()}
                  hasMore={hasMore}
                  loadMore={this.loadMore}
                  useWindow={false}
                  threshold={1}
                  loader={infiniteLoader ? <InfiniteLoader /> : ''}
                  className={style.RMcontainerDataListWrapper}
                >
                  {videoList.map((row, index) => {
                    return (
                      <div
                        className={style.box}
                        key={`vidoe-list${row.title}${index}`}
                        role="button"
                        tabIndex="0"
                        onClick={() => this.handleVideoItem(row.id, row.platform)}
                      >
                        <div className={style.boxImage}>
                          <img
                            src={
                              this.state.file_url && row.thumbnail
                                ? this.state.file_url + row.thumbnail
                                : images.demoImg
                            }
                            alt=""
                          />
                        </div>
                        <div className={style.boxBottomContent}>
                          <div className={style.mediaTitle}>
                            <span>{row.title}</span>
                          </div>
                        </div>
                        <div className={style.boxIconSection}>
                          <div className={style.boxIconMainLayer}>
                            {row.platform === YOUTUBE ? (
                              <div
                                className={`${style.boxIconColorLayer} ${style.youtubeIconBG}`}
                              >
                                <LogoYoutube className={style.icon} />
                              </div>
                            ) : row.platform === VIMEO ? (
                              <div
                                className={`${style.boxIconColorLayer} ${style.vimeoIconBg}`}
                              >
                                <LogoVimeo className={style.icon} />
                              </div>
                            ) : (
                              <div
                                className={`${style.boxIconColorLayer} ${style.folderOpenIconBg}`}
                              >
                                <FolderOpen className={style.icon} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </InifiniteScroll>
              </div>
            </div>
          )}
        </div>
      </DefaultLayout>
    );
  }
}

function mapStateToProps(state) {
  return {
    selectedVideoId: state.videoReducer.selectedVideoId,
    rawFilterData: state.videoReducer.rawFilterData,
    apiSuccess: state.videoReducer.apiSuccess,
    globalSearchText: state.commonReducer.rawMaterial
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fieldInitialization: (data) => dispatch(fieldInitialization(data)),
    getMaterialVideoItem: (data) => dispatch(getMaterialVideoItem(data))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(RawMaterial));
