import React, {Component} from 'react';
import {Label} from 'reactstrap';
import {connect} from 'react-redux';
import {Route, Redirect, withRouter} from 'react-router-dom';
import './styles.scss';
import {translator} from '../../../localizations';
import {authModtranslator} from '../modLocalization';
import Inputfield from '../../../common-components/inputfield/Inputfield';
import Commonbutton from '../../../common-components/button/Button';
import {images} from '../mod-constants/images';
import RequiredMessage from '../../../common-components/RequiredMessage';
import {validateEmail} from '../../../helper/index';
import AxiosService from '../../../networks/AxiosService';
import ApiServices from '../../../networks/ApiServices';
import getErrorMessage from '../../../app-constants/ServerErrorInfo';
import NcInput from '../../../common-components/NcInput';
import path from '../../../routes/path';
class ForgetPass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      hasError: false,
      apiSuccess: false,
      apiError: '',
      isDataProcessing: false,
      showErrorMsg: false
    };
    this.onChangeEmailValue = this.onChangeEmailValue.bind(this);
    this.submitButton = null;
  }

  handleOnBlur = (e) => {
    const email = e === undefined ?this.state.email:e.target.value.trim();
    this.setState({email}, () => {
      if (!email) {
        this.setState({
          hasError: false,
          apiSuccess: '',
          apiError: '',
          isDataProcessing: false,
          showErrorMsg: false
        });
      } else if (validateEmail(email)) {
        this.setState({
          hasError: false,
          apiError: '',
          showErrorMsg:false
        });
      } else {
        this.setState({
          hasError: true,
          apiSuccess: '',
          showErrorMsg: true,
          apiError: {
            message: authModtranslator('FORGOT.EMAIL_NOT_VALID')
          }
        });
      }
    });
  };

  onChangeEmailValue = (e) => {
    this.setState({
      email: e.target.value,
      showErrorMsg: false,
      hasError: false,
      apiError: false
    })
    if(e.target.value==""){
      this.setState({
        hasError:false,
        apiError:'',
        showErrorMsg: false
      })
    }
  };
  // handleOnBlur = () => {
  //   // this.setState({
  //   //   // hasError: false,
  //   //   apiError: ''
  //   // });
  // };

  handleSend = () => {
    this.handleOnBlur();
    this.setState({showErrorMsg: true});
    setTimeout(() => {
    if(!this.state.hasError){
      this.setState({isDataProcessing: true});
      const param = {email: this.state.email};
      if (this.state.email && !this.state.hasError) {
        this.callApi(param);
      } else {
        this.setState({
          hasError: true,
          apiSuccess: '',
          apiError: {message: authModtranslator('FORGOT.EMAIL_REQUIRED')},
          isDataProcessing: false,
          showErrorMsg:true
        });
      }
    }
    }, 100);
  }

  callApi = (param) => {
    const url = ApiServices.AUTH_FORGOT;
    AxiosService.post(url, param, false)
      .then((response) => {
        if (response.data) {
          this.setState({
            apiError: '',
            apiSuccess: response.data,
            isDataProcessing: false,
            showErrorMsg: false
          });
        }
      })
      .catch((err) => {
        if (err) {
          const apiError = getErrorMessage(err); // err.response.data
          this.setState({
            apiError: apiError,
            apiSuccess: '',
            isDataProcessing: false,
            showErrorMsg: true
          });
        }
      });
  };

  componentDidMount(){
    // let {loginData} = this.props || {};
    // if(loginData && loginData.id){
    //   localStorage.setItem('activeMenu', 'content');
    //   this.props.history.push(path.content);
    // }
  }
  render() {
    const {
      hasError,
      apiError,
      apiSuccess,
      isDataProcessing,
      showErrorMsg
    } = this.state;
    return (
      <div className="app flex-row align-items-center">
        <div className="auth-container-main-forgot">
          <div className="auth-container">
            <div className="auth-container-logo">
              <img src={images.loginLogo} alt="logo" />
            </div>
            <div className="auth-container-content forgot-container-content">
              <div className="auth-input-form justify-content-center">
                <div className="title">{authModtranslator('FORGOT.PAGE_TITLE')}</div>
                <div
                  className={`common-inp inp-email ${(hasError || apiError) &&
                    'error'}`}
                >
                  <NcInput
                    className="forget-password-email"
                    label={authModtranslator('FORGOT.EMAIL_LABEL')}
                    type="text"
                    placeholder={authModtranslator(
                      'LOGIN.EMAIL_FORGET_PASSWORD_PLACEHOLDER'
                    )}
                    name="email"
                    onBlur={this.handleOnBlur}
                    onChange={this.onChangeEmailValue}
                    value={this.state.email}
                    inputRef={(ref) => {
                      this.inputEmail = ref;
                    }}
                    error={showErrorMsg && (apiError || apiError.errors)}
                    errorMessage={
                      showErrorMsg &&
                      (apiError.errors
                        ? apiError.errors.email[0] && apiError.errors.email[0]
                        : apiError.message)
                    }
                  />
                </div>
                {!!apiSuccess && (
                  <div>
                    <Label className="text-msg-success">{apiSuccess.message}</Label>
                  </div>
                )}
                <div className="input-button">
                  <div className="common-button">
                    <Commonbutton
                      className="primary"
                      onClick={() => (isDataProcessing ? {} : this.handleSend())}
                      disabled={isDataProcessing}
                      inputRef={(ref) => (this.submitButton = ref)}
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

//export default ForgetPass;
function mapStateToProps(state) {
  return {
    loginData: state.authReducer.loginData
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default connect(mapStateToProps, null)(withRouter(ForgetPass));