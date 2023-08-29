import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import DefaultLayout from '../../../containers/DefaultLayout';
import MailHistoryList from './components/MailHistoryList';
import Style from './history.module.scss';
import {translator} from '../../../localizations';
import {maliMagazineModtranslator} from '../modLocalization';
import NcButton from '../../../common-components/NcButton';
import MailMagazineContainer from '../../../containers/MailMagazineContainer';
import Axios from '../../../networks/AxiosService';
import API from '../../../networks/ApiServices';
import getErrorMessage from '../../../app-constants/ServerErrorInfo';
import Loader from '../../../common-components/Loader';
import Toast from '../../../common-components/Toast';
import path from '../../../routes/path';
import {Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert} from 'reactstrap';
import {DuplicateIcon, CloseCircleSharp} from '../mod-assets/svgComp';
import NcBreadcrumbs from '../../../common-components/NcBreadcrumbs/ncBreadcrumbs'
class MailHistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mailList: [],
      isAttempToDelete: false,
      serverDeleteMsg: '',
      serverDeleteStatus: false,
      deletIds: [],
      isDeleteProcessing: false
    };
    this.selectDeselectAll = this.selectDeselectAll.bind(this);
    this.mailHistoryDetails = this.mailHistoryDetails.bind(this);
    this.openConfirmModal = this.openConfirmModal.bind(this);
    this.confirmModalClose = this.confirmModalClose.bind(this);
    this.deleteProcess = this.deleteProcess.bind(this);
  }

  componentDidMount() {
    this.getEmailHistoryList('', true);
    Toast.clear();
  }

  getEmailHistoryList(param = '', isDataProcessing) {
    this.setState({isLoader: true, isDataProcessing: isDataProcessing});
    Axios.get(API.GET_MAIL_HISTORY_LIST, param, false)
      .then((response) => {
        this.setState({
          mailList: response.data.data.list || [],
          isLoader: false,
          mailServerMsg: response.data.message,
          mailServerStatus: response.data.status,
          deletIds: []
        });
        this.setState({isDataProcessing: false});
      })
      .catch((err) => {
        const apiError = getErrorMessage(err);
        Toast.error(apiError.message);
        this.setState({
          isLoader: false,
          mailList: [],
          mailServerMsg: apiError.message,
          mailServerStatus: false,
          isDataProcessing: false,
          deletIds: []
        });
      });
  }

  mailHistoryDetails(row) {
    localStorage.setItem('selectedHistoryId', row.id);
    localStorage.setItem('selectedGroupName', row.group_name);
    this.props.history.push(path.mailHistoryDetails);
  }

  async openConfirmModal() {
    const {deletIds} = this.state;
    if (deletIds.length) {
      this.setState({
        confirmModalOpen: true,
        isAttempToDelete: false,
        serverDeleteMsg: '',
        serverDeleteStatus: false
      });
      Toast.clear();
    } else {
      Toast.error(
        maliMagazineModtranslator('MAIL_MAGAZINE.HISTORY.SELECETION_ERROR')
      );
    }
  }

  confirmModalClose() {
    this.setState({
      confirmModalOpen: false,
      isAttempToDelete: false,
      serverDeleteMsg: '',
      serverDeleteStatus: false
    });
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
    const {mailList, deletIds, isDeleteProcessing} = this.state;
    if (isDeleteProcessing) {
      return false;
    }
    this.setState({isDeleteProcessing: true});

    const deleteAPI = await Axios.remove(
      API.EMAIL_HISTORY_DELETE,
      {emailHistoryId: JSON.stringify(deletIds)},
      false
    )
      .then((response) => {
        const {status} = response.data;
        const {message} = response.data;
        if (status) {
          Toast.success(message);
          this.setState(() => ({
            deletIds: [],
            confirmModalOpen: false,
            isAttempToDelete: false,
            isDeleteProcessing: false
          }));
          this.getEmailHistoryList('', true);
        } else {
          Toast.error(message);
          this.setState(() => ({
            deletIds: [],
            isAttempToDelete: true,
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
          isAttempToDelete: true,
          serverDeleteMsg: apiError.message,
          serverDeleteStatus: false,
          isDeleteProcessing: false,
          confirmModalOpen: false
        }));
      });
  }
  render() {
    const {
      mailList,
      isLoader,
      confirmModalOpen,
      serverDeleteStatus,
      isAttempToDelete,
      serverDeleteMsg,
      isDeleteProcessing
    } = this.state;
    const breadcrumbs = [
      {title: maliMagazineModtranslator('MAIL_MAGAZINE.HISTORY.BREADCRUMBS_TITLE'), link: '',active: true},
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
              <div className={`${Style.pageTitle}`}>
                {maliMagazineModtranslator('MAIL_MAGAZINE.HISTORY.PAGE_TITLE')}
              </div>
                <div className="float-right">
                  {mailList && mailList.length ? (
                    <NcButton
                      className={`${Style.customBtn} ${Style.deleteBtn}`}
                      callback={this.openConfirmModal}
                    >
                      {translator('BUTTON.DELETE')}
                    </NcButton>
                  ) : (
                    ''
                  )}
                </div>
              </div>
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
                      'MAIL_MAGAZINE.HISTORY.CONFIRM_DELETE_MSG'
                    )}
                  </div>
                </ModalBody>
                <ModalFooter className={Style.modalFooter}>
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
              <div className="col-lg-12">
                <MailHistoryList
                  mailList={mailList}
                  mailHistoryDetails={this.mailHistoryDetails}
                  selectDeselectAll={this.selectDeselectAll}
                />
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

export default withRouter(connect(mapStateToProps)(MailHistory));
