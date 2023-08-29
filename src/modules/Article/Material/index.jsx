import React, {Component} from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
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
  LogoVimeo
} from '../mod-assets/svgComp';
import {rawMaterialModtranslator} from '../modLocalization';
import {
  KILO_BYTE,
  MAX_VIDEO_IN_GB,
  RAW_MATERIAL_SEPARETOR,
  rawMaterialPage,
  contentPage
} from '../../../app-constants/usersConstant';
import path from '../../../routes/path';
import Loader from '../../../common-components/Loader';

import {fieldInitialization} from '../../../redux/actions/video';

const {CancelToken} = axios;
class RawMaterial extends Component {
  constructor(props) {
    super(props);
    this.formData = new FormData();
    this.cancel = null;
    this.state = {
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
      isVideoChecked: false,
      isLoader: true
    };
    this.toggleModal = this.toggleModal.bind(this);
    this.getVideoList = this.getVideoList.bind(this);
    this.postVideo = this.postVideo.bind(this);
  }

  componentDidMount() {
    this.getVideoList('', false);
    const URL = window.location.href;
    const param = URL.split(RAW_MATERIAL_SEPARETOR);
    if (param.length > 1) {
      this.setState({isRawMaterialPage: true});
    }
  }

  getVideoList(param = '', isDataProcessing) {
    this.setState({isLoader: true, isDataProcessing: isDataProcessing});
    AxiosService.get(ApiServices.GET_RAW_MATERIAL_VIDEO_LIST, param, false)
      .then((response) => {
        this.setState({
          videoList: response.data.data,
          isLoader: false,
          videoMessage: response.data.message,
          videoStatus: response.data.status
        });
        this.setState({isDataProcessing: false});
      })
      .catch((err) => {
        this.setState({
          isLoader: false,
          videoList: [],
          videoMessage: err.response.data.message,
          videoStatus: err.response.data.status
        });
        if (err) {
          const apiError = getErrorMessage(err);
        }
        this.setState({isDataProcessing: false});
      });
  }

  onChangeVideoTitle = (e) => {
    // this.formData.append('name', this.videoTitleInput.value);
  };

  videoUpload = (e) => {
    const {files} = e.target;
    this.formData.append('video', files[0]);
    const file = files[0];
    const isVideo = this.isVideo(file.name);
    if (isVideo) {
      this.setState({isNotVideo: false});
      if (file.size / (KILO_BYTE * KILO_BYTE * KILO_BYTE) > MAX_VIDEO_IN_GB) {
        this.setState({
          isVideoError: true,
          videoErrorMsg: rawMaterialModtranslator('RAW_MATERIAL.VIDEO_SIZE_ERROR'),
          isValidVideo: false,
          isVideoChecked: true
        });
      } else {
        this.setState({
          isValidVideo: true,
          videoErrorMsg: '',
          isVideoError: false,
          isVideoChecked: true
        });
      }
    } else {
      this.setState({
        isVideoError: true,
        videoErrorMsg: rawMaterialModtranslator('RAW_MATERIAL.VIDEO_TYPE_ERROR'),
        isValidVideo: false,
        isVideoChecked: true
      });
    }
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

  cancelRequest = () => {
    const cancelMessage = rawMaterialModtranslator(
      'RAW_MATERIAL.VIDEO_UPLOAD_CANCEL_MESSAGE'
    );
    this.cancel(cancelMessage);
    this.setState({isUploadProcessing: false});
  };

  handleVideoItem = (id) => {
    this.props.fieldInitialization({selectedVideoId: id});
    this.props.history.push(path.videoManagement);
  };

  postVideo = (e) => {
    this.setState({isUploadProcessing: true});
    const videoTitle = this.videoTitleInput.value;
    const {isValidVideo} = this.state;
    const isVideoNameValid = videoTitle.length ? true : false;
    this.setState({isValidName: isVideoNameValid});
    if (isVideoNameValid && isValidVideo) {
      this.formData.set('name', videoTitle);
      this.setState({
        isLoading: true,
        loaded: 0,
        isAttempToUpload: true
      });
      const serverUrl = config.API_URL;
      const token = JSON.parse(localStorage.getItem('accessToken'));
      axios
        .post(serverUrl + ApiServices.POST_RAW_MATERIAL_VIDEO, this.formData, {
          onUploadProgress: (ProgressEvent) => {
            const totalLength = ProgressEvent.lengthComputable
              ? ProgressEvent.total
              : ProgressEvent.target.getResponseHeader('content-length') ||
                ProgressEvent.target.getResponseHeader(
                  'x-decompressed-content-length'
                );
            this.setState({
              // loaded: (ProgressEvent.loaded / ProgressEvent.total) * 100
              loaded: Math.round((ProgressEvent.loaded * 100) / totalLength)
            });
          },
          cancelToken: new CancelToken((c) => {
            this.cancel = c;
            // this.setState({isUploadProcessing : false});
          }),
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept-Language': config.DEFAULT_LANGUAGE,
            Authorization: `Bearer ${token}`
          }
        })
        .then((res) => {
          this.setState({
            serverMessage: res.data.message,
            isAllValid: true,
            isOpenAlert: true,
            isLoading: false,
            isUploadProcessing: false
          });
          this.getVideoList('', false);
        })
        .catch((err) => {
          const apiError = getErrorMessage(err);
          if (axios.isCancel(err)) {
            this.setState({
              serverMessage: rawMaterialModtranslator(
                'RAW_MATERIAL.VIDEO_UPLOAD_CANCEL_MESSAGE'
              ),
              isAllValid: false,
              isOpenAlert: true,
              isLoading: false,
              loaded: 0
            });
          } else {
            this.setState({
              serverMessage: apiError.message,
              isAllValid: false,
              isOpenAlert: true,
              isLoading: false
            });
          }
        });
    } else {
      let {videoErrorMsg, isVideoChecked} = this.state;
      videoErrorMsg = isVideoChecked
        ? videoErrorMsg
        : rawMaterialModtranslator('RAW_MATERIAL.SELECT_VIDEO_FILE');
      this.setState({
        isAttempToUpload: true,
        videoErrorMsg: videoErrorMsg,
        isUploadProcessing: false
      });
    }
    e.preventDefault();
  };

  toggleModal() {
    this.setState((prevState) => ({
      modalOpen: !prevState.modalOpen,
      isOpenAlert: false,
      loaded: 0,
      isAttempToUpload: false,
      isUploadProcessing: false
    }));
  }

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
      isUploadProcessing
    } = this.state;
    const dataList = _.chunk(videoList, 4);
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
          >
            <ModalHeader className={style.modalHeader} toggle={this.toggleModal}>
              {rawMaterialModtranslator('RAW_MATERIAL.UPLOAD_VIDEO_TITLE')}
              <div
                className={style.customClose}
                tabIndex={0}
                role="button"
                onClick={() => {
                  this.toggleModal();
                  this.cancelRequest();
                }}
              >
                <CloseCircleSharp />
              </div>
            </ModalHeader>
            <ModalBody>
              <Alert color={isAllValid ? 'success' : 'danger'} isOpen={isOpenAlert}>
                {serverMessage}
              </Alert>
              <Form className={style.videoInputForm}>
                <FormGroup className={style.formGroup}>
                  <Label for="video">
                    {rawMaterialModtranslator('RAW_MATERIAL.VIDEO')}
                  </Label>
                  <br />
                  <Inputfield
                    inputRef={(ref) => {
                      this.videoInput = ref;
                    }}
                    textType="file"
                    inputName="videofile"
                    onchangeCallback={(e) => this.videoUpload(e)}
                  />
                  <Progress
                    className={style.progress}
                    max="100"
                    color="success"
                    value={loaded}
                  >
                    {Math.round(loaded, 2)}%
                  </Progress>
                  <div
                    className={style.uploadCancel}
                    tabIndex={0}
                    role="button"
                    onClick={this.cancelRequest}
                  >
                    {isAttempToUpload && isValidVideo && <CloseCircleSharp />}
                  </div>
                </FormGroup>
                {isAttempToUpload && !isValidVideo && (
                  <div className={`${style.marginButton} text-msg`}>
                    {videoErrorMsg}
                  </div>
                )}
                <FormGroup className={style.formGroupName}>
                  <Label for="title">
                    {rawMaterialModtranslator('RAW_MATERIAL.VIDEO_NAME')}
                  </Label>
                  <br />
                  <Inputfield
                    inputRef={(ref) => {
                      this.videoTitleInput = ref;
                    }}
                    textType="text"
                    inputName="name"
                    onchangeCallback={(e) => this.onChangeVideoTitle(e)}
                  />
                </FormGroup>
                {isAttempToUpload && !isValidName && (
                  <div className={`${style.marginButton} text-msg`}>
                    {rawMaterialModtranslator('RAW_MATERIAL.NAME_ERROR')}
                  </div>
                )}
              </Form>
            </ModalBody>
            <ModalFooter className={style.modalFooter}>
              <Button
                className={style.commonButton}
                color="primary"
                onClick={(e) => (isUploadProcessing ? {} : this.postVideo(e))}
              >
                {rawMaterialModtranslator('RAW_MATERIAL.VIDEO_UPLOAD_BUTTON')}
              </Button>{' '}
              <Button
                className={style.commonButton}
                color="secondary"
                onClick={() => {
                  this.toggleModal();
                  this.cancelRequest();
                }}
              >
                >{rawMaterialModtranslator('RAW_MATERIAL.CANCEL')}
              </Button>
            </ModalFooter>
          </Modal>
          <FilterBar
            getVideoList={this.getVideoList}
            pageType={isRawMaterialPage ? rawMaterialPage : contentPage}
            isDataProcessing={isDataProcessing}
          />
          {isLoader ? (
            <Loader />
          ) : (
            <div className={style.RMcontainer}>
              <div className={style.RMTitle}>
                <span></span>
                <div className={style.uploadBtn}>
                  <Commonbutton className="primary" callback={this.toggleModal}>
                    <CloudUploadSharp />
                    {rawMaterialModtranslator('RAW_MATERIAL.VIDEO_UPLOAD_BUTTON')}
                  </Commonbutton>
                </div>
              </div>
              {videoMessage && <h4> {videoMessage}</h4>}
              {dataList &&
                dataList.map((value, i) => {
                  return (
                    <div className={style.row} key={`list-row${i}`}>
                      {value.map((row, index) => {
                        return (
                          <div
                            className={style.box}
                            key={row.title + index}
                            role="button"
                            tabIndex="0"
                            onClick={() => this.handleVideoItem(row.id)}
                          >
                            <div className={style.boxImage}>
                              <img
                                src={row.thumbnail ? row.thumbnail : images.demoImg}
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
                                {row.platform == 1 ? (
                                  <div
                                    className={`${style.boxIconColorLayer} ${style.youtubeIconBG}`}
                                  >
                                    <LogoYoutube className={style.icon} />
                                  </div>
                                ) : row.platform == 2 ? (
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
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </DefaultLayout>
    );
  }
}

function mapStateToProps(state) {
  return {
    selectedVideoId: state.videoReducer.selectedVideoId
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fieldInitialization: (data) => dispatch(fieldInitialization(data))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(RawMaterial));
