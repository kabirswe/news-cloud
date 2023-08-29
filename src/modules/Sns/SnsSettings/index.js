import React, {Component} from 'react';
import Inputfield from '../../../common-components/inputfield/Inputfield';
import { withRouter } from 'react-router-dom';
import {translator} from '../../../localizations';
import {snsModtranslator} from './modLocalization';
import SystemSettingsLayout from '../../../containers/SystemSettingsLayout';
import Commonbutton from '../../../common-components/button/Button';
import Facebook from './mod-assets/svg/facebook-sns2.svg';
import Twitter from './mod-assets/svg/twitter-sns.svg';
import Line from './mod-assets/svg/line-sns.svg';
import './system-sns-settings.scss';
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

class SystemSnsSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      SNS_LIST: [],
      platformList: ['facebook', 'twitter', 'line'],
      isLoader: true,
      isDataProcessing: false,
      reLoad: false
    };
    this.saveSNSList = this.saveSNSList.bind(this);
  }

  redirectToLogin(error = {}) {
    setTimeout(() => {
      if (error.response && error.response.status == 401) {
        this.props.history.push('/login');
      }
    }, 2000);
  }

  componentDidMount() {
    Toast.clear();
    this.props.setSystemSettingsMenu('sns');
    this.getSNSDataList();
  }

  getSNSDataList(reLoad = false) {
    this.setState({reLoad: reLoad});
    const param = {};
    AxiosServices.get(ApiServices.GET_SNS_SETTING_LIST, param, false)
      .then((response) => {
        const result = response.data;
        if (result) {
          this.setState({
            SNS_LIST: result.data.list || [],
            isLoader: false,
            reLoad: false
          });
        }
      })
      .catch((error) => {
        const apiError = getErrorMessage(error);
        Toast.error(apiError.message);
        this.setState({reLoad: false});
        this.redirectToLogin(error);
      });
  }

  allInputValue(e) {
    const inputName = e.target.name;
    switch (inputName) {
      case 'facebookAppID':
        this.setState({facebookAppIDError: false});
        break;
      case 'facebookAppSecret':
        this.setState({facebookAppSecretError: false});
        break;
      case 'facebookAppToken':
        this.setState({facebookAppTokenError: false});
        break;
      case 'lineChannelId':
        this.setState({lineChannelIdError: false});
        break;
      case 'lineChannelSecret':
        this.setState({lineSecretError: false});
        break;
        case 'lineChannelAccessToken':
        this.setState({lineChannelAccessTokenError: false});
        break;
      case 'twitterApiKey':
        this.setState({twitterApiKeyError: false});
        break;
      case 'twitterAppSecret':
        this.setState({twitterAppSecretError: false});
        break;
      case 'twitterAccessToken':
        this.setState({twitterAccessTokenError: false});
        break;
      case 'twitterTokenSecret':
        this.setState({twitterTokenSecretError: false});
        break;
    }
  }

  saveSNSList() {
    this.setState({isDataProcessing: true});
    const facebookAppID = this.facebookAppID.value.trim();
    const facebookAppSecret = this.facebookAppSecret.value.trim();
    const facebookAppToken = this.facebookAppToken.value.trim();
    const twitterApiKey = this.twitterApiKey.value.trim();
    const twitterAppSecret = this.twitterAppSecret.value.trim();
    const twitterAccessToken = this.twitterAccessToken.value.trim();
    const twitterTokenSecret = this.twitterTokenSecret.value.trim();
    const lineChannelId = this.lineChannelId.value.trim();
    const lineChannelSecret = this.lineChannelSecret.value.trim();
    const lineChannelAccessToken = this.lineChannelAccessToken.value.trim();
    let snsInputData = [];
    const {SNS_LIST, platformList} = this.state;
    const isFirstTimeSaveData = SNS_LIST && SNS_LIST.length ? false : true;
    SNS_LIST && SNS_LIST.length
      ? SNS_LIST.map((item, index) => {
          const platformName = item.platform.name;
          let clientSecret = '';
          let client_id = '';
          let access_token = '';
          let param = {};
          let is_update_facebook = 1;
          let is_update_twitter = 1;
          let is_update_line = 1;
          if (platformName === platformList[0]) {
            client_id = facebookAppID;
            clientSecret = facebookAppSecret;
            access_token = facebookAppToken;
            if (
              facebookAppID == item.client_id &&
              facebookAppSecret == item.client_secret &&
              facebookAppToken == item.access_token
            ) {
              is_update_facebook = 0;
            }
            param = {
              platform_id: item.platform.id,
              is_update: is_update_facebook,
              client_id: client_id,
              client_secret: clientSecret,
              access_token: access_token
            };
          } else if (platformName === platformList[1]) {
            client_id = twitterApiKey;
            clientSecret = twitterAppSecret;
            if (
              twitterApiKey == item.client_id &&
              twitterAppSecret == item.client_secret &&
              twitterAccessToken == item.access_token &&
              twitterTokenSecret == item.access_token_secret
            ) {
              is_update_twitter = 0;
            }
            param = {
              platform_id: item.platform.id,
              is_update: is_update_twitter,
              client_id: client_id,
              client_secret: clientSecret,
              access_token: twitterAccessToken,
              access_token_secret: twitterTokenSecret
            };
          } else if (platformName === platformList[2]) {
            client_id = lineChannelId;
            clientSecret = lineChannelSecret;
            if (
              lineChannelId == item.client_id &&
              lineChannelSecret == item.client_secret &&
              lineChannelAccessToken == item.access_token
            ) {
              is_update_line = 0;
            }
            param = {
              platform_id: item.platform.id,
              is_update: is_update_line,
              client_id: client_id,
              client_secret: clientSecret,
              access_token: lineChannelAccessToken
            };
          }
          snsInputData.push(param);
        })
      : (snsInputData = [
          {
            platform_id: DEFAULT_PLATFORM.FACEBOOK,
            is_update: 1,
            client_id: facebookAppID,
            client_secret: facebookAppSecret,
            access_token: facebookAppToken
          },
          {
            platform_id: DEFAULT_PLATFORM.TWITTER,
            is_update: 1,
            client_id: twitterApiKey,
            client_secret: twitterAppSecret,
            access_token_secret: twitterTokenSecret,
            access_token: twitterAccessToken
          },
          {
            platform_id: DEFAULT_PLATFORM.LINE,
            is_update: 1,
            client_id: lineChannelId,
            client_secret: lineChannelSecret,
            access_token: lineChannelAccessToken
          }
        ]);

    let isfacebookInputFillBoth = false;
    let facebookAppIDError = false;
    let facebookAppSecretError = false;
    let facebookAppTokenError = false;
    let isLineInputFillBoth = false;
    let lineChannelIdError = false;
    let lineSecretError = false;
    let lineChannelAccessTokenError = false;
    let isTwitterFillBoth = false;
    let twitterApiKeyError = false;
    let twitterAppSecretError = false;
    let twitterAccessTokenError = false;
    let twitterTokenSecretError = false;
    if (
      (facebookAppID.length &&
        facebookAppSecret.length &&
        facebookAppToken.length) ||
      (!facebookAppID.length &&
        !facebookAppSecret.length &&
        !facebookAppToken.length)
    ) {
      isfacebookInputFillBoth = true;
    } else {
      if (!facebookAppID.length) {
        facebookAppIDError = true;
      }
      if (!facebookAppSecret.length) {
        facebookAppSecretError = true;
      }
      if (!facebookAppToken.length) {
        facebookAppTokenError = true;
      }
    }
    if (
      (lineChannelId.length &&
        lineChannelSecret.length &&
        lineChannelAccessToken.length) ||
      (!lineChannelId.length &&
        !lineChannelSecret.length &&
        !lineChannelAccessToken.length)
    ) {
      isLineInputFillBoth = true;
    } else {
      if (!lineChannelId.length) {
        lineChannelIdError = true;
      }
      if (!lineChannelSecret.length) {
        lineSecretError = true;
      }
      if (!lineChannelAccessToken.length) {
        lineChannelAccessTokenError = true;
      }
    }
    if (
      (twitterApiKey.length &&
        twitterAppSecret.length &&
        twitterAccessToken.length &&
        twitterTokenSecret.length) ||
      (!twitterApiKey.length &&
        !twitterAppSecret.length &&
        !twitterAccessToken.length &&
        !twitterTokenSecret.length)
    ) {
      isTwitterFillBoth = true;
    } else {
      if (!twitterApiKey.length) {
        twitterApiKeyError = true;
      }
      if (!twitterAppSecret.length) {
        twitterAppSecretError = true;
      }
      if (!twitterAccessToken.length) {
        twitterAccessTokenError = true;
      }
      if (!twitterTokenSecret.length) {
        twitterTokenSecretError = true;
      }
    }

    this.setState({
      facebookAppSecretError: facebookAppSecretError,
      facebookAppTokenError: facebookAppTokenError,
      facebookAppIDError: facebookAppIDError,
      lineChannelIdError: lineChannelIdError,
      lineSecretError: lineSecretError,
      lineChannelAccessTokenError: lineChannelAccessTokenError,
      twitterApiKeyError,
      twitterAppSecretError,
      twitterAccessTokenError,
      twitterTokenSecretError
    });

    let isProvideAnyInput = false;
    if (
      facebookAppID.length ||
      facebookAppSecret.length ||
      twitterApiKey.length ||
      twitterAppSecret.length ||
      twitterAccessToken.length ||
      twitterTokenSecret.length ||
      lineChannelId.length ||
      lineChannelSecret.length ||
      lineChannelAccessToken.length
    ) {
      isProvideAnyInput = true;
    }
    if (
      isfacebookInputFillBoth &&
      isLineInputFillBoth &&
      isTwitterFillBoth &&
      isProvideAnyInput
    ) {
      AxiosServices.post(
        ApiServices.SAVE_SNS_SETTING_LIST,
        {data: JSON.stringify(snsInputData)},
        false
      )
        .then((response) => {
          this.setState({isDataProcessing: false});
          const {data} = response;
          if (data.status) {
            /* LIST API CALL & reload when save first time SNS */
            if (isFirstTimeSaveData) {
              this.getSNSDataList(isFirstTimeSaveData);
            }
            Toast.success(data.message);
            window.scroll(0, 0);
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
      if (isfacebookInputFillBoth && isLineInputFillBoth && isTwitterFillBoth) {
        Toast.error(snsModtranslator('SNS.SNS_ERROR_MSG.INPUT_ERROR'));
        window.scroll(0, 0);
      }
    }
  }

  render() {
    const {
      SNS_LIST,
      isLoader,
      platformList,
      facebookAppSecretError,
      facebookAppTokenError,
      facebookAppIDError,
      lineSecretError,
      lineChannelIdError,
      lineChannelAccessTokenError,
      twitterApiKeyError,
      twitterAppSecretError,
      twitterAccessTokenError,
      twitterTokenSecretError,
      isDataProcessing,
      reLoad
    } = this.state;
    let facebookAppID = '';
    let facebookAppSecret = '';
    let facebookAppToken = '';
    let twitterApiKey = '';
    let twitterAppSecret = '';
    let twitterTokenSecret = '';
    let twitterAccessToken = '';
    let lineChannelId = '';
    let lineChannelSecret = '';
    let lineChannelAccessToken = '';
    SNS_LIST &&
      SNS_LIST.map((item, index) => {
        const platformName = item.platform.name;
        if (platformName == platformList[0]) {
          facebookAppID = item.client_id;
          facebookAppSecret = item.client_secret;
          facebookAppToken = item.access_token;
        }
        if (platformName == platformList[1]) {
          twitterApiKey = item.client_id;
          twitterAppSecret = item.client_secret;
          twitterTokenSecret = item.access_token_secret;
          twitterAccessToken = item.access_token;
        }
        if (platformName == platformList[2]) {
          lineChannelId = item.client_id;
          lineChannelSecret = item.client_secret;
          lineChannelAccessToken = item.access_token;
        }
      });
    const breadcrumbs = [
      {title: snsModtranslator('SNS.SYSTEM_SETTING'), link: path.role},
      {title: snsModtranslator('SNS.BREAD_CRUBMS_TITLE'), link: '', active: true}
    ];
    return (
      <SystemSettingsLayout>
        <div className="sns-container">
          <Toast />
          <NcBreadcrumbs breadcrumbs={breadcrumbs} />
          {isLoader ? (
            <Loader />
          ) : (
            <>
              <h2 className="title">{snsModtranslator('SNS.BREAD_CRUBMS_TITLE')}</h2>
              {reLoad ? (
                <Loader />
              ) : (
                <>
                  <div className="facebook-section">
                    <div className="top-head">
                      <img src={Facebook} alt="facebook-icon" />
                      <span className="head-title">
                        {snsModtranslator('SNS.FACEBOOK_TITLE')}
                      </span>
                    </div>
                    <div className="input-container">
                      <div className="input-content">
                        <NcInput
                          label={snsModtranslator('SNS.INPUT_LABEL_FACEBOOK')}
                          leftLabel
                          className="user-input"
                          inputRef={(ref) => {
                            this.facebookAppID = ref;
                          }}
                          type="text"
                          name="text"
                          defaultValue={facebookAppID}
                          errorMessage={
                            facebookAppIDError &&
                            snsModtranslator('SNS.SNS_ERROR_MSG.FACEBOOK_APP_ID')
                          }
                          placeholder={snsModtranslator(
                            'SNS.FACEBOOK_APP_ID_PLACEHOLDER'
                          )}
                          name="facebookAppID"
                          onChange={(e) => this.allInputValue(e)}
                        />
                      </div>
                      <div className="input-content">
                        <NcInput
                          label={snsModtranslator('SNS.INPUT_LABEL_FACEBOOK_SECRET')}
                          leftLabel
                          className="user-input"
                          inputRef={(ref) => {
                            this.facebookAppSecret = ref;
                          }}
                          type="text"
                          name="text"
                          defaultValue={facebookAppSecret}
                          errorMessage={
                            facebookAppSecretError &&
                            snsModtranslator('SNS.SNS_ERROR_MSG.FACEBOOK_APP_SECRET')
                          }
                          placeholder={snsModtranslator(
                            'SNS.FACEBOOK_APP_SECRETE_PLACEHOLDER'
                          )}
                          name="facebookAppSecret"
                          onChange={(e) => this.allInputValue(e)}
                        />
                      </div>
                      <div className="input-content">
                        <NcInput
                          label={snsModtranslator('SNS.FACEBOOK_APP_ACCESS_TOKEN')}
                          leftLabel
                          className="user-input"
                          inputRef={(ref) => {
                            this.facebookAppToken = ref;
                          }}
                          type="text"
                          name="text"
                          defaultValue={facebookAppToken}
                          errorMessage={
                            facebookAppTokenError &&
                            snsModtranslator(
                              'SNS.SNS_ERROR_MSG.FACEBOOK_APP_ACCESS_TOKEN'
                            )
                          }
                          placeholder={snsModtranslator(
                            'SNS.FACEBOOK_APP_ACCESS_TOKEN_PLACEHOLDER'
                          )}
                          name="facebookAppToken"
                          onChange={(e) => this.allInputValue(e)}
                        />
                      </div>
                    </div>
                    <div className="twitter-section">
                      <div className="top-head">
                        <img src={Twitter} alt="twitter-icon" />
                        <span className="head-title">
                          {snsModtranslator('SNS.TWITTER_TITLE')}
                        </span>
                      </div>
                      <div className="input-container">
                        <div className="input-content">
                          <NcInput
                            label={snsModtranslator('SNS.TWITTER_CLIENT_API_INPT')}
                            leftLabel
                            className="user-input"
                            inputRef={(ref) => {
                              this.twitterApiKey = ref;
                            }}
                            type="text"
                            name="text"
                            defaultValue={twitterApiKey}
                            errorMessage={
                              twitterApiKeyError &&
                              snsModtranslator('SNS.SNS_ERROR_MSG.TWITTER_API_KEY')
                            }
                            placeholder={snsModtranslator(
                              'SNS.TWITTER_API_KEY_PLACEHOLDER'
                            )}
                            name="twitterApiKey"
                            onChange={(e) => this.allInputValue(e)}
                          />
                        </div>
                        <div className="input-content">
                          <NcInput
                            label={snsModtranslator('SNS.TWITTER_APP_SECRET')}
                            leftLabel
                            className="user-input"
                            inputRef={(ref) => {
                              this.twitterAppSecret = ref;
                            }}
                            type="text"
                            name="text"
                            defaultValue={twitterAppSecret}
                            errorMessage={
                              twitterAppSecretError &&
                              snsModtranslator(
                                'SNS.SNS_ERROR_MSG.TWITTER_APP_SECRET'
                              )
                            }
                            placeholder={snsModtranslator(
                              'SNS.TWITTER_APP_SECRET_PLACEHOLDER'
                            )}
                            name="twitterAppSecret"
                            onChange={(e) => this.allInputValue(e)}
                          />
                        </div>
                        <div className="input-content">
                          <NcInput
                            label={snsModtranslator('SNS.TWITTER_ACCESS_TOKEN')}
                            leftLabel
                            className="user-input"
                            inputRef={(ref) => {
                              this.twitterAccessToken = ref;
                            }}
                            type="text"
                            name="text"
                            defaultValue={twitterAccessToken}
                            errorMessage={
                              twitterAccessTokenError &&
                              snsModtranslator(
                                'SNS.SNS_ERROR_MSG.TWITTER_ACCESS_TOKEN'
                              )
                            }
                            placeholder={snsModtranslator(
                              'SNS.TWITTER_ACCESS_TOKEN_PLACEHOLDER'
                            )}
                            name="twitterAccessToken"
                            onChange={(e) => this.allInputValue(e)}
                          />
                        </div>
                        <div className="input-content">
                          <NcInput
                            label={snsModtranslator(
                              'SNS.TWITTER_ACCESS_TOKEN_SECRET'
                            )}
                            leftLabel
                            className="user-input"
                            inputRef={(ref) => {
                              this.twitterTokenSecret = ref;
                            }}
                            type="text"
                            name="text"
                            defaultValue={twitterTokenSecret}
                            errorMessage={
                              twitterTokenSecretError &&
                              snsModtranslator(
                                'SNS.SNS_ERROR_MSG.TWITTER_TOKEN_SECRET'
                              )
                            }
                            placeholder={snsModtranslator(
                              'SNS.TWITTER_ACCESS_TOKEN_SECRET_PLACEHOLDER'
                            )}
                            name="twitterTokenSecret"
                            onChange={(e) => this.allInputValue(e)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="line-section">
                      <div className="top-head">
                        <img src={Line} alt="line-icon" />
                        <span className="head-title">
                          {snsModtranslator('SNS.LINE_TITLE')}
                        </span>
                      </div>
                      <div className="input-container">
                        <div className="input-content">
                          <NcInput
                            label={snsModtranslator('SNS.LINE_CHANNEL_ID')}
                            leftLabel
                            className="user-input"
                            inputRef={(ref) => {
                              this.lineChannelId = ref;
                            }}
                            type="text"
                            name="text"
                            defaultValue={lineChannelId}
                            errorMessage={
                              lineChannelIdError &&
                              snsModtranslator('SNS.SNS_ERROR_MSG.LINE_CHANNEL_ID')
                            }
                            placeholder={snsModtranslator(
                              'SNS.LINE_CHANNEL_ID_PLACEHOLDER'
                            )}
                            name="lineChannelId"
                            onChange={(e) => this.allInputValue(e)}
                          />
                        </div>
                        <div className="input-content">
                          <NcInput
                            label={snsModtranslator('SNS.LINE_CHANNEL_SECRET')}
                            leftLabel
                            className="user-input"
                            inputRef={(ref) => {
                              this.lineChannelSecret = ref;
                            }}
                            type="text"
                            name="text"
                            defaultValue={lineChannelSecret}
                            errorMessage={
                              lineSecretError &&
                              snsModtranslator(
                                'SNS.SNS_ERROR_MSG.LINE_CHANNEL_SECRET'
                              )
                            }
                            placeholder={snsModtranslator(
                              'SNS.LINE_CHANNEL_SECRET_PLACEHOLDER'
                            )}
                            name="lineChannelSecret"
                            onChange={(e) => this.allInputValue(e)}
                          />
                        </div>
                        <div className="input-content">
                          <NcInput
                            label={snsModtranslator('SNS.LINE_CHANNEL_ACCESS_TOKEN')}
                            leftLabel
                            className="user-input"
                            inputRef={(ref) => {
                              this.lineChannelAccessToken = ref;
                            }}
                            type="text"
                            name="text"
                            defaultValue={lineChannelAccessToken}
                            errorMessage={
                              lineChannelAccessTokenError &&
                              snsModtranslator(
                                'SNS.SNS_ERROR_MSG.LINE_HANNEL_ACCESS_TOKEN'
                              )
                            }
                            placeholder={snsModtranslator(
                              'SNS.LINE_CHANNEL_ACCESS_TOKEN_PLACEHOLDER'
                            )}
                            name="lineChannelAccessToken"
                            onChange={(e) => this.allInputValue(e)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="submit-button">
                    <Commonbutton
                      className="primary-medium"
                      disabled={isDataProcessing}
                      onClick={() => (isDataProcessing ? {} : this.saveSNSList())}
                    >
                      {snsModtranslator('SNS.BUTTON_TEXT')}
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(SystemSnsSettings));
