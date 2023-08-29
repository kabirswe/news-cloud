import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Label} from 'reactstrap';
import {ToastContainer, toast} from 'react-toastify';
import {withRouter} from 'react-router-dom';
import DefaultLayout from '../../../../containers/DefaultLayout';
import {translator} from '../../../../localizations';
import {profileModtranslator} from '../modLocalization';
import AxiosServices from '../../../../networks/AxiosService';
import ApiServices from '../../../../networks/ApiServices';
import Toast from '../../../../common-components/Toast';
import Loader from '../../../../common-components/Loader';
import RequiredMessage from '../../../../common-components/RequiredMessage';
import NcBreadcrumbs from '../../../../common-components/NcBreadcrumbs/ncBreadcrumbs';
import {updateUserName} from '../../../../redux/actions/auth';
import getErrorMessage from '../../../../app-constants/ServerErrorInfo';
import {
  // validateUsername,
  validateFullname,
  validatePasswordConfirmation,
  validateForm
} from '../../../../helper/userHelper';
import PasswordProgressBar from './component/PasswordProgressBar';

import {isJapaneseText, validatePassword} from '../../../../helper';
import {ID_MAX_LENGTH, EMAIL_MAX_LENGTH} from '../mod-constants/profileConstant';
import NcInput from '../../../../common-components/NcInput';
import ProfileStyle from './profile.module.scss';
import Commonbutton from '../../../../common-components/button/Button';

const formInputs = ['username', 'fullname', 'password', 'password_confirmation'];

class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      prevName: '',
      fullname: '',
      password: '',
      email: '',
      errorMsg: '',
      confirmPassword: '',
      isLoader: true,
      errors: {
        username: '',
        fullname: '',
        password: '',
        confirmPassword: ''
      },
      updateInProgress: false
    };
  }

  componentDidMount() {
    const userId = localStorage.getItem('currentUserID');
    AxiosServices.get(ApiServices.GET_PROFILE + userId, {}, false)
      .then((response) => {
        this.setState({
          username: response.data.data.username,
          prevName: response.data.data.username,
          fullname: response.data.data.fullname,
          email: response.data.data.email,
          isLoader: false
        });
      })
      .catch((error) => {
        let apiError = getErrorMessage(error);
        Toast.error(apiError.message);
        this.redirectToLogin(error);
      });
  }

  redirectToLogin(error = {}) {
    setTimeout(() => {
      if (error.response.status == 401) {
        this.props.history.push('/login');
      }
    }, 2000);
  }

  onChangeIdValue = (e) => {
    const input = e.target.value;
    // return

    this.setState({
      username: input,
      errors: {
        ...this.state.errors,
        username: ''
      }
    });
  };

  idOrEmailValidation = (e) => {
    const input = e.target.value;
    const idPattern = /^[\w-]+$/;
    // check if input is id type or email typ
    if (!input) {
      this.setState({
        errors: {
          ...this.state.errors,
          username: ''
        }
      });
      return;
    }
    if (idPattern.test(input) && !isJapaneseText(input)) {
      // if local check pass go for server validation
      this.setState({
        errors: {
          ...this.state.errors,
          username: ''
        }
      });

      if (input !== this.state.prevName) {
        this.checkUserNameUniqness(input);
      }
    } else {
      this.setState({
        // id not valid
        errors: {
          ...this.state.errors,
          username: profileModtranslator('USER_PROFILE.ID_NOT_VALID')
        }
      });
    }
  };

  fullNameChange = (event) => {
    this.setState({
      fullname: event.target.value,
      errors: {
        ...this.state.errors,
        fullname: ''
      }
    });
  };

  fullNameBlur = () => {
    this.setState({
      errors: {
        ...this.state.errors,
        fullname: ''
      }
    });
  };

  passwordChange = (event) => {
    const {value} = event.target;
    let checkPasswordValidation = validatePassword(value);
    if (!value) {
      this.setState({
        password: value,
        errors: {
          ...this.state.errors,
          password: '',
          confirmPassword: ''
        }
      });
      return;
    }
    if (
      value &&
      (value.length < 8 || value.length > 32 || checkPasswordValidation == false)
    ) {
      this.setState({
        password: value,
        errors: {
          ...this.state.errors,
          password: profileModtranslator('USER_PROFILE.PASSWORD_LENGTH'),
          confirmPassword: ''
        }
      });
    } else {
      this.setState({
        password: value,
        errors: {
          ...this.state.errors,
          password: '',
          confirmPassword: ''
        }
      });
    }
  };

  passwordChangeBlur = (event) => {
    const {value} = event.target;
    if (!value) {
      this.setState({
        password: value,
        errors: {
          ...this.state.errors,
          password: ''
        }
      });
    }
  };

  confirmPasswordChange = (event) => {
    this.setState({
      confirmPassword: event.target.value,
      errors: {
        ...this.state.errors,
        confirmPassword: ''
      }
    });
  };

  comparePassword = () => {
    const {password, confirmPassword} = this.state;
    if (password !== confirmPassword) {
      this.setState({
        errors: {
          ...this.state.errors,
          confirmPassword: profileModtranslator('USER_PROFILE.PASSWORD_NOT_MATCHED')
        }
      });
      return false;
    }
    return true;
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const {
      username,
      fullname,
      password,
      confirmPassword,
      updateInProgress
    } = this.state;

    if (updateInProgress) {
      return;
    }
    const userId = localStorage.getItem('currentUserID');
    const errors = {};
    if (!username) {
      errors.username = profileModtranslator('USER_PROFILE.FIELD_REQUIRED');
    }
    if (!fullname) {
      errors.fullname = profileModtranslator('USER_PROFILE.FIELD_REQUIRED');
    }

    if (password && !confirmPassword) {
      errors.confirmPassword = profileModtranslator(
        'USER_PROFILE.CONFIRM_PASSWORD_REQUIRED'
      );
    }

    if (confirmPassword && !password) {
      errors.password = profileModtranslator('USER_PROFILE.FIELD_REQUIRED');
    }

    if (
      !username ||
      !fullname ||
      (password && !confirmPassword) ||
      (confirmPassword && !password)
    ) {
      this.setState({
        errors: {
          ...this.state.errors,
          ...errors
        }
      });
      return;
    }

    if (!this.comparePassword()) {
      return;
    }

    if (
      this.state.errors.username ||
      this.state.errors.fullname ||
      this.state.errors.password ||
      this.state.errors.confirmPassword
    ) {
      return;
    }

    AxiosServices.put(
      ApiServices.UPDATE_PROFILE + userId,
      {
        username,
        fullname,
        password,
        password_confirmation: confirmPassword
      },
      false
    )
      .then((response) => {
        // this.props.history.push('/profile');
        this.props.updateUserName(username);
        Toast.success(response.data.message);
        this.setState({apiSuccess: response.data.message});
        localStorage.setItem('currentUserName', this.state.username);
        this.setState({
          updateInProgress: false
        });
      })
      .catch((error) => {
        const apiError = getErrorMessage(error);
        Toast.error(apiError.message);
        this.setState({
          updateInProgress: false
        });
        window.scroll(0, 0);
        this.redirectToLogin(error);
      });
    this.setState({
      updateInProgress: true
    });
  };

  hasInputError = (inputName) => {
    return this.state.hasFormError && this.state.errors[inputName].length > 0;
  };

  checkUserNameUniqness = (idOrEmail) => {
    const username = idOrEmail;
    const {errors} = this.state;
    const {formData} = this.state;
    if (username.length === 0 || errors.username.length !== 0) return;

    AxiosServices.post(ApiServices.CHECK_USERNAME, {username}, false)
      .then((response) => {
        if (response.status === 200) {
          this.setState({
            prevName: this.state.username,
            errors: {
              ...this.state.errors,
              username: ''
            }
          });
        }
      })
      .catch((err) => {
        if (err.response.data.status === false) {
          this.setState({
            errors: {
              ...this.state.errors,
              username: err.response.data.message
            }
          });
        }
        if (err.response.status === 401) {
          let apiError = getErrorMessage(err);
          Toast.error(apiError.message);
          this.redirectToLogin(err);
        }
      });
  };

  render() {
    const {
      errors,
      maxLength,
      username,
      email,
      fullname,
      password,
      confirmPassword,
      apiSuccess,
      isLoader,
      updateInProgress
    } = this.state;
    const breadcrumbs = [
      {
        title: profileModtranslator('USER_PROFILE.HEADING_TEXT'),
        link: '',
        active: true
      },
      {
        title: '',
        link: '',
        active: true
      }
    ];
    return (
      <DefaultLayout>
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm-12">
              <div className={ProfileStyle.customBreadCrumb}>
                <NcBreadcrumbs breadcrumbs={breadcrumbs} />
              </div>

              <Toast />
            </div>
          </div>
        </div>
        {isLoader ? (
          <Loader />
        ) : (
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-12">
                <div className={ProfileStyle.userProfileContainer}>
                  <div className="row d-flex flex-column align-items-center">
                    <div className={ProfileStyle.headerText}>
                      {profileModtranslator('USER_PROFILE.HEADING_TEXT')}
                    </div>
                    <span className={ProfileStyle.email}>{email}</span>
                  </div>
                  <form onSubmit={this.handleSubmit} noValidate>
                    <div className={`row + ${ProfileStyle.container}`}>
                      <div className={`col-12 + ${ProfileStyle.labelPadding}`}>
                        <div className="row">
                          <NcInput
                            label={profileModtranslator(
                              'USER_PROFILE.LABEL_USERNAME'
                            )}
                            isRequired
                            leftLabel
                            type="text"
                            className={ProfileStyle.profileInput}
                            name="username"
                            maxLength="100"
                            value={username}
                            onChange={this.onChangeIdValue}
                            onBlur={this.idOrEmailValidation}
                            autoComplete="off"
                            errorMessage={errors.username}
                          />
                        </div>
                        <div className="row">
                          <NcInput
                            label={profileModtranslator('USER_PROFILE.LABEL_NAME')}
                            isRequired
                            leftLabel
                            className={ProfileStyle.profileInput}
                            type="text"
                            name="fullname"
                            maxLength="100"
                            value={fullname}
                            onChange={this.fullNameChange}
                            onBlur={this.fullNameBlur}
                            autoComplete="off"
                            errorMessage={errors.fullname}
                          />
                        </div>
                        <div className="row">
                          <NcInput
                            label={profileModtranslator(
                              'USER_PROFILE.LABEL_PASSWORD'
                            )}
                            leftLabel
                            className={ProfileStyle.profileInput}
                            type="password"
                            name="password"
                            value={password}
                            onChange={this.passwordChange}
                            onBlur={this.passwordChangeBlur}
                            errorMessage={errors.password}
                            maxLength="32"
                            // autoComplete="off"
                          />
                        </div>
                        <div className="profilePasswordStrength">
                          <PasswordProgressBar data={password} />
                        </div>
                        <div className="row">
                          <NcInput
                            label={profileModtranslator(
                              'USER_PROFILE.LABEL_CONFIRMATION'
                            )}
                            leftLabel
                            className={ProfileStyle.profileInput}
                            type="password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={this.confirmPasswordChange}
                            onBlur={this.comparePassword}
                            autoComplete="off"
                            errorMessage={errors.confirmPassword}
                            maxLength="32"
                          />
                        </div>
                        <div className="row">
                          <Commonbutton
                            type="submit"
                            disabled={updateInProgress}
                            className={`${ProfileStyle.profileButton} primary`}
                          >
                            {profileModtranslator('USER_PROFILE.SUBMIT_BUTTON')}
                          </Commonbutton>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </DefaultLayout>
    );
  }
}

function mapStateToProps(state) {
  return {
    lang: state.commonReducer.lang
  };
}
function mapDispatchToProps(dispatch) {
  return {
    updateUserName: (userName) => dispatch(updateUserName(userName))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Profile));

//export default compose(withRouter,connect(mapStateToProps, mapDispatchToProps))(Profile);
