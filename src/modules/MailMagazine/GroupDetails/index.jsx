import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Modal, ModalHeader, ModalBody, ModalFooter, Alert} from 'reactstrap';
import MailGroupDetailsList from './components/MailGroupDetailsList';
import Style from './mailGroupDetails.module.scss';
import {maliMagazineModtranslator} from '../modLocalization';
import NcButton from '../../../common-components/NcButton';
import MailMagazineContainer from '../../../containers/MailMagazineContainer';
import NcInput from '../../../common-components/NcInput';
import {AddCircleShape, CloseCircleSharp} from '../mod-assets/svgComp';
import Axios from '../../../networks/AxiosService';
import API from '../../../networks/ApiServices';
import getErrorMessage from '../../../app-constants/ServerErrorInfo';
import Loader from '../../../common-components/Loader';
import Toast from '../../../common-components/Toast';
import AddNewPeople from './components/AddNewPeople';
import path from '../../../routes/path';
import NcBreadcrumbs from '../../../common-components/NcBreadcrumbs/ncBreadcrumbs';
import NcCheckbox from '../../../common-components/NcCheckbox';
import SpinnerLoader from '../../../common-components/spinnerLoader';
class MailGroupDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groupInfo: {},
      groupNameError: null,
      commentError: null,
      isLoader: true,
      isUpdateDataProcess: false,
      isAttempAddPeople: true,
      memberList: [],
      deletIds: [],
      memberData: {},
      csvLoader: false,
      csvUploadLoader: false,
      groupNameExistsError: '',
      isDeleteProcessing: false,
      hasShowGroupNameError: false,
      hasShowCommentError: false,
      reLoadMemberList: false,
      isSoftDelete: false
    };
    this.updateGroup = this.updateGroup.bind(this);
    this.noUpdateData = this.noUpdateData.bind(this);
    this.modalOpenAddNewPeople = this.modalOpenAddNewPeople.bind(this);
    this.modalCloseAddNewPeople = this.modalCloseAddNewPeople.bind(this);
    this.addNewPeopleSuccess = this.addNewPeopleSuccess.bind(this);
    this.selectDeselectAll = this.selectDeselectAll.bind(this);
    this.openConfirmModal = this.openConfirmModal.bind(this);
    this.confirmModalClose = this.confirmModalClose.bind(this);
    this.deleteProcess = this.deleteProcess.bind(this);
    this.editMemberInfo = this.editMemberInfo.bind(this);
    this.updateMemberInfo = this.updateMemberInfo.bind(this);
    this.mailListCSVDownload = this.mailListCSVDownload.bind(this);
    this.checkGroupNameExists = this.checkGroupNameExists.bind(this);
    this.getGroupMemberList = this.getGroupMemberList.bind(this);
    this.isSoftDelete = this.isSoftDelete.bind(this);
  }

  async componentDidMount() {
    const getSelectedGroup = localStorage.getItem('selectedMailGroup');
    Axios.get(API.GET_MAIL_GROUP_DETAILS + getSelectedGroup, {}, false)
      .then((response) => {
        // const {data} = response;
        this.setState(() => ({
          groupInfo: response.data.data,
          isLoader: false
        }));
      })
      .catch((err) => {
        this.setState(() => ({
          isLoader: false
        }));
        const apiError = getErrorMessage(err);
        Toast.error(apiError.message);
      });
    this.getGroupMemberList(true);
    Toast.clear();
  }

 async getGroupMemberList(reLoadMemberList = false) {
    const getSelectedGroup = localStorage.getItem('selectedMailGroup');
    this.setState({reLoadMemberList: reLoadMemberList});
   await Axios.get(API.GET_GROUP_MEMBER_LIST + getSelectedGroup, {}, false)
      .then((response) => {
        const result = response.data.data.list || [];
        this.setState(() => ({
          memberList: result,
          isLoader: false,
          reLoadMemberList: false
        }));
      })
      .catch((err) => {
        this.setState(() => ({
          isLoader: false,
          memberList: [],
          reLoadMemberList: false
        }));
        const apiError = getErrorMessage(err);
        Toast.error(apiError.message);
      });

    this.setState({getSelectedGroup});
  }

  groupNameValidation(fromSaveBtn = false) {
    const groupName = this.groupName.value.trim();
    const {groupNameExistsError} = this.state;
    if (groupName.length && groupName.length <= 100) {
      const groupNameError = '';
      const {groupNameExistsError} = this.state;
      this.setState({
        groupNameError,
        hasShowGroupNameError: groupNameExistsError ? true : false,
        groupNameExistsError: fromSaveBtn ? groupNameExistsError : ''
      });
    } else {
      this.setState({
        groupNameError: maliMagazineModtranslator(
          'MAIL_MAGAZINE.GROUP.GROUP_NAME_ERROR'
        ),
        hasShowGroupNameError: false,
        groupNameExistsError: fromSaveBtn ? groupNameExistsError : '',
      });
    }
  }

  commentValidation() {
    const comment = this.comment.value.trim();
    if (comment.trim().length && comment.length <= 100) {
      const commentError = '';
      this.setState({commentError, hasShowCommentError: false});
    } else {
      this.setState({
        commentError: maliMagazineModtranslator('MAIL_MAGAZINE.GROUP.COMMENT_ERROR'),
        hasShowCommentError: false
      });
    }
  }

  async updateGroup() {
    const getSelectedGroup = localStorage.getItem('selectedMailGroup');
    this.setState({
      isUpdateDataProcess: true
    });
    const groupName = this.groupName.value;
    const comment = this.comment.value;
    await this.groupNameValidation(true);
    await this.commentValidation();
    await this.checkGroupNameExists();
    const {
      groupNameError,
      commentError,
      groupNameExistsError,
      groupInfo
    } = this.state;
    const isValidGroup = groupNameError.length ? false : true;
    const isValidComment = commentError.length ? false : true;
    const isGroupAvailable = groupNameExistsError ? false : true;
    if (isValidGroup && isValidComment && isGroupAvailable) {
      this.setState({
        hasShowGroupNameError: false,
        hasShowCommentError: false
      });
      const param = {
        groupName: groupName,
        comments: comment
      };
      Axios.put(API.UPDATE_MAIL_GROUP + getSelectedGroup, param, false)
        .then((response) => {
          const result = response.data;
          if (response.status) {
            Toast.success(result.message);
            groupInfo.group_name = groupName;
            this.setState({groupInfo});
          } else {
            Toast.error(result.message);
          }
          this.setState(() => ({isUpdateDataProcess: false}));
        })
        .catch((err) => {
          const apiError = getErrorMessage(err);
          Toast.error(apiError.message);
          this.setState(() => ({isUpdateDataProcess: false}));
        });
    } else {
      this.setState({
        isUpdateDataProcess: false,
        hasShowGroupNameError: true,
        hasShowCommentError: true
      });
    }
  }

  noUpdateData() {
    return false;
  }

  modalOpenAddNewPeople() {
    this.setState({
      isOpenAddNewPeople: true,
      isModalOpenAttemp: true,
      memberData: {},
      isEditMember: false,
      editMemberId: null
    });
  }

  modalCloseAddNewPeople() {
    this.setState({
      isOpenAddNewPeople: false,
      memberData: {},
      isEditMember: false,
      editMemberId: null
    });
  }

  addNewPeopleSuccess() {
    this.getGroupMemberList(true);
  }

  selectDeselectAll(selectRows) {
    const deletIds = [];
    selectRows.forEach((item) => {
      const ids = {id: item.id};
      deletIds.push(ids);
    });
    this.setState({deletIds});
  }

  async deleteProcess() {
    const {memberList, deletIds, isDeleteProcessing} = this.state;
    if (isDeleteProcessing) {
      return false;
    }
    this.setState({isDeleteProcessing: true});
    const deleteAPI = await Axios.remove(
      API.DELETE_MEMBER_FROM_GROUP_MAIL,
      {
        memberId: JSON.stringify(deletIds),
        deleteType: this.state.isSoftDelete ? 1 : 0
      },
      false
    )
      .then((response) => {
        const {status} = response.data;
        const {message} = response.data;
        if (status) {
          Toast.success(message);
          this.setState(() => ({
            deletIds: []
          }));
          this.getGroupMemberList(true);
        } else {
          Toast.error(message);
        }
        this.setState(() => ({confirmModalOpen: false, isDeleteProcessing: false}));
      })
      .catch((err) => {
        const apiError = getErrorMessage(err);
        Toast.error(apiError.message);
        this.setState(() => ({confirmModalOpen: false, isDeleteProcessing: false}));
      });
  }

  async openConfirmModal() {
    const {deletIds} = this.state;
    if (deletIds.length) {
      this.setState({
        confirmModalOpen: true,
        memberServerMessage: '',
        isMemberAttempToStore: false,
        isDeleteProcessing: false
      });
      Toast.clear();
    } else {
      Toast.error(
        maliMagazineModtranslator(
          'MAIL_MAGAZINE.GROUP_DETAILS.MEMBER_SELECTION_ERROR'
        )
      );
    }
  }

  confirmModalClose() {
    this.setState({confirmModalOpen: false, isDeleteProcessing: false});
  }

  editMemberInfo(memberId) {
    /* 
      Axios.get(API.EDIT_GROUP_MEMVER + memberId, {}, false)
    */
    const {memberList} = this.state;
    const index = memberList.findIndex((item) => item.id == memberId);
    const memberData = memberList[index];
    this.setState({
      indexPosition: index,
      isEditMember: true,
      editMemberId: memberId,
      isOpenAddNewPeople: true,
      isModalOpenAttemp: true,
      memberData: memberData,
      findMemberIndex: index
    });
  }

  updateMemberInfo() {
    this.getGroupMemberList(true);
  }

  async mailListCSVDownload() {
    const {csvLoader} = this.state;
    if (!csvLoader) {
      this.setState({csvLoader: true});
      const getSelectedGroup = localStorage.getItem('selectedMailGroup');
      const csvDownload = await Axios.get(
        API.MAIL_GROUP_LIST_CSV_DOWNLOAD + getSelectedGroup,
        {},
        false
      )
        .then((response) => {
          const result = response.data;
          if (result.status) {
            const link = document.createElement('a');
            link.download = 'download';
            link.href = result.data.file_url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            Toast.error(result.message);
          }
          setTimeout(() => {
            this.setState(() => ({
              csvLoader: false
            }));
          }, 1000);
        })
        .catch((err) => {
          const apiError = getErrorMessage(err);
          Toast.error(apiError.message);
          this.setState(() => ({
            iscsvLoaderLoader: false
          }));
        });
    }
  }

  async checkGroupNameExists() {
    const groupName = this.groupName.value || "";
    const {groupNameError, groupInfo} = this.state;
    if (!groupNameError && groupName != groupInfo.group_name) {
      const extis = await Axios.post(
        API.CHECK_GROUP_MAIL_EXISTS,
        {groupName: groupName},
        false
      )
        .then((response) => {
          const result = response.data;
          if (result.status) {
            this.setState({
              groupNameExistsError: '',
              hasShowGroupNameError: true
            });
          } else {
            this.setState({
              groupNameExistsError: result.message,
              hasShowGroupNameError: true
            });
          }
        })
        .catch((err) => {
          const apiError = getErrorMessage(err);
          this.setState({
            groupNameExistsError: apiError.message
          });
        });
    } else if (groupName == groupInfo.group_name) {
      this.setState({
        groupNameExistsError: ''
      });
    }
  }

  async onChangeFile(event) {
    const file = event.target.files[0];
    if (file && file.name) {
      const maxFileSize = 2 * 1024 * 1024;
      const isFileTypeCSV = this.isCSVFile(file.name);
      if (isFileTypeCSV && file.size < maxFileSize) {
        const formData = new FormData();
        formData.append('file', file);
        /* Action here for valid file */

        this.setState({csvUploadLoader: true});
        const getSelectedGroup = localStorage.getItem('selectedMailGroup');
        const upload = await Axios.post(
          API.GROUP_MAIL_MEMBER_CSV_UPLOAD + getSelectedGroup,
          formData,
          false
        )
          .then((response) => {
            const result = response.data;
            if (result.status) {
              this.setState({
                csvUploadLoader: false
              });
              Toast.success(result.message);
            } else {
              this.setState({
                csvUploadLoader: false
              });
              Toast.error(result.message);
            }
            setTimeout(() => {
              this.getGroupMemberList(true);
            }, 1500)
            this.upload.value = '';
            if (result.data && result.data.invalid_members_file_url) {
              const link = document.createElement('a');
              link.download = 'download';
              link.href = result.data.invalid_members_file_url;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          })
          .catch((err) => {
            const apiError = getErrorMessage(err);
            this.setState({
              csvUploadLoader: false
            });
            Toast.error(apiError.message);
            let errorData = (err.response && err.response.data &&  err.response.data.error) || {};
            if(errorData.invalid_members_file_url){
              const link = document.createElement('a');
              link.download = 'download';
              link.style.display = 'none';
              link.href = errorData.invalid_members_file_url;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
            setTimeout(() => {
              this.getGroupMemberList(true);
            }, 1500)
          });
      } else if (!isFileTypeCSV) {
        Toast.error(
          maliMagazineModtranslator('MAIL_MAGAZINE.GROUP_DETAILS.CSV_ERROR.FORMAT')
        );
        this.setState({
          csvUploadLoader: false
        });
      } else if (file.size > maxFileSize) {
        Toast.error(
          maliMagazineModtranslator('MAIL_MAGAZINE.GROUP_DETAILS.CSV_ERROR.SIZE')
        );
        this.setState({
          csvUploadLoader: false
        });
      }
      // event.stopPropagation();
      // event.preventDefault();
    }
  }

  getExtension(filename) {
    const parts = filename.split('.');
    return parts[parts.length - 1];
  }

  isCSVFile(filename) {
    const ext = this.getExtension(filename);
    switch (ext.toLowerCase()) {
      case 'csv':
        return true;
    }
    return false;
  }
  isSoftDelete(event) {
    this.setState({isSoftDelete: event.target.checked});
  }

  render() {
    const {
      groupInfo,
      groupNameError,
      commentError,
      isLoader,
      isUpdateDataProcess,
      isOpenAddNewPeople,
      memberList,
      isModalOpenAttemp,
      getSelectedGroup,
      confirmModalOpen,
      isEditMember,
      editMemberId,
      memberData,
      isUpdatedId,
      csvLoader,
      csvUploadLoader,
      groupNameExistsError,
      hasShowGroupNameError,
      hasShowCommentError,
      reLoadMemberList,
      isDeleteProcessing
    } = this.state;
    const breadcrumbs = [
      {
        title: maliMagazineModtranslator('MAIL_MAGAZINE.GROUP_DETAILS.EMAIL_LIST'),
        link: path.mailGroup
      },
      {
        title: maliMagazineModtranslator(
          'MAIL_MAGAZINE.GROUP_DETAILS.BREADCRUMBS_TITLE'
        ),
        link: '',
        active: true
      }
    ];
    return (
      <MailMagazineContainer>
        {isLoader ? (
          <Loader />
        ) : (
          <div className={`container-fluid ${Style.pagePadding}`}>
            <div className={`container-fluid ${Style.pagePadding}`}>
              <Toast />
              <NcBreadcrumbs breadcrumbs={breadcrumbs} />
              <div className={`${Style.pageTitle} ${Style.paddingTop}`}>
                {/* {maliMagazineModtranslator('MAIL_MAGAZINE.GROUP_DETAILS.PAGE_TITLE')} */}
                {groupInfo && groupInfo.group_name}
              </div>
              <div className={`${Style.groupInputArea}`}>
                <div className={`${Style.groupSection}`}>
                  <NcInput
                    label={maliMagazineModtranslator(
                      'MAIL_MAGAZINE.GROUP_DETAILS.GROUP_NAME'
                    )}
                    isRequired
                    type="text"
                    placeholder={maliMagazineModtranslator(
                      'MAIL_MAGAZINE.GROUP.GROUP_NAME_PLACEHOLDER'
                    )}
                    className={Style.bgWhite}
                    maxLength={100}
                    errorMessage={
                      hasShowGroupNameError &&
                      (groupNameError || groupNameExistsError)
                    }
                    defaultValue={groupInfo && groupInfo.group_name}
                    inputRef={(ref) => {
                      this.groupName = ref;
                    }}
                    onChange={() => this.groupNameValidation}
                    onBlur={()=>this.checkGroupNameExists()}
                  />
                </div>
                <div className={`${Style.groupComment}`}>
                  <NcInput
                    label={maliMagazineModtranslator(
                      'MAIL_MAGAZINE.GROUP_DETAILS.COMMENT'
                    )}
                    isRequired
                    type="text"
                    placeholder={maliMagazineModtranslator(
                      'MAIL_MAGAZINE.GROUP.COMMENT_PLACEHOLDER'
                    )}
                    maxLength={100}
                    className={Style.bgWhite}
                    errorMessage={hasShowCommentError && commentError}
                    defaultValue={groupInfo && groupInfo.comments}
                    inputRef={(ref) => {
                      this.comment = ref;
                    }}
                    onChange={() => this.commentValidation()}
                  />
                </div>
                <div className={`${Style.groupBtnSave}`}>
                  <NcButton
                    className={
                      isUpdateDataProcess
                        ? `${Style.customBtn} ${Style.disabledBtn}`
                        : `${Style.customBtn}`
                    }
                    callback={()=>
                      isUpdateDataProcess ? this.noUpdateData() : this.updateGroup()
                    }
                  >
                    {maliMagazineModtranslator('MAIL_MAGAZINE.GROUP_DETAILS.EDIT')}
                  </NcButton>
                </div>
              </div>

              <div className={`row ${Style.buttonGroupArea}`}>
                <div className="col-lg-5"></div>
                <div className="col-lg-7">
                  <div className={`float-right  ${Style.rightSideMenu}`}>
                    <div
                      className={`${Style.groupDetailsAddEmailBtn} ${Style.spinLoader}`}
                      onClick={() => this.modalOpenAddNewPeople()}
                    >
                      <AddCircleShape />
                      <span>
                        {' '}
                        {maliMagazineModtranslator(
                          'MAIL_MAGAZINE.GROUP_DETAILS.EMAIL_BTN'
                        )}{' '}
                      </span>
                    </div>
                    <div className={csvUploadLoader ? `${Style.widthLoader}` :''}>
                      <input
                        id="myInput"
                        type="file"
                        name="upload"
                        ref={(ref) => (this.upload = ref)}
                        style={{display: 'none'}}
                        onChange={this.onChangeFile.bind(this)}
                      />
                      <NcButton
                        className={
                          csvUploadLoader || csvLoader
                            ? `${Style.customBtn} ${Style.disabledBtn} ${Style.uploadBtn}`
                            : `${Style.customBtn} ${Style.uploadBtn}`
                        }
                        callback={() => this.upload.click()}
                      >
                        {csvUploadLoader && <SpinnerLoader />}

                        {maliMagazineModtranslator(
                          'MAIL_MAGAZINE.GROUP_DETAILS.CSV_UPLOAD'
                        )}
                      </NcButton>
                    </div>
                    <div
                      className={
                        csvLoader
                          ? `${Style.spinLoader} ${Style.widthLoader}`
                          : `${Style.spinLoader}`
                      }
                    >
                      <NcButton
                        className={
                          csvUploadLoader || csvLoader || !memberList.length
                            ? `${Style.customBtn} ${Style.disabledBtn} ${Style.downLoadBtn}`
                            : `${Style.customBtn} ${Style.downLoadBtn}`
                        }
                        callback={()=>this.mailListCSVDownload()}
                      >
                        {csvLoader && <SpinnerLoader />}
                        {maliMagazineModtranslator(
                          'MAIL_MAGAZINE.GROUP_DETAILS.CSV_DOWNLOAD'
                        )}
                      </NcButton>
                    </div>
                    <div>
                      {/* <NcButton
                        className={
                          csvUploadLoader || csvLoader || !memberList.length
                            ? `${Style.customBtn} ${Style.disabledBtn} ${Style.dangerBtn}`
                            : `${Style.customBtn} ${Style.dangerBtn}`
                        }
                        callback={this.openConfirmModal}
                      >
                        {maliMagazineModtranslator(
                          'MAIL_MAGAZINE.GROUP_DETAILS.DELETE'
                        )}
                      </NcButton> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`row ${Style.mailMagazineComponent}`}>
              <div
                className={`col-lg-12 ${Style.dataTableList} user-list-pagination`}
              >
                {reLoadMemberList ? (
                  <Loader />
                ) : (
                  <MailGroupDetailsList
                    memberList={memberList}
                    selectDeselectAll={this.selectDeselectAll}
                    editMemberInfo={this.editMemberInfo}
                    isUpdatedId={isUpdatedId}
                  />
                )}
              </div>
            </div>

            {memberList && memberList.length ? (
              <div className={`${Style.deleteButtonArea} float-right`}>
                <div className={`${Style.deleteText}`}>
                  <NcCheckbox id="maildeletedId" handleChange={this.isSoftDelete} />
                  <span>
                    {' '}
                    {maliMagazineModtranslator(
                      'MAIL_MAGAZINE.GROUP_DETAILS.SOFT_DELETE_TEXT'
                    )}
                  </span>
                </div>

                <NcButton
                  className={
                    csvUploadLoader || csvLoader || !memberList.length
                      ? `${Style.customBtn} ${Style.disabledBtn} ${Style.dangerBtn}`
                      : `${Style.customBtn} ${Style.dangerBtn}`
                  }
                  callback={()=>this.openConfirmModal()}
                >
                  {maliMagazineModtranslator('MAIL_MAGAZINE.GROUP_DETAILS.DELETE')}
                </NcButton>
              </div>
            ) : (
              ''
            )}
          </div>
        )}

        <div className="deleteConfirmModal">
          <Modal
            isOpen={confirmModalOpen}
            toggle={this.toggleModalConfirm}
            contentClassName={Style.groupMailModal}
            backdropClassName={Style.backDrop}
            centered
          >
            <ModalHeader className={Style.modalHeader}>
              {maliMagazineModtranslator('MAIL_MAGAZINE.GROUP.CONFRIM_DELETE')}
              <div
                className={Style.customClose}
                tabIndex={0}
                role="button"
                onClick={() => this.confirmModalClose()}
              >
                <CloseCircleSharp />
              </div>
            </ModalHeader>

            <ModalBody className={Style.modalBody}>
              <div className={Style.deleteConfirm}>
                {maliMagazineModtranslator(
                  'MAIL_MAGAZINE.GROUP_DETAILS.CONFIRM_DELETE_MSG'
                )}
              </div>
            </ModalBody>
            <ModalFooter className={Style.modalFooterDelete}>
              <NcButton
                className={
                  isDeleteProcessing
                    ? `${Style.commonButton} ${Style.disabledBtn}`
                    : `${Style.commonButton}`
                }
                callback={()=>this.deleteProcess()}
              >
                {maliMagazineModtranslator('MAIL_MAGAZINE.GROUP.YES_BUTTON')}
              </NcButton>
              <NcButton
                className={`${Style.commonButton} ${Style.dangerBtn}`}
                callback={()=>this.confirmModalClose()}
              >
                {maliMagazineModtranslator('MAIL_MAGAZINE.GROUP.NO_BUTTON')}
              </NcButton>
            </ModalFooter>
          </Modal>
        </div>
        {isModalOpenAttemp && (
          <AddNewPeople
            isOpenAddNewPeople={isOpenAddNewPeople}
            modalCloseAddNewPeople={this.modalCloseAddNewPeople}
            getSelectedGroup={getSelectedGroup}
            addNewPeopleSuccess={this.addNewPeopleSuccess}
            memberData={memberData}
            isEditMember={isEditMember}
            editMemberId={editMemberId}
            updateMemberInfo={this.updateMemberInfo}
          />
        )}
      </MailMagazineContainer>
    );
  }
}

function mapStateToProps(state) {
  return {
    lang: state.commonReducer.lang
  };
}

export default connect(mapStateToProps)(withRouter(MailGroupDetails));
