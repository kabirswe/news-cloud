import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {ToastContainer, toast} from 'react-toastify';
import DefaultLayout from '../../../containers/DefaultLayout';
import {memberModtranslator} from '../modLocalization';
import PasswordProgressBar from './components/passwordProgressBar';
import Style from './memberForm.module.scss';
import Commonbutton from '../../../common-components/button/Button';
import {
  fieldInitialization,
  getMemberItemById,
  memberItemDelete,
  saveMemberItem
} from '../../../redux/actions/Member';
import {
  generateKey,
  isJapaneseText,
  validateEmail,
  validatePassword
} from '../../../helper';
import {
  EMAIL_MAX_LENGTH,
  INPUT_MAX_LENGTH_100,
  PASSWD_MAX_LENGTH
} from '../../../app-constants/characterLength';
import getErrorMsg, {hasErrorInput} from '../../../helper/FieldError';
import path from '../../../routes/path';
import ConfirmationModal from '../../../common-components/confirmationModal';
import Loader from '../../../common-components/Loader';
import {profileModtranslator} from '../../Users/Profile/modLocalization';
import Toast from '../../../common-components/Toast';
import ApiServices from '../../../networks/ApiServices';
import AxiosService from '../../../networks/AxiosService';
import getErrorMessage from '../../../app-constants/ServerErrorInfo';
import NcBreadcrumbs from '../../../common-components/NcBreadcrumbs/ncBreadcrumbs';
import NcCheckbox from '../../../common-components/NcCheckbox';

class MemberForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasFormError: false,
      selectedMemberId: '',
      memberData: {
        id: '',
        username: '',
        email: '',
        fullname: ''
      },
      password: '',
      password_confirmation: '',
      dataError: {},
      dataErrorMassage: {},
      apiError: '',
      apiSuccess: '',
      deleteWarning: false,
      isHardDelete: false
    };
  }

  static getDerivedStateFromProps(props, state) {
    const data = {};

    if (props.selectedMemberId !== state.selectedMemberId) {
      data.selectedMemberId = props.selectedMemberId;
    }
    if (props.selectedMember !== state.memberData) {
      data.memberData = props.selectedMember;
    }
    if (props.apiError !== state.apiError) {
      data.apiError = props.apiError;
    }
    return data;
  }

  async componentDidMount() {
    await this.props.fieldInitialization({
      apiError: '',
      apiSuccess: '',
      currentUserName: '',
      currentEmail: ''
    });
    if (this.props.selectedMemberId) {
      await this.props.getMemberItemById({id: this.props.selectedMemberId});
    }
    Toast.clear();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.apiSuccess !== this.props.apiSuccess) {
      if (!!this.props.apiSuccess) {
        this.props.history.push(path.memberList);
      }
    }
  }

  onChangeValue = (event) => {
    const {memberData, dataError, dataErrorMassage} = this.state;

    const key = event.target.name;
    const {value} = event.target;
    if (key === 'password' || key === 'password_confirmation') {
      this.setState({[key]: value}, () => {
        this.onChangeValidationCheck(key);
      });
    } else {
      memberData[key] = value;
      dataError[key] = false;
      dataErrorMassage[key] = '';
      this.setState({dataError, dataErrorMassage});
    }
  };

  notSupportChar = (name) => {
    const charNotSupport = ['--', '__', '-_', '_-'];
    let hasNotSupportChar = false;
    charNotSupport.forEach((regChar) => {
      if (name.indexOf(regChar) !== -1) {
        hasNotSupportChar = true;
      }
    });
    return hasNotSupportChar;
  };

  onChangeValidationCheck = async (fieldName) => {
    const {memberData, dataError, dataErrorMassage, password} = this.state;
    const {currentEmail, currentUserName} = this.props;
    const idPattern = /^[\w-]+$/;
    switch (fieldName) {
      case 'username':
        if (
          memberData.username &&
          (!idPattern.test(memberData.username) ||
            this.notSupportChar(memberData.username) ||
            isJapaneseText(memberData.username))
        ) {
          dataError[fieldName] = true;
          dataErrorMassage[fieldName] = memberModtranslator('MEMBER.ERROR.ID_ERROR');
        } else if (memberData.username) {
          this.props.fieldInitialization({apiError: ''});
          Toast.clear();
          if (currentUserName.toLowerCase() !== memberData.username.toLowerCase()) {
            this.callUniqueApi(memberData.username, 'username');
          }
        }
        break;
      case 'email':
        if (memberData.email && !validateEmail(memberData.email)) {
          dataError[fieldName] = true;
          dataErrorMassage[fieldName] = memberModtranslator(
            'MEMBER.ERROR.EMAIL_ERROR'
          );
        } else if (memberData.email) {
          this.props.fieldInitialization({apiError: ''});
          Toast.clear();
          if (currentEmail !== memberData.email) {
            this.callUniqueApi(memberData.email, 'email');
          }
        }
        break;

      case 'password':
        if (
          password &&
          (password.length < 8 ||
            password.length > 32 ||
            validatePassword(password) == false)
        ) {
          dataError.password = true;
          dataErrorMassage.password = profileModtranslator(
            'USER_PROFILE.PASSWORD_LENGTH'
          );
        } else {
          dataError.password = false;
          dataErrorMassage.password = '';
        }
        break;
      default:
        // dataError[fieldName] = memberData[fieldName] ? false : true;
        break;
    }
    this.setState({dataError, dataErrorMassage});
  };

  comparePassword = () => {
    const {password, password_confirmation} = this.state;
    const {dataError, dataErrorMassage} = this.state;
    if (!!password && password !== password_confirmation) {
      dataError.password_confirmation = true;
      dataErrorMassage.password_confirmation = profileModtranslator(
        'USER_PROFILE.PASSWORD_NOT_MATCHED'
      );
    } else {
      dataError.password_confirmation = false;
      dataErrorMassage.password_confirmation = '';
    }
    this.setState({dataError, dataErrorMassage});
  };

  passwordChangeBlur = () => {
    const {dataError, dataErrorMassage} = this.state;
    const {password} = this.state;
    if (!password) {
      dataError.password = false;
      dataErrorMassage.password = '';
      this.setState({dataError, dataErrorMassage});
    }
  };

  validationCheck = (param) => {
    let hasError = false;
    const {dataError, dataErrorMassage} = this.state;

    if (
      !param.username ||
      !param.email ||
      !param.fullname ||
      (!!param.password && !param.password_confirmation) ||
      (!!param.password_confirmation && !param.password) ||
      param.password !== param.password_confirmation
    ) {
      if (!param.username) {
        dataError.username = true;
        dataErrorMassage.username = memberModtranslator('MEMBER.ERROR.ID_REQUIRED');
        this.setState({dataError, dataErrorMassage});
      }
      if (!param.email) {
        dataError.email = true;
        dataErrorMassage.email = memberModtranslator('MEMBER.ERROR.EMAIL_REQUIRED');
        this.setState({dataError, dataErrorMassage});
      }
      if (!param.fullname) {
        dataError.fullname = true;
        dataErrorMassage.fullname = memberModtranslator(
          'MEMBER.ERROR.NAME_REQUIRED'
        );
        this.setState({dataError, dataErrorMassage});
      }
      if (!!param.password && !param.password_confirmation) {
        dataError.password_confirmation = true;
        dataErrorMassage.password_confirmation = memberModtranslator(
          'MEMBER.ERROR.CONFIRM_PASSWD_REQUIRED'
        );
        this.setState({dataError, dataErrorMassage});
      }
      if (!!param.password_confirmation && !param.password) {
        dataError.password = true;
        dataErrorMassage.password = memberModtranslator(
          'MEMBER.ERROR.PASSWD_REQUIRED'
        );

        this.setState({dataError, dataErrorMassage});
      }
      if (
        !!param.password_confirmation &&
        param.password !== param.password_confirmation
      ) {
        dataError.password_confirmation = true;
        dataErrorMassage.password_confirmation = profileModtranslator(
          'USER_PROFILE.PASSWORD_NOT_MATCHED'
        );

        this.setState({dataError, dataErrorMassage});
      }
      hasError = true;
    }

    if (
      Object.keys(dataError)
        .map((key) => dataError[key])
        .includes(true)
    ) {
      hasError = true;
    } else {
      this.setState({dataError: {}});
    }
    return hasError;
  };

  handleSubmit = () => {
    const {memberData, password, password_confirmation} = this.state;
    let param = {
      username: memberData.username,
      email: memberData.email,
      fullname: memberData.fullname
    };
    if (memberData && memberData.id) {
      param = {
        ...param,
        password: password,
        password_confirmation: password_confirmation
      };
    }
    if (!this.validationCheck(param)) {
      this.props.saveMemberItem({
        id: memberData && memberData.id ? memberData.id : '',
        param: param
      });
    }
  };

  hasInputError = (inputName) => {
    return this.state.hasFormError && this.state.errors[inputName].length > 0;
  };

  handleImage = () => {
    document.querySelector('#profileImageUpload').click();
  };

  handleWarning = (WarningType) => {
    this.setState({[WarningType]: true});
  };

  cancelClick = (WarningType) => {
    this.setState(() => ({
      [WarningType]: false
    }));
  };

  handleDeleteItem = async () => {
    this.setState(
      () => ({
        deleteWarning: false,
        password: ''
      }),
      async () => {
        this.props.memberItemDelete({
          id: this.props.selectedMemberId,
          deleteType: this.state.isHardDelete ? 1 : 0
        });
      }
    );
  };

  callUniqueApi = (value, type) => {
    const url = `${ApiServices.MEMBER_UNIQUE_PATH}/${value}`;
    AxiosService.post(url, {}, false)
      .then(() => {})
      .catch((err) => {
        if (err) {
          const {dataError, dataErrorMassage} = this.state;
          const apiError = getErrorMessage(err); // err.response.data
          if (!!apiError.errors && type in apiError.errors) {
            dataError[type] = true;
            dataErrorMassage[type] = apiError.errors[type];
            this.setState({
              dataError,
              dataErrorMassage
            });
          }
        }
      });
  };

  handleDeleteType = (event) => {
    this.setState({isHardDelete: event.target.checked});
  };

  render() {
    const {
      apiError,
      dataError,
      dataErrorMassage,
      selectedMemberId,
      password,
      memberData
    } = this.state;
    const {selectedMember} = this.props;
    const breadcrumbs = [
      {title: memberModtranslator('MEMBER.MEMBER_LINK'), link: path.memberList},
      {
        title: memberModtranslator(
          !!selectedMemberId ? 'MEMBER.ADD.PAGE_TITLE_EDIT' : 'MEMBER.ADD.PAGE_TITLE'
        ),
        link: '',
        active: true
      }
    ];

    return (
      <DefaultLayout>
        <ConfirmationModal
          key={generateKey()}
          isActive={this.state.deleteWarning}
          title={memberModtranslator('MEMBER.MODAL_TITLE')}
          body={memberModtranslator('MEMBER.DELETE_TEXT')}
          cancelClick={() => this.cancelClick('deleteWarning')}
          okClick={() => this.handleDeleteItem()}
        />
        {!this.props.loading ? (
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-12">
                <div className={Style.memberFormComponent}>
                  {!apiError.errors && <Toast />}
                  <div className="row">
                    <div className="col-lg-12">
                      <div className={Style.header}>
                        <NcBreadcrumbs breadcrumbs={breadcrumbs} />
                        {memberModtranslator(
                          !!selectedMemberId
                            ? 'MEMBER.ADD.PAGE_TITLE_EDIT'
                            : 'MEMBER.ADD.PAGE_TITLE'
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`row  ${Style.container}`}>
                    <div className="col-12">
                      <div className="row">
                        <div className={Style.profileLabel}>
                          {memberModtranslator('MEMBER.MEMBER_ID')}
                          <span className={Style.requiredLevel}>*</span>
                        </div>
                        <input
                          className={
                            `${Style.profileInputField} ` +
                            `${hasErrorInput(
                              apiError.errors,
                              dataError,
                              'username'
                            ) && Style.hasFormError}`
                          }
                          type="text"
                          name="username"
                          placeholder={memberModtranslator('MEMBER.MEMBER_ID')}
                          defaultValue={memberData.username || ''}
                          value={selectedMember.username || ''}
                          onChange={(e) => this.onChangeValue(e)}
                          onBlur={(e) => this.onChangeValidationCheck('username')}
                          autoComplete="off"
                          maxLength={INPUT_MAX_LENGTH_100}
                        />
                      </div>
                      {hasErrorInput(apiError.errors, dataError, 'username') && (
                        <div className={`${Style.helperText}`}>
                          {getErrorMsg(
                            !!dataErrorMassage && dataErrorMassage.username,
                            !!apiError.errors &&
                              'username' in apiError.errors &&
                              apiError.errors.username[0]
                          )}
                        </div>
                      )}

                      <div className="row">
                        <div className={Style.profileLabel}>
                          {memberModtranslator('MEMBER.MAIL_ADDRESS')}
                          <span className={Style.requiredLevel}>*</span>
                        </div>
                        <input
                          className={
                            `${Style.profileInputField} ` +
                            `${hasErrorInput(apiError.errors, dataError, 'email') &&
                              Style.hasFormError}`
                          }
                          type="email"
                          name="email"
                          placeholder={memberModtranslator('MEMBER.MAIL_ADDRESS')}
                          defaultValue={memberData.email || ''}
                          value={selectedMember.email || ''}
                          onChange={(e) => this.onChangeValue(e)}
                          onBlur={(e) => this.onChangeValidationCheck('email')}
                          autoComplete="off"
                          maxLength={EMAIL_MAX_LENGTH}
                        />
                      </div>
                      {hasErrorInput(apiError.errors, dataError, 'email') && (
                        <div className={`${Style.helperText}`}>
                          {getErrorMsg(
                            !!dataErrorMassage && dataErrorMassage.email,
                            !!apiError.errors &&
                              'email' in apiError.errors &&
                              apiError.errors.email[0]
                          )}
                        </div>
                      )}

                      <div className="row">
                        <div className={Style.profileLabel}>
                          {memberModtranslator('MEMBER.FULL_NAME')}
                          <span className={Style.requiredLevel}>*</span>
                        </div>
                        <input
                          className={
                            `${Style.profileInputField} ` +
                            `${hasErrorInput(
                              apiError.errors,
                              dataError,
                              'fullname'
                            ) && Style.hasFormError}`
                          }
                          type="text"
                          name="fullname"
                          placeholder={memberModtranslator('MEMBER.FULL_NAME')}
                          defaultValue={memberData.fullname || ''}
                          value={selectedMember.fullname || ''}
                          onChange={(e) => this.onChangeValue(e)}
                          autoComplete="off"
                          maxLength={INPUT_MAX_LENGTH_100}
                        />
                      </div>
                      {hasErrorInput(apiError.errors, dataError, 'fullname') && (
                        <div className={`${Style.helperText}`}>
                          {getErrorMsg(
                            !!dataErrorMassage && dataErrorMassage.fullname,
                            !!apiError.errors &&
                              'fullname' in apiError.errors &&
                              apiError.errors.fullname[0]
                          )}
                        </div>
                      )}

                      {selectedMemberId && (
                        <>
                          <div className="row">
                            <div className={Style.profileLabel}>
                              {memberModtranslator('MEMBER.ADD.LABEL_PASSWORD')}
                            </div>
                            <input
                              className={
                                `${Style.profileInputField} ` +
                                `${hasErrorInput(
                                  apiError.errors,
                                  dataError,
                                  'password'
                                ) && Style.hasFormError}`
                              }
                              type="password"
                              name="password"
                              placeholder={memberModtranslator(
                                'MEMBER.ADD.LABEL_PASSWORD'
                              )}
                              onChange={(e) => this.onChangeValue(e)}
                              onBlur={(e) => this.passwordChangeBlur(e)}
                              autoComplete="off"
                              maxLength={PASSWD_MAX_LENGTH}
                            />
                          </div>
                          <div className="profilePasswordStrength">
                            <PasswordProgressBar data={password} />
                          </div>
                          {!!dataErrorMassage && dataErrorMassage.password && (
                            <div className={`${Style.helperText}`}>
                              {dataErrorMassage.password}
                            </div>
                          )}
                          {hasErrorInput(apiError.errors, {}, 'password') && (
                            <div className={`${Style.helperText}`}>
                              {getErrorMsg(
                                !!apiError.errors &&
                                  'password' in apiError.errors &&
                                  apiError.errors.password[0]
                              )}
                            </div>
                          )}
                          <div className="row">
                            <div className={Style.profileLabel}>
                              {memberModtranslator('MEMBER.ADD.LABEL_CONFIRMATION')}
                            </div>
                            <input
                              className={
                                `${Style.profileInputField} ` +
                                `${hasErrorInput(
                                  apiError.errors,
                                  dataError,
                                  'password_confirmation'
                                ) && Style.hasFormError}`
                              }
                              type="password"
                              name="password_confirmation"
                              placeholder={memberModtranslator(
                                'MEMBER.ADD.LABEL_CONFIRMATION'
                              )}
                              onBlur={this.comparePassword}
                              onChange={(e) => this.onChangeValue(e)}
                              autoComplete="off"
                              maxLength={PASSWD_MAX_LENGTH}
                            />
                          </div>
                          {!!dataErrorMassage &&
                            dataErrorMassage.password_confirmation && (
                              <div className={`${Style.helperText}`}>
                                {dataErrorMassage.password_confirmation}
                              </div>
                            )}
                          {hasErrorInput(
                            apiError.errors,
                            {},
                            'password_confirmation'
                          ) && (
                            <div className={`${Style.helperText}`}>
                              {getErrorMsg(
                                !!apiError.errors &&
                                  'password_confirmation' in apiError.errors &&
                                  apiError.errors.password_confirmation[0]
                              )}
                            </div>
                          )}
                        </>
                      )}
                      <div className="row">
                        <div className={Style.profileLabel} />
                        <div className={Style.profileButton}>
                          <Commonbutton
                            className="primary-medium"
                            onClick={(e) => this.handleSubmit(e)}
                            disabled={this.props.isBtnActive}
                          >
                            {memberModtranslator('MEMBER.ADD.SUBMIT_BUTTON')}
                          </Commonbutton>
                        </div>
                        {!!selectedMemberId && (
                          <>
                            <div className={Style.profileButtonDelete}>
                              <Commonbutton
                                className="danger"
                                disabled={this.props.isBtnActive}
                                onClick={() => this.handleWarning('deleteWarning')}
                              >
                                {memberModtranslator('MEMBER.ADD.DELETE_BUTTON')}
                              </Commonbutton>
                            </div>
                            <div className={Style.deleteText}>
                              <NcCheckbox
                                className={Style.disabledBtn}
                                id="deletedId"
                                handleChange={(event) =>
                                  this.handleDeleteType(event)
                                }
                              />
                              <span>
                                {memberModtranslator('MEMBER.DELETE_ALERT_TEXT')}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Loader />
        )}
      </DefaultLayout>
    );
  }
}

function mapStateToProps(state) {
  return {
    lang: state.commonReducer.lang,
    apiError: state.memberReducer.apiError,
    selectedMemberId: state.memberReducer.selectedMemberId,
    selectedMember: state.memberReducer.selectedMember,
    apiSuccess: state.memberReducer.apiSuccess,
    loading: state.memberReducer.loading,
    isBtnActive: state.memberReducer.isBtnActive,
    currentEmail: state.memberReducer.currentEmail,
    currentUserName: state.memberReducer.currentUserName
  };
}
function mapDispatchToProps(dispatch) {
  return {
    saveMemberItem: (data) => dispatch(saveMemberItem(data)),
    getMemberItemById: (data) => dispatch(getMemberItemById(data)),
    memberItemDelete: (data) => dispatch(memberItemDelete(data)),
    fieldInitialization: (data) => dispatch(fieldInitialization(data))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(MemberForm));
