import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link, withRouter} from 'react-router-dom';
import './styles.scss';
import {authModtranslator} from '../modLocalization';
import Commonbutton from '../../../common-components/button/Button';
import {images} from '../mod-constants/images';
import RequiredMessage from '../../../common-components/RequiredMessage';
import {fieldInitialization, loginApi} from '../../../redux/actions/auth';
import {INPUT_MAX_LENGTH_100} from '../mod-constants/authConstants';
import path from '../../../routes/path';
import {setMenu} from '../../../redux/actions/common';
import NcInput from '../../../common-components/NcInput';
import {routePrepare} from '../../../redux/actions/auth'
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputError: {
        loginInput: false,
        password: false
      },
      enableLogin: false,
      apiError: '',
      loginInput: '',
      password: '',
      isDataProcessing: false
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.submitButton = null;
  }

  static getDerivedStateFromProps(props, state) {
    const data = {};
    if (props.apiError !== state.apiError) {
      data.apiError = props.apiError;
    }
    return data;
  }

  componentDidMount() {
    let {loginData} = this.props || {};
    if(loginData && loginData.id){
      console.log('component did mount ', loginData.id)
      localStorage.setItem('activeMenu', 'content');
      this.props.history.push(path.content);
      return
    }
    this.props.fieldInitialization({apiError: ''});
    this.props.fieldInitialization({loginInput: ''});
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.isRoutePrepared !== this.props.isRoutePrepared){
      this.props.getProtectedRoutes(this.props.permissions || null)
      console.log('redirecting to content', prevProps.isRoutePrepared, this.props.isRoutePrepared)
      this.props.isRoutePreparedAction(false)
      this.props.history.push(path.content);
    }
   
  }

  onChangeValue = (event) => {
    const {name, value} = event.target;
    const {apiError} = this.state;
    if (apiError) {
      this.props.fieldInitialization({apiError: ''});
    }
    this.setState({[name]: value}, () => {
      this.checkValidation(name);
    });
  };

  onKeyDownHandler = (e) => {
    if (e.keyCode === 13) {
      if (this.submitButton) {
        this.submitButton.click();
        this.submitButton.focus();
      }
    }
  };

  checkValidation = (inputField) => {
    const inputError = {...this.state.inputError};
    if (inputField === 'loginInput') {
      inputError.loginInput = !this.state.loginInput.trim().length;
    }
    if (inputField === 'password') {
      inputError.password = !this.state.password.trim().length;
    }
    this.setState({inputError}, () => {
      if (!this.state.inputError.loginInput && !this.state.inputError.password) {
        this.setState({enableLogin: true});
      }
    });
  };

  handleOnBlur = (event) => {
    const filedType = event.target.name;
    if (filedType === 'loginInput') {
      this.setState({
        inputError: {
          ...this.state.inputError,
          loginInput: false
        }
      });
    }
    if (filedType === 'password') {
      this.setState({
        inputError: {
          ...this.state.inputError,
          password: false
        }
      });
    }

    this.props.fieldInitialization({apiError: ''});
  };

  handleLogin = async (event) => {
    this.setState({isDataProcessing: true});
    const {inputError, loginInput, password} = this.state;
    if (!loginInput || !password) {
      this.props.fieldInitialization({
        apiError: {message: authModtranslator('LOGIN.EMAIL_PASSWORD_REQUIRED')}
      });
      this.setState({
        inputError: {loginInput: true, password: true},
        isDataProcessing: false
      });
      return;
    }
    if (!inputError.loginInput || !inputError.password) {
      this.props.fieldInitialization({loginInput: this.state.loginInput});
      const param = {
        username: this.state.loginInput,
        password: this.state.password
      };
      this.props.loginApi(param);
      setTimeout(() => {
        this.setState({isDataProcessing: false});
      }, 1500);
    } else {
      const inputError = {...this.state.inputError};
      inputError.loginInput = true;
      inputError.password = true;
      this.setState({inputError});
    }
  };

  render() {
    const {apiError, inputError, isDataProcessing} = this.state;
    return (
      <div className="app flex-row align-items-center" id="loginArea">
        <div className="auth-container-main-login">
          <div className="auth-container">
            <div className="auth-container-logo">
              <img src={images.loginLogo} alt="logo" />
            </div>
            <div className="auth-container-content">
              <div className="auth-input-form justify-content-center">
                <NcInput
                  label={authModtranslator('LOGIN.EMAIL_LABEL')}
                  type="text"
                  placeholder={authModtranslator('LOGIN.EMAIL_PLACEHOLDER')}
                  name="loginInput"
                  maxLength={INPUT_MAX_LENGTH_100}
                  onBlur={this.handleOnBlur}
                  onChange={(event) => this.onChangeValue(event)}
                  error={inputError.loginInput}
                  className="login-label"
                  inputRef={(input) => (this.emailOrId = input)}
                  onKeyDown={this.onKeyDownHandler}
                />
                <NcInput
                  type="password"
                  placeholder={authModtranslator('LOGIN.PASSWORD_PLACEHOLDER')}
                  name="password"
                  onBlur={this.handleOnBlur}
                  onChange={(event) => this.onChangeValue(event)}
                  label={authModtranslator('LOGIN.PASSWORD_LABEL')}
                  error={inputError.password}
                  errorMessage={apiError.message}
                  className="login-label"
                  inputRef={(input) => (this.password = input)}
                  onKeyDown={this.onKeyDownHandler}
                />
                {/* {!!apiError && <RequiredMessage text={apiError.message} />} */}
                <div className="com-inp-label forgot-psw-link">
                  <Link to={path.forgot}>
                    {authModtranslator('LOGIN.FORGET_PASSWORD_TEXT')}
                  </Link>
                </div>
                <div className="input-button">
                  <div className="common-button" id="submitLogin">
                    <Commonbutton
                      className="primary common-button"
                      type="button"
                      inputRef={(ref) => {
                        this.submitButton = ref;
                      }}
                      disabled={isDataProcessing}
                      onClick={() => (isDataProcessing ? {} : this.handleLogin())}
                    >
                      {authModtranslator('LOGIN.LOGIN_BUTTON_TEXT')}
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
function mapStateToProps(state) {
  return {
    permissions: state.authReducer.permissions,
    apiError: state.authReducer.apiError,
    loginData: state.authReducer.loginData,
    isRoutePrepared: state.authReducer.isRoutePrepared
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fieldInitialization: (key, value) => dispatch(fieldInitialization(key, value)),
    loginApi: (data) => dispatch(loginApi(data)),
    setMenu: (menu) => dispatch(setMenu(menu)),
    isRoutePreparedAction: (flag) => dispatch({type: "ROUTE_PREPARED_SUCCESS", flag: false})
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Login));
