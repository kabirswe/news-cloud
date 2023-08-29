import React, {Component} from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Alert
} from 'reactstrap';
import {maliMagazineModtranslator} from '../../modLocalization';
import Style from '../mailGroupDetails.module.scss';
import NcInput from '../../../../common-components/NcInput';
import {AddCircleShape, CloseCircleSharp} from '../../mod-assets/svgComp';
import Axios from '../../../../networks/AxiosService';
import API from '../../../../networks/ApiServices';
import Toast from '../../../../common-components/Toast';
import getErrorMessage from '../../../../app-constants/ServerErrorInfo';
import {hasNumber} from '../../../../helper/userHelper';
import usersConstant from '../../../../app-constants/usersConstant';
import {validateEmail} from '../../../../helper/index';
import NcButton from '../../../../common-components/NcButton';
import SmallLoader from '../../../../common-components/SmallLoader';
export default class AddNewPeople extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpenAddNewPeople: this.props.isOpenAddNewPeople,
      isGroupAttempToStore: false,
      isMemberAttempToUpdate: false,
      isAddNewMemberProcess: false,
      isUpdateMemberProcess: false,
      hasShowFullNameError: false,
      hasShowEmailError: false,
      hasShowCompanyError: false,
      hasShowDepartmentError: false,
      emailExistsError: '',
      modalRequest: 0,
      modalInputOperation: 0,
      API_REQ_MODAL_NO: 0,
      emailErrorMsg:'',
      openModal: true
    };
    this.modalCloseAddNewPeople = this.modalCloseAddNewPeople.bind(this);
    this.saveNewMember = this.saveNewMember.bind(this);
    this.updateMemberInfo = this.updateMemberInfo.bind(this);
    this.isEmailExists = this.isEmailExists.bind(this);
  }
  modalCloseAddNewPeople() {
    this.props.modalCloseAddNewPeople();
    this.setState({
      openModal: true,
      isOpenAddNewPeople: false,
      fullNameErrorMsg: '',
      emailErrorMsg: '',
      departmentErrorMsg: '',
      companyErrorMsg: '',
      isMemberAttempToUpdate: false,
      isGroupAttempToStore: false,
      hasShowFullNameError: false,
      hasShowEmailError: false,
      hasShowCompanyError: false,
      hasShowDepartmentError: false,
      emailExistsError: '',
      modalInputOperation: this.state.modalInputOperation + 1
    });
  }

  fullNameValidation() {
    let fullName = this.fullName.value.trim();
    if (fullName.length && fullName.length <= 100) {
      let status = false;
      let fullNameErrorMsg = '';
      this.setState({
        fullNameErrorMsg,
        hasShowFullNameError: false
      });
    } else {
      this.setState({
        fullNameErrorMsg: maliMagazineModtranslator(
          'MAIL_MAGAZINE.GROUP_DETAILS.FULL_NAME_ERROR_MSG'
        ),
        hasShowFullNameError: false
      });
    }
  }
  emailValidation(fromSaveBtn = false) {
    let email = this.email.value.trim();
    let {emailExistsError} = this.state;
    if (email.length && email.length <= 255) {
      let status = false;
      let emailErrorMsg = '';
      if (!validateEmail(email)) {
        emailErrorMsg = maliMagazineModtranslator(
          'MAIL_MAGAZINE.GROUP_DETAILS.INVALID_EMAIL'
        );
      } else {
        status = true;
        emailErrorMsg = '';
      }
      this.setState({
        emailErrorMsg: fromSaveBtn ? emailErrorMsg : '',
        hasShowEmailError: fromSaveBtn ? true : false,
        emailExistsError: fromSaveBtn ? emailExistsError : ''
      });
    } else {
      this.setState({
        emailErrorMsg: maliMagazineModtranslator(
          'MAIL_MAGAZINE.GROUP_DETAILS.EMAIL_ERROR_MSG'
        ),
        hasShowEmailError: false,
        emailExistsError: fromSaveBtn ? emailExistsError : ''
      });
    }
  }
  companyNameValidation() {
    let companyName = this.companyName.value.trim();
    if (companyName.length && companyName.length <= 100) {
      this.setState({
        companyErrorMsg: '',
        hasShowCompanyError: false
      });
    } else {
      this.setState({
        companyErrorMsg: maliMagazineModtranslator(
          'MAIL_MAGAZINE.GROUP_DETAILS.COMPANY_ERROR_MSG'
        ),
        hasShowCompanyError: false
      });
    }
  }
  departmentNameValidation() {
    let departmentName = this.departmentName.value.trim();
    if (departmentName.length && departmentName.length <= 100) {
      this.setState({
        departmentErrorMsg: '',
        hasShowDepartmentError: false
      });
    } else {
      this.setState({
        departmentErrorMsg: maliMagazineModtranslator(
          'MAIL_MAGAZINE.GROUP_DETAILS.DEPARTMENT_ERROR_MSG'
        ),
        hasShowDepartmentError: false
      });
    }
  }

  isEmailExists = (e) =>{
    if(this.state.openModal){
      this.setState({
        openModal:false
      })
      return
    }
    let email = this.email.value.trim();
    let {emailErrorMsg} = this.state;
    let {memberData} = this.props;
    let getSelectedGroup = localStorage.getItem('selectedMailGroup');
    if (email && !emailErrorMsg && memberData.email != email) {
      this.setState({ API_REQ_MODAL_NO : this.state.modalInputOperation})
      let exists = Axios.post(
        API.CHECK_MAIL_MAGAZINE_MEMBER_EMAIL_UNIQUE,
        {email: email, groupId: getSelectedGroup},
        false
      )
        .then((response) => {
          let result = response.data;
          let { API_REQ_MODAL_NO , modalInputOperation}  = this.state;
          if (result.status) {
            this.setState({
              emailExistsError: '',
              hasShowEmailError: true
            });
          } else {
            this.setState({
              emailExistsError:  API_REQ_MODAL_NO == modalInputOperation ? result.message :'',
              hasShowEmailError:  API_REQ_MODAL_NO == modalInputOperation ? true : false
            });
          }
        })
        .catch((err) => {
          const apiError = getErrorMessage(err);
          let { API_REQ_MODAL_NO , modalInputOperation}  = this.state;
          this.setState({
            emailExistsError: API_REQ_MODAL_NO == modalInputOperation ? apiError.message : '',
            hasShowEmailError: API_REQ_MODAL_NO == modalInputOperation ? true : false
          });
        });
    } else {
      if (email && memberData.email && memberData.email == email) {
        this.setState({
          emailExistsError: '',
          hasShowEmailError: false
        });
      }
      if(!email){
        this.setState({
          hasShowEmailError: false,
        })
        return false;
      }
      if (email && !validateEmail(email)) {
        let emailErrorMsg = maliMagazineModtranslator(
          'MAIL_MAGAZINE.GROUP_DETAILS.INVALID_EMAIL'
        );
        this.setState({emailExistsError: emailErrorMsg, hasShowEmailError: true});
      }
    }
  }
  async saveNewMember() {
    let {isAddNewMemberProcess} = this.state;
    if (isAddNewMemberProcess) {
      return false;
    }
    this.setState({isAddNewMemberProcess: true});
    let fullName = this.fullName.value;
    let email = this.email.value;
    let companyName = this.companyName.value;
    let departmentName = this.departmentName.value;
    await this.fullNameValidation(fullName);
    await this.emailValidation(true);
    await this.isEmailExists();
    await this.companyNameValidation(companyName);
    await this.departmentNameValidation(departmentName);
    let {emailExistsError} = this.state;
    let {
      fullNameErrorMsg,
      emailErrorMsg,
      companyErrorMsg,
      departmentErrorMsg
    } = this.state;
    if (
      !fullNameErrorMsg.length &&
      !emailErrorMsg.length &&
      !companyErrorMsg &&
      !departmentErrorMsg &&
      !emailExistsError
    ) {
      this.setState({
        hasShowFullNameError: false,
        hasShowEmailError: false,
        hasShowCompanyError: false,
        hasShowDepartmentError: false
      });
      let param = {
        groupId: this.props.getSelectedGroup,
        email: email,
        name: fullName,
        companyName: companyName,
        departmentName: departmentName
      };
      Axios.post(API.ADD_NEW_GROUP_MEMBER, param, false)
        .then((response) => {
          let result = response.data;
          let serverMsg = result.message;
          this.setState({isAddNewMemberProcess: false});
          if (result.status) {
            this.props.addNewPeopleSuccess();
            this.fullName.value = '';
            this.email.value = '';
            this.companyName.value = '';
            this.departmentName.value = '';
            Toast.success(serverMsg);
            this.modalCloseAddNewPeople();
          } else {
            this.setState({
              isGroupAttempToStore: true,
              addNewGroupMessage: serverMsg,
              addNewGroupStatus: false,
              isAddNewMemberProcess: false
            });
          }
        })
        .catch((err) => {
          const apiError = getErrorMessage(err);
          this.setState(() => ({
            isUpdateDataProcess: false,
            isGroupAttempToStore: true,
            addNewGroupMessage: apiError.message,
            addNewGroupStatus: false,
            isAddNewMemberProcess: false
          }));
        });
    } else {
      this.setState({
        isAddNewMemberProcess: false,
        hasShowFullNameError: true,
        hasShowEmailError: true,
        hasShowCompanyError: true,
        hasShowDepartmentError: true
      });
    }
  }

  async updateMemberInfo() {
    let {isUpdateMemberProcess} = this.state;
    if (isUpdateMemberProcess) {
      return false;
    }
    this.setState({isUpdateMemberProcess: true});
    let fullName = this.fullName.value;
    let email = this.email.value;
    let companyName = this.companyName.value;
    let departmentName = this.departmentName.value;
    await this.fullNameValidation(fullName);
    await this.emailValidation(true);
    await this.isEmailExists();
    await this.companyNameValidation(companyName);
    await this.departmentNameValidation(departmentName);
    let {emailExistsError} = this.state;
    let {
      fullNameErrorMsg,
      emailErrorMsg,
      companyErrorMsg,
      departmentErrorMsg
    } = this.state;
    if (
      !fullNameErrorMsg.length &&
      !emailErrorMsg.length &&
      !companyErrorMsg &&
      !departmentErrorMsg &&
      !emailExistsError
    ) {
      this.setState({
        hasShowFullNameError: false,
        hasShowEmailError: false,
        hasShowCompanyError: false,
        hasShowDepartmentError: false
      });
      let {memberData} = this.props;
      let param = {
        groupId: memberData.group_id,
        email: email,
        name: fullName,
        companyName: companyName,
        departmentName: departmentName
      };
      Axios.put(API.UPDATE_GROUP_MEMBER_INFO + memberData.id, param, false)
        .then((response) => {
          let result = response.data;
          let serverMsg = result.message;
          if (result.status) {
            this.setState(() => ({
              isUpdateDataProcess: false,
              isUpdateMemberProcess: false
            }));
            Toast.success(serverMsg);
            this.modalCloseAddNewPeople();
            this.props.updateMemberInfo();
          } else {
            this.setState(() => ({
              updateServerMsg: serverMsg,
              updateServerStatus: result.status,
              isMemberAttempToUpdate: false,
              isUpdateMemberProcess: false
            }));
          }
        })
        .catch((err) => {
          const apiError = getErrorMessage(err);
          this.setState(() => ({
            isUpdateDataProcess: false,
            isUpdateMemberProcess: false
          }));
          Toast.error(apiError.message);
        });
    } else {
      this.setState(() => ({
        isUpdateMemberProcess: false,
        hasShowFullNameError: true,
        hasShowEmailError: true,
        hasShowCompanyError: true,
        hasShowDepartmentError: true
      }));
    }
  }
  render() {
    let {
      fullNameErrorMsg,
      emailErrorMsg,
      companyErrorMsg,
      departmentErrorMsg,
      isGroupAttempToStore,
      addNewGroupMessage,
      addNewGroupStatus,
      updateServerMsg,
      updateServerStatus,
      isMemberAttempToUpdate,
      hasShowFullNameError,
      hasShowEmailError,
      hasShowCompanyError,
      hasShowDepartmentError,
      emailExistsError,
      isAddNewMemberProcess,
      isUpdateMemberProcess,
      modalInputOperation
    } = this.state;
    let {isOpenAddNewPeople, memberData, isEditMember, editMemberId} =
      this.props || {};
    return (
      <div className="addNewPeople">
        <Modal
          isOpen={isOpenAddNewPeople}
          contentClassName={Style.groupMailModal}
          backdropClassName={Style.backDrop}
          centered
        >
          <ModalHeader className={Style.modalHeader}>
            {maliMagazineModtranslator('MAIL_MAGAZINE.GROUP_DETAILS.ADD_NEW_PEOPLE')}
            <div
              className={Style.customClose}
              tabIndex={0}
              role="button"
              onClick={() => this.modalCloseAddNewPeople()}
            >
              <CloseCircleSharp />
            </div>
          </ModalHeader>

          <ModalBody className={Style.modalBody}>
            <div className={Style.addNewPeopleForm}>
              {isEditMember && editMemberId ? (
                <Alert
                  color={updateServerStatus ? 'success' : 'danger'}
                  isOpen={isMemberAttempToUpdate}
                >
                  <div className={Style.serverResult}>{updateServerMsg}</div>
                </Alert>
              ) : (
                <Alert
                  color={addNewGroupStatus ? 'success' : 'danger'}
                  isOpen={isGroupAttempToStore}
                >
                  <div className={Style.serverResult}>{addNewGroupMessage}</div>
                </Alert>
              )}

              <div className={Style.groupInput}>
                <div className={Style.inputLabel}>
                  {maliMagazineModtranslator(
                    'MAIL_MAGAZINE.GROUP_DETAILS.FULL_NAME'
                  )}
                  <span className="text-danger">*</span>
                </div>
                <div className={Style.input}>
                  <NcInput
                    inputRef={(ref) => {
                      this.fullName = ref;
                    }}
                    type="text"
                    name="text"
                    defaultValue={memberData.name || ''}
                    maxLength={100}
                    errorMessage={hasShowFullNameError && fullNameErrorMsg}
                    onChange={() => this.fullNameValidation()}
                    placeholder={maliMagazineModtranslator(
                      'MAIL_MAGAZINE.GROUP_DETAILS.FULL_NAME_PLACEHOLDER'
                    )}
                  />
                </div>
              </div>

              <div className={Style.groupInput}>
                <div className={Style.inputLabel}>
                  {maliMagazineModtranslator('MAIL_MAGAZINE.GROUP_DETAILS.EMAIL')}
                  <span className="text-danger">*</span>
                </div>
                <div className={Style.input}>
                  <NcInput
                    inputRef={(ref) => {
                      this.email = ref;
                    }}
                    type="text"
                    name="text"
                    defaultValue={memberData.email || ''}
                    maxLength={255}
                    errorMessage={
                      hasShowEmailError && (emailErrorMsg || emailExistsError)
                    }
                    onChange={() => this.emailValidation()}
                    placeholder={maliMagazineModtranslator(
                      'MAIL_MAGAZINE.GROUP_DETAILS.EMAIL_PLACEHOLDER'
                    )}
                    onBlur={(e) => this.isEmailExists(e)}
                  />
                </div>
              </div>
              <div className={Style.groupInput}>
                <div className={Style.inputLabel}>
                  {maliMagazineModtranslator(
                    'MAIL_MAGAZINE.GROUP_DETAILS.COMPANY_NAME'
                  )}
                  <span className="text-danger">*</span>
                </div>
                <div className={Style.input}>
                  <NcInput
                    inputRef={(ref) => {
                      this.companyName = ref;
                    }}
                    type="text"
                    name="text"
                    defaultValue={memberData.company_name || ''}
                    maxLength={100}
                    errorMessage={hasShowCompanyError && companyErrorMsg}
                    onChange={() => this.companyNameValidation()}
                    placeholder={maliMagazineModtranslator(
                      'MAIL_MAGAZINE.GROUP_DETAILS.COMPANY_NAME_PLACEHOLDER'
                    )}
                  />
                </div>
              </div>
              <div className={Style.groupInput}>
                <div className={Style.inputLabel}>
                  {maliMagazineModtranslator(
                    'MAIL_MAGAZINE.GROUP_DETAILS.DEPARTMENT_NAME'
                  )}
                  <span className="text-danger">*</span>
                </div>
                <div className={Style.input}>
                  <NcInput
                    inputRef={(ref) => {
                      this.departmentName = ref;
                    }}
                    type="text"
                    name="text"
                    defaultValue={memberData.department_name || ''}
                    maxLength={100}
                    errorMessage={hasShowDepartmentError && departmentErrorMsg}
                    onChange={() => this.departmentNameValidation()}
                    placeholder={maliMagazineModtranslator(
                      'MAIL_MAGAZINE.GROUP_DETAILS.DEPARTMENT_NAME_PLACEHOLDER'
                    )}
                  />
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className={Style.modalFooter}>
            <NcButton
              className={
                isUpdateMemberProcess || isAddNewMemberProcess
                  ? `${Style.commonButton} ${Style.disabledBtn}`
                  : `${Style.commonButton}`
              }
              callback={()=>
                isEditMember && editMemberId
                  ? this.updateMemberInfo()
                  : this.saveNewMember()
              }
            >
              {maliMagazineModtranslator('MAIL_MAGAZINE.GROUP_DETAILS.SAVE')}
            </NcButton>
            <NcButton
              className={ `${Style.commonButton} ${Style.dangerBtn}`
              }
              callback={()=>this.modalCloseAddNewPeople()}
            >
              {maliMagazineModtranslator('MAIL_MAGAZINE.GROUP_DETAILS.CANCEL')}
            </NcButton>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}
