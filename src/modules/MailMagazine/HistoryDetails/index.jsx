import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import ReactHtmlParser from 'react-html-parser';
import DefaultLayout from '../../../containers/DefaultLayout';
import Style from './historyDetails.module.scss';
import {translator} from '../../../localizations';
import {maliMagazineModtranslator} from '../modLocalization';
import NcButton from '../../../common-components/NcButton';
import MailHistoryDetailsList from './components/MailHistoryDetailsList';
import MailMagazineContainer from '../../../containers/MailMagazineContainer';
import Axios from '../../../networks/AxiosService';
import API from '../../../networks/ApiServices';
import getErrorMessage from '../../../app-constants/ServerErrorInfo';
import Loader from '../../../common-components/Loader';
import Toast from '../../../common-components/Toast';
import SmallLoader from '../../../common-components/SmallLoader';
import {Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert} from 'reactstrap';
import {CloseCircleSharp} from '../mod-assets/svgComp';
import NcBreadcrumbs from '../../../common-components/NcBreadcrumbs/ncBreadcrumbs';
import SpinnerLoader from '../../../common-components/spinnerLoader';
import path from '../../../routes/path';
class MailHistoryDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mailHistoryList: [],
      csvLoader: false,
      contentData: {},
      isOpenEmailBodyModal: false,
      selectedGroupName:''
    };
    this.mailHistoryEmailPopup = this.mailHistoryEmailPopup.bind(this);
    this.mailHistoryDetailsCSVDown = this.mailHistoryDetailsCSVDown.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  componentDidMount() {
    let selectedGroupName = localStorage.getItem('selectedGroupName');
    this.setState({selectedGroupName})
    this.getEmailHistoryList('', true);
    Toast.clear();
  }

  getEmailHistoryList(param = '', isDataProcessing) {
    let selectedHistoryId = localStorage.getItem('selectedHistoryId');
    this.setState({isLoader: true, isDataProcessing: isDataProcessing});
    Axios.get(API.GET_MAIL_HISTORY_DETAILS + selectedHistoryId, param, false)
      .then((response) => {
        let historyList = response.data.data.list || [];
        let historyWithStatus = [];
        this.setState({
          mailHistoryList: historyList,
          isLoader: false,
          mailServerMsg: response.data.message,
          mailServerStatus: response.data.status
        });
        this.setState({isDataProcessing: false});
      })
      .catch((err) => {
        const apiError = getErrorMessage(err);
        this.setState({
          isLoader: false,
          mailHistoryList: [],
          mailServerMsg: apiError.message,
          mailServerStatus: false,
          isDataProcessing: false
        });
      });
  }

  async mailHistoryEmailPopup(emailHistoryId) {
    this.setState({openModalLoader: true});
    let csvDownload = await Axios.get(
      API.EMAIL_HISTORY_BODY_CONTENT + emailHistoryId,
      {},
      false
    )
      .then((response) => {
        let result = response.data;
        if (result.status) {
          this.setState({
            contentData: result,
            isOpenEmailBodyModal: true,
            openModalLoader: false
          });
          Toast.clear();
        } else {
          Toast.error(result.message);
          this.setState({openModalLoader: false});
        }
      })
      .catch((err) => {
        const apiError = getErrorMessage(err);
        Toast.error(apiError.message);
        this.setState(() => ({
          openModalLoader: false
        }));
      });
  }
  closeModal() {
    this.setState({isOpenEmailBodyModal: false});
  }
  async mailHistoryDetailsCSVDown() {
    let {csvLoader} = this.state;
    if (!csvLoader) {
      this.setState({csvLoader: true});
      let selectedHistoryId = localStorage.getItem('selectedHistoryId');
      let csvDownload = await Axios.get(
        API.EMAIL_HISTORY_DETAILS_CSV_DOWNLOAD + selectedHistoryId,
        {},
        false
      )
        .then((response) => {
          let result = response.data;
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
          this.setState(() => ({
            csvLoader: false
          }));
          Toast.error(apiError.message);
        });
    }
  }
  render() {
    const {mailHistoryList, csvLoader,selectedGroupName} = this.state;
    const {
      isLoader,
      contentData,
      isOpenEmailBodyModal,
      openModalLoader
    } = this.state;
    const breadcrumbs = [
      {
        title: maliMagazineModtranslator('MAIL_MAGAZINE.HISTORY.BREADCRUMBS_TITLE'),
        link: path.mailHistory
      },
      {
        title: maliMagazineModtranslator(
          'MAIL_MAGAZINE.HISTORY_DETAILS.BREADCRUMBS_TITLE'
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
          <div className="container-fluid">
            <Toast />
            <div className={`row ${Style.mailMagazineComponent}`}>
              <div className={`col-lg-12  ${Style.pageHeading}`}>
                <NcBreadcrumbs breadcrumbs={breadcrumbs} />
                <div className={`${Style.pageTitle}`}>
                  {
                    selectedGroupName
                  }
                </div>
                <div
                  className={
                    csvLoader
                      ? `${Style.spinLoader} ${Style.widthLoader} float-right`
                      : `${Style.spinLoader} float-right`
                  }
                >
                  <NcButton
                    className={
                      csvLoader || !mailHistoryList.length
                        ? `${Style.customBtn} ${Style.disabledBtn}`
                        : `${Style.customBtn}`
                    }
                    callback={this.mailHistoryDetailsCSVDown}
                  >
                    {csvLoader && <SpinnerLoader />}

                    {maliMagazineModtranslator(
                      'MAIL_MAGAZINE.HISTORY_DETAILS.CSV_UPLOAD'
                    )}
                  </NcButton>
                </div>
              </div>
              <div className={`col-lg-12 ${Style.listArea}`}>
                {openModalLoader && <Loader className={`${Style.openModalLoder}`} />}
                <MailHistoryDetailsList
                  mailHistoryList={mailHistoryList}
                  mailHistoryEmailPopup={this.mailHistoryEmailPopup}
                />
              </div>
            </div>
          </div>
        )}
        <Modal
          isOpen={isOpenEmailBodyModal}
          toggle={this.toggleModalConfirm}
          contentClassName={Style.groupMailModal}
          backdropClassName={Style.backDrop}
          centered
        >
          <ModalHeader className={Style.modalHeader}>
            {maliMagazineModtranslator(
              'MAIL_MAGAZINE.HISTORY_DETAILS.EMAIL_BODY_TITLE'
            )}
            <div
              className={Style.customClose}
              tabIndex={0}
              role="button"
              onClick={() => this.closeModal()}
            >
              <CloseCircleSharp />
            </div>
          </ModalHeader>

          <ModalBody className={Style.modalBody}>
            <div className={Style.emailBody}>
              {contentData.data
                ? ReactHtmlParser(contentData.data.content_body_html)
                : ''}
            </div>
          </ModalBody>
          <ModalFooter className={Style.modalFooter}>
            <NcButton
              className={`${Style.commonButton} ${Style.deleteBtn}`}
              callback={this.closeModal}
            >
              {maliMagazineModtranslator('MAIL_MAGAZINE.HISTORY_DETAILS.CLOSE')}
            </NcButton>
          </ModalFooter>
        </Modal>
      </MailMagazineContainer>
    );
  }
}

function mapStateToProps(state) {
  return {
    lang: state.commonReducer.lang
  };
}

export default withRouter(connect(mapStateToProps)(MailHistoryDetails));
