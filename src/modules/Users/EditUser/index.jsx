import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {Modal, ModalHeader, ModalBody, ModalFooter, Alert} from 'reactstrap';
import _ from 'lodash';
import getErrorMessage from '../../../app-constants/ServerErrorInfo';
import {validateEmail} from '../../../helper/index';
import {translator} from '../../../localizations';
import {userModtranslator} from '../modLocalization';
import DefaultLayout from '../../../containers/DefaultLayout';
import NcInput from '../../../common-components/NcInput';
import RequiredMessage from '../../../common-components/RequiredMessage';
import RoleSettingsTable from './components/RoleSettingsTable';
import './styles.scss';
import Loader from '../../../common-components/Loader/index';
import AxiosService from '../../../networks/AxiosService';
import ApiServices from '../../../networks/ApiServices';
import NcCheckbox from '../../../common-components/NcCheckbox';
import Toast from '../../../common-components/Toast';
import NcButton from '../../../common-components/NcButton';
import userConst from '../../../app-constants/usersConstant';
import NcBreadcrumbs from '../../../common-components/NcBreadcrumbs/ncBreadcrumbs';
import {CloseCircleSharp} from '../mod-assets/svgComp';
import path from '../../../routes/path';
const queryString = require('query-string');

class EditUser extends Component {
  constructor(props) {
    super(props);
    this.medias = ['owned media 1'];
    this.search = queryString.parse(window.location.search);
    this.userId = queryString.stringify(this.search);
    this.state = {
      userList: [],
      roleTitleList: [],
      isLoader: true,
      userDetails: [],
      fullName: '',
      email: '',
      blocked: null,
      locked: null,
      userRoles: [],
      tempArray: null,
      isSuccess: true,
      isFailed: true,
      hasEmailError: false,
      hasValidEmail: false,
      hasFullNameError: false,
      hasRoleError: false,
      isAllValid: false,
      serverMessage: '',
      isOpenAlert: false,
      submittedRoles: [],
      checkedAll: false,
      unCheckedAll: false,
      allCheckedUnchecked: 1,
      defaultView: false,
      isDataProcessing: false,
      emailExistsError: false,
      emailExisErrorMsg: '',
      isAvailableEmail: false,
      confirmModalOpen: false,
      disabledAllField: false
    };
    this.roleObj = [];
    this.getInitialState();
    this.getOwnMedia();
    this.openConfirmModal = this.openConfirmModal.bind(this);
    this.confirmModalClose = this.confirmModalClose.bind(this);
    this.isSoftDelete = this.isSoftDelete.bind(this);
    this.noAction = this.noAction.bind(this)
  }

  redirectToLogin(error = {}) {
    setTimeout(() => {
      if (error.response.status == 401) {
        this.props.history.push('/login');
      }
    }, 2000);
  }

  getInitialState() {
    const param = '';
    AxiosService.get(ApiServices.GET_ROLE_LIST, param, false)
      .then((response) => {
        if (response.data.data) {
          const roleTitleList = _.sortBy(response.data.data.list, ['id']);
          this.setState({
            roleTitleList: roleTitleList
          });
          const tempRoleArray = new Array(roleTitleList.length).fill(1);
          const tempRoleObj = [];
          AxiosService.get(
            ApiServices.EDIT_USER_GET_DETAILS + this.userId,
            param,
            false
          )
            .then((response) => {
              if (response.data) {
                this.setState({
                  userDetails: response.data.data,
                  fullName: response.data.data.fullname,
                  email: response.data.data.email,
                  originalEmail: response.data.data.email,
                  invitationStatus: response.data.data.invitation_status,
                  blocked: response.data.data.blocked ? 0 : 1,
                  locked: response.data.data.locked ? 0 : 1,
                  userRoles: _.sortBy(response.data.data.roles, ['id']),
                  editUserId: response.data.data.id,
                  isLoader: false,
                  defaultView: true
                });
                if (response.data.data.roles.length === roleTitleList.length) {
                  this.setState({
                    checkedAll: true,
                    defaultView: false,
                    allCheckedUnchecked: 0
                  });
                }
                const tempSortedRoles = _.sortBy(response.data.data.roles, ['id']);
                tempSortedRoles.map(function(value, index) {
                  tempRoleArray[value.id - 2] = 0;
                  tempRoleObj[index] = {role_id: value.id.toString()};
                });
                this.setState({
                  tempArray: tempRoleArray,
                  submittedRoles: tempRoleObj
                });
                this.roleObj = tempRoleObj;
              }
            })
            .catch((error) => {
              this.setState({
                isLoader: false,
                disabledAllField: true
              });
              Toast.error(translator(error.response.data.message));
              this.redirectToLogin(error);
            });
        }
      })
      .catch((error) => {
        this.setState({
          isLoader: false
        });
        let apiError = getErrorMessage(error);
        Toast.error(apiError.message);
        this.redirectToLogin(error);
      });
  }

  getOwnMedia() {
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

  goBackToUserList = () => {
    this.props.history.push('/users');
  };

  getSelectedRoleId = (event) => {
    const {submittedRoles, tempArray} = this.state;
    const {checked, id} = event.target;
    if (checked) {
      _.remove(submittedRoles, function(n) {
        return n.role_id == id;
      });
      submittedRoles.push({role_id: id.toString()});
    } else {
      _.remove(submittedRoles, function(n) {
        return n.role_id == id;
      });
      _.remove(this.roleObj, function(n) {
        return n.role_id == id;
      });
    }
    let allCheckedUnchecked = 1;
    if (tempArray.length == submittedRoles.length) {
      allCheckedUnchecked = 0;
    }
    this.setState({
      submittedRoles: submittedRoles,
      allCheckedUnchecked: allCheckedUnchecked,
      hasRoleError: submittedRoles.length ? false : false
    });
  };

  getAllSelectedId = (event) => {
    const {checked} = event.target;
    const {roleTitleList} = this.state;
    const roleLength = roleTitleList.length;
    if (checked) {
      const tempRoleArray = new Array(roleLength).fill(0);
      const tempObj = [];
      _.forEach(roleTitleList, function(value, key) {
        const temp = {role_id: value.id.toString()};
        tempObj.push(temp);
      });
      this.setState({
        tempArray: tempRoleArray,
        checkedAll: true,
        unCheckedAll: false,
        allCheckedUnchecked: 0,
        defaultView: false,
        submittedRoles: tempObj
      });
    } else {
      const tempRoleArray = new Array(roleLength).fill(1);
      this.setState({
        tempArray: tempRoleArray,
        checkedAll: false,
        unCheckedAll: true,
        defaultView: false,
        allCheckedUnchecked: 1,
        submittedRoles: []
      });
    }
  };

  onChangeFUllName = (event) => {
    const fullName = this.inputFullName.value.trim();
    this.setState({
      fullName: fullName
    });
    if (fullName.length > 100) {
      this.setState({
        hasFullNameError: true
      });
    } else {
      this.setState({
        hasFullNameError: false
      });
    }
  };

  onChangeEmail = (event) => {
    const email = this.inputEmail.value.trim();
    this.setState({
      email: email,
      hasEmailError: false,
      emailExistsError: false,
      emailErrorMessage: '',
      emailExisErrorMsg: ''
    });
  };

  handleOnBlurEmail = (event) => {
    const email = event.target.value.trim();
    if (email) {
      if (!validateEmail(email) || email.length > 255) {
        this.setState({
          hasEmailError: true,
          hasValidEmail: true
        });
      } else {
        this.setState({
          hasValidEmail: false
        });
        this.checkUserEmail(email);
      }
    } else {
      this.setState({
        hasEmailError: false,
        hasValidEmail: false
      });
    }
  };

  getBlockUnBlockValue = (event) => {
    let {editUserId} = this.state;
    let currentUserID = localStorage.getItem('currentUserID');
    if (editUserId == currentUserID) {
      Toast.error(userModtranslator('USER_MANAGEMENT.LOCK_DISABLED_FOR_OWN'));
      return false;
    }
    const {checked} = event.target;
    if (checked) {
      this.setState({
        blocked: 1
      });
    } else {
      this.setState({
        blocked: 0
      });
    }
  };

  getLockUnlockValue = (event) => {
    let {editUserId} = this.state;
    let currentUserID = localStorage.getItem('currentUserID');
    if (editUserId == currentUserID) {
      Toast.error(userModtranslator('USER_MANAGEMENT.LOCK_DISABLED_FOR_OWN'));
      return false;
    }
    const {checked} = event.target;
    if (checked) {
      this.setState({
        locked: 1
      });
    } else {
      this.setState({
        locked: 0
      });
    }
  };

  async updateUser(event) {
    let email = this.inputEmail.value.trim();

    this.setState({isDataProcessing: true});
    let hasValidEmail = null;
    let hasEmailError = false;
    let hasFullNameError = false;
    let hasRoleError = false;
    let {emailExistsError} = this.state;
    if (!email) {
      hasEmailError = true;
    } else {
      if (!validateEmail(email) || email.length > 255) {
        hasValidEmail = true;
        hasEmailError = false;
        emailExistsError = true;
      } else {
        hasEmailError = false;
      }
    }

    if (!this.inputFullName.value) {
      hasFullNameError = true;
    } else {
      hasFullNameError = false;
    }
    if (this.state.submittedRoles.length === 0) {
      hasRoleError = true;
    } else {
      hasRoleError = false;
    }
    let checkEmail = await this.checkUserEmail(email);
    this.setState({
      hasEmailError: hasEmailError,
      hasValidEmail: hasValidEmail,
      hasFullNameError: hasFullNameError,
      hasRoleError: hasRoleError,
      emailExistsError: emailExistsError
    });

    const updatedUserData = {
      email: this.inputEmail.value,
      fullname: this.inputFullName.value,
      roles: JSON.stringify(this.state.submittedRoles),
      blocked: this.state.blocked ? 0 : 1,
      locked: this.state.locked ? 0 : 1
    };
    if (
      this.inputEmail.value &&
      !this.state.hasRoleError &&
      !this.state.hasValidEmail &&
      !this.state.hasFullNameError &&
      this.inputFullName.value &&
      this.state.submittedRoles.length >= 1 &&
      this.state.isAvailableEmail
    ) {
      AxiosService.put(
        ApiServices.EDIT_USER_UPDATE_DETAILS + this.userId,
        updatedUserData,
        false
      )
        .then((response) => {
          if (response.data.status) {
            Toast.success(response.data.message);
            this.setState({
              serverMessage: response.data.message,
              isAllValid: true,
              isOpenAlert: true,
              isDataProcessing: false,
              originalEmail: email
            });
          } else {
            Toast.error(response.data.message);
            this.setState({
              serverMessage: response.data.message,
              isDataProcessing: false,
              isAllValid: false
            });
          }
        })
        .catch((err) => {
          if (err) {
            const apiError = getErrorMessage(err);
            Toast.error(apiError.message);
            this.setState({
              isAllValid: false,
              isOpenAlert: true,
              serverMessage: apiError.message,
              isDataProcessing: false
            });
          }
        });
    } else {
      this.setState({isDataProcessing: false});
    }
    event.preventDefault();
  }
  checkUserEmail = (email) => {
    if (!email) {
      this.setState({hasEmailError: true, isAvailableEmail: false});
      return false;
    }
    let {originalEmail} = this.state;
    if (originalEmail == email) {
      this.setState({
        emailExistsError: false,
        isAvailableEmail: true,
        emailExisErrorMsg: ''
      });
      return false;
    }
    AxiosService.post(ApiServices.CHECK_USER_EMAIL_EXISTS, {email: email}, false)
      .then((response) => {
        let data = response.data;
        if (data.status) {
          this.setState({
            emailExistsError: false,
            isAvailableEmail: true,
            emailExisErrorMsg: '',
            hasEmailError: false,
            hasEmailError: false
          });
        } else {
          this.setState({
            emailExistsError: true,
            vailableEmail: false,
            emailExisErrorMsg: data.message
          });
        }
      })
      .catch((err) => {
        const apiError = getErrorMessage(err);
        this.setState({
          emailExistsError: true,
          isAvailableEmail: false,
          emailExisErrorMsg: apiError.message
        });
      });
  };

  async openConfirmModal() {
    this.setState({
      confirmModalOpen: true,
      isDeleteProcessing: false
    });
    Toast.clear();
  }

  confirmModalClose() {
    this.setState({
      confirmModalOpen: false,
      isDeleteProcessing: false
    });
  }
  deleteProcess() {
    this.setState({isDeleteProcessing: true});
    AxiosService.remove(
      ApiServices.DELETE_USER + this.userId,
      {deleteType: this.state.isSoftDelete == true ? 1 : 0},
      false
    )
      .then((response) => {
        let data = response.data;
        if (data.status) {
          this.setState({confirmModalOpen: false, isDeleteProcessing: false});
          Toast.success(data.message);
          setTimeout(() => {
            this.props.history.push('/users');
          }, 2000);
        } else {
          this.setState({confirmModalOpen: false, isDeleteProcessing: false});
          Toast.error(data.message);
        }
      })
      .catch((error) => {
        this.setState({confirmModalOpen: false, isDeleteProcessing: false});
        let apiError = getErrorMessage(error);
        Toast.error(apiError.message);
      });
  }
  isSoftDelete(e) {
    this.setState({isSoftDelete: !this.state.isSoftDelete});
  }
  componentDidMount() {
    let {loginData} = this.props || {};
    if (loginData && loginData.id == this.userId) {
      this.setState({disabledAllField: true});
    } else {
      this.setState({disabledAllField: false});
    }
  }
  noAction() {
    return false;
  }
  render() {
    const {
      roleTitleList,
      isLoader,
      tempArray,
      fullName,
      blocked,
      locked,
      email,
      hasEmailError,
      hasFullNameError,
      hasRoleError,
      hasValidEmail,
      checkedAll,
      unCheckedAll,
      allCheckedUnchecked,
      defaultView,
      isDataProcessing,
      submittedRoles,
      emailExistsError,
      emailExisErrorMsg,
      invitationStatus,
      ownMediaList,
      confirmModalOpen,
      isDeleteProcessing,
      disabledAllField
    } = this.state;

    let emailErrorMessage = null;
    if (hasEmailError) {
      emailErrorMessage = userModtranslator('USER_MANAGEMENT.EMAIL_ERROR');
    }
    if (hasValidEmail) {
      emailErrorMessage = userModtranslator('USER_MANAGEMENT.INVALID_EMAIL_ERROR');
    }
    const breadcrumbs = [
      {
        title: userModtranslator('USER_MANAGEMENT.EDIT_PAGE_TO_USER_LINK'),
        link: path.users
      },
      {title: userModtranslator('USER_MANAGEMENT.EDIT_PAGE_ACTIVE'), active: true}
    ];

    const isDisabled = invitationStatus && (
      invitationStatus == userConst.INVITATION_ACCEPTED || !disabledAllField)
        ? false
        : true;
    return (
      <DefaultLayout>
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm-12">
              <Toast />
            </div>
          </div>
        </div>
        {isLoader ? (
          <>
            <Loader />
          </>
        ) : (
          <div className="container-fluid user-management edit-user-management">
            <div className="row">
              <div className="col-sm-12">
                <NcBreadcrumbs breadcrumbs={breadcrumbs} />
                <div className="title">
                  {userModtranslator('USER_MANAGEMENT.USER_MANAGEMENT_EDIT_TITLE')}
                </div>
                <div className="sub-title">{fullName}</div>
              </div>
            </div>

            <div className="user-input-area">
              <div className="user-email">
                <NcInput
                  label={userModtranslator('USER_MANAGEMENT.EMAIL_ADDRESS')}
                  isRequired
                  type="email"
                  className="username"
                  maxLength={255}
                  defaultValue={email}
                  onBlur={this.handleOnBlurEmail}
                  onChange={(event) => this.onChangeEmail(event)}
                  disabled={isDisabled}
                  inputRef={(ref) => {
                    this.inputEmail = ref;
                  }}
                  errorMessage={
                    (hasEmailError || emailExistsError) &&
                    (emailErrorMessage || emailExisErrorMsg)
                  }
                  placeholder={userModtranslator(
                    'USER_MANAGEMENT.EMAIL_PLACEHOLDER'
                  )}
                />
              </div>
              <div className="user-name">
                <NcInput
                  label={userModtranslator('USER_MANAGEMENT.FULLNAME')}
                  isRequired
                  type="text"
                  placeholder=""
                  maxLength={100}
                  defaultValue={fullName}
                  disabled={isDisabled}
                  onChange={(event) => this.onChangeFUllName(event)}
                  error={hasFullNameError}
                  inputRef={(ref) => {
                    this.inputFullName = ref;
                  }}
                  errorMessage={
                    hasFullNameError &&
                    userModtranslator('USER_MANAGEMENT.FULL_NAME_ERROR')
                  }
                  placeholder={userModtranslator(
                    'USER_MANAGEMENT.USER_NAME_PLACEHOLDER'
                  )}
                />
              </div>
              <div className="user-action-btn"></div>
            </div>

            <div className="row">
              <div className="col-sm-12">
                <div className="role-title required-inp">
                  {userModtranslator('USER_MANAGEMENT.USER_ROLE')}{' '}
                  <span className="text-danger">*</span>
                </div>
              </div>
            </div>
            {/* END USER INVITAIION  */}
            <div className="row user-role">
              <div className="col-12">
                {roleTitleList && (
                  <RoleSettingsTable
                    medias={this.medias}
                    roleTitleList={roleTitleList}
                    tempArray={tempArray}
                    checkedAll={checkedAll}
                    unCheckedAll={unCheckedAll}
                    allCheckedUnchecked={allCheckedUnchecked}
                    defaultView={defaultView}
                    onChangeCallSelectAll={(e) => this.getAllSelectedId(e)}
                    onChangeCallBack={(e) => this.getSelectedRoleId(e)}
                    invitationStatus={invitationStatus}
                    ownMediaList={ownMediaList}
                  />
                )}
                {hasRoleError && (
                  <RequiredMessage
                    customClass="custom-margin-three"
                    text={userModtranslator('USER_MANAGEMENT.USER_ROLE_ERROR')}
                  />
                )}
              </div>
            </div>
            {/* END USER ROLE TABLE */}
            <div className="row">
              <div className="col-sm-12">
                <div className="role-title">
                  {userModtranslator('USER_MANAGEMENT.USER_ACCOUNT_STATUS')}
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="card locked-unlocked-section card-body bg-light">
                  <div className="lock-block">
                    <div className="edit-user-checkbox">
                      <NcCheckbox
                        value="0"
                        checked={blocked ? true : false}
                        id="editblocked99"
                        handleChange={(e) => this.getBlockUnBlockValue(e)}
                        disabled={isDisabled}
                        className={isDisabled ? 'disabledInput' : ''}
                      />
                    </div>
                    <div className="edit-role-text">
                      {userModtranslator('USER_MANAGEMENT.BLOCK')}
                    </div>
                  </div>
                  <div className="lock-block">
                    <div className="edit-user-checkbox">
                      <NcCheckbox
                        value="1"
                        checked={locked ? true : false}
                        id="editlocked99"
                        handleChange={(e) => this.getLockUnlockValue(e)}
                        disabled={isDisabled}
                        className={isDisabled ? 'disabledInput' : ''}
                      />
                    </div>
                    <div className="edit-role-text">
                      {userModtranslator('USER_MANAGEMENT.LOCK_LABEL')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4">
                <NcButton
                  type="submit"
                  className={
                    isDataProcessing || isDisabled
                      ? `invitationBtn disabledBtn`
                      : `invitationBtn`
                  }
                  callback={(e) => this.updateUser(e)}
                >
                  {userModtranslator('USER_MANAGEMENT.SAVE')}
                </NcButton>
              </div>
              <div className="col-md-8">
                <div className="delete-button-area float-right">
                  <div className="deleteText">
                    <NcCheckbox
                      className=""
                      id="deletedId"
                      handleChange={this.isSoftDelete}
                      disabled={disabledAllField}
                    />
                    <span>
                      {' '}
                      {userModtranslator('USER_MANAGEMENT.DELETE_ALERT_TEXT')}{' '}
                    </span>
                  </div>
                  <NcButton
                    type="button"
                    className={disabledAllField?  `invitationBtn dangerBtn disabledBtn` :  `invitationBtn dangerBtn`}
                    callback={()=> disabledAllField ? this.noAction() : this.openConfirmModal()}
                    disabled={disabledAllField}
                  >
                    {userModtranslator('USER_MANAGEMENT.DELETE_USER')}
                  </NcButton>
                </div>
              </div>
            </div>
          </div>
        )}

        <Modal
          isOpen={confirmModalOpen}
          toggle={this.toggleModalConfirm}
          modalClassName="customClose"
          contentClassName="userMailModal"
          backdropClassName="backDrop"
          centered
        >
          <ModalHeader className="modalHeader">
            {userModtranslator('USER_MANAGEMENT.DELETE_TITLE')}
            <div
              className="customClose"
              tabIndex={0}
              role="button"
              onClick={() => this.confirmModalClose()}
            >
              <CloseCircleSharp />
            </div>
          </ModalHeader>

          <ModalBody className="modalBody">
            <div className="deleteConfirm">
              {userModtranslator('USER_MANAGEMENT.DELETE_MSG')}
            </div>
          </ModalBody>
          <ModalFooter className="modalFooter">
            <NcButton
              className={
                isDeleteProcessing ? `commonButton disabledBtn` : `commonButton`
              }
              callback={() => this.deleteProcess()}
            >
              {userModtranslator('USER_MANAGEMENT.YES_BUTTON')}
            </NcButton>
            <NcButton
              className={`commonButton dangerBtn disabledBtn}`}
              callback={this.confirmModalClose}
            >
              {userModtranslator('USER_MANAGEMENT.NO_BUTTON')}
            </NcButton>
          </ModalFooter>
        </Modal>
      </DefaultLayout>
    );
  }
}

function mapStateToProps(state) {
  return {
    loginData: state.authReducer.loginData
  };
}

export default connect(mapStateToProps, null)(withRouter(EditUser));
