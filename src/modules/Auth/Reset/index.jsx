import React, {Component} from 'react';
import {Route, Redirect, withRouter} from 'react-router-dom';
import {Label} from 'reactstrap';
import './styles.scss';

import {translator} from '../../../localizations';
import {authModtranslator} from '../modLocalization';
import Inputfield from '../../../common-components/inputfield/Inputfield';
import Commonbutton from '../../../common-components/button/Button';
import {images} from '../mod-constants/images';
import RequiredMessage from '../../../common-components/RequiredMessage';
import {validatePassword} from '../../../helper/index';
import PasswordProgressBar from '../components/passwordProgressBar';
import ApiServices from '../../../networks/ApiServices';
import AxiosService from '../../../networks/AxiosService';
import getErrorMessage from '../../../app-constants/ServerErrorInfo';
import {TOKEN_NAME_SEPARETOR} from '../mod-constants/authConstants';
import path from '../../../routes/path';
import NcInput from '../../../common-components/NcInput';

class ResetPass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      hasConfirmError: false,
      apiError: false,
      password: '',
      confirmPassword: '',
      apiSuccess: '',
      isValidToken: false,
      isAttemptTokenVerify: false,
      isDataProcessing: false,
      hasCheckPasswordError:''
    };
    this.onChangePasswordValue = this.onChangePasswordValue.bind(this);
    this.onChangeConfirmPasswordValue = this.onChangeConfirmPasswordValue.bind(this);
  }

  componentDidMount() {
    setTimeout(() => {
      if (document.getElementById('resetPassword')) {
        document.body.addEventListener('keyup', (event) => {
          event.preventDefault();
          if (event.keyCode === 13) {
            if (document.getElementById('resetPassword')) {
              document.getElementById('resetPassword').click();
            }
          }
        });
      }
    }, 1000);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.apiSuccess !== this.state.apiSuccess) {
      this.props.history.push(path.login);
    }
  }

  onChangePasswordValue = (e) => {
    const password = e.target.value;
    const hasCheckPasswordError = validatePassword(password);
    if (!password) {
      this.setState({
        password,
        apiError: '',
        hasCheckPasswordError: ''
      });

      return;
    }
    if(hasCheckPasswordError == false){
      this.setState({
        password,
        apiError: '',
        hasCheckPasswordError: authModtranslator('RESET.PASSWORD_LENGTH_ERROR')
      });
    }
    else if (password.length <= 7) {
      this.setState({
        password,
        apiError: '',
        hasCheckPasswordError: hasCheckPasswordError
      });
    } else if(password.length > 32){
      this.setState({
        password,
        apiError: '',
        hasCheckPasswordError: hasCheckPasswordError
      });
    }else {
      this.setState({
        password,
        apiError: '',
        hasCheckPasswordError: ''
      });
    }
  };

  onChangeConfirmPasswordValue = (e) => {
    const rePassword = e.target.value;
    const confirmPassword = this.inputPassword.value;
    this.setState({
      confirmPassword: rePassword,
      apiError: '',
      hasConfirmError: false
    });
  };

  onConfirmPasswordBlur = (event) => {
    const confirmPassword = this.inputPassword.value;
    const {value} = event.target;
    if (!value) {
      this.setState({
        hasConfirmError: false
      });
      return;
    }
    if (value !== confirmPassword) {
      this.setState({
        hasConfirmError: true
      });
    }
  };

  onPasswordBlur = (event) => {
    const {value} = event.target;
    if (!value) {
      this.setState({
        hasError: false
      });
    }
  };

  handleSend = () => {
    this.setState({isDataProcessing: true});
    const {password, confirmPassword} = this.state;
    let token;
    if (!!this.props.history.location.search) {
      const query = new URLSearchParams(this.props.history.location.search);
      token = query.get('token');
    }
    if (!this.state.password && !this.state.confirmPassword) {
      this.setState({
        hasError: true,
        hasConfirmError: true,
        isDataProcessing: false,
        apiError: {message: authModtranslator('RESET.PASSWORD_REQUIRED')}
      });
      return;
    }
    if (!this.state.password) {
      this.setState({
        hasError: true,
        hasConfirmError: false,
        isDataProcessing: false,
        apiError: {message: authModtranslator('RESET.PASSWORD_REQUIRED')}
      });
      return;
    }
    if (!this.state.confirmPassword) {
      this.setState({
        hasError: false,
        hasConfirmError: true,
        isDataProcessing: false,
        apiError: {message: authModtranslator('RESET.PASSWORD_REQUIRED')}
      });
      return;
    }
    if (password !== confirmPassword) {
      this.setState({
        apiError: {message: authModtranslator('RESET.PASSWORD_NOT_SAME')},
        isDataProcessing: false
      });
      return;
    }
    if(this.state.hasCheckPasswordError.length > 0){
      this.setState({
        hasError:true,
        isDataProcessing: false,
      })
      return;
    }
    if (this.state.password && this.state.confirmPassword && token) {
      const param = {
        password: this.state.password,
        password_confirmation: this.state.confirmPassword,
        token
      };

      this.callApiResetPass(param);
    } else {
      this.setState({
        hasError: !this.state.password,
        hasConfirmError: !this.state.confirmPassword,
        isDataProcessing: false
      });
    }
  };

  callApiResetPass = (param) => {
    const url = ApiServices.RESET_PASSWORD;
    AxiosService.post(url, param, false)
      .then((response) => {
        if (response.data) {
          this.setState({apiSuccess: response.data});
        }
        this.setState({isDataProcessing: false});
      })
      .catch((err) => {
        if (err) {
          const apiError = getErrorMessage(err); // err.response.data
          this.setState({apiError: apiError});
        }
        this.setState({isDataProcessing: false});
      });
  };

  render() {
    const {
      hasError,
      apiError,
      hasConfirmError,
      apiSuccess,
      hasCheckPasswordError,
      isAttemptTokenVerify,
      isValidToken,
      isDataProcessing
    } = this.state;
    return (
      <div className="app flex-row align-items-center">
        <div className="auth-container-main-reset">
          <div className="auth-container">
            <div className="auth-container-logo">
              <img src={images.loginLogo} alt="logo" />
            </div>
            <div className="auth-container-content reset-container-content">
              <div className="auth-input-form justify-content-center">
                <div className="title">{authModtranslator('RESET.PAGE_TITLE')}</div>
                {/* <Label className="com-inp-label">
                  {authModtranslator('RESET.INPUT_LABEL')}
                </Label> */}
                <div className={`common-inp reset ${hasError && 'error'}`}>
                  <NcInput
                    label={authModtranslator('RESET.INPUT_LABEL')}
                    inputRef={(ref) => {
                      this.inputPassword = ref;
                    }}
                    maxLength="32"
                    type="password"
                    placeholder={authModtranslator('RESET.PASSWORD_PLACEHOLDER')}
                    name="password"
                    onChange={this.onChangePasswordValue}
                    onBlur={this.onPasswordBlur}
                    error={hasCheckPasswordError}
                    errorMessage={hasCheckPasswordError}
                  />
                </div>
                <PasswordProgressBar data={this.state.password} />
                <div
                  className={`common-inp reset2`}
                >
                  <NcInput
                    inputRef={(ref) => {
                      this.inputConfirmPassword = ref;
                    }}
                    maxLength="32"
                    type="password"
                    placeholder={authModtranslator('RESET.RE_PASSWORD_PLACEHOLDER')}
                    name="rePassword"
                    onBlur={this.onConfirmPasswordBlur}
                    onChange={this.onChangeConfirmPasswordValue}
                    error={apiError || apiError.errors}
                    errorMessage={apiError?apiError.message:apiError.errors && apiError.errors.password[0]}
                  />
                </div>
                {!!apiSuccess && (
                  <div className="custom-margin-fourteen">
                    <Label className="text-msg-success">{apiSuccess.message}</Label>
                  </div>
                )}
                <div className="input-button">
                  <div
                    className="common-button"
                    // onClick={() => (isDataProcessing ? {} : this.handleSend())}
                    >
                    <Commonbutton className="primary" disabled={isDataProcessing}
                      id="resetPassword"
                      onClick={() => (isDataProcessing ? {} : this.handleSend())}
                    >
                      {translator('COMMON.BUTTON_SEND')}
                    </Commonbutton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(ResetPass);
