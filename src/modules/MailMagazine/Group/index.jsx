import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Modal, ModalHeader, ModalBody, ModalFooter, Alert} from 'reactstrap';
import MailGroupList from './components/MailGroupList';
import Style from './mailGroup.module.scss';
import {translator} from '../../../localizations';
import {maliMagazineModtranslator} from '../modLocalization';
import NcButton from '../../../common-components/NcButton';
import {DuplicateIcon, CloseCircleSharp} from '../mod-assets/svgComp';
import MailMagazineContainer from '../../../containers/MailMagazineContainer';
import NcInput from '../../../common-components/NcInput';
import getErrorMessage from '../../../app-constants/ServerErrorInfo';
import Axios from '../../../networks/AxiosService';
import API from '../../../networks/ApiServices';
import Loader from '../../../common-components/Loader';
import Toast from '../../../common-components/Toast';
import path from '../../../routes/path';
import NcBreadcrumbs from '../../../common-components/NcBreadcrumbs/ncBreadcrumbs';

class MailGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      isOpenAlert: true,
      groupNameError: '',
      commentError: '',
      isGroupAttempToStore: false,
      isAddDataProcess: false,
      isSelectedAll: false,
      confirmModalOpen: false,
      deletIds: [],
      isGroupAttempToDelete: false,
      groupNameExistsError: '',
      isDeleteProcessing: false,
      hasShowGroupNameError: false,
      hasShowCommentError: false,
      reLoadModalList: false,
      isLoader: true
    };
    this.addGroupMail = this.addGroupMail.bind(this);
    this.selectDeselectAll = this.selectDeselectAll.bind(this);
    this.deleteProcess = this.deleteProcess.bind(this);
    this.openConfirmModal = this.openConfirmModal.bind(this);
    this.confirmModalClose = this.confirmModalClose.bind(this);
    this.groupMailDetails = this.groupMailDetails.bind(this);
    this.modalOpen = this.modalOpen.bind(this);
    this.modalClose = this.modalClose.bind(this);
    this.checkGroupNameExists = this.checkGroupNameExists.bind(this);
  }

  modalOpen() {
    this.setState({
      modalOpen: true,
      isGroupAttempToStore: false,
      groupNameError: '',
      commentError: '',
      isDataProcessing: false,
      groupNameExistsError: ''
    });
  }

  componentDidMount() {
    this.getEmailGroupList('', false);
    Toast.clear();
  }

  getEmailGroupList(param = '', reLoadModalList) {
    this.setState({reLoadModalList: reLoadModalList});
    Axios.get(API.GET_EMAIL_GROUP_LIST, param, false)
      .then((response) => {
        this.setState({
          groupList: response.data.data.list || [],
          isLoader: false,
          groupMsessage: response.data.message,
          groupStatus: response.data.status
        });
        this.setState({reLoadModalList: false});
      })
      .catch((err) => {
        const apiError = getErrorMessage(err);
        this.setState({
          isLoader: false,
          groupList: [],
          groupMsessage: apiError.message,
          groupStatus: false,
          reLoadModalList: false
        });
      });
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
        groupNameExistsError: fromSaveBtn ? groupNameExistsError : ''
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

  async addGroupMail() {
    const {isAddDataProcess} = this.state;
    if (isAddDataProcess) {
      return false;
    }
    this.setState({isAddDataProcess: true});
    const groupName = this.groupName.value;
    const comment = this.comment.value;
    await this.groupNameValidation(true);
    await this.commentValidation();
    await this.checkGroupNameExists();
    const {groupNameError, commentError, groupNameExistsError} = this.state;
    const isValidGroup = groupNameError ? false : true;
    const isValidComment = commentError ? false : true;
    const isGroupAvailable = groupNameExistsError ? false : true;
    if (isValidGroup && isValidComment && isGroupAvailable) {
      const param = {
        groupName: groupName,
        comments: comment
      };
      Axios.post(API.ADD_NEW_GROUP, param, false)
        .then((response) => {
          const result = response.data;
          if (result.status) {
            Toast.success(result.message);
            this.setState({
              isGroupAttempToStore: false,
              isAddDataProcess: false,
              hasShowGroupNameError: false,
              hasShowCommentError: false
            });
            this.groupName.value = '';
            this.comment.value = '';
            this.modalClose();
            this.getEmailGroupList('', true);
          } else {
            Toast.clear();
            this.setState({
              addNewGroupStatus: false,
              addNewGroupMessage: result.message,
              isGroupAttempToStore: true,
              isAddDataProcess: false,
              hasShowGroupNameError: false,
              hasShowCommentError: false
            });
          }
        })
        .catch((err) => {
          Toast.clear();
          const apiError = getErrorMessage(err);
          this.setState({
            isGroupAttempToStore: true,
            isAddDataProcess: false,
            deletIds: [],
            addNewGroupStatus: false,
            addNewGroupMessage: apiError.message,
            hasShowGroupNameError: false,
            hasShowCommentError: false
          });
        });
    } else {
      this.setState({
        isGroupAttempToStore: false,
        isAddDataProcess: false,
        hasShowGroupNameError: true,
        hasShowCommentError: true
      });
    }
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
    const {groupList, deletIds, isDeleteProcessing} = this.state;
    if (isDeleteProcessing) {
      return false;
    }
    this.setState({isDeleteProcessing: true});
    const deleteAPI = await Axios.remove(
      API.DELETE_MAIL_GROUP,
      {groupId: JSON.stringify(deletIds)},
      false
    )
      .then((response) => {
        const {status} = response.data;
        const {message} = response.data;
        if (status) {
          Toast.success(message);
          this.getEmailGroupList('', true);
          this.setState(() => ({
            deletIds: [],
            confirmModalOpen: false,
            isGroupAttempToDelete: false,
            isDeleteProcessing: false
          }));
        } else {
          Toast.error(message);
          this.setState(() => ({
            deletIds: [],
            isGroupAttempToDelete: true,
            serverDeleteMsg: message,
            serverDeleteStatus: false,
            isDeleteProcessing: false,
            confirmModalOpen: false
          }));
        }
      })
      .catch((err) => {
        const apiError = getErrorMessage(err);
        Toast.error(apiError.message);
        this.setState(() => ({
          confirmModalOpen: false,
          isGroupAttempToDelete: true,
          serverDeleteMsg: apiError.message,
          serverDeleteStatus: false,
          isDeleteProcessing: false
        }));
      });
  }

  async openConfirmModal() {
    const {deletIds} = this.state;
    if (deletIds.length) {
      this.setState({
        confirmModalOpen: true,
        addNewGroupMessage: '',
        isGroupAttempToStore: false,
        isGroupAttempToDelete: false,
        serverDeleteMsg: '',
        serverDeleteStatus: false,
        groupNameExistsError: '',
        isDeleteProcessing: false
      });
      Toast.clear();
    } else {
      Toast.error(maliMagazineModtranslator('MAIL_MAGAZINE.GROUP.SELECETION_ERROR'));
    }
  }

  confirmModalClose() {
    this.setState({
      confirmModalOpen: false,
      isGroupAttempToDelete: false,
      serverDeleteMsg: '',
      serverDeleteStatus: false,
      isDeleteProcessing: false
    });
  }

  groupMailDetails(id) {
    localStorage.setItem('selectedMailGroup', id);
    this.props.history.push(path.groupMailList);
  }

  modalClose() {
    this.setState({
      modalOpen: false,
      isGroupAttempToStore: false,
      addNewGroupMessage: '',
      groupNameError: '',
      commentError: '',
      isDataProcessing: false
    });
  }

  async checkGroupNameExists() {
    const groupName = this.groupName.value;
    const {groupNameError} = this.state;
    if (!groupNameError) {
      if (groupName) {
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
              groupNameExistsError: apiError.message,
              hasShowGroupNameError: true
            });
          });
      }
    }
  }

  render() {
    const {
      modalOpen,
      isLoader,
      groupList,
      groupNameError,
      commentError,
      isGroupAttempToStore,
      isAddDataProcess,
      isSelectedAll,
      confirmModalOpen,
      addNewGroupStatus,
      addNewGroupMessage,
      groupNameExistsError,
      hasShowGroupNameError,
      hasShowCommentError,
      reLoadModalList,
      isDeleteProcessing
    } = this.state;

    const breadcrumbs = [
      {
        title: maliMagazineModtranslator('MAIL_MAGAZINE.GROUP.BREADCRUMBS_TITLE'),
        link: '',
        active: true
      },
      {title: '', link: '', active: true}
    ];

    return (
      <MailMagazineContainer>
        {isLoader ? (
          <Loader />
        ) : (
          <div className="container-fluid">
            <Toast />
            <div className={`row ${Style.mailMagazineComponent}`}>
              <div className={`col-lg-12  ${Style.pageHeading}`}>
                <NcBreadcrumbs breadcrumbs={breadcrumbs} />
                <div className={`${Style.mailGroup} float-left`}>
                  {groupList && groupList.length
                    ? maliMagazineModtranslator('MAIL_MAGAZINE.GROUP.SUB_PAGE_TITLE')
                    : ''}
                </div>
                <div className="float-right">
                  <div className={`${Style.rightButtonArea}`}>
                    <div
                      className={`${Style.addGroupBtn}`}
                      onClick={() => this.modalOpen()}
                    >
                      <DuplicateIcon />
                      <span>
                        {' '}
                        {maliMagazineModtranslator(
                          'MAIL_MAGAZINE.GROUP.ADD_GROUP'
                        )}{' '}
                      </span>
                    </div>

                    <NcButton
                      className={
                        groupList && !groupList.length
                          ? `${Style.customBtn} ${Style.dangerBtn} ${Style.disabledBtn}`
                          : `${Style.customBtn} ${Style.dangerBtn}`
                      }
                      callback={this.openConfirmModal}
                    >
                      {translator('BUTTON.DELETE')}
                    </NcButton>
                  </div>
                  <Modal
                    isOpen={confirmModalOpen}
                    toggle={this.toggleModalConfirm}
                    contentClassName={Style.groupMailModal}
                    backdropClassName={Style.backDrop}
                    centered
                  >
                    <ModalHeader className={Style.modalHeader}>
                      {maliMagazineModtranslator(
                        'MAIL_MAGAZINE.GROUP.CONFRIM_DELETE'
                      )}
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
                          'MAIL_MAGAZINE.GROUP.CONFIRM_DELETE_MSG'
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
                        callback={this.deleteProcess}
                      >
                        {maliMagazineModtranslator('MAIL_MAGAZINE.GROUP.YES_BUTTON')}
                      </NcButton>
                      <NcButton
                        className={`${Style.commonButton} ${Style.dangerBtn}`}
                        callback={this.confirmModalClose}
                      >
                        {maliMagazineModtranslator('MAIL_MAGAZINE.GROUP.NO_BUTTON')}
                      </NcButton>
                    </ModalFooter>
                  </Modal>

                  <Modal
                    isOpen={modalOpen}
                    toggle={this.toggleModal}
                    contentClassName={Style.groupMailModal}
                    backdropClassName={Style.backDrop}
                    centered
                  >
                    <ModalHeader
                      className={Style.modalHeader}
                      toggle={this.toggleModal}
                    >
                      {maliMagazineModtranslator(
                        'MAIL_MAGAZINE.GROUP.ADD_MODAL_TITLE'
                      )}
                      <div
                        className={Style.customClose}
                        tabIndex={0}
                        role="button"
                        onClick={() => this.modalClose()}
                      >
                        <CloseCircleSharp />
                      </div>
                    </ModalHeader>
                    <ModalBody className={Style.modalBody}>
                      <Alert
                        color={addNewGroupStatus ? 'success' : 'danger'}
                        isOpen={isGroupAttempToStore}
                      >
                        <div className={Style.serverResult}>
                          {addNewGroupMessage}
                        </div>
                      </Alert>
                      <div className={Style.groupInput}>
                        <div className={Style.inputLabel}>
                          {maliMagazineModtranslator(
                            'MAIL_MAGAZINE.GROUP.GROUP_NAME'
                          )}
                          <span className="text-danger">*</span>
                        </div>
                        <div className={Style.input}>
                          <NcInput
                            inputRef={(ref) => {
                              this.groupName = ref;
                            }}
                            type="text"
                            name="text"
                            defaultValue=""
                            maxLength={100}
                            errorMessage={
                              hasShowGroupNameError &&
                              (groupNameError || groupNameExistsError)
                            }
                            onChange={() => this.groupNameValidation()}
                            placeholder={maliMagazineModtranslator(
                              'MAIL_MAGAZINE.GROUP.GROUP_NAME_PLACEHOLDER'
                            )}
                            onBlur={() => this.checkGroupNameExists()}
                          />
                        </div>
                      </div>

                      <div className={Style.groupInput}>
                        <div className={Style.inputLabel}>
                          {maliMagazineModtranslator('MAIL_MAGAZINE.GROUP.COMMENT')}
                          <span className="text-danger">*</span>
                        </div>
                        <div className={Style.input}>
                          <NcInput
                            inputRef={(ref) => {
                              this.comment = ref;
                            }}
                            type="text"
                            name="text"
                            defaultValue=""
                            maxLength={100}
                            errorMessage={hasShowCommentError && commentError}
                            onChange={() => this.commentValidation()}
                            placeholder={maliMagazineModtranslator(
                              'MAIL_MAGAZINE.GROUP.COMMENT_PLACEHOLDER'
                            )}
                          />
                        </div>
                      </div>
                    </ModalBody>
                    <ModalFooter className={Style.modalFooter}>
                      <NcButton
                        className={
                          isAddDataProcess
                            ? `${Style.commonButton} ${Style.disabledBtn}`
                            : `${Style.commonButton}`
                        }
                        callback={this.addGroupMail}
                      >
                        {maliMagazineModtranslator('MAIL_MAGAZINE.GROUP.SAVE')}
                      </NcButton>

                      <NcButton
                        className={`${Style.commonButton} ${Style.dangerBtn}`}
                        callback={this.modalClose}
                      >
                        {maliMagazineModtranslator('MAIL_MAGAZINE.GROUP.CANCEL')}
                      </NcButton>
                    </ModalFooter>
                  </Modal>
                </div>
              </div>
              <div className={`col-lg-12 ${Style.dataTableList}`}>
                {reLoadModalList ? (
                  <Loader />
                ) : (
                  <MailGroupList
                    groupList={groupList}
                    isSelectedAll={isSelectedAll}
                    selectDeselectAll={this.selectDeselectAll}
                    groupMailDetails={this.groupMailDetails}
                  />
                )}
              </div>
            </div>
          </div>
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

export default withRouter(connect(mapStateToProps)(MailGroup));
