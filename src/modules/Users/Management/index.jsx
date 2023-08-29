import React, {Component} from 'react';
import {ToastContainer, toast} from 'react-toastify';
import {withRouter} from 'react-router-dom';
import {Label} from 'reactstrap';
import {connect} from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
import {translator} from '../../../localizations';
import {userModtranslator} from '../modLocalization';
import DefaultLayout from '../../../containers/DefaultLayout';
import NcInput from '../../../common-components/NcInput';
import RoleTable from '../RoleTable';
import UserListTable from '../UserListTable';
import './styles.scss';
import {addToast, type} from '../../../redux/actions/toast';
import Loader from '../../../common-components/Loader/index';
import AxiosService from '../../../networks/AxiosService';
import ApiServices from '../../../networks/ApiServices';
import {isObjectEmpty, validateEmail} from '../../../helper';
import {EMAIL, FULL_NAME} from '../modConstants/usersConstant';
import getErrorMessage from '../../../app-constants/ServerErrorInfo';
import RequiredMessage from '../../../common-components/RequiredMessage';
import Toast from '../../../common-components/Toast';
import NcButton from '../../../common-components/NcButton';
import NcBreadcrumbs from '../../../common-components/NcBreadcrumbs/ncBreadcrumbs';
import path from '../../../routes/path';
class Index extends Component {
  constructor(props) {
    super(props);
    this.medias = ['owned media 1'];
    this.state = {
      userList: [],
      roleTitleList: [],
      isLoader: true,
      email: '',
      fullName: '',
      hasErrorEmail: false,
      hasErrorName: false,
      apiError: false,
      apiSuccess: false,
      isSetRolePermission: false,
      isRoleChanged: false,
      isDataProcessing: false,
      inSideReload: false,
      error: {
        email: ''
      },
      setRoles: [],
      emailExistsError: false,
      isAvailableEmail: false,
      ownMediaList: [],
      ownMediaBtnChecked: false
    };
    this.setRoleValues = this.setRoleValues.bind(this);
    this.goEditUserPage = this.goEditUserPage.bind(this);
    this.resetAddUserForm = this.resetAddUserForm.bind(this);
    this.checkUserName = this.checkUserName.bind(this);
    this.resetUserList = this.resetUserList.bind(this);
  }

  setRoleValues(id, allIds, makeALlEmpty) {
    let {setRoles, roleTitleList, isRoleChanged, isSetRolePermission} = this.state;
    let ownMediaBtnChecked = false;
    if (makeALlEmpty) {
      setRoles = [];
    } else if (allIds) {
      if (setRoles.length == roleTitleList.length) {
        setRoles = [];
      } else {
        setRoles = [];
        roleTitleList.map((item, index) => {
          setRoles.push(item.id);
        });
      }
      ownMediaBtnChecked = true;
    } else if (id) {
      if (!setRoles.includes(id)) {
        setRoles.push(id);
      } else {
        const index = setRoles.findIndex((roleId) => roleId === id);
        setRoles.splice(index, 1);
      }

      if (setRoles.length != roleTitleList.length) {
        console.log('not ');
      } else {
        ownMediaBtnChecked = true;
      }
    }

    roleTitleList.map((item, index) => {
      if (setRoles.includes(item.id)) {
        item.isActive = 0;
      } else {
        item.isActive = 1;
      }
    });
    this.setState({
      setRoles: setRoles,
      isSetRolePermission: setRoles.length ? '' : isSetRolePermission,
      roleTitleList: roleTitleList,
      isRoleChanged: !isRoleChanged,
      ownMediaBtnChecked: ownMediaBtnChecked
    });
  }

  redirectToLogin(error = {}) {
    setTimeout(() => {
      if (error.response && error.response.status == 401) {
        this.props.history.push('/login');
      }
    }, 2000);
  }

  componentDidMount() {
    const param = '';
    this.getUserList(true);
    AxiosService.get(ApiServices.GET_ROLE_LIST, param, false)
      .then((response) => {
        const {data} = response.data;
        if (data) {
          this.setState({
            roleTitleList: data.list,
            isLoader: false
          });
        }
      })
      .catch((error) => {
        let apiError = getErrorMessage(error);
        Toast.error(apiError.message);
        this.redirectToLogin(error);
      });

    AxiosService.get(ApiServices.OWN_MEDIA(1), {}, false)
      .then((response) => {
        const {data} = response.data;
        if (data) {
          this.setState({
            ownMediaList: data
          });
        }
      })
      .catch((error) => {
        let apiError = getErrorMessage(error);
        Toast.error(apiError.message);
      });
  }

  getUserList(inSideReload = false) {
    const param = '';
    this.setState({inSideReload: inSideReload});
    AxiosService.get(ApiServices.USERT_LIST, param, false)
      .then((response) => {
        const {data} = response.data;
        if (data) {
          this.setState({
            userList: data.list,
            isLoader: false,
            inSideReload: false
          });
        }
      })
      .catch((error) => {
        let apiError = getErrorMessage(error);
        Toast.error(apiError.message);
        this.setState({inSideReload: false});
        this.redirectToLogin(error);
      });
  }
  isValidEmail = (event, setEmail ) => {
    const email = setEmail ? setEmail : event.target.value.trim() || setEmail;
    if (!email) {
      let error = {};
      error.email = '';
      this.setState({
        hasErrorEmail: false,
        error: {
          ...this.state.error,
          ...error
        },
        isAvailableEmail: false
      });
      return false;
    }
    if (validateEmail(email)) {
      let error = {};
      error.email = '';
      this.setState({
        email,
        hasErrorEmail: false,
        error: {
          ...this.state.error,
          ...error
        },
        isAvailableEmail: false
      });
      this.checkUserName(email);
    } else if (!email.length) {
      this.setState({
        hasErrorEmail: true
      });
    } else {
      this.setState({
        hasErrorEmail: true,
        error: {
          email: userModtranslator('USER_MANAGEMENT.EMAIL_NOT_VALID')
        }
      });
    }
  };

  onChangeValue = (e, field) => {
    if (field === FULL_NAME) {
      const fullName = e.target.value.trim();
      const error = {};
      if (fullName.length && fullName.length <= 100) {
        error.username = '';
      } else {
        error.username = userModtranslator('USER_MANAGEMENT.EMAIL_REQUIRED');
      }
      this.setState({
        fullName,
        hasErrorName: false,
        error: {
          ...this.state.error,
          ...error
        }
      });
    } else {
      let error = {};
      error.email = '';
      this.setState({
        email: e.target.value,
        hasErrorEmail: false,
        emailExistsError: false,
        isAvailableEmail: false,
        errror: {
          ...this.state.error,
          ...error
        }
      });
    }
  };

  checkUserName = (email) => {
    if(this.state.isAvailableEmail){
      return false;
    }
    AxiosService.post(ApiServices.CHECK_USER_EMAIL_EXISTS, {email: email}, false)
      .then((response) => {
        let data = response.data;
        if (data.status) {
          let error = {};
          error.email = '';
          this.setState({
            emailExistsError: false,
            error: {
              ...this.state.error,
              ...error
            },
            isAvailableEmail: true
          });
        } else {
          let error = {};
          error.email = data.message;
          this.setState({
            emailExistsError: true,
            error: {
              ...this.state.error,
              ...error
            },
            isAvailableEmail: false
          });
        }
      })
      .catch((err) => {
        const apiError = getErrorMessage(err);
        let error = {};
        error.email = apiError.message || '';
        this.setState({
          emailExistsError: true,
          error: {
            ...this.state.error,
            ...error
          },
          isAvailableEmail: false
        });
      });
  };

  async handleInvitation(isDataProcessing) {
    if (isDataProcessing) {
      return false;
    }
    const {
      email,
      fullName,
      setRoles,
      emailExistsError,
      isAvailableEmail
    } = this.state;
    const rolesList = [];
    setRoles.map((roleId) => {
      rolesList.push({role_id: roleId});
    });
    const error = {};
    // const {rolesValue} = this.props;
    const {rolesValue} = rolesList;

    if (!email) {
      error.email = userModtranslator('USER_MANAGEMENT.EMAIL_REQUIRED');
    } else {
      //let checkMail = await this.checkUserName(email);
      this.isValidEmail(null, email);
    }
    // enable this error after fixing role select deselect logic
    if (!rolesList.length) {
      // error.role = translator("USER_MANAGEMENT.ROLE_REQUIRED")
      this.setState({
        isSetRolePermission: userModtranslator('USER_MANAGEMENT.ROLE_REQUIRED')
      });
    } else {
      this.setState({isSetRolePermission: false});
    }
    let hasErrorName = true;
    let isFullNameValidate = false;
    if (fullName.length && fullName.length <= 100) {
      isFullNameValidate = true;
      error.username = '';
    } else {
      error.username = userModtranslator('USER_MANAGEMENT.FULL_NAME_REQUIRED');
      hasErrorName = true;
      isFullNameValidate = false;
    }
    this.setState({hasErrorName: true, hasErrorEmail: true});

    if (!email || isObjectEmpty(rolesList) || hasErrorName) {
      this.setState({
        error: {
          ...this.state.error,
          ...error
        },
        isDataProcessing: false
      });
    }
    if (email && rolesList.length && isFullNameValidate && isAvailableEmail) {
      const param = {
        roles: JSON.stringify(rolesList),
        email: email,
        fullname: fullName
      };
      this.inviteApiCall(param);
    }
  }

  handleUserNameBlur = () => {
    //let {fullName} = this.state;
  };

  inviteApiCall = (param) => {
    const url = ApiServices.USER_ADD;
    this.setState({isDataProcessing: true});
    AxiosService.post(url, param, false)
      .then((response) => {
        if (response.data.status) {
          this.setState({apiError: ''});
          Toast.success(response.data.message);
          let {roleTitleList} = this.state;
          roleTitleList.map((item, index) => {
            item.isActive = 1;
          });
          this.setState({
            apiSuccess: response.data.message,
            fullName: '',
            email: '',
            setRoles: [],
            isRoleChanged: true,
            error: {
              email: ''
            },
            roleTitleList: [...roleTitleList],
            isAvailableEmail: false,
            ownMediaBtnChecked: false,
            hasErrorEmail:false,
            emailExistsError :false
          });
          this.fullName.value = '';
          this.email.value = '';
          this.getUserList(true);
        } else {
          Toast.error(response.data.message);
          this.setState({apiError: response.data.message});
        }
        this.setState({isDataProcessing: false});
      })
      .catch((err) => {
        if (err) {
          const apiError = getErrorMessage(err);
          Toast.error(apiError.message);
          this.setState({apiError: apiError.message});
        }
        this.setState({isDataProcessing: false});
      });
  };

  goEditUserPage(userId) {
    this.props.history.push(`/edit-user?${userId}`);
  }
  resetAddUserForm() {
    this.setState({
      hasErrorName: false,
      hasErrorEmail: false,
      isSetRolePermission: false
    });
  }
  resetUserList() {
    this.getUserList(true);
  }
  render() {
    const {
      userList,
      roleTitleList,
      isLoader,
      hasErrorEmail,
      hasErrorName,
      apiError,
      apiSuccess,
      error,
      isSetRolePermission,
      setRoles,
      isRoleChanged,
      isDataProcessing,
      inSideReload,
      emailExistsError,
      ownMediaList,
      ownMediaBtnChecked
    } = this.state;
    const breadcrumbs = [
      {
        title: userModtranslator('USER_MANAGEMENT.EDIT_PAGE_TO_USER_LINK'),
        link: path.users,
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
        {isLoader ? (
          <>
            <div className="container-fluid">
              <div className="row">
                <div className="col-sm-12">
                  <Toast />
                </div>
              </div>
            </div>
            <Loader />
          </>
        ) : (
          <div className="container-fluid user-management">
            <div className="row">
              <div className="col-sm-12">
                <NcBreadcrumbs breadcrumbs={breadcrumbs} />
                <Toast />
                <div className="title">
                  {userModtranslator('USER_MANAGEMENT.USER_MANAGEMENT_EDIT_TITLE')}
                </div>
                <div className="role-title">
                  {userModtranslator('USER_MANAGEMENT.ADD_USER')}
                </div>
              </div>
            </div>

            <div className="user-input-area">
              <div className="user-email">
                <NcInput
                  label={userModtranslator('USER_MANAGEMENT.EMAIL_ADDRESS')}
                  isRequired
                  placeholder={userModtranslator(
                    'USER_MANAGEMENT.EMAIL_PLACEHOLDER'
                  )}
                  type="email"
                  maxLength={255}
                  onBlur={this.isValidEmail}
                  className="email"
                  onChange={(event) => this.onChangeValue(event, EMAIL)}
                  errorMessage={(hasErrorEmail || emailExistsError) && error.email}
                  inputRef={(ref) => {
                    this.email = ref;
                  }}
                />
              </div>
              <div className="user-name">
                <NcInput
                  label={userModtranslator('USER_MANAGEMENT.FULLNAME_FIELD')}
                  type="text"
                  isRequired
                  placeholder={userModtranslator(
                    'USER_MANAGEMENT.USER_NAME_PLACEHOLDER'
                  )}
                  maxLength={100}
                  // onBlur={this.handleUserNameBlur}
                  className="username"
                  onChange={(event) => this.onChangeValue(event, FULL_NAME)}
                  errorMessage={hasErrorName && error.username}
                  inputRef={(ref) => {
                    this.fullName = ref;
                  }}
                />
              </div>
              <div className="user-action-btn"></div>
            </div>

            <div className="row">
              <div className="col-sm-12">
                <div className="role-title">
                  {userModtranslator('USER_MANAGEMENT.USER_ROLE')}
                  <span className="text-danger">*</span>
                </div>
              </div>
            </div>

            {/* END USER INVITAIION  */}
            <div className="row user-role">
              <div className="col-12 ">
                {roleTitleList && (
                  <RoleTable
                    medias={this.medias}
                    isRoleChanged={isRoleChanged}
                    roleTitleList={roleTitleList}
                    setRoleValues={this.setRoleValues}
                    setRolesLength={setRoles.length}
                    ownMediaList={ownMediaList}
                    ownMediaBtnChecked={ownMediaBtnChecked}
                  />
                )}
                {isSetRolePermission && (
                  <RequiredMessage
                    customClass="custom-margin-one"
                    text={isSetRolePermission}
                  />
                )}
                <div className="float-right">
                  <NcButton
                    type="button"
                    className={
                      isDataProcessing
                        ? `disabledBtn invitationBtn`
                        : `invitationBtn`
                    }
                    callback={() => this.handleInvitation(isDataProcessing)}
                  >
                    {userModtranslator('USER_MANAGEMENT.ADD_BUTTON')}
                  </NcButton>
                </div>
              </div>
            </div>
            {/* END USER ROLE TABLE */}
            <div className="row user-role insideLoader user-list-pagination">
              {inSideReload ? (
                <Loader />
              ) : (
                <div className="col-12">
                  <div className="role-title">
                    {userModtranslator('USER_MANAGEMENT.USER_MANAGEMENT_TITLE')}
                  </div>
                  {userList && userList.length > 0 && (
                    <UserListTable
                      userList={userList}
                      goEditUserPage={this.goEditUserPage}
                      resetAddUserForm={this.resetAddUserForm}
                      resetUserList={this.resetUserList}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </DefaultLayout>
    );
  }
}

function mapStateToProps(state) {
  return {
    rolesName: state.usersReducer.rolesName,
    rolesValue: state.usersReducer.rolesValue
  };
}

function mapDispatchToProps(dispacth) {
  return {
    addToast: (options) => dispacth(addToast(options))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Index));
