import React, {Component} from 'react';
import _ from 'lodash';
import Select from 'react-select';
import {Label} from 'reactstrap';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import moment from 'moment';
import style from '../videoManagement.module.scss';
import {translator} from '../../../../localizations';
import {rawMaterialModtranslator} from '../../modLocalization';
import Inputfield from '../../../../common-components/inputfield/Inputfield';
import Commonbutton from '../../../../common-components/button/Button';
import TimePicker from '../../../../common-components/timepicker/index';
import {
  ImageOutline,
  TrashSharp,
  CloudUploadOutline,
  CheckmarkDoneSharp,
  SyncSharp
} from '../../mod-assets/svgComp';
import DateInput from '../../components/dateInput';
import Switch from '../../components/switch';
import {
  INPUT_MAX_LENGTH_100,
  TEXT_MAX_LENGTH_500,
  TEXT_MAX_LENGTH_5000
} from '../../../../app-constants/characterLength';
import {
  formatScheduleDateWithLang,
  generateKey,
  getFieldStatus,
  getIsPublishedById,
  getIsUploadedById,
  getRequiredVal,
  isEmpty,
  isObjectEmpty,
  isValidTitle
} from '../../../../helper';
import {
  deleteVideoContent,
  fieldInitialization,
  saveVimeoVideo,
  showVimeoVideo
} from '../../../../redux/actions/video';
import {NEWSCLOUD, VIMEO, YOUTUBE} from '../../../../app-constants/rawContent';
import path from '../../../../routes/path';
import RequiredMessage from '../../../../common-components/RequiredMessage';
import ConfirmationModal from '../../../../common-components/confirmationModal';
import Toast from '../../../../common-components/Toast';
import ApiServices from '../../../../networks/ApiServices';
import AxiosService from '../../../../networks/AxiosService';

class VideoFormVimeo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      apiSuccessMsg: '',
      vimeoData: {
        media_id: '',
        title: '',
        description: '',
        embed_code: '',
        selectedView: '',
        selectedEmbed: '',
        selectedComment: '',
        is_uploaded: 0,
        is_published: 0,
        schedule_time: '',
        is_schedule_on: false
      },
      dataError: {},
      titleErrorMsg: '',
      descriptionErrorMsg: '',
      deleteWarning: false,
      saveWarning: false,
      isScheduleDisable: this.getScheduleStatus(props)
    };
    this.serverDataVimeo = {...this.props.videoReducer.vimeoDetail};
  }

  static getDerivedStateFromProps(props, state) {
    const data = {};
    if (props.vimeoDetail !== state.vimeoData) {
      data.vimeoData = props.vimeoDetail;
    }
    if (props.apiSuccess !== state.apiSuccessMsg) {
      data.apiSuccessMsg = props.apiSuccess;
    }
    return data;
  }

  componentDidMount() {
    this.fileSelector = this.buildFileSelector();
    // window.onbeforeunload = (e) => {
    //   // this message will not show up becuase browser policy
    //   // instead a default message will be shown
    //   let confirmationMessage =
    //     'It looks like you have been editing something.If you leave before saving, your changes will be lost.';
    //
    //   if (!_.isEqual(this.serverDataVimeo, this.state.vimeoData)) {
    //     (e || window.event).returnValue = confirmationMessage;
    //   }
    // };
  }

  componentWillUnmount() {
    if (!_.isEqual(this.serverDataVimeo, this.state.vimeoData)) {
      // window.confirm("sometext");
    }
  }

  getScheduleStatus = (props) => {
    let scheduleStatus = true;
    if (props.vimeoDetail && 'is_schedule_on' in props.vimeoDetail) {
      scheduleStatus = props.vimeoDetail.is_schedule_on === 1 ? false : true;
    }
    return scheduleStatus;
  };

  buildFileSelector = () => {
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    // fileSelector.setAttribute('accept', 'image/png,image/jpeg,image/gif');
    fileSelector.addEventListener('change', this.listImagesVimeo);
    return fileSelector;
  };

  listImagesVimeo = (event) => {
    Toast.clear();
    // const {vimeoData} = this.state;
     const {files} = event.target;
    const img = event.target.files[0];
    console.log('aaaaaa', img);
    const allowTypeImg = ['image/png', 'image/jpeg', 'image/gif'];

    if (typeof img === 'undefined') {
      return;
    }
    if (!allowTypeImg.includes(img.type)) {
      window.scrollTo(0, 0);
      Toast.error(rawMaterialModtranslator('VIDEO_MANAGE.IMAGE_TYPE_ERROR_VIMEO'));
    } else {
      this.dimensionValidation(img, files);
    }
    // if (!this.dimensionValidation(img)) {
    //   console.log();
    //   this.setState({
    //     file: URL.createObjectURL(img)
    //   });
    //   this.props.fieldInitialization({
    //     vimeoThumb: URL.createObjectURL(img)
    //   });
    //   vimeoData.thumbnail = files;
    //   this.setState({vimeoData});
    // }
  };

  dimensionValidation = (image, files) => {
    const img = new Image();
    const {vimeoData} = this.state;
    //const {files} = event.target;
    img.src = window.URL.createObjectURL(image);
    img.onload = () => {
      if (img.width > 9600 || img.height > 5400) {
        window.scrollTo(0, 0);
        Toast.error(
          rawMaterialModtranslator('VIDEO_MANAGE.IMAGE_SIZE_ERROR_DIMENSION')
        );
      } else {
        this.setState({
          file: URL.createObjectURL(image)
        });
        this.props.fieldInitialization({
          vimeoThumb: URL.createObjectURL(image)
        });
        vimeoData.thumbnail = files;
        this.setState({vimeoData});
      }
    };
  };

  getFormData = (object) => {
    const formData = new FormData();
    Object.keys(object).forEach((key) => formData.append(key, object[key]));
    return formData;
  };

  handleFileSelect = (e) => {
    e.preventDefault();
    this.fileSelector.click();
  };

  onChangeValue = (event, field = null) => {
    const {vimeoData} = this.state;
    if (!!field) {
      vimeoData[field] = event;
      if (field === 'selectedView') {
        this.setState({
          isScheduleDisable: !(event.value === 'disable' || event.value === 'nobody')
        });
        vimeoData.is_schedule_on = !(
          event.value !== 'disable' || event.value !== 'nobody'
        );
        this.setState({vimeoData});
      }
    } else if (field === 'is_schedule_on') {
      vimeoData[field] = event.target.checked;
    } else {
      const key = event.target.name;
      const {value} = event.target;
      vimeoData[key] = value;
      this.onChangeValidationCheck(key);
    }
  };

  onChangeValidationCheck = (fieldName) => {
    const {dataError} = this.state;
    const {vimeoData} = this.state;
    dataError[fieldName] = vimeoData[fieldName] ? false : true;
    this.setState({dataError}, () => {
      if (fieldName === 'title' && !dataError.title) {
        this.setState({
          titleErrorMsg: ''
        });
      }
      if (fieldName === 'description' && !dataError.description) {
        this.setState({
          descriptionErrorMsg: ''
        });
      }
    });
  };

  onBlurValidationCheck = (fieldName) => {
    const {dataError} = this.state;
    const {vimeoData} = this.state;
    if (fieldName === 'title' && !!vimeoData[fieldName]) {
      if (isValidTitle(vimeoData[fieldName])) {
        dataError[fieldName] = true;
        this.setState({
          titleErrorMsg: rawMaterialModtranslator('VIDEO_MANAGE.TEXT_INVALID')
        });
      }
      this.callUniqueApi(vimeoData[fieldName], 'title');
      // if (!!vimeoData && vimeoData.media_id) {
      //   if (
      //     this.serverDataVimeo.title.toLowerCase() !== vimeoData.title.toLowerCase()
      //   ) {
      //     this.callUniqueApi(vimeoData[fieldName], 'title');
      //   }
      // } else {
      //   this.callUniqueApi(vimeoData[fieldName], 'title');
      // }
    } else if (fieldName === 'description' && !!vimeoData[fieldName]) {
      if (isValidTitle(vimeoData[fieldName])) {
        dataError[fieldName] = true;
        this.setState({
          descriptionErrorMsg: rawMaterialModtranslator(
            'VIDEO_MANAGE.TEXT_INVALID_DESCRIPTION'
          )
        });
      }
    } else {
      this.setState({
        titleErrorMsg: '',
        descriptionErrorMsg: ''
      });
      dataError[fieldName] = false;
    }
    this.setState({dataError});
  };

  handleDate = (date, type) => {
    const {vimeoData} = this.state;
    vimeoData[type] = date;
    // vimeoData[type] = moment(date).format('YYYY-MM-DD HH:mm');
    this.setState({vimeoData});
  };

  handleDeleteVideo = async () => {
    this.setState(
      () => ({
        deleteWarning: false
      }),
      async () => {
        const {vimeoDetail, selectedVideo, selectedPlatform} = this.props;
        if (selectedPlatform === NEWSCLOUD) {
          this.props.fieldInitialization({isAPICall: true});
          await this.props.deleteVideoContent({
            itemID: selectedVideo.id,
            type: NEWSCLOUD
          });
        } else {
          await this.props.deleteVideoContent({
            itemID: vimeoDetail.media_id,
            type: VIMEO
          });
        }
      }
    );
  };

  handleAcquireVimeo = () => {
    const {vimeoData} = this.state;
    if (!!vimeoData && vimeoData.media_id) {
      this.props.showVimeoVideo(vimeoData.media_id);
    }
  };

  validationCheck = (param) => {
    let hasError = false;
    const {dataError} = this.state;
    if (
      typeof param.title === 'undefined' ||
      ('title' in param && param.title.trim().length === 0) ||
      !param.description
    ) {
      if (
        typeof param.title === 'undefined' ||
        ('title' in param && param.title.trim().length === 0)
      ) {
        dataError.title = true;
        this.setState({dataError, titleErrorMsg: translator('REQUIRED.MESSAGE')});
      }
      if (!param.description) {
        dataError.description = true;
        this.setState({
          dataError,
          descriptionErrorMsg: translator('REQUIRED.MESSAGE')
        });
      }
      hasError = true;
    }
    if (
      Object.keys(dataError)
        .map((key) => dataError[key])
        .includes(true)
    ) {
      hasError = true;
    } else {
      this.setState({dataError: {}});
    }
    return hasError;
  };

  handleVimeoSave = () => {
    this.setState(
      () => ({
        saveWarning: false
      }),
      () => {
        const {vimeoData, file} = this.state;
        const {viewCoverage, commentPermission, embedCoverage} = this.props;
        let param = {
          videoId: this.props.selectedVideoId,
          title: vimeoData.title,
          description: vimeoData.description,
          privacyView: getRequiredVal(viewCoverage, vimeoData.selectedView),
          privacyComments: getRequiredVal(
            commentPermission,
            vimeoData.selectedComment
          ),
          privacyEmbed: getRequiredVal(embedCoverage, vimeoData.selectedEmbed),
          scheduleTime: vimeoData.schedule_time
            ? moment(vimeoData.schedule_time).format('YYYY-MM-DD HH:mm')
            : '',
          isScheduleOn: vimeoData.is_schedule_on ? 1 : 0
        };
        if (!!file) {
          param = {...param, thumbnail: vimeoData.thumbnail[0]};
        } else {
          let thumb = '';
          if (!!vimeoData.thumbnail && vimeoData.media_id) {
            const imgArr = vimeoData.thumbnail.split('/');
            if (imgArr.indexOf('i.vimeocdn.com') !== -1) {
              thumb = vimeoData.thumbnail;
            }
            param = {...param, thumbnail: thumb};
          }
        }
        const data = this.getFormData(param);

        if (!this.validationCheck(param)) {
          this.props.saveVimeoVideo({
            id: vimeoData && vimeoData.media_id ? vimeoData.media_id : '',
            param: data
          });
        }
      }
    );
  };

  cancelClick = (WarningType) => {
    this.setState(() => ({
      [WarningType]: false
    }));
  };

  handleWarningVimeo = (WarningType) => {
    if (WarningType === 'saveWarning') {
      if (!this.validationCheck(this.state.vimeoData)) {
        this.setState({[WarningType]: true});
      }
    } else {
      this.setState({[WarningType]: true});
    }
  };

  callUniqueApi = (value, type) => {
    const {dataError} = this.state;
    if (dataError.title) return;
    if (value.trim().length > 0) {
      const url = ApiServices.VIMEO_TITLE_UNIQUE;
      AxiosService.post(url, {title: value, videoId: this.props.selectedVideoId}, false)
        .then((response) => {})
        .catch((err) => {
          if (err) {
            // const {dataError} = this.state;
            if (err.response && err.response.data && !err.response.data.status) {
              dataError[type] = true;
              this.setState({dataError, titleErrorMsg: err.response.data.message});
            }
          }
        });
    }
  };

  render() {
    console.log('render', _.isEqual(this.serverDataVimeo, this.state.vimeoData));
    let videoThumb = '';
    const {file, vimeoData, dataError} = this.state;
    const {
      videoItem,
      viewCoverage,
      commentPermission,
      embedCoverage,
      selectedPlatform,
      vimeoThumb,
      videoAuth
    } = this.props;
    if (!!this.state.apiSuccessMsg) {
      this.props.history.push(path.rawMaterials);
    }
    if (!!vimeoData && vimeoData.media_id) {
      videoThumb = vimeoData.thumbnail;
    } else {
      videoThumb = videoItem.thumbnail;
    }
    return (
      <>
        <ConfirmationModal
          index={generateKey()}
          isActive={this.state.deleteWarning}
          title={rawMaterialModtranslator('VIDEO_MANAGE.DELETE_TITLE')}
          body={rawMaterialModtranslator(
            selectedPlatform === NEWSCLOUD
              ? 'VIDEO_MANAGE.DELETE_TEXT_NEWSCLOUD'
              : 'VIDEO_MANAGE.DELETE_TEXT_VIMEO'
          )}
          cancelClick={() => this.cancelClick('deleteWarning')}
          okClick={() => this.handleDeleteVideo()}
        />
        <ConfirmationModal
          key={generateKey()}
          isActive={this.state.saveWarning}
          title={rawMaterialModtranslator(
            !!vimeoData && vimeoData.media_id
              ? 'VIDEO_MANAGE.UPDATE_TITLE'
              : 'VIDEO_MANAGE.UPLOAD_TITLE'
          )}
          body={rawMaterialModtranslator(
            !!vimeoData && vimeoData.media_id
              ? 'VIDEO_MANAGE.VIMEO_UPDATE_TEXT'
              : 'VIDEO_MANAGE.VIMEO_UPLOAD_TEXT'
          )}
          cancelClick={() => this.cancelClick('saveWarning')}
          okClick={() => this.handleVimeoSave()}
        />
        <div className={style.dataContainer}>
          <div className={style.videoFormContent}>
            <div className={style.colOne}>
              <Label className={style.inputLabel}>
                {rawMaterialModtranslator('VIDEO_MANAGE.TITLE')}
                <span className="text-danger">*</span>
              </Label>
              <div className={style.commonInput}>
                <Inputfield
                  textType="text"
                  placeHolder={rawMaterialModtranslator(
                    'VIDEO_MANAGE.PLACEHOLDER_VIMEO_TITLE'
                  )}
                  inputName="title"
                  maxLength={INPUT_MAX_LENGTH_100}
                  onchangeCallback={(e) => this.onChangeValue(e)}
                  blurCallback={(e) => this.onBlurValidationCheck('title')}
                  isError={!isEmpty(dataError) && dataError.title && 'inputError'}
                  defaultValue={vimeoData.title}
                  isDisabled={getFieldStatus(videoItem.is_uploaded_vimeo)}
                />
                {!isEmpty(dataError) && dataError.title && (
                  <RequiredMessage text={this.state.titleErrorMsg} />
                )}
              </div>
              <Label className={style.inputLabel}>
                {rawMaterialModtranslator('VIDEO_MANAGE.EXPLANATION')}
                <span className="text-danger">*</span>
              </Label>
              <div className={style.commonTextArea}>
                <textarea
                  className={`${style.textArea} ${!isEmpty(dataError) &&
                    dataError.description &&
                    style.error}`}
                  name="description"
                  maxLength={TEXT_MAX_LENGTH_5000}
                  placeholder={rawMaterialModtranslator(
                    'VIDEO_MANAGE.PLACEHOLDER_VIMEO_EXPLANATION'
                  )}
                  onChange={(e) => this.onChangeValue(e)}
                  onBlur={(e) => this.onBlurValidationCheck('description')}
                  defaultValue={vimeoData.description}
                  disabled={getFieldStatus(videoItem.is_uploaded_vimeo)}
                />
                {!isEmpty(dataError) && dataError.description && (
                  <RequiredMessage text={this.state.descriptionErrorMsg} />
                )}
              </div>

              <div className={style.privacySettings}>
                {rawMaterialModtranslator('VIDEO_MANAGE.PRIVACY_SETTINGS')}
              </div>
              <Label className={style.inputLabel}>
                {rawMaterialModtranslator('VIDEO_MANAGE.VIEWING_RANGE')}
                {/* <span className="text-danger">*</span> */}
              </Label>
              <div className={style.selectBoxCat}>
                <Select
                  key={generateKey}
                  className={style.reactSelectContainer}
                  options={viewCoverage}
                  name="selectedView"
                  isDisabled={getFieldStatus(videoItem.is_uploaded_vimeo)}
                  onChange={(e) => this.onChangeValue(e, 'selectedView')}
                  defaultValue={
                    !!vimeoData && vimeoData.selectedView
                      ? vimeoData.selectedView
                      : !isObjectEmpty(viewCoverage)
                      ? viewCoverage[0]
                      : {}
                  }
                />
              </div>
              <Label className={style.inputLabel}>
                {rawMaterialModtranslator('VIDEO_MANAGE.ALLOW_COMMENT')}
                {/* <span className="text-danger">*</span> */}
              </Label>
              <div className={style.selectBoxCat}>
                <Select
                  key={generateKey}
                  className={style.reactSelectContainer}
                  options={commentPermission}
                  name="selectedComment"
                  isDisabled={getFieldStatus(videoItem.is_uploaded_vimeo)}
                  onChange={(e) => this.onChangeValue(e, 'selectedComment')}
                  defaultValue={
                    !!vimeoData && vimeoData.selectedComment
                      ? vimeoData.selectedComment
                      : !isObjectEmpty(commentPermission)
                      ? commentPermission[0]
                      : {}
                  }
                />
              </div>
              <Label className={style.inputLabel}>
                {rawMaterialModtranslator('VIDEO_MANAGE.EMBED_CODE')}
                {/* <span className="text-danger">*</span> */}
              </Label>
              <div className={style.selectBoxCat}>
                <Select
                  key={generateKey}
                  className={style.reactSelectContainer}
                  options={embedCoverage}
                  name="selectedEmbed"
                  isDisabled={getFieldStatus(videoItem.is_uploaded_vimeo)}
                  onChange={(e) => this.onChangeValue(e, 'selectedEmbed')}
                  defaultValue={
                    !!vimeoData && vimeoData.selectedEmbed
                      ? vimeoData.selectedEmbed
                      : !isObjectEmpty(embedCoverage)
                      ? embedCoverage[0]
                      : {}
                  }
                />
              </div>
            </div>
            <div className={style.colTwo}>
              <div className={style.commonSection}>
                <div className={style.commonSectionHeader}>
                  <span>{rawMaterialModtranslator('VIDEO_MANAGE.STATUS')}</span>
                </div>
                <div className={style.commonSectionBody}>
                  <div
                    className={style.commonSectionBodyUpper}
                    style={{border: 'none'}}
                  >
                    <div className={style.item}>
                      動画ステータス：
                      <span>
                        {getIsUploadedById(
                          !!vimeoData.is_uploaded
                            ? vimeoData.is_uploaded
                            : videoItem.is_uploaded
                        )}
                      </span>
                    </div>
                    <div className={style.item}>
                      公開ステータス：
                      <span>
                        {getIsPublishedById(
                          !!vimeoData.is_published
                            ? vimeoData.is_published
                            : videoItem.is_published
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${style.commonSection} ${style.customMargin}`}>
                <div className={style.commonSectionHeader}>
                  <span>{rawMaterialModtranslator('VIDEO_MANAGE.COMING_SOON')}</span>
                </div>
                <div className={style.commonSectionBody}>
                  <div className={style.commonSectionBodyUpper}>
                    <div className={style.dateSection}>
                      <div className={style.dateItemTitle}>
                        <span className={style.dateItem}>
                          {rawMaterialModtranslator('VIDEO_MANAGE.START')}
                        </span>
                      </div>
                      <div className={style.dateTime}>
                        <DateInput
                          className={style.dateInput}
                          type="schedule_time"
                          disabled={
                            getFieldStatus(videoItem.is_uploaded_vimeo) ||
                            this.state.isScheduleDisable
                          }
                          handleDate={this.handleDate}
                          value={vimeoData.schedule_time}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          timeCaption="time"
                          minDate={new Date()}
                          dateFormat="yyyy.MM.dd HH:mm"
                        />
                      </div>
                    </div>
                  </div>
                  <div className={style.commonSectionBodyLower}>
                    <div>
                      <span>
                        {rawMaterialModtranslator('VIDEO_MANAGE.CONFIGURATION')}
                      </span>
                    </div>
                    <div className={style.toggleBtn}>
                      <Switch
                        key={generateKey()}
                        name="is_schedule_on"
                        handleChange={(e) => this.onChangeValue(e, 'is_schedule_on')}
                        disabled={{
                          disabled:
                            getFieldStatus(videoItem.is_uploaded_vimeo) ||
                            this.state.isScheduleDisable ||
                            !vimeoData.schedule_time
                        }}
                        styleName="configuration"
                        defaultValue={vimeoData.is_schedule_on}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${style.commonSection} ${style.customMargin}`}>
                <div className={style.commonSectionHeader}>
                  <span>{rawMaterialModtranslator('VIDEO_MANAGE.EMBED_CODE')}</span>
                </div>
                <div className={style.commonSectionBody}>
                  <textarea
                    name="embed_code"
                    readOnly
                    onChange={(e) => this.onChangeValue(e)}
                    value={vimeoData.embed_code}
                    placeholder={rawMaterialModtranslator(
                      'VIDEO_MANAGE.PLACEHOLDER_VIMEO_EMBEDED_CODE'
                    )}
                  />
                </div>
              </div>
            </div>
            <div className={style.colThree}>
              <div className={style.commonSection}>
                <div className={style.commonSectionHeader}>
                  <span>{rawMaterialModtranslator('VIDEO_MANAGE.THUMBNAIL')}</span>
                </div>
                <div className={style.commonSectionBody}>
                  <div className={style.imageContent}>
                    {!!vimeoThumb ? (
                      <img src={vimeoThumb} aria-hidden alt="image" />
                    ) : !!videoThumb ? (
                      <img src={videoThumb} aria-hidden alt="image" />
                    ) : (
                      <span>
                        {rawMaterialModtranslator('VIDEO_MANAGE.NO_IMAGE')}
                      </span>
                    )}
                  </div>
                  <div className={style.commonButton}>
                    <Commonbutton
                      className="primary"
                      disabled={getFieldStatus(videoItem.is_uploaded_vimeo)}
                      onClick={(e) => this.handleFileSelect(e)}
                    >
                      <ImageOutline className={style.icon} />
                      {rawMaterialModtranslator('VIDEO_MANAGE.LOAD')}
                    </Commonbutton>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {!isEmpty(videoItem) && (
            <div className={style.videoBtnContent}>
              <div className={style.commonButton}>
                <Commonbutton
                  className="primary"
                  disabled={
                    videoItem.is_uploaded_vimeo === 1 ||
                    (videoAuth && videoAuth.vimeo_unauthenticated)
                      ? true
                      : false
                  }
                  onClick={() => this.handleWarningVimeo('saveWarning')}
                >
                  {!!vimeoData &&
                  vimeoData.media_id &&
                  !('is_uploaded_vimeo' in videoItem) ? (
                    <SyncSharp className={style.icon} />
                  ) : (
                    <CloudUploadOutline className={style.icon} />
                  )}
                  {!!vimeoData &&
                  vimeoData.media_id &&
                  !('is_uploaded_vimeo' in videoItem)
                    ? rawMaterialModtranslator('VIDEO_MANAGE.UPDATE')
                    : translator('HEADER.CLOUD_BUTTON')}
                </Commonbutton>
              </div>
              {!!vimeoData &&
                vimeoData.media_id &&
                !('is_uploaded_vimeo' in videoItem) && (
                  <div className={`${style.commonButton} ${style.customMarginLeft}`}>
                    <Commonbutton
                      className="primary"
                      onClick={() => this.handleAcquireVimeo()}
                      disabled={
                        videoAuth && videoAuth.vimeo_unauthenticated ? true : false
                      }
                    >
                      <CheckmarkDoneSharp className={style.icon} />
                      {rawMaterialModtranslator('VIDEO_MANAGE.PROFITABLE')}
                    </Commonbutton>
                  </div>
                )}
              <div className={`${style.commonButton} ${style.customMarginLeft}`}>
                <Commonbutton
                  className="danger"
                  disabled={
                    videoItem.is_uploaded_vimeo === 1 ||
                    (videoAuth &&
                      videoAuth.vimeo_unauthenticated &&
                      selectedPlatform !== NEWSCLOUD)
                      ? true
                      : false
                  }
                  onClick={() => this.handleWarningVimeo('deleteWarning')}
                >
                  <TrashSharp fill="white" className={style.icon} />
                  {rawMaterialModtranslator('VIDEO_MANAGE.DELETE')}
                </Commonbutton>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    videoReducer: state.videoReducer,
    selectedVideo: state.videoReducer.selectedVideo,
    selectedVideoId: state.videoReducer.selectedVideoId,
    selectedPlatform: state.videoReducer.selectedPlatform,
    vimeoDetail: state.videoReducer.vimeoDetail,
    viewCoverage: state.videoReducer.viewCoverage,
    commentPermission: state.videoReducer.commentPermission,
    embedCoverage: state.videoReducer.embedCoverage,
    apiSuccess: state.videoReducer.apiSuccess,
    vimeoThumb: state.videoReducer.vimeoThumb,
    videoAuth: state.videoReducer.videoAuth
  };
}

function mapDispatchToProps(dispatch) {
  return {
    deleteVideoContent: (data) => dispatch(deleteVideoContent(data)),
    saveVimeoVideo: (data) => dispatch(saveVimeoVideo(data)),
    showVimeoVideo: (data) => dispatch(showVimeoVideo(data)),
    fieldInitialization: (data) => dispatch(fieldInitialization(data))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(VideoFormVimeo));
