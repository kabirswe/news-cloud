import React, {Component} from 'react';
import _ from 'lodash';
import Select from 'react-select';
import {Label} from 'reactstrap';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css'; // If using WebPack and style-loader.
import moment from 'moment';
import style from '../videoManagement.module.scss';
import {translator} from '../../../../localizations';
import {rawMaterialModtranslator} from '../../modLocalization';
import Inputfield from '../../../../common-components/inputfield/Inputfield';
import Commonbutton from '../../../../common-components/button/Button';
import TimePicker from '../../../../common-components/timepicker/index';
import {
  ImageOutline,
  SyncSharp,
  CheckmarkDoneSharp,
  TrashSharp,
  CloudUploadOutline
} from '../../mod-assets/svgComp';
import DateInput from '../../components/dateInput';
import Switch from '../../components/switch';
import {
  INPUT_MAX_LENGTH_100,
  TEXT_MAX_LENGTH_500,
  TEXT_MAX_LENGTH_5000,
  INPUT_TAG_CUT_CEIL
} from '../../../../app-constants/characterLength';
import {
  formatScheduleDateWithLang,
  generateKey,
  getFieldStatus,
  getIsPublishedById,
  getIsUploadedById,
  isEmpty,
  isObjectEmpty,
  isValidTitle,
  trim
} from '../../../../helper';
import {
  deleteVideoContent,
  fieldInitialization,
  saveVideoYoutube,
  showVideoYoutube
} from '../../../../redux/actions/video';
import RequiredMessage from '../../../../common-components/RequiredMessage';
import path from '../../../../routes/path';
import {NEWSCLOUD, YOUTUBE} from '../../../../app-constants/rawContent';
import ConfirmationModal from '../../../../common-components/confirmationModal';
import Toast from '../../../../common-components/Toast';
import ApiServices from '../../../../networks/ApiServices';
import AxiosService from '../../../../networks/AxiosService';

class VideoForm extends Component {
  constructor(props) {
    super(props);
    this.getScheduleStatus(props);
    this.state = {
      file: null,
      youtubeData: {
        media_id: '',
        title: '',
        description: '',
        tags: '',
        status: false,
        category: props.categories[0] || {},
        channel: props.channels[0] || {},
        is_published: 0,
        is_uploaded: 0,
        embed_code: '',
        thumbnail: '',
        schedule_time: '',
        is_schedule_on: false
      },
      dataError: {},
      titleErrorMsg: '',
      descriptionErrorMsg: '',
      apiSuccessMsg: '',
      categories: [],
      channels: [],
      deleteWarning: false,
      saveWarning: false,
      tags: [],
      isScheduleDisable: this.getScheduleStatus(props),
      inputTags: ''
    };
    this.serverDataYoutube = {...this.props.videoReducer.youtubeDetail};
  }

  componentDidMount() {
    this.fileSelector = this.buildFileSelector();
  }

  static getDerivedStateFromProps(props, state) {
    const data = {};
    if (props.youtubeDetail !== state.youtubeData) {
      data.youtubeData = props.youtubeDetail;
    }
    if (props.apiSuccess !== state.apiSuccessMsg) {
      data.apiSuccessMsg = props.apiSuccess;
    }
    if (props.categories !== state.categories) {
      data.categories = props.categories;
    }
    if (props.channels !== state.channels) {
      data.channels = props.channels;
    }
    return data;
  }

  getScheduleStatus = (props) => {
    let scheduleStatus = false;
    if (props.youtubeDetail && 'is_schedule_on' in props.youtubeDetail) {
      scheduleStatus =
        props.youtubeDetail.is_schedule_on === 1
          ? false
          : props.youtubeDetail.status;
    }
    return scheduleStatus;
  };

  buildFileSelector = () => {
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    // fileSelector.setAttribute('accept', 'image/png,image/jpeg');
    fileSelector.addEventListener('change', this.listImages);
    return fileSelector;
  };

  listImages = (event) => {
    Toast.clear();
    const {youtubeData} = this.state;
    const {files} = event.target;
    const img = event.target.files[0];
    if (files && img) {
      const allowType = ['image/png', 'image/jpeg'];
      const maxFileSize = 2 * 1024 * 1024; // max allow 2MB
      if (img.size >= maxFileSize) {
        window.scrollTo(0, 0);
        Toast.error(rawMaterialModtranslator('VIDEO_MANAGE.IMAGE_SIZE_ERROR'));
      } else if (!allowType.includes(img.type)) {
        window.scrollTo(0, 0);
        Toast.error(
          rawMaterialModtranslator('VIDEO_MANAGE.IMAGE_TYPE_ERROR_YOUTUBE')
        );
      } else {
        this.setState({
          file: URL.createObjectURL(img)
        });
        this.props.fieldInitialization({
          youtubeThumb: URL.createObjectURL(img)
        });
        youtubeData.thumbnail = files;
        this.setState({youtubeData});
      }
    }
  };

  handleFileSelect = (e) => {
    e.preventDefault();
    this.fileSelector.click();
  };

  onChangeValue = (event, field = null) => {
    const {youtubeData} = this.state;
    if (!!field) {
      if (field === 'status' || field === 'is_schedule_on') {
        youtubeData[field] = event.target.checked;
        if (field === 'status') {
          if (event.target.checked) {
            youtubeData.is_schedule_on = false;
            this.setState({youtubeData});
          }
          this.setState({isScheduleDisable: event.target.checked});
        }
      } else {
        youtubeData[field] = event;
        this.onChangeValidationCheck(field);
      }
    } else {
      const key = event.target.name;
      const {value} = event.target;
      youtubeData[key] = value;
      this.onChangeValidationCheck(key);
    }
  };

  onChangeValidationCheck = (fieldName) => {
    const {dataError} = this.state;
    const {youtubeData} = this.state;
    dataError[fieldName] = youtubeData[fieldName] ? false : true;
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
    const {youtubeData} = this.state;
    if (fieldName === 'title' && !!youtubeData[fieldName]) {
      if (isValidTitle(youtubeData[fieldName])) {
        dataError[fieldName] = true;
        this.setState({
          titleErrorMsg: rawMaterialModtranslator('VIDEO_MANAGE.TEXT_INVALID')
        });
      }
      this.callUniqueApi(youtubeData[fieldName], 'title');
      // if (!!youtubeData && youtubeData.media_id) {
      //   if (
      //     this.serverDataYoutube.title.toLowerCase() !==
      //     youtubeData.title.toLowerCase()
      //   ) {
      //     this.callUniqueApi(youtubeData[fieldName], 'title');
      //   }
      // } else {
      //   this.callUniqueApi(youtubeData[fieldName], 'title');
      // }
    } else if (fieldName === 'description' && !!youtubeData[fieldName]) {
      if (isValidTitle(youtubeData[fieldName])) {
        dataError[fieldName] = true;
        this.setState({
          descriptionErrorMsg: rawMaterialModtranslator(
            'VIDEO_MANAGE.TEXT_INVALID_DESCRIPTION'
          )
        });
      }
    } else {
      dataError[fieldName] = false;
      this.setState({
        titleErrorMsg: '',
        descriptionErrorMsg: ''
      });
    }
    this.setState({dataError});
  };

  validationCheck = (param) => {
    let hasError = false;
    const {dataError} = this.state;
    const {channels, categories} = this.props;
    if (
      typeof param.title === 'undefined' ||
      ('title' in param && param.title.trim().length === 0) ||
      !param.description ||
      isObjectEmpty(channels) ||
      isObjectEmpty(categories)
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
      if (isObjectEmpty(channels)) {
        dataError.channel = true;
        this.setState({dataError});
      }
      if (isObjectEmpty(categories)) {
        dataError.category = true;
        this.setState({dataError});
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

  handleDate = (date, type) => {
    const {youtubeData} = this.state;
    youtubeData[type] = date;
    // youtubeData[type] = moment(date).format('YYYY-MM-DD HH:mm');
    this.setState({youtubeData});
    // console.log(moment(date).format('YYYY-MM-DD HH:mm'));
  };

  handleAcquire = () => {
    const {youtubeData} = this.state;
    if (!!youtubeData && youtubeData.media_id) {
      this.props.showVideoYoutube(youtubeData.media_id);
    }
  };

  handleDeleteVideo = async () => {
    this.setState(
      () => ({
        deleteWarning: false
      }),
      async () => {
        const {youtubeDetail, selectedVideo, selectedPlatform} = this.props;
        if (selectedPlatform === NEWSCLOUD) {
          this.props.fieldInitialization({isAPICall: true});
          await this.props.deleteVideoContent({
            itemID: selectedVideo.id,
            type: NEWSCLOUD
          });
        } else {
          await this.props.deleteVideoContent({
            itemID: youtubeDetail.media_id,
            type: YOUTUBE
          });
        }
      }
    );
  };

  getFormData = (object) => {
    const formData = new FormData();
    Object.keys(object).forEach((key) => formData.append(key, object[key]));
    return formData;
  };

  handleVideoSave = () => {
    this.setState(
      () => ({
        saveWarning: false
      }),
      () => {
        const {youtubeData, file} = this.state;
        const {categories, channels} = this.props;
        const cat = !!youtubeData.category
          ? {id: youtubeData.category.id, name: youtubeData.category.value}
          : !!categories
          ? {id: categories[0].id, name: categories[0].value}
          : {};
        let param = {
          videoId: this.props.selectedVideoId,
          channelId: !!youtubeData.channel
            ? youtubeData.channel.id
            : !!channels
            ? channels[0].id
            : '',
          title: youtubeData.title,
          description: youtubeData.description,
          tags: !!youtubeData.tags ? youtubeData.tags : '',
          category: JSON.stringify(cat),
          status: youtubeData.status ? 'public' : 'private',
          scheduleTime: youtubeData.schedule_time
            ? moment(youtubeData.schedule_time).format('YYYY-MM-DD HH:mm')
            : '',
          isScheduleOn: youtubeData.is_schedule_on ? 1 : 0

          // thumbnail: youtubeData.thumbnail[0]
        };

        if (!!file) {
          param = {...param, thumbnail: youtubeData.thumbnail[0]};
        } else {
          let thumb = '';
          if (!!youtubeData && !!youtubeData.thumbnail && youtubeData.media_id) {
            const imgArr = youtubeData.thumbnail + ''.split('/');
            if (imgArr.indexOf(youtubeData.media_id) !== -1) {
              thumb = youtubeData.thumbnail;
            }
            param = {...param, thumbnail: thumb};
          }
        }
        const data = this.getFormData(param);
        if (!this.validationCheck(param)) {
          this.props.saveVideoYoutube({
            id: youtubeData && youtubeData.media_id ? youtubeData.media_id : '',
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

  handleWarning = (WarningType) => {
    if (WarningType === 'saveWarning') {
      if (!this.validationCheck(this.state.youtubeData)) {
        this.setState({[WarningType]: true});
      }
    } else {
      this.setState({[WarningType]: true});
    }
  };

  handleChange(tags) {
    tags =
      tags && tags.length > TEXT_MAX_LENGTH_500
        ? tags.substr(0, INPUT_TAG_CUT_CEIL)
        : tags;
    const {youtubeData} = this.state;
    youtubeData.tags = _.uniq(tags).join(',');
    this.setState({youtubeData, inputTags: ''});
  }

  handleChangeInput = (tag) => {
    tag =
      tag && tag.length > TEXT_MAX_LENGTH_500
        ? tag.substr(0, INPUT_TAG_CUT_CEIL)
        : tag;
    this.setState({inputTags: tag}, () => {
      const {youtubeData} = this.state;
      const input = !!youtubeData.tags
        ? `${youtubeData.tags},${this.state.inputTags}`
        : this.state.inputTags;
      if (this.state.inputTags.indexOf(',') !== -1) {
        const arr = input && input.split(',');
        const element = arr.pop();
        this.handleChange(arr);
      }
    });
  };

  defaultRenderTag = (props) => {
    const {
      tag,
      key,
      disabled,
      onRemove,
      classNameRemove,
      getTagDisplayValue,
      ...other
    } = props;
    return (
      <span title={tag} key={key} {...other}>
        {getTagDisplayValue(trim(tag, 6))}
        {!disabled && (
          <a className={classNameRemove} onClick={(e) => onRemove(key)} />
        )}
      </span>
    );
  };

  callUniqueApi = (value, type) => {
    const {dataError} = this.state;
    if (dataError.title) return;
    if (value.trim().length > 0) {
      const url = ApiServices.YOUTUBE_TITLE_UNIQUE;
      AxiosService.post(
        url,
        {title: value, videoId: this.props.selectedVideoId},
        false
      )
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
    // else {
    //   const {dataError} = this.state;
    //   dataError[type] = true;
    //   this.setState({dataError, titleErrorMsg: translator('REQUIRED.MESSAGE')});
    // }
  };

  render() {
    let videoThumb = '';
    const {file, youtubeData, dataError, categories, channels} = this.state;
    const {videoItem, selectedPlatform, youtubeThumb, videoAuth} = this.props;
    if (!!this.state.apiSuccessMsg) {
      this.props.history.push(path.rawMaterials);
    }
    if (!!youtubeData && youtubeData.media_id) {
      videoThumb = youtubeData.thumbnail;
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
              : 'VIDEO_MANAGE.DELETE_TEXT_YOUTUBE'
          )}
          cancelClick={() => this.cancelClick('deleteWarning')}
          okClick={() => this.handleDeleteVideo()}
        />
        <ConfirmationModal
          key={generateKey()}
          isActive={this.state.saveWarning}
          title={rawMaterialModtranslator(
            !!youtubeData && youtubeData.media_id
              ? 'VIDEO_MANAGE.UPDATE_TITLE'
              : 'VIDEO_MANAGE.UPLOAD_TITLE'
          )}
          body={rawMaterialModtranslator(
            !!youtubeData && youtubeData.media_id
              ? 'VIDEO_MANAGE.YOUTUBE_UPDATE_TEXT'
              : 'VIDEO_MANAGE.YOUTUBE_UPLOAD_TEXT'
          )}
          cancelClick={() => this.cancelClick('saveWarning')}
          okClick={() => this.handleVideoSave()}
        />
        <div className={style.dataContainer}>
          <div className={style.videoFormContent}>
            <div className={style.colOne}>
              <Label className={style.inputLabel}>
                {rawMaterialModtranslator('VIDEO_MANAGE.CHANNEL')}
                <span className="text-danger">*</span>
              </Label>
              <div className={style.selectBoxCat}>
                <Select
                  key={generateKey}
                  className={`${style.reactSelectContainer} ${!isEmpty(dataError) &&
                    dataError.channel &&
                    style.errorSelect}`}
                  options={channels}
                  name="channel"
                  isDisabled={getFieldStatus(videoItem.is_uploaded_youtube)}
                  onChange={(e) => this.onChangeValue(e, 'channel')}
                  defaultValue={
                    !!youtubeData && youtubeData.channel
                      ? youtubeData.channel
                      : !isObjectEmpty(channels)
                      ? channels[0]
                      : {}
                  }
                />
                {!isEmpty(dataError) && dataError.channel && (
                  <RequiredMessage text={translator('REQUIRED.MESSAGE')} />
                )}
              </div>
              <Label className={style.inputLabel}>
                {rawMaterialModtranslator('VIDEO_MANAGE.CATEGORY')}
                <span className="text-danger">*</span>
              </Label>
              <div className={style.selectBoxCat}>
                <Select
                  key={generateKey}
                  className={`${style.reactSelectContainer} ${!isEmpty(dataError) &&
                    dataError.category &&
                    style.errorSelect}`}
                  options={categories}
                  name="category"
                  isDisabled={getFieldStatus(videoItem.is_uploaded_youtube)}
                  onChange={(e) => this.onChangeValue(e, 'category')}
                  defaultValue={
                    !!youtubeData && youtubeData.category
                      ? youtubeData.category
                      : !isObjectEmpty(categories)
                      ? categories[0]
                      : {}
                  }
                />
                {!isEmpty(dataError) && dataError.category && (
                  <RequiredMessage text={translator('REQUIRED.MESSAGE')} />
                )}
              </div>

              <Label className={style.inputLabel}>
                {rawMaterialModtranslator('VIDEO_MANAGE.TITLE')}
                <span className="text-danger">*</span>
              </Label>
              <div className={style.commonInput}>
                <Inputfield
                  textType="text"
                  placeHolder={rawMaterialModtranslator(
                    'VIDEO_MANAGE.PLACEHOLDER_TITLE'
                  )}
                  inputName="title"
                  maxLength={INPUT_MAX_LENGTH_100}
                  isDisabled={getFieldStatus(videoItem.is_uploaded_youtube)}
                  onchangeCallback={(e) => this.onChangeValue(e)}
                  blurCallback={(e) => this.onBlurValidationCheck('title')}
                  defaultValue={youtubeData.title}
                  isError={!isEmpty(dataError) && dataError.title && 'inputError'}
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
                  // className={style.textArea}
                  className={`${style.textArea} ${!isEmpty(dataError) &&
                    dataError.description &&
                    style.error}`}
                  name="description"
                  maxLength={TEXT_MAX_LENGTH_5000}
                  disabled={getFieldStatus(videoItem.is_uploaded_youtube)}
                  placeholder={rawMaterialModtranslator(
                    'VIDEO_MANAGE.PLACEHOLDER_EXPLANATION'
                  )}
                  onChange={(e) => this.onChangeValue(e)}
                  onBlur={(e) => this.onBlurValidationCheck('description')}
                  defaultValue={youtubeData.description}
                />
                {!isEmpty(dataError) && dataError.description && (
                  <RequiredMessage text={this.state.descriptionErrorMsg} />
                )}
              </div>

              <Label className={style.inputLabel}>
                {rawMaterialModtranslator('VIDEO_MANAGE.TAG')}
              </Label>
              <div
                className={`${style.commonTextAreaTag} ${getFieldStatus(
                  videoItem.is_uploaded_youtube
                ) && style.commonTextAreaTagDisable}`}
              >
                {/* <textarea */}
                {/*  className={style.textArea} */}
                {/*  name="tags" */}
                {/*  maxLength={TEXT_MAX_LENGTH_5000} */}
                {/*  placeholder={rawMaterialModtranslator('VIDEO_MANAGE.TAG')} */}
                {/*  onChange={(e) => this.onChangeValue(e)} */}
                {/*  defaultValue={youtubeData.tags} */}
                {/* /> */}
                <TagsInput
                  value={!!youtubeData.tags ? youtubeData.tags.split(',') : []}
                  inputProps={{
                    placeholder: !!youtubeData.tags
                      ? ''
                      : rawMaterialModtranslator('VIDEO_MANAGE.PLACEHOLDER_TAG')
                  }}
                  maxLength={TEXT_MAX_LENGTH_500}
                  name="tags"
                  disabled={getFieldStatus(videoItem.is_uploaded_youtube)}
                  onChange={(e) => this.handleChange(e)}
                  onChangeInput={(e) => this.handleChangeInput(e)}
                  inputValue={this.state.inputTags}
                  // renderTag={this.defaultRenderTag}
                  onlyUniq

                  // validationRegex="/^[ぁ-んァ-ン一-龥 \w,：.\s!@#\$%\^\&*\)\ \\[\]{\}(+=._-]+$/"
                />
              </div>
            </div>
            <div className={style.colTwo}>
              <div className={style.commonSection}>
                <div className={style.commonSectionHeader}>
                  <span>{rawMaterialModtranslator('VIDEO_MANAGE.STATUS')}</span>
                </div>
                <div className={style.commonSectionBody}>
                  <div className={style.commonSectionBodyUpper}>
                    <div className={style.item}>
                      動画ステータス：
                      <span>
                        {getIsUploadedById(
                          !!youtubeData.is_uploaded
                            ? youtubeData.is_uploaded
                            : videoItem.is_uploaded
                        )}
                      </span>
                    </div>
                    <div className={style.item}>
                      公開ステータス：
                      <span>
                        {getIsPublishedById(
                          !!youtubeData.is_published
                            ? youtubeData.is_published
                            : videoItem.is_published
                        )}
                      </span>
                    </div>
                  </div>
                  <div className={style.commonSectionBodyLower}>
                    <div>
                      <span>
                        {rawMaterialModtranslator(
                          'VIDEO_MANAGE.PUBLISHING_SETTINGS'
                        )}
                      </span>
                    </div>
                    <div>
                      <span>
                        <Switch
                          disabled={{
                            disabled: getFieldStatus(videoItem.is_uploaded_youtube)
                          }}
                          handleChange={(e) => this.onChangeValue(e, 'status')}
                          name="status"
                          styleName="publish-status"
                          defaultValue={youtubeData.status}
                        />
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
                            getFieldStatus(videoItem.is_uploaded_youtube) ||
                            this.state.isScheduleDisable
                          }
                          handleDate={this.handleDate}
                          value={youtubeData.schedule_time}
                          defaultOption=""
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
                            getFieldStatus(videoItem.is_uploaded_youtube) ||
                            this.state.isScheduleDisable ||
                            !youtubeData.schedule_time
                        }}
                        styleName="configuration"
                        defaultValue={youtubeData.is_schedule_on}
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
                    value={youtubeData.embed_code}
                    placeholder={rawMaterialModtranslator(
                      'VIDEO_MANAGE.PLACEHOLDER_EMBEDED_CODE'
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
                    {!!youtubeThumb ? (
                      <img src={youtubeThumb} aria-hidden alt="image" />
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
                      disabled={getFieldStatus(videoItem.is_uploaded_youtube)}
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
                    videoItem.is_uploaded_youtube === 1 ||
                    (videoAuth && videoAuth.youtube_unauthenticated)
                      ? true
                      : false
                  }
                  onClick={() => this.handleWarning('saveWarning')}
                >
                  {!!youtubeData &&
                  youtubeData.media_id &&
                  !('is_uploaded_youtube' in videoItem) ? (
                    <SyncSharp className={style.icon} />
                  ) : (
                    <CloudUploadOutline className={style.icon} />
                  )}{' '}
                  {!!youtubeData &&
                  youtubeData.media_id &&
                  !('is_uploaded_youtube' in videoItem)
                    ? rawMaterialModtranslator('VIDEO_MANAGE.UPDATE')
                    : translator('HEADER.CLOUD_BUTTON')}
                </Commonbutton>
              </div>

              {!!youtubeData &&
                youtubeData.media_id &&
                !('is_uploaded_youtube' in videoItem) && (
                  <div className={`${style.commonButton} ${style.customMarginLeft}`}>
                    <Commonbutton
                      className="primary"
                      onClick={() => this.handleAcquire()}
                      disabled={
                        videoAuth && videoAuth.youtube_unauthenticated ? true : false
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
                    videoItem.is_uploaded_youtube === 1 ||
                    (videoAuth &&
                      videoAuth.youtube_unauthenticated &&
                      selectedPlatform !== NEWSCLOUD)
                      ? true
                      : false
                  }
                  onClick={() => this.handleWarning('deleteWarning')}
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
    selectedPlatform: state.videoReducer.selectedPlatform,
    selectedVideoId: state.videoReducer.selectedVideoId,
    categories: state.videoReducer.categories,
    channels: state.videoReducer.channels,
    youtubeDetail: state.videoReducer.youtubeDetail,
    apiSuccess: state.videoReducer.apiSuccess,
    youtubeThumb: state.videoReducer.youtubeThumb,
    videoAuth: state.videoReducer.videoAuth
  };
}

function mapDispatchToProps(dispatch) {
  return {
    saveVideoYoutube: (data) => dispatch(saveVideoYoutube(data)),
    showVideoYoutube: (data) => dispatch(showVideoYoutube(data)),
    deleteVideoContent: (data) => dispatch(deleteVideoContent(data)),
    fieldInitialization: (data) => dispatch(fieldInitialization(data))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(VideoForm));
