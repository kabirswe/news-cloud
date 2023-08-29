import React, {Component} from 'react';
import { withRouter } from 'react-router-dom';
import Inputfield from '../../../common-components/inputfield/Inputfield';
import SystemSettingsLayout from '../../../containers/SystemSettingsLayout';
import {translator} from '../../../localizations';
import {mediaModtranslator} from './modLocalization';
import GOOGLE_ANALYTIC_ICON from './mod-assets/svg/google-analytic.svg';
import GOOGLE_CONSOLE_ICON from './mod-assets/svg/google-search-console.svg';
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

class SystemStatisticsSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      DATA_LIST: [],
      platformList: ['google_analytics','google_search_console'],
      isLoader: true,
      isDataProcessing: false,
      reload: false,
      googleClientSecretValidation: '',
    };
    this.saveGoogleAnalyticList = this.saveGoogleAnalyticList.bind(this);
    this.enableDisableGoogleAnalytic = this.enableDisableGoogleAnalytic.bind(this);
    this.enableDisableGoogleConsole = this.enableDisableGoogleConsole.bind(this);
  }

  componentDidMount() {
    Toast.clear();
    this.props.setSystemSettingsMenu('statistics_setting');
    this.getGoogleAnalyticsData();
  }

  getGoogleAnalyticsData(reload = false) {
    this.setState({reload: reload});
    const param = {};
    AxiosServices.get(ApiServices.GOOGLE_ANALYTIC_DATA, param, false)
      .then((response) => {
        const {platformList} = this.state;
        const result = response.data.data;
        if (result) {
          let googleAnalyticIsActive = '';
          let googleConsoleIsActive = '';
          let googleAnalyticOldIsActive = '';
          let googleAnalyticOldClientId = '';
          let googleAnalyticOldClientEmail = '';
          let googleAnalyticOldClientSecret = '';
          let googleConsoleOldIsActive='';
          let googleConsoleOldClientID='';
          let googleConsoleOldClientSecret='';
          result.list &&
            result.list.map((item, index) => {
              const platformName = item.platform.name;
              if (platformName == platformList[0]) {
                googleAnalyticIsActive = item.is_active;
                googleAnalyticOldIsActive = item.is_active;
                googleAnalyticOldClientId = item.client_id;
                googleAnalyticOldClientSecret = item.private_key;
                googleAnalyticOldClientEmail = item.client_email;
              }
              if (platformName === platformList[1]) {
                googleConsoleIsActive = item.is_active;
                googleConsoleOldIsActive= item.is_active;
                googleConsoleOldClientID= item.client_id;
                googleConsoleOldClientSecret= item.client_secret;
                if (googleConsoleOldClientID && googleConsoleOldClientSecret && googleConsoleIsActive) {
                  this.getGoogleConsoleAuthenticate();
                }
              }
            });

          this.setState({
            DATA_LIST: result.list,
            isLoader: false,
            googleAnalyticIsActive: googleAnalyticIsActive,
            googleConsoleIsActive: googleConsoleIsActive,
            reload: false,
            googleAnalyticOldIsActive,
            googleAnalyticOldClientId,
            googleAnalyticOldClientEmail,
            googleAnalyticOldClientSecret,
            googleConsoleOldIsActive,
            googleConsoleOldClientID,
            googleConsoleOldClientSecret
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

  getGoogleConsoleAuthenticate() {
    AxiosServices.post(ApiServices.GOOGLE_CONSOLE_AUTHENTICATION, {}, false)
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

  allInputValue(e) {
    let inputName = e.target.name;
    switch (inputName) {
      case 'googleAnalyticClientId':
        this.setState({googleAnalyticClientIdError: false});
        break;
      case 'googleAnalyticClientSecret':
        this.setState({googleAnalyticClientSecretError: false});
        break;
        case 'googleAnalyticClientEmail':
          this.setState({googleAnalyticClientEmailError: false});
          break;
      case 'googleConsoleClientId':
        this.setState({googleConsoleClientIdError: false});
        break;
      case 'googleConsoleClientSecret':
        this.setState({googleConsoleClientSecretError: false});
        break;
    }
  }
  saveGoogleAnalyticList() {
    this.setState({isDataProcessing: true});
    const googleAnalyticClientId = this.googleAnalyticClientId.value.trim();
    const googleAnalyticClientEmail = this.googleAnalyticClientEmail.value.trim();
    const googleAnalyticClientSecret = this.googleAnalyticClientSecret.value.trim();
    const googleConsoleClientId = this.googleConsoleClientId.value.trim();
    const googleConsoleClientSecret = this.googleConsoleClientSecret.value.trim();
    let googleInputData = [];
    const {DATA_LIST, platformList, googleAnalyticIsActive, googleConsoleIsActive} = this.state;
    let isFirstTimeSaveData = DATA_LIST && DATA_LIST.length ? false : true;
    DATA_LIST && DATA_LIST.length
      ? DATA_LIST.map((item, index) => {
          const platformName = item.platform.name;
          let clientSecret = '';
          let client_id = '';
          let is_update_google_analytic = 1;
          let is_update_google_console = 1;
          let param = {};
          let {
            googleAnalyticOldIsActive,
            googleAnalyticOldClientId,
            googleAnalyticOldClientEmail,
            googleAnalyticOldClientSecret,
            googleConsoleOldIsActive,
            googleConsoleOldClientID,
            googleConsoleOldClientSecret
            
          } = this.state;
          if (platformName === platformList[0]) {
            client_id = googleAnalyticClientId;
            clientSecret = googleAnalyticClientSecret;
            if (
              googleAnalyticClientId == googleAnalyticOldClientId &&
              googleAnalyticClientEmail == googleAnalyticOldClientEmail &&
              googleAnalyticClientSecret == googleAnalyticOldClientSecret &&
              googleAnalyticIsActive == googleAnalyticOldIsActive
            ) {
              is_update_google_analytic = 0;
            }
            param = {
              platform_id: item.platform.id,
              is_update: is_update_google_analytic,
              is_active: googleAnalyticIsActive,
              client_id: client_id,
              client_email : googleAnalyticClientEmail,
              private_key: clientSecret
            };
          }
           else if (platformName === platformList[1]) {
            client_id = googleConsoleClientId;
            clientSecret = googleConsoleClientSecret;
            if (
              googleConsoleClientId == googleConsoleOldClientID &&
              googleConsoleClientSecret == googleConsoleOldClientSecret &&
              googleConsoleIsActive == googleConsoleOldIsActive
            ) {
              is_update_google_console = 0;
            }
            param = {
              platform_id: item.platform.id,
              is_update: is_update_google_console,
              is_active: googleConsoleIsActive,
              client_id: client_id,
              client_secret: clientSecret
            };
          }
          googleInputData.push(param);
        })
      : (googleInputData = [
          {
            platform_id: DEFAULT_PLATFORM.GOOGLE_ANALYTIC,
            is_update: 1,
            is_active: googleAnalyticIsActive == 1 ? 1 : 0,
            client_id: googleAnalyticClientId,
            client_email : googleAnalyticClientEmail,
            private_key: googleAnalyticClientSecret
          },
          {
            platform_id: DEFAULT_PLATFORM.GOOGLE_SEARCH_CONSOLE,
            is_update: 1,
            is_active: googleConsoleIsActive == 1 ? 1 : 0,
            client_id: googleConsoleClientId,
            client_secret: googleConsoleClientSecret
          }
        ]);
    let isGoogleAnalyticFillAllField = false;
    let googleAnalyticClientIdError = false;
    let googleAnalyticClientSecretError = false;
    let googleAnalyticClientEmailError = false;
    let isVimeoFillBoth = false;
    let googleConsoleClientIdError = false;
    let googleConsoleClientSecretError = false;

    if (googleAnalyticIsActive !== 1) {
      isGoogleAnalyticFillAllField = true;
    } else if (googleAnalyticClientId.length && googleAnalyticClientSecret.length && googleAnalyticClientEmail.length) {
      isGoogleAnalyticFillAllField = true;
    } else {
      if (!googleAnalyticClientId.length) {
        googleAnalyticClientIdError = true;
      }
      if (!googleAnalyticClientSecret.length) {
        googleAnalyticClientSecretError = true;
      }
      if (!googleAnalyticClientEmail.length) {
        googleAnalyticClientEmailError = true;
      }
    }

    if (googleConsoleIsActive !== 1) {
      isVimeoFillBoth = true;
    } else if (
      googleConsoleClientId.length &&
      googleConsoleClientSecret.length
    ) {
      isVimeoFillBoth = true;
    } else {
      if (!googleConsoleClientId.length) {
        googleConsoleClientIdError = true;
      }
      if (!googleConsoleClientSecret.length) {
        googleConsoleClientSecretError = true;
      }
    }

    this.setState({
      googleAnalyticClientIdError: googleAnalyticClientIdError,
      googleAnalyticClientSecretError: googleAnalyticClientSecretError,
      googleAnalyticClientEmailError: googleAnalyticClientEmailError,
      googleConsoleClientIdError: googleConsoleClientIdError,
      googleConsoleClientSecretError: googleConsoleClientSecretError
    });

    let isProvideAnyInput = false;
    if (
      googleAnalyticClientId.length ||
      googleAnalyticClientSecret.length ||
      googleAnalyticClientEmail.length ||
      googleConsoleClientId.length ||
      googleConsoleClientSecret.length
    ) {
      isProvideAnyInput = true;
    }
//SAVE_MEDIA_SETTING_LIST
    if (isGoogleAnalyticFillAllField && isVimeoFillBoth && isProvideAnyInput) {
      AxiosServices.post(
        ApiServices.SAVE_GOOGLE_ANALYTIC_DATA,
        {data: JSON.stringify(googleInputData)},
        false
      )
        .then((response) => {
          const {data} = response;
          if (data.status) {
            if (isFirstTimeSaveData) {
              this.getGoogleAnalyticsData(isFirstTimeSaveData);
            }
            Toast.success(data.message);
            window.scroll(0, 0);
            this.setState({
              isDataProcessing: false,
              googleAnalyticOldIsActive: googleAnalyticIsActive,
              googleAnalyticOldClientId:googleAnalyticClientId,
              googleAnalyticOldClientEmail:googleAnalyticClientEmail,
              googleAnalyticOldClientSecret: googleAnalyticClientSecret,
              googleConsoleOldIsActive: googleConsoleIsActive,
              googleConsoleOldClientID: googleConsoleClientId,
              googleConsoleOldClientSecret : googleConsoleClientSecret
            });
            if (googleConsoleClientId && googleConsoleClientSecret && googleConsoleIsActive) {
              this.getGoogleConsoleAuthenticate();
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
      if (isGoogleAnalyticFillAllField && isVimeoFillBoth) {
        Toast.error(mediaModtranslator('STATISTICS.SNS_ERROR_MSG.INPUT_ERROR'));
        window.scroll(0, 0);
      }
    }
  }

 

  redirectToLogin(error = {}) {
    setTimeout(() => {
      if (error.response && error.response.status == 401) {
        this.props.history.push('/login');
      }
    }, 2000);
  }

  enableDisableGoogleAnalytic(isActive) {
    this.setState({
      googleAnalyticIsActive: isActive == 1 ? 0 : 1
    });
  }

  enableDisableGoogleConsole(isActive) {
    this.setState({
      googleConsoleIsActive: isActive == 1 ? 0 : 1
    });
  }

  render() {
    const {
      DATA_LIST,
      isLoader,
      platformList,
      googleAnalyticClientIdError,
      googleAnalyticClientSecretError,
      googleAnalyticClientEmailError,
      googleConsoleClientIdError,
      googleConsoleClientSecretError,
      googleAnalyticIsActive,
      googleConsoleIsActive,
      isDataProcessing,
      reload
    } = this.state;
    let googleAnalyticClientId = '';
    let googleAnalyticClientSecret = '';
    let googleAnalyticClientEmail = '';
    let googleConsoleClientId = '';
    let googleConsoleClientSecret = '';
    DATA_LIST &&
    DATA_LIST.map((item, index) => {
        const platformName = item.platform.name;
        if (platformName === platformList[0]) {
          googleAnalyticClientId = item.client_id;
          googleAnalyticClientSecret = item.private_key;
          googleAnalyticClientEmail = item.client_email;
        }
        if (platformName === platformList[1]) {
          googleConsoleClientId = item.client_id;
          googleConsoleClientSecret = item.client_secret;
        }
      });
    const breadcrumbs = [
      {title: mediaModtranslator('STATISTICS.SYSTEM_SETTING'), link: path.role},
      {title: mediaModtranslator('STATISTICS.BREADCRUMB_TITLE'), link: '', active: true}
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
                {mediaModtranslator('STATISTICS.BREADCRUMB_TITLE')}
              </h2>
              {reload ? (
                <Loader />
              ) : (
                <>
                  <div className="youtube-section">
                    <div className="top-head">
                      <NcCheckbox
                        id="youtube-setting"
                        isActive={googleAnalyticIsActive == 1 ? 0 : 1}
                        handleChange={() =>
                          this.enableDisableGoogleAnalytic(googleAnalyticIsActive)
                        }
                      />
                      <img
                        className="youtube-icon"
                        src={GOOGLE_ANALYTIC_ICON}
                        alt="youtube-icon"
                      />
                      <span className="head-title">
                        {mediaModtranslator('STATISTICS.GOOGLE_ANALYTIC')}
                      </span>
                    </div>
                    <div className="input-container">
                      <div className="input-content">
                        <NcInput
                          label={mediaModtranslator('STATISTICS.YOUTUBE_CLIENT_ID')}
                          leftLabel
                          className="user-input"
                          inputRef={(ref) => {
                            this.googleAnalyticClientId = ref;
                          }}
                          type="text"
                          name="text"
                          defaultValue={googleAnalyticClientId}
                          errorMessage={
                            googleAnalyticIsActive !== 0 &&
                            googleAnalyticClientIdError &&
                            mediaModtranslator(
                              'STATISTICS.SNS_ERROR_MSG.YOUTUBE_CLIENT_ID'
                            )
                          }
                          disabled={googleAnalyticIsActive == 0 ? true : false}
                          placeholder={mediaModtranslator(
                            'STATISTICS.YOUTUBE_CLIENT_ID_PLACEHOLDER'
                          )}
                          name="googleAnalyticClientId"
                          onChange={(e) => this.allInputValue(e)}
                        />
                      </div>
                      <div className="input-content">
                        <NcInput
                          label={mediaModtranslator('STATISTICS.CLIENT_EMAIL')}
                          leftLabel
                          className="user-input"
                          inputRef={(ref) => {
                            this.googleAnalyticClientEmail = ref;
                          }}
                          type="text"
                          name="text"
                          defaultValue={googleAnalyticClientEmail}
                          errorMessage={
                            googleAnalyticIsActive !== 0 &&
                            googleAnalyticClientEmailError &&
                            mediaModtranslator(
                              'STATISTICS.SNS_ERROR_MSG.GOOGLE_ANALYTIC_CLIENT_ERROR'
                            )
                          }
                          disabled={googleAnalyticIsActive == 0 ? true : false}
                          placeholder={mediaModtranslator(
                            'STATISTICS.GOOGLE_ANALYTIC_EMAIL_PLACEHOLDER'
                          )}
                          name="googleAnalyticClientEmail"
                          onChange={(e) => this.allInputValue(e)}
                        />
                      </div>
                      <div className="input-content">
                        <NcInput
                          label={mediaModtranslator('STATISTICS.YOUTUBE_CLIENT_SECRET')}
                          leftLabel
                          className="user-input"
                          inputRef={(ref) => {
                            this.googleAnalyticClientSecret = ref;
                          }}
                          type="text"
                          name="text"
                          defaultValue={googleAnalyticClientSecret}
                          errorMessage={
                            googleAnalyticIsActive !== 0 &&
                            googleAnalyticClientSecretError &&
                            mediaModtranslator(
                              'STATISTICS.SNS_ERROR_MSG.YOUTUBE_CLIENT_SECRET'
                            )
                          }
                          disabled={googleAnalyticIsActive == 0 ? true : false}
                          placeholder={mediaModtranslator(
                            'STATISTICS.YOUTUBE_CLIENT_SECRETE_PLACEHOLDER'
                          )}
                          name="googleAnalyticClientSecret"
                          onChange={(e) => this.allInputValue(e)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="vimeo-section">
                    <div className="top-head">
                      <NcCheckbox
                        id="vimeo-setting"
                        isActive={googleConsoleIsActive == 1 ? 0 : 1}
                        handleChange={() =>
                          this.enableDisableGoogleConsole(googleConsoleIsActive)
                        }
                      />
                      <img className="vimeo-icon" src={GOOGLE_CONSOLE_ICON} alt="vimeo-icon" />
                      <span className="head-title">
                        {mediaModtranslator('STATISTICS.GOOGLE_SEARCH_CONSOLE')}
                      </span>
                    </div>
                    <div className="input-container">
                      <div className="input-content">
                        <NcInput
                          label={mediaModtranslator('STATISTICS.YOUTUBE_CLIENT_ID')}
                          leftLabel
                          className="user-input"
                          inputRef={(ref) => {
                            this.googleConsoleClientId = ref;
                          }}
                          type="text"
                          name="text"
                          defaultValue={googleConsoleClientId}
                          errorMessage={
                            googleConsoleIsActive !== 0 &&
                            googleConsoleClientIdError &&
                            mediaModtranslator('STATISTICS.SNS_ERROR_MSG.VIEMO_CLIENT_ID')
                          }
                          disabled={googleConsoleIsActive == 0 ? true : false}
                          placeholder={mediaModtranslator(
                            'STATISTICS.VIMEO_CLIENT_ID_PLACEHOLDER'
                          )}
                          name="googleConsoleClientId"
                          onChange={(e) => this.allInputValue(e)}
                        />
                      </div>
                      <div className="input-content">
                        <NcInput
                          label={mediaModtranslator('STATISTICS.YOUTUBE_CLIENT_SECRET')}
                          leftLabel
                          className="user-input"
                          inputRef={(ref) => {
                            this.googleConsoleClientSecret = ref;
                          }}
                          type="text"
                          name="text"
                          defaultValue={googleConsoleClientSecret}
                          errorMessage={
                            googleConsoleIsActive !== 0 &&
                            googleConsoleClientSecretError &&
                            mediaModtranslator(
                              'STATISTICS.SNS_ERROR_MSG.VIEMO_CLIENT_SECRET'
                            )
                          }
                          disabled={googleConsoleIsActive == 0 ? true : false}
                          placeholder={mediaModtranslator(
                            'STATISTICS.VIMEO_CLIENT_SECRET_PLACEHOLDER'
                          )}
                          name="googleConsoleClientSecret"
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
                  >
                    <Commonbutton
                      className="primary-medium"
                      disabled={isDataProcessing}
                      onClick={() => (isDataProcessing ? {} : this.saveGoogleAnalyticList())}
                    >
                      {mediaModtranslator('STATISTICS.BUTTON_TEXT')}
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(SystemStatisticsSettings));
