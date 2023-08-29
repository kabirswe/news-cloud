import React, {Component} from 'react';
import {Route, Redirect, withRouter} from 'react-router-dom';
import {Label} from 'reactstrap';
import {ToastContainer, toast} from 'react-toastify';
import {connect} from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
import './styles.scss';
import {authModtranslator} from '../modLocalization';
import Inputfield from '../../../common-components/inputfield/Inputfield';
import Commonbutton from '../../../common-components/button/Button';
import {images} from '../mod-constants/images';
import RequiredMessage from '../../../common-components/RequiredMessage';
import {
  validatePassword,
  validateEmail,
  isJapaneseText
} from '../../../helper/index';
import PasswordProgressBar from '../components/passwordProgressBar';
import AxiosService from '../../../networks/AxiosService';
import ApiService from '../../../networks/ApiServices';
import {
  ID_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  TOKEN_NAME_SEPARETOR
} from '../mod-constants/authConstants';

import Toast from '../../../common-components/Toast';
import NcInput from '../../../common-components/NcInput';
import path from '../../../routes/path';
const queryString = require('query-string');

class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      hasId: false,
      hasFullName: false,
      hasPassword: false,
      hasConfirmPassword: false,
      hasServerError: false,
      hasAllValueValid: false,
      hasUserIdSuccess: false,
      isValidToken: false,
      isAttemptTokenVerify: false,
      userFullName: '',
      userIdMessage: '',
      idOrEmail: '',
      maxLength: ID_MAX_LENGTH,
      isDataProcessing: false,
      hasCheckPasswordError: '',
      error: {
        idOrEmail: '',
        fullName: '',
        password: '',
        confirmPassword: ''
      }
    };
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChangePasswordValue = (e) => {
    const password = e.target.value;
    let hasCheckPasswordError = validatePassword(password);
    if (!password) {
      this.setState({
        password,
        hasConfirmPassword: false,
        error: {
          ...this.state.error,
          password: ''
        },
        hasPassword: true,
        hasCheckPasswordError: ''
      });

      return;
    }

    if (password.length <= 7) {
      this.setState({
        password,
        hasConfirmPassword: false,
        error: {
          ...this.state.error,
          password: ''
        },
        hasPassword: true,
        hasCheckPasswordError: hasCheckPasswordError
      });
    } else if (password.length > 32) {
      this.setState({
        password,
        hasConfirmPassword: false,
        error: {
          ...this.state.error,
          password: ''
        },
        hasPassword: true,
        hasCheckPasswordError: hasCheckPasswordError
      });
    } else if (hasCheckPasswordError == false) {
      this.setState({
        password,
        hasConfirmPassword: false,
        error: {
          ...this.state.error,
          password: ''
        },
        hasPassword: true,
        hasCheckPasswordError: authModtranslator(
          'REGISTRATION.PASSWORD_LENGTH_ERROR'
        )
      });
    } else {
      this.setState({
        password,
        hasConfirmPassword: false,
        error: {
          ...this.state.error,
          password: ''
        },
        hasPassword: false,
        hasCheckPasswordError: ''
      });
    }
  };

  onChangeIdValue = (e) => {
    const input = e.target.value;
    // return
    const emailPattern = /\w+@\w+/;
    // check max length for email or id
    this.setState({
      idOrEmail: input
    });
    if (!input) {
      this.setState({
        hasId: true,
        error: {...this.state.error, idOrEmail: ''},
        userIdMessage: '',
        hasUserIdSuccess: false
      });
    } else {
      this.setState({
        hasId: false,
        error: {
          ...this.state.error,
          idOrEmail: ''
        },
        userIdMessage: '',
        hasUserIdSuccess: false
      });
    }
  };

  idOrEmailValidation = (e) => {
    const input = e.target.value;
    const idPattern = /^[\w-]+$/;
    // input is id type
    if (idPattern.test(input) && !isJapaneseText(input)) {
      // if local check pass go for server validation

      this.setState({
        error: {
          ...this.state.error,
          idOrEmail: ''
        }
      });
      this.checkUserName(input);
    } else if (!this.inputUsername.value) {
      this.setState({
        // id not valid
        hasId: false,
        error: {
          ...this.state.error,
          idOrEmail: ''
        }
      });
    }
    // else {
    //   this.setState({
    //     // id not valid
    //     hasId: true,
    //     error: {
    //       ...this.state.error,
    //       idOrEmail: authModtranslator('REGISTRATION.ID_NOT_VALID')
    //     }
    //   });
    // }
  };

  onChangeFullNameValue = (e) => {
    this.setState({
      hasFullName: false,
      userFullName: e.target.value,
      error: {
        ...this.state.error,
        fullName: ''
      }
    });
  };

  validateFullName = (e) => {
    const fullName = e.target.value;
    if (!fullName) {
      // name is required
      this.setState({
        hasFullName: false,
        error: {
          ...this.state.error,
          fullName: ''
        }
      });
    }
  };

  onChangePasswordMatching = () => {
    this.setState({
      hasConfirmPassword: false,
      error: {
        ...this.state.error,
        confirmPassword: ''
      }
    });
  };

  isPasswordSame = (e) => {
    const confirmPassword = e.target.value;
    if (!confirmPassword) {
      this.setState({
        hasConfirmPassword: false,
        error: {
          ...this.state.error,
          confirmPassword: ''
        }
      });
      return;
    }
    if (this.inputPassword.value !== confirmPassword) {
      this.setState({
        hasConfirmPassword: true,
        error: {
          ...this.state.error,
          confirmPassword: authModtranslator('REGISTRATION.PASSWORD_NOT_SAME')
        }
      });
    }
  };

  checkUserName = (callback) => {
    const self = this;
    const token = queryString.parse(window.location.search);
    const userName = {
      username: this.inputUsername.value
    };
    AxiosService.post(
      ApiService.CHECK_REGISTRATION_USERNAME_URL + token.token,
      userName,
      false
    )
      .then(() => {
        self.setState({
          userIdMessage: '',
          hasUserIdSuccess: false,
          isDataProcessing: false
        });
        typeof callback === 'function' && callback();
      })
      .catch((error) => {
        if (error.response) {
          // Toast.error(error.response.data.error);
          self.setState({
            // userIdMessage: authModtranslator('REGISTRATION.EMAIL_OR_ID_EXISTS'),
            userIdMessage: error.response.data.message,
            hasUserIdSuccess: true,
            hasId: true,
            isDataProcessing: false
          });
        }
        typeof callback === 'function' && callback();
      });
  };

  handleOnBlur = (event) => {
    const fieldType = event.target.name;
    if (fieldType === 'password' && !this.inputPassword.value) {
      this.setState({
        hasPassword: false,
        error: {
          ...this.state.error,
          password: ''
        }
      });
    }
  };

  onSubmit = (event) => {
    const token = queryString.parse(window.location.search);
    const self = this;
    const error = {};
    let errorFlag = false;
    let passwordError = this.state.hasPassword;
    let exp = /^[\w-]+$/;
    this.setState({
      isDataProcessing: true
    });
    this.checkUserName(() => {
      if (!this.inputUsername.value) {
        error.idOrEmail = authModtranslator('REGISTRATION.EMAIL_OR_ID_REQUIRED');
        this.setState({
          hasId: true,
          hasUserIdSuccess: false
        });
        errorFlag = true;
      } else if (
        !exp.test(this.inputUsername.value) ||
        this.inputUsername.value.length > 100
      ) {
        error.idOrEmail = authModtranslator('REGISTRATION.ID_NOT_VALID');
        this.setState({
          hasId: true
        });
        errorFlag = true;
      }
      if (!this.inputFullName.value) {
        error.fullName = authModtranslator('REGISTRATION.FULL_NAME_REQUIRED');
        this.setState({
          hasFullName: true
        });
        errorFlag = true;
      }
      if (!this.inputPassword.value) {
        error.password = authModtranslator('REGISTRATION.PASSWORD_FILED_REQUIRED');
        this.setState({
          hasPassword: true
        });
        errorFlag = true;
        passwordError = true;
      }
      if (!this.inputConfirmPassword.value) {
        error.confirmPassword = authModtranslator(
          'REGISTRATION.CONFIRM_PASSWORD_FILED_REQUIRED'
        );
        this.setState({
          hasConfirmPassword: true
        });
        errorFlag = true;
      }
      if (
        this.inputConfirmPassword.value &&
        this.inputPassword.value !== this.inputConfirmPassword.value
      ) {
        error.confirmPassword = authModtranslator('REGISTRATION.PASSWORD_NOT_SAME');
        this.setState({
          hasConfirmPassword: true
        });
        errorFlag = true;
      }
      // else {
      //   this.setState({
      //     hasAllValueValid: true
      //   });
      // }
      if (errorFlag || passwordError) {
        // all input must be valid otherwise show the error and abort
        this.setState({
          error,
          isDataProcessing: false
        });
        return;
      } else {
        this.setState({
          hasAllValueValid: true
        });
      }
      this.setState({isDataProcessing: true});
      const signUpData = {
        email_token: token.token,
        username: this.inputUsername.value,
        fullname: this.inputFullName.value,
        password: this.inputPassword.value,
        password_confirmation: this.inputConfirmPassword.value
      };
      const passwordStrength = {
        passwordString: this.inputPassword.value
      };
      let passwordStrengthFlag = 10;
      AxiosService.post(
        ApiService.CHECK_PASSSWORD_STRENGTH + token.token,
        passwordStrength,
        false
      )
        .then((response) => {
          passwordStrengthFlag = response.data.flag;
          if (
            this.state.hasAllValueValid &&
            !(
              passwordStrengthFlag == 4 ||
              passwordStrengthFlag == 5 ||
              passwordStrengthFlag == 6
            )
          ) {
            AxiosService.post(ApiService.USER_REGISTER, signUpData, false)
              .then((res) => {
                // Toast.success(res.data.message.message);
                setTimeout(() => {
                  this.props.history.push('/login');
                }, 2000);
              })
              .catch((error) => {
                this.setState({isDataProcessing: false});
                if (error.response) {
                  if (!error.response.data.error.length) {
                    Toast.error(error.response.data.message);
                  } else {
                    // Toast.error(error.response.data.error[0]);
                  }

                  // window.scroll(0, 0);
                }
              });
          } else {
            this.setState({
              hasPassword: true
            });
          }
          this.setState({isDataProcessing: false});
        })
        .catch((error) => {
          this.setState({isDataProcessing: false});
          // Toast.error(error.response.data.message)
          // window.scroll(0,0)
        });
      event.preventDefault();
    });
  };

  componentDidMount() {
    // let {loginData} = this.props || {};
    // if(loginData && loginData.id){
    //   localStorage.setItem('activeMenu', 'content');
    //   this.props.history.push(path.content);
    // }
    Toast.clear();
    const URL = window.location.href;
    const param = URL.split(TOKEN_NAME_SEPARETOR);
    if (param.length === 1) {
      this.setState({inValidToken: true});
      this.setState({isAttemptTokenVerify: true, isValidToken: false});
    } else if (param.length > 1) {
      const token = param[1];
      AxiosService.get(`${ApiService.VERIFY_EMAIL_TOKEN}${token}`, {}, false)
        .then((response) => {
          const result = response.data;
          this.setState(() => ({
            isValidToken: result.status,
            isAttemptTokenVerify: true,
            userFullName: result.data.fullname || ''
          }));
        })
        .catch((error) => {
          this.setState({isAttemptTokenVerify: true, isValidToken: false});
        });
    }
    setTimeout(() => {
      if (document.getElementById('submitRegistration')) {
        document.body.addEventListener('keyup', (event) => {
          event.preventDefault();
          if (event.keyCode === 13) {
            if (document.getElementById('submitRegistration')) {
              document.getElementById('submitRegistration').click();
            }
          }
        });
      }
    }, 1000);
  }

  render() {
    const {
      hasConfirmPassword,
      hasId,
      hasFullName,
      hasPassword,
      hasUserIdSuccess,
      userIdMessage,
      maxLength,
      idOrEmail,
      error,
      isAttemptTokenVerify,
      isValidToken,
      hasCheckPasswordError,
      userFullName,
      isDataProcessing
    } = this.state;
    return (
      <div className="app flex-row align-items-center">
        <Toast />
        {isAttemptTokenVerify && (
          <>
            {!isValidToken ? (
              <Redirect to="/token-expired" />
            ) : (
              <>
                <div className="auth-container-main-registration">
                  <div className="auth-container">
                    <div className="auth-container-logo">
                      <img src={images.loginLogo} alt="logo" />
                    </div>
                    <div className="auth-container-content">
                      <div className="auth-input-form justify-content-center">
                        <div className="title">
                          {authModtranslator('REGISTRATION.PAGE_TITLE')}
                        </div>
                        <div
                          className={`common-inp inp-loginInput ${hasId && 'error'}`}
                        >
                          <NcInput
                            isRequired
                            label={authModtranslator('REGISTRATION.EMAIL_LABEL')}
                            inputRef={(ref) => {
                              this.inputUsername = ref;
                            }}
                            maxLength="100"
                            type="text"
                            placeholder={authModtranslator(
                              'REGISTRATION.PLACEHOLDER_TEXT'
                            )}
                            name="username"
                            value={idOrEmail}
                            autoComplete="off"
                            onBlur={this.idOrEmailValidation}
                            onChange={(e) => this.onChangeIdValue(e)}
                            error={hasUserIdSuccess || error.idOrEmail}
                            errorMessage={
                              hasUserIdSuccess ? userIdMessage : error.idOrEmail
                            }
                          />
                          {/* <Inputfield
                            inputRef={(ref) => {
                              this.inputUsername = ref;
                            }}
                            maxLength="100"
                            textType="text"
                            placeHolder={authModtranslator(
                              'REGISTRATION.PLACEHOLDER_TEXT'
                            )}
                            inputName="username"
                            inputValue={idOrEmail}
                            autoComplete="off"
                            blurCallback={this.idOrEmailValidation}
                            onchangeCallback={(e) => this.onChangeIdValue(e)}
                          /> */}
                        </div>
                        {/* {hasUserIdSuccess && (
                          <RequiredMessage
                            customClass="custom-margin-three"
                            text={userIdMessage}
                          />
                        )}
                        {error.idOrEmail && (
                          <RequiredMessage
                            customClass="custom-margin-three"
                            text={error.idOrEmail}
                          />
                        )} */}

                        {/* <Label className="com-inp-label">
                          {authModtranslator('REGISTRATION.NAME_LABEL')}
                          <span className="required">*</span>
                        </Label> */}
                        <div
                          className={`common-inp inp-loginInput ${hasFullName &&
                            'error'}`}
                        >
                          <NcInput
                            isRequired
                            label={authModtranslator('REGISTRATION.NAME_LABEL')}
                            inputRef={(ref) => {
                              this.inputFullName = ref;
                            }}
                            type="text"
                            maxLength="100"
                            placeholder={authModtranslator(
                              'REGISTRATION.PLACEHOLDER_TEXT'
                            )}
                            name="fullname"
                            onBlur={this.validateFullName}
                            onChange={(e) => this.onChangeFullNameValue(e)}
                            value={userFullName}
                            error={error.fullName}
                            errorMessage={error.fullName}
                          />
                          {/* <Inputfield
                            inputRef={(ref) => {
                              this.inputFullName = ref;
                            }}
                            textType="text"
                            maxLength="100"
                            placeHolder={authModtranslator(
                              'REGISTRATION.PLACEHOLDER_TEXT'
                            )}
                            inputName="fullname"
                            blurCallback={this.validateFullName}
                            onchangeCallback={(e) => this.onChangeFullNameValue(e)}
                            defaultValue={userFullName}
                          /> */}
                        </div>
                        {/* {error.fullName && (
                          <RequiredMessage
                            customClass="custom-margin-three"
                            text={error.fullName}
                          />
                        )} */}

                        {/* <Label className="com-inp-label">
                          {authModtranslator('REGISTRATION.PASSWORD_LABEL')}
                          <span className="required">*</span>
                        </Label> */}
                        <div className={`common-inp ${hasPassword && 'error'}`}>
                          <NcInput
                            isRequired
                            label={authModtranslator('REGISTRATION.PASSWORD_LABEL')}
                            type="password"
                            maxLength="32"
                            inputRef={(ref) => {
                              this.inputPassword = ref;
                            }}
                            placeholder={authModtranslator(
                              'REGISTRATION.PLACEHOLDER_TEXT'
                            )}
                            name="password"
                            onBlur={this.handleOnBlur}
                            onChange={(e) => this.onChangePasswordValue(e)}
                            error={hasCheckPasswordError || error.password}
                            errorMessage={
                              hasCheckPasswordError
                                ? hasCheckPasswordError
                                : error.password
                            }
                          />
                          {/* <Inputfield
                            textType="password"
                            inputRef={(ref) => {
                              this.inputPassword = ref;
                            }}
                            placeHolder={authModtranslator(
                              'REGISTRATION.PLACEHOLDER_TEXT'
                            )}
                            inputName="password"
                            blurCallback={this.handleOnBlur}
                            onchangeCallback={(e) => this.onChangePasswordValue(e)}
                          /> */}
                          {/* {hasCheckPasswordError && (
                            <RequiredMessage
                              customClass="custom-margin-three"
                              text={hasCheckPasswordError}
                            />
                          )} */}
                        </div>
                        <PasswordProgressBar data={this.state.password} />
                        {/* {error.password && (
                          <RequiredMessage
                            customClass="custom-margin-three"
                            text={error.password}
                          />
                        )} */}

                        {/* <Label className="com-inp-label">
                          {authModtranslator('REGISTRATION.RE_PASSWORD_LABEL')}
                          <span className="required">*</span>
                        </Label> */}
                        <div
                          className={`common-inp ${hasConfirmPassword && 'error'}`}
                        >
                          <NcInput
                            isRequired
                            label={authModtranslator(
                              'REGISTRATION.RE_PASSWORD_LABEL'
                            )}
                            type="password"
                            maxLength="32"
                            inputRef={(ref) => {
                              this.inputConfirmPassword = ref;
                            }}
                            placeholder={authModtranslator(
                              'REGISTRATION.PLACEHOLDER_TEXT'
                            )}
                            name="rePassword"
                            onBlur={this.isPasswordSame}
                            onChange={(e) => this.onChangePasswordMatching(e)}
                            error={error.confirmPassword}
                            errorMessage={error.confirmPassword}
                          />
                          {/* <Inputfield
                            textType="password"
                            inputRef={(ref) => {
                              this.inputConfirmPassword = ref;
                            }}
                            placeHolder={authModtranslator(
                              'REGISTRATION.PLACEHOLDER_TEXT'
                            )}
                            inputName="rePassword"
                            blurCallback={this.isPasswordSame}
                            onchangeCallback={(e) =>
                              this.onChangePasswordMatching(e)
                            }
                          /> */}
                        </div>
                        {/* {error.confirmPassword && (
                          <RequiredMessage
                            customClass="custom-margin-three"
                            text={error.confirmPassword}
                          />
                        )} */}
                        <div className="input-button">
                          <div
                            className="common-button"
                            // onClick={(e) =>
                            //   isDataProcessing ? {} : this.onSubmit(e)
                            // }
                          >
                            {/* callback={this.onSubmit} */}
                            <Commonbutton
                              className="primary"
                              disabled={isDataProcessing}
                              id="submitRegistration"
                              onClick={(e) =>
                                isDataProcessing ? {} : this.onSubmit(e)
                              }
                            >
                              {authModtranslator('REGISTRATION.BUTTON_TEXT')}
                            </Commonbutton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    loginData: state.authReducer.loginData
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default connect(mapStateToProps, null)(withRouter(Registration));
