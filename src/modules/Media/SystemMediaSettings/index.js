import React, {Component} from 'react';
import { withRouter } from 'react-router-dom';
import Inputfield from '../../../common-components/inputfield/Inputfield';
import SystemSettingsLayout from '../../../containers/SystemSettingsLayout';
import {translator} from '../../../localizations';
import {mediaModtranslator} from './modLocalization';
import Youtube from './mod-assets/svg/youtube-icon.svg';
import Vimeo from './mod-assets/svg/vimeo-icon.svg';
import NcCheckbox from '../../../common-components/NcCheckbox';
import Commonbutton from '../../../common-components/button/Button';
import './system-location-settings.scss';
import ApiServices from '../../../networks/ApiServices';
import AxiosServices from '../../../networks/AxiosService';
import 'react-toastify/dist/ReactToastify.css';
import {setSystemSettingsMenu} from '../../../redux/actions/common';
import {connect} from 'react-redux';
import {routes} from '../../../app-constants';
import Loader from '../../../common-components/Loader';
import RequiredMessage from '../../../common-components/RequiredMessage';
import {DEFAULT_PLATFORM} from '../../../app-constants/usersConstant';
import Toast from '../../../common-components/Toast';
import NcInput from '../../../common-components/NcInput';
import NcBreadcrumbs from '../../../common-components/NcBreadcrumbs/ncBreadcrumbs';
import path from '../../../routes/path';
import getErrorMessage from '../../../app-constants/ServerErrorInfo';

class SystemMediaSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      MEDIA_LIST: [],
      platformList: ['youtube', 'vimeo'],
      isLoader: true,
      isDataProcessing: false,
      reload: false,
      youtubeClientSecretValidation: ''
    };
    this.saveMediaList = this.saveMediaList.bind(this);
    this.enableDisableYoutubeField = this.enableDisableYoutubeField.bind(this);
    this.enableDisableVimeoField = this.enableDisableVimeoField.bind(this);
    this.getYoutubeAuthenticate = this.getYoutubeAuthenticate.bind(this);
  }

  componentDidMount() {
    Toast.clear();
    this.props.setSystemSettingsMenu('location');
    this.getMediaDataList();
  }

  getMediaDataList(reload = false) {
    this.setState({reload: reload});
    const param = {};
    AxiosServices.get(ApiServices.GET_MEDIA_SETTING_LIST, param, false)
      .then((response) => {
        const {platformList} = this.state;
        const result = response.data.data;
        if (result) {
          let youtubeIsActive = '';
          let vimeoIsActive = '';
          let youtubeClientIdValidation = '';
          let youtubeClientSecretValidation = '';
          let youtubeOldIsActive = '';
          let youtubeOldClientId = '';
          let youtubeOldClientSecret = '';
          let vimeoOldIsActive='';
          let vimeoOldClientID='';
          let vimeoOldClientSecret='';
          let vimeoOldAccessToken='';
          result.list &&
            result.list.map((item, index) => {
              const platformName = item.platform.name;
              if (platformName === platformList[0]) {
                youtubeIsActive = item.is_active;
                youtubeClientIdValidation = item.client_id;
                youtubeClientSecretValidation = item.client_secret;
                youtubeOldIsActive = item.is_active;
                youtubeOldClientId = item.client_id;
                youtubeOldClientSecret = item.client_secret;
                if (youtubeClientIdValidation && youtubeClientSecretValidation && youtubeIsActive) {
                  this.getYoutubeAuthenticate();
                }
              }
              if (platformName === platformList[1]) {
                vimeoIsActive = item.is_active;
                vimeoOldIsActive= item.is_active;
                vimeoOldClientID= item.client_id;
                vimeoOldClientSecret= item.client_secret;
                vimeoOldAccessToken= item.access_token;
              }
            });

          this.setState({
            MEDIA_LIST: result.list,
            isLoader: false,
            youtubeIsActive: youtubeIsActive,
            vimeoIsActive: vimeoIsActive,
            reload: false,
            youtubeClientIdValidation,
            youtubeClientSecretValidation,
            youtubeOldIsActive,
            youtubeOldClientId,
            youtubeOldClientSecret,
            vimeoOldIsActive,
            vimeoOldClientID,
            vimeoOldClientSecret,
            vimeoOldAccessToken
          });
        }
      })
      .catch((error) => {
        let apiError = getErrorMessage(error);
        Toast.error(apiError.message);
        this.setState({reload: false});
        this.redirectToLogin(error);
      });
  }

  allInputValue(e) {
    let inputName = e.target.name;
    switch (inputName) {
      case 'youtubeClientId':
        this.setState({youtubeClientIdError: false});
        break;
      case 'youtubeClientSecret':
        this.setState({youtubeClientSecretError: false});
        break;
      case 'vimeoClientId':
        this.setState({vimeoClientIdError: false});
        break;
      case 'vimeoClientSecret':
        this.setState({vimeoClientSecretError: false});
        break;
      case 'vimeoAccessToken':
        this.setState({vimeoAccessTokenError: false});
        break;
    }
  }
  saveMediaList() {
    this.setState({isDataProcessing: true});
    const youtubeClientId = this.youtubeClientId.value.trim();
    const youtubeClientSecret = this.youtubeClientSecret.value.trim();
    const vimeoClientId = this.vimeoClientId.value.trim();
    const vimeoClientSecret = this.vimeoClientSecret.value.trim();
    const vimeoAccessToken = this.vimeoAccessToken.value.trim();
    let mediaInputData = [];
    const {MEDIA_LIST, platformList, youtubeIsActive, vimeoIsActive} = this.state;
    let isFirstTimeSaveData = MEDIA_LIST && MEDIA_LIST.length ? false : true;
    MEDIA_LIST && MEDIA_LIST.length
      ? MEDIA_LIST.map((item, index) => {
          const platformName = item.platform.name;
          let clientSecret = '';
          let client_id = '';
          let is_update_youtube = 1;
          let is_update_vimeo = 1;
          let param = {};
          let {
            youtubeOldIsActive,
            youtubeOldClientId,
            youtubeOldClientSecret,
            vimeoOldIsActive,
            vimeoOldClientID,
            vimeoOldClientSecret,
            vimeoOldAccessToken
          } = this.state;
          if (platformName === platformList[0]) {
            client_id = youtubeClientId;
            clientSecret = youtubeClientSecret;
            if (
              youtubeClientId == youtubeOldClientId &&
              youtubeClientSecret == youtubeOldClientSecret &&
              youtubeIsActive == youtubeOldIsActive
            ) {
              is_update_youtube = 0;
            }
            param = {
              platform_id: item.platform.id,
              is_update: is_update_youtube,
              is_active: youtubeIsActive,
              client_id: client_id,
              client_secret: clientSecret
            };
          } else if (platformName === platformList[1]) {
            client_id = vimeoClientId;
            clientSecret = vimeoClientSecret;
            if (
              vimeoClientId == vimeoOldClientID &&
              vimeoClientSecret == vimeoOldClientSecret &&
              vimeoAccessToken == vimeoOldAccessToken &&
              vimeoIsActive == vimeoOldIsActive
            ) {
              is_update_vimeo = 0;
            }
            param = {
              platform_id: item.platform.id,
              is_update: is_update_vimeo,
              is_active: vimeoIsActive,
              client_id: client_id,
              client_secret: clientSecret,
              access_token: vimeoAccessToken
            };
          }
          mediaInputData.push(param);
        })
      : (mediaInputData = [
          {
            platform_id: DEFAULT_PLATFORM.YOUTUBE,
            is_update: 1,
            is_active: youtubeIsActive == 1 ? 1 : 0,
            client_id: youtubeClientId,
            client_secret: youtubeClientSecret
          },
          {
            platform_id: DEFAULT_PLATFORM.VIMEO,
            is_update: 1,
            is_active: vimeoIsActive == 1 ? 1 : 0,
            client_id: vimeoClientId,
            client_secret: vimeoClientSecret,
            access_token: vimeoAccessToken
          }
        ]);
    let youtubeClientIdValidation = youtubeClientId;
    let youtubeClientSecretValidation = youtubeClientSecret;
    let isYoutubeFillBoth = false;
    let youtubeClientIdError = false;
    let youtubeClientSecretError = false;
    let isVimeoFillBoth = false;
    let vimeoClientIdError = false;
    let vimeoAccessTokenError = false;
    let vimeoClientSecretError = false;

    if (youtubeIsActive !== 1) {
      isYoutubeFillBoth = true;
    } else if (youtubeClientId.length && youtubeClientSecret.length) {
      isYoutubeFillBoth = true;
    } else {
      if (!youtubeClientId.length) {
        youtubeClientIdError = true;
      }
      if (!youtubeClientSecret.length) {
        youtubeClientSecretError = true;
      }
    }

    if (vimeoIsActive !== 1) {
      isVimeoFillBoth = true;
    } else if (
      vimeoClientId.length &&
      vimeoClientSecret.length &&
      vimeoAccessToken.length
    ) {
      isVimeoFillBoth = true;
    } else {
      if (!vimeoClientId.length) {
        vimeoClientIdError = true;
      }
      if (!vimeoClientSecret.length) {
        vimeoClientSecretError = true;
      }
      if (!vimeoAccessToken.length) {
        vimeoAccessTokenError = true;
      }
    }

    this.setState({
      youtubeClientIdError: youtubeClientIdError,
      youtubeClientSecretError: youtubeClientSecretError,
      vimeoClientIdError: vimeoClientIdError,
      vimeoClientSecretError: vimeoClientSecretError,
      vimeoAccessTokenError: vimeoAccessTokenError
    });

    let isProvideAnyInput = false;
    if (
      youtubeClientId.length ||
      youtubeClientSecret.length ||
      vimeoClientId.length ||
      vimeoClientSecret.length ||
      vimeoAccessToken.length
    ) {
      isProvideAnyInput = true;
    }

    if (isYoutubeFillBoth && isVimeoFillBoth && isProvideAnyInput) {
      AxiosServices.post(
        ApiServices.SAVE_MEDIA_SETTING_LIST,
        {data: JSON.stringify(mediaInputData)},
        false
      )
        .then((response) => {
          const {data} = response;
          if (data.status) {
            if (isFirstTimeSaveData) {
              this.getMediaDataList(isFirstTimeSaveData);
            }
            Toast.success(data.message);
            window.scroll(0, 0);
            this.setState({
              isDataProcessing: false,
              youtubeOldIsActive: youtubeIsActive,
              youtubeOldClientId:youtubeClientId,
              youtubeOldClientSecret: youtubeClientSecret,
              vimeoOldIsActive: vimeoIsActive,
              vimeoOldClientID: vimeoClientId,
              vimeoOldClientSecret : vimeoClientSecret,
              vimeoOldAccessToken: vimeoAccessToken,
            });
            if (youtubeClientIdValidation && youtubeClientSecretValidation && youtubeIsActive) {
              this.getYoutubeAuthenticate();
            }
          }
        })
        .catch((error) => {
          this.setState({
            isLoader: false,
            isDataProcessing: false
          });
          Toast.error(error.response.data.message);
          window.scroll(0, 0);
        });
    } else {
      this.setState({isDataProcessing: false});
      if (isYoutubeFillBoth && isVimeoFillBoth) {
        Toast.error(mediaModtranslator('MEDIA.SNS_ERROR_MSG.INPUT_ERROR'));
        window.scroll(0, 0);
      }
    }
  }

  getYoutubeAuthenticate() {
    AxiosServices.post(ApiServices.GET_YOUTUBE_AUTHENTICATION, {}, false)
      .then((response) => {
        let authURL = response.data.data.authUrl || '';
        if (authURL) {
          let w = 1000;
          let h = 600;
          const dualScreenLeft =
            window.screenLeft !== undefined ? window.screenLeft : window.screenX;
          const dualScreenTop =
            window.screenTop !== undefined ? window.screenTop : window.screenY;
          const width = window.innerWidth
            ? window.innerWidth
            : document.documentElement.clientWidth
            ? document.documentElement.clientWidth
            : window.screen.width;
          const height = window.innerHeight
            ? window.innerHeight
            : document.documentElement.clientHeight
            ? document.documentElement.clientHeight
            : window.screen.height;
          const systemZoom = width / window.screen.availWidth;
          const left = (width - w) / 2 / systemZoom + dualScreenLeft;
          const top = (height - h) / 2 / systemZoom + dualScreenTop;
          const newWindow = window.open(
            authURL,
            'YoutubeAuth',
            `
          scrollbars=yes,
          width=${w / systemZoom},
          height=${h / systemZoom},
          top=${top},
          left=${left}
          `
          );
        }
      })
      .catch((err) => {
        let apiError = getErrorMessage(err);
        Toast.error(apiError.message);
      });
  }

  redirectToLogin(error = {}) {
    setTimeout(() => {
      if (error.response && error.response.status == 401) {
        this.props.history.push('/login');
      }
    }, 2000);
  }

  enableDisableYoutubeField(isActive) {
    this.setState({
      youtubeIsActive: isActive == 1 ? 0 : 1
    });
  }

  enableDisableVimeoField(isActive) {
    this.setState({
      vimeoIsActive: isActive == 1 ? 0 : 1
    });
  }

  render() {
    const {
      MEDIA_LIST,
      isLoader,
      platformList,
      youtubeClientIdError,
      youtubeClientSecretError,
      vimeoClientIdError,
      vimeoClientSecretError,
      vimeoAccessTokenError,
      youtubeIsActive,
      vimeoIsActive,
      isDataProcessing,
      reload
    } = this.state;
    let youtubeClientId = '';
    let youtubeClientSecret = '';
    let vimeoClientId = '';
    let vimeoClientSecret = '';
    let vimeoAccessToken = '';
    MEDIA_LIST &&
      MEDIA_LIST.map((item, index) => {
        const platformName = item.platform.name;
        if (platformName === platformList[0]) {
          youtubeClientId = item.client_id;
          youtubeClientSecret = item.client_secret;
        }
        if (platformName === platformList[1]) {
          vimeoClientId = item.client_id;
          vimeoClientSecret = item.client_secret;
          vimeoAccessToken = item.access_token || '';
        }
      });
    const breadcrumbs = [
      {title: mediaModtranslator('MEDIA.SYSTEM_SETTING'), link: path.role},
      {title: mediaModtranslator('MEDIA.BREADCRUMB_TITLE'), link: '', active: true}
    ];
    return (
      <SystemSettingsLayout>
        <div className="location-container">
          <Toast />
          <NcBreadcrumbs breadcrumbs={breadcrumbs} />
          {isLoader ? (
            <Loader />
          ) : (
            <>
              <h2 className="title">
                {mediaModtranslator('MEDIA.BREADCRUMB_TITLE')}
              </h2>
              {reload ? (
                <Loader />
              ) : (
                <>
                  <div className="youtube-section">
                    <div className="top-head">
                      <NcCheckbox
                        id="youtube-setting"
                        isActive={youtubeIsActive == 1 ? 0 : 1}
                        handleChange={() =>
                          this.enableDisableYoutubeField(youtubeIsActive)
                        }
                      />
                      <img
                        className="youtube-icon"
                        src={Youtube}
                        alt="youtube-icon"
                      />
                      <span className="head-title">
                        {mediaModtranslator('MEDIA.YOUTUBE')}
                      </span>
                    </div>
                    <div className="input-container">
                      <div className="input-content">
                        <NcInput
                          label={mediaModtranslator('MEDIA.YOUTUBE_CLIENT_ID')}
                          leftLabel
                          className="user-input"
                          inputRef={(ref) => {
                            this.youtubeClientId = ref;
                          }}
                          type="text"
                          name="text"
                          defaultValue={youtubeClientId}
                          errorMessage={
                            youtubeIsActive !== 0 &&
                            youtubeClientIdError &&
                            mediaModtranslator(
                              'MEDIA.SNS_ERROR_MSG.YOUTUBE_CLIENT_ID'
                            )
                          }
                          disabled={youtubeIsActive == 0 ? true : false}
                          placeholder={mediaModtranslator(
                            'MEDIA.YOUTUBE_CLIENT_ID_PLACEHOLDER'
                          )}
                          name="youtubeClientId"
                          onChange={(e) => this.allInputValue(e)}
                        />
                      </div>
                      <div className="input-content">
                        <NcInput
                          label={mediaModtranslator('MEDIA.YOUTUBE_CLIENT_SECRET')}
                          leftLabel
                          className="user-input"
                          inputRef={(ref) => {
                            this.youtubeClientSecret = ref;
                          }}
                          type="text"
                          name="text"
                          defaultValue={youtubeClientSecret}
                          errorMessage={
                            youtubeIsActive !== 0 &&
                            youtubeClientSecretError &&
                            mediaModtranslator(
                              'MEDIA.SNS_ERROR_MSG.YOUTUBE_CLIENT_SECRET'
                            )
                          }
                          disabled={youtubeIsActive == 0 ? true : false}
                          placeholder={mediaModtranslator(
                            'MEDIA.YOUTUBE_CLIENT_SECRETE_PLACEHOLDER'
                          )}
                          name="youtubeClientSecret"
                          onChange={(e) => this.allInputValue(e)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="vimeo-section">
                    <div className="top-head">
                      <NcCheckbox
                        id="vimeo-setting"
                        isActive={vimeoIsActive == 1 ? 0 : 1}
                        handleChange={() =>
                          this.enableDisableVimeoField(vimeoIsActive)
                        }
                      />
                      <img className="vimeo-icon" src={Vimeo} alt="vimeo-icon" />
                      <span className="head-title">
                        {mediaModtranslator('MEDIA.VIMEO')}
                      </span>
                    </div>
                    <div className="input-container">
                      <div className="input-content">
                        <NcInput
                          label={mediaModtranslator('MEDIA.YOUTUBE_CLIENT_ID')}
                          leftLabel
                          className="user-input"
                          inputRef={(ref) => {
                            this.vimeoClientId = ref;
                          }}
                          type="text"
                          name="text"
                          defaultValue={vimeoClientId}
                          errorMessage={
                            vimeoIsActive !== 0 &&
                            vimeoClientIdError &&
                            mediaModtranslator('MEDIA.SNS_ERROR_MSG.VIEMO_CLIENT_ID')
                          }
                          disabled={vimeoIsActive == 0 ? true : false}
                          placeholder={mediaModtranslator(
                            'MEDIA.VIMEO_CLIENT_ID_PLACEHOLDER'
                          )}
                          name="vimeoClientId"
                          onChange={(e) => this.allInputValue(e)}
                        />
                      </div>
                      <div className="input-content">
                        <NcInput
                          label={mediaModtranslator('MEDIA.YOUTUBE_CLIENT_SECRET')}
                          leftLabel
                          className="user-input"
                          inputRef={(ref) => {
                            this.vimeoClientSecret = ref;
                          }}
                          type="text"
                          name="text"
                          defaultValue={vimeoClientSecret}
                          errorMessage={
                            vimeoIsActive !== 0 &&
                            vimeoClientSecretError &&
                            mediaModtranslator(
                              'MEDIA.SNS_ERROR_MSG.VIEMO_CLIENT_SECRET'
                            )
                          }
                          disabled={vimeoIsActive == 0 ? true : false}
                          placeholder={mediaModtranslator(
                            'MEDIA.VIMEO_CLIENT_SECRET_PLACEHOLDER'
                          )}
                          name="vimeoClientSecret"
                          onChange={(e) => this.allInputValue(e)}
                        />
                      </div>
                      <div className="input-content">
                        <NcInput
                          label={mediaModtranslator('MEDIA.TWITTER_ACCESS_TOKEN')}
                          leftLabel
                          className="user-input"
                          inputRef={(ref) => {
                            this.vimeoAccessToken = ref;
                          }}
                          type="text"
                          name="text"
                          defaultValue={vimeoAccessToken}
                          errorMessage={
                            vimeoIsActive !== 0 &&
                            vimeoAccessTokenError &&
                            mediaModtranslator(
                              'MEDIA.SNS_ERROR_MSG.VIMEO_ACCESS_TOKEN'
                            )
                          }
                          disabled={vimeoIsActive == 0 ? true : false}
                          placeholder={mediaModtranslator(
                            'MEDIA.VIMEO_ACCESS_TOKEN_PLACEHOLDER'
                          )}
                          name="vimeoAccessToken"
                          onChange={(e) => this.allInputValue(e)}
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className="submit-button"
                    ref={(btn) => {
                      this.submitBtn = btn;
                    }}
                    // onClick={() => (isDataProcessing ? {} : this.saveMediaList())}
                  >
                    <Commonbutton
                      className="primary-medium"
                      disabled={isDataProcessing}
                      onClick={() => (isDataProcessing ? {} : this.saveMediaList())}
                    >
                      {mediaModtranslator('MEDIA.BUTTON_TEXT')}
                    </Commonbutton>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </SystemSettingsLayout>
    );
  }
}

function mapStateToProps(state) {
  return {
    activeSystemMenu: state.commonReducer.activeSystemMenu
  };
}
function mapDispatchToProps(dispatch) {
  return {
    setSystemSettingsMenu: (menu) => dispatch(setSystemSettingsMenu(menu))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(SystemMediaSettings));
