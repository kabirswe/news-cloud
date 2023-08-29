import React, {Component} from 'react';

import RichEditor from '../../components/RichEditor/RichEditor';
import {EditorState, convertToRaw, convertFromRaw, ContentState} from 'draft-js';
import {contentModtranslator} from '../../Content/modLocalization';
import {CloseCircleSharp, CalenderOutline} from '../../mod-assets/svgComp';
import NcInput from '../../../../common-components/NcInput';
import DateInput from '../../components/dateInput';
import Select from 'react-select';
import AxiosService from '../../../../networks/AxiosService';
import ApiService from '../../../../networks/ApiServices';
import Toast from '../../../../common-components/Toast';
import Loader from '../../../../common-components/Loader';
import Logger from '../../../../helper/logger';
import ConfirmationModal from '../../../../common-components/confirmationModal';
import {editorContentAsText, zeroPadding} from '../../../../helper';
import {Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';

export default class MailPosting extends Component {
  constructor(props) {
    super(props);
    this.mailSubjectRef = React.createRef();
    this.isCloseModal = false
    this.state = {
      article: this.props.article,
      isLoader: false,
      readyUrl: '',
      loadData: true,
      isMailGroupFetching: false,
      workInProgress: {
        articleSaveInprogress: false,
        reviewRequestInprogress: false,
        approverRequestInprogress: false,
        mailPost: false
      },
      selectedMailGroup: [],
      mailGroupList: [],
      syncWithLocalData: true,
      scheduleModal: false,
      mailPosting: {
        hideSave: false,
        isMailDelivered: false,
        reSchedule: false,
        approvalCancelationModal: false,
        warningModal: false,
        warningMessage: '',
        warningTitle: '',
        saveWithoutSubject: false,
        saveWithoutBody: false,
        saveWithoutBodyAndSubject: false,
        editorState: null,
        editorContent: null,
        subject: '',
        mailBody: '',
        group: '',
        date: '',
        config: false,
        dateType: 1,
        id: null,
        isCronActivated: false,
      }
    };
  }

  mailSubjectChange = (event) => {
    let {value} = event.target;
    let {mailPosting} = this.state;

    this.setState({
      mailPosting: {
        ...mailPosting,
        subject: value
      }
    });
  };
  handleMailDateChange = (event, name) => {
    let {mailPosting} = this.state;
    this.setState({
      mailPosting: {
        ...mailPosting,
        date: mailPosting.dateType == 2? this.formatDateSafari(event) : ''
      }
    });
  };

  // get mail group list

  getMailGroupList = () => {
    this.setState({
      isLoader: true,
      isMailGroupFetching: true
    });
    AxiosService.get(ApiService.GET_EMAIL_GROUP_LIST, false)
      .then((result) => {
        let selectedMailGroup = [{value: '', label: '',}];
        let prepareGroup = [{value: '', label: ''}];
        if (result.data.data.list) {
          result.data.data.list.forEach((g) => {
            prepareGroup.push({value: g.id, label: g.group_name});
          });
        }

        // first item is default selected
        let [firstChoice] = prepareGroup;
        // firstChoice && selectedMailGroup.push(firstChoice);
        this.setState({
          selectedMailGroup,
          mailGroupList: prepareGroup,
          isMailGroupFetching: false,
          mailPosting: {
            ...this.state.mailPosting,
            // group: firstChoice && firstChoice.value
          }
        });

        this.getMailPostingData();
      })
      .catch((error) => {
        Logger(error);
       this.setState({
         isMailGroupFetching: false
       })
      });
  };

  mailDateChange = (event) => {
    let {value} = event.target;
    let {mailPosting} = this.state;
    this.setState({
      mailPosting: {
        ...mailPosting,
        dateType: value
      }
    });
  };

  toggleMailScheduleModal = (value) => {
    let {
      article: {startDate}
    } = this.state;
    if (value == 'save') {
      this.setState({
        scheduleModal: !this.state.scheduleModal,
        mailPosting: {
          ...this.state.mailPosting,
          config: 1,
          reSchedule: true
        }
      });
      return;
    }

    this.setState({
      scheduleModal: !this.state.scheduleModal,
      mailPosting: {
        ...this.state.mailPosting,
      }
    });
  };

  getMailEditorContent = (content, editorState) => {
    let {mailPosting} = this.state;
    this.setState({
      mailPosting: {
        ...mailPosting,
        editorState,
        editorContent: content
      }
    });
  };

  onChangeMailConfig = (event) => {
    let {checked} = event.target;
    let {mailPosting} = this.state;

    if (!mailPosting.id) {
      this.setState({
        mailPosting: {
          ...this.state.mailPosting,
          config: checked
        }
      });
      return;
    }
   if (checked ) {
    AxiosService.get(ApiService.MAIL_SEND_STATUS(mailPosting.id), false)
    .then((result) => {
      let isDeliverid = result.data.data.mail_delivered;
      if (checked && isDeliverid) {
        this.setState({
          scheduleModal: true,
          mailPosting: {
            ...this.state.mailPosting,
          }
        });
      } else {
        this.setState({
          mailPosting: {
            ...this.state.mailPosting,
            config: checked
          }
        });
      }
    })
    .catch((error) => {
      Logger(error);
    });
   } else {
    this.setState({
      mailPosting: {
        ...this.state.mailPosting,
        config: checked
      }
    });
   }
  };

  onMailGroupChagne = (value) => {
    let {selectedMailGroup} = this.state;
    this.setState({
      selectedMailGroup: [value],
      mailPosting: {
        ...this.state.mailPosting,
        group: value.value,
      }
    });
  };

  saveMailPostingData = () => {
    let {
      mailPosting,
      article,
      selectedMailGroup,
      workInProgress: {mailPost}
    } = this.state;

    if (mailPost) {
      return;
    }


    let errors = {};

    if (!mailPosting.subject) {
      errors.subject = contentModtranslator('ARTICLE_EDIT.MAIL_WITHOUT_SUBJECT');
    }

    let {html, text} = editorContentAsText(mailPosting.editorState);

    if (!text) {
      errors.mailBody = contentModtranslator('ARTICLE_EDIT.MAIL_WITHOUT_BODY');
    }

    if (
      mailPosting.dateType == 2 &&
      !mailPosting.date
    ) {
      this.setState({
        mailPosting: {
          ...mailPosting,
          warningModal: true,
          saveWithoutSubject: true,
          hideSave: true,
          warningTitle: contentModtranslator('ARTICLE_EDIT.MAIL_POSTING_DATE_MUST_BE_SELECTED_TITLE'),
          warningMessage: contentModtranslator('ARTICLE_EDIT.MAIL_POSTING_DATE_MUST_BE_SELECTED_BODY')
        }
      });
      return;
    }
    if (mailPosting.config && !mailPosting.group) {
      this.setState({
        mailPosting: {
          ...mailPosting,
          hideSave: true,
          warningModal: true,
          warningTitle: contentModtranslator('ARTICLE_EDIT.MAIL_POSTING_GROUP_IS_REQUIRED_TITLE'),
          warningMessage: contentModtranslator('ARTICLE_EDIT.MAIL_POSTING_GROUP_IS_REQUIRED_BODY')
        }
      });
      return;
    }

    if (
      errors.subject &&
      errors.mailBody
    ) {
      this.setState({
        mailPosting: {
          ...mailPosting,
          warningModal: true,
          hideSave: true,
          warningTitle: contentModtranslator('ARTICLE_EDIT.MAIL_POSTING_BODY_AND_SUBJECT_REQUIRED_TITLE'),
          warningMessage: contentModtranslator('ARTICLE_EDIT.MAIL_POSTING_BODY_AND_SUBJECT_REQUIRED_BODY')
        }
      });
      return;
    }

    if (errors.subject) {
      this.setState({
        mailPosting: {
          ...mailPosting,
          warningModal: true,
          hideSave: true,
          warningTitle: contentModtranslator('ARTICLE_EDIT.MAIL_POSTING_SUBJECT_IS_REQUIRED_TITLE'),
          warningMessage: contentModtranslator('ARTICLE_EDIT.MAIL_POSTING_SUBJECT_IS_REQUIRED_BODY')
        }
      });
      return;
    }
    if (errors.mailBody) {
      this.setState({
        mailPosting: {
          ...mailPosting,
          warningModal: true,
          hideSave: true,
          warningTitle: contentModtranslator('ARTICLE_EDIT.MAIL_POSTING_BODY_IS_REQUIRED_TITLE'),
          warningMessage: contentModtranslator('ARTICLE_EDIT.MAIL_POSTING_BODY_IS_REQUIRED_BODY')
        }
      });
      return;
    }
    this.props.getMailPostingData({
      ...this.state.mailPosting,
      selectedMailGroup: selectedMailGroup
    });

    this.props.closeMailModal();
    this.isCloseModal = true
    this.setState({
      loadData: true,
      syncWithLocalData: true
    });
  };



  getMailDeliveryStatus = () => {
    let {mailPosting} = this.state;
    if (!mailPosting.id) {
      return;
    }
    AxiosService.get(ApiService.MAIL_SEND_STATUS(mailPosting.id), false)
      .then((result) => {
        let isDeliverid = result.data.data.mail_delivered;
        this.setState({
          isLoader: false,
          mailPosting: {
            ...this.state.mailPosting,
            isMailDelivered: isDeliverid
          }
        });
      })
      .catch((error) => {
        Logger(error);
      });
  };

  closeMailModal(type) {
    let {selectedMailGroup} = this.state;
    if (type == 'save') {
      this.saveMailPostingData();
      return;
    }

    this.isCloseModal = true
    this.props.getMailPostingData({
      group: this.state.mailPosting.group
    });
    this.props.closeMailModal();
    this.setState({
      loadData: true,
      syncWithLocalData: true
    });
  }

  getMailPostingData = () => {
    let {mailPosting, mailGroupList} = this.state;
    AxiosService.get(ApiService.GET_MAIL_POSTING(this.props.articleId), false)
      .then((result) => {
        let data = result.data.data || {};
        let editorState =
          data.email_content &&
          JSON.parse(data.email_content.content_body) &&
          EditorState.createWithContent(
            convertFromRaw(JSON.parse(data.email_content.content_body)) || {}
          );
        let selectedMailGroup = {
          value: data.mail_group && data.mail_group.id,
          label: data.mail_group && data.mail_group.group_name
        };
        let mailGroup = null;
        if (selectedMailGroup.value) {
          mailGroup = selectedMailGroup.value;
        } else {
          mailGroup = this.state.selectedMailGroup.length
            ? this.state.selectedMailGroup[0].value
            : null;
        }

        let findselctedGroup = mailGroupList.filter(g => g.value == selectedMailGroup.value)
        let d = {
          editorState,
          editorContent: editorState && editorState.getCurrentContent(),
          config:  data.is_cron_activated ? false :  data.is_schedule_on,
          isCronActivated: data.is_cron_activated,
          subject: data.email_content && data.email_content.subject,
          dateType: data.schedule_type,
          date:
            (data.delivery_date && `${data.delivery_date} ${data.delivery_time}`) ||
            '',
          id: data.id,
          //   group: selectedMailGroup && selectedMailGroup.value || this.state.selectedMailGroup.length ? this.state.selectedMailGroup[0].value : null
          group: mailGroup,
          selectedMailGroup: findselctedGroup.length > 0 ? findselctedGroup : [{value: '', label: ''}]
        };
        if (result.data.data.id) {
          this.setState({
            isLoader: false,
            selectedMailGroup:
              (selectedMailGroup.value && [selectedMailGroup]) ||
              this.state.selectedMailGroup,
            mailPosting: {
              ...d
            }
          });

        this.props.getMailPostingData({
          ...this.state.mailPosting,
          ...d,
          // selectedMailGroup: [selectedMailGroup]
        });

          // this.getMailDeliveryStatus(result.data.data.id)
        }
        this.setState({
          isLoader: false
        });
      })
      .catch((error) => {
        Logger(error);
      });
  };

  mailPostingWarningModal = (type) => {
    let {mailPosting} = this.state;

    this.setState({
      mailPosting: {
        ...mailPosting,
        warningModal: !mailPosting.warningModal
      }
    });
  };



  formatDateSafari = (date, formatter = '-') => {
    date = date && date.toString()
    if (Date.parse(date && date.replace(/-/g, '/'))) {
    let d = new Date(date.replace(/-/g, '/'));
    return `${d.getFullYear()}${formatter}${zeroPadding(
    d.getMonth() + 1
    )}${formatter}${zeroPadding(d.getDate())} ${zeroPadding(
    d.getHours()
    )}:${zeroPadding(d.getMinutes())}`;
    }
    return '';
    };

    dateParseSafari = (date) => {
      date = date && date.toString()
      if (Date.parse(date && date.replace(/-/g, '/'))) {
        return new Date(date && date.replace(/-/g, '/'))
      }
      return '';
    }
  

  componentDidMount () {
    let {category,url, ownMedia} = this.props
    let [cat={}] = category || []
     let readyUrl = ''
     if (cat.label && url) {
        readyUrl = `${ownMedia.url}/${cat.slug}/${url}`
     }  else {
       readyUrl = `${ownMedia.url}/${url}`
     }
     
  

    const plainText = readyUrl
    const content = ContentState.createFromText(plainText);
     let state =  EditorState.createWithContent(content)

    this.setState({
      readyUrl: readyUrl? readyUrl : '',
      mailPosting: {
        ...this.state.mailPosting,
        editorState: state,
        editorContent: state.getCurrentContent()
      }
    })
  }

  componentDidUpdate() {
    let {mailDeliveryModal, isMailModalOpened, localMailData} = this.props;
    let {isLoading, loadData, syncWithLocalData, isCloseModal} = this.state;

    if (mailDeliveryModal && !isMailModalOpened && loadData) {
      this.setState({
        loadData: false,
        isLoader: true
      });

      this.getMailGroupList();
    }
   
    if (isMailModalOpened && syncWithLocalData) {
     if (this.isCloseModal) {
       this.isCloseModal = false
       return
     }
      this.setState({
        syncWithLocalData: false,
        isCloseModal: false,
        mailPosting: {
          ...localMailData
        },
        selectedMailGroup: localMailData.selectedMailGroup
      });
    }

    
  }

  render() {
    let {
      selectedMailGroup,
      mailGroupList,
      mailPosting,
      isLoader,
      article,
      scheduleModal,
      readyUrl,
      isMailGroupFetching
    } = this.state;

    let {mailDeliveryModal} = this.props;


    return (
      <>
        <Modal
          size="lg"
          isOpen={mailDeliveryModal}
          modalClassName="custom-close"
          contentClassName="sns-modal"
          backdropClassName="sns-backdrop"
          centered
        >
          <ModalHeader className="sns-modal-header">
            {contentModtranslator('ARTICLE_EDIT.MAIL_DELIVERY_TITLE')}
            <div
              className="custom-close"
              tabIndex={0}
              role="button"
              onClick={() => this.closeMailModal()}
            >
              <CloseCircleSharp />
            </div>
          </ModalHeader>

          <ModalBody className="sns-modal-body">
            {isLoader ? (
              <>
                <div style={{minHeight: '150px'}}>
                  <Loader />
                </div>
              </>
            ) : (
              <>
                <div className="mail-subject-input">
                  <div className="input-label">
                    {contentModtranslator('ARTICLE_EDIT.MAIL_SUBJECT')}
                  </div>
                  <NcInput
                    placeholder={contentModtranslator(
                      'ARTICLE_EDIT.SUBJECT_PLACEHOLDER'
                    )}
                    value={mailPosting.subject}
                    inputRef={this.mailSubjectRef}
                    onChange={this.mailSubjectChange}
                  />
                </div>

                <div className="input-label-text">
                  {contentModtranslator('ARTICLE_EDIT.MAIL_DELEVERY_TEXT')}
                </div>
                <div className={`sns-post-editor`}>
                  <RichEditor
                    getEditorContent={this.getMailEditorContent}
                    editorState={mailPosting.editorState}
                    isImageVideoOff={true}
                    isMailPosting={true}
                    url={readyUrl}
                    key={readyUrl}
                  />
                </div>
                <div className="mail-footer">
                  <div className="mail-deliver-section">
                    <div className="select-drop-option">
                      <div className="mail-footer-label">
                        {contentModtranslator('ARTICLE_EDIT.DELIVERY_GROUP')}
                      </div>
                      <Select
                        className="mail-select"
                        classNamePrefix="mail"
                        options={mailGroupList || []}
                        value={selectedMailGroup && selectedMailGroup[0]}
                        onChange={this.onMailGroupChagne}
                        maxMenuHeight={148}
                        isLoading={isMailGroupFetching ? true : false}
                        placeholder=""
                      />
                    </div>
                    <div className="date-section">
                      <div className="date-type">
                        <div className="mail-footer-label">
                          {contentModtranslator('ARTICLE_EDIT.DATE_SELECTION_TYPE')}
                        </div>
                        <div className="input-radio-mail">
                          <label className="select-option">
                            {contentModtranslator(
                              'ARTICLE_EDIT.ARTICLE_PUBLICATION_DATE'
                            )}
                            <input
                              type="radio"
                              name="publishingDate"
                              value={1}
                              onChange={this.mailDateChange}
                              checked={mailPosting.dateType == 1 ? true : false}
                            />
                            <span className="checkmark"></span>
                          </label>
                        </div>
                        <div className="input-radio-mail">
                          <label className="select-option">
                            {contentModtranslator('ARTICLE_EDIT.INDIVIDUAL_DATE')}
                            <input
                              type="radio"
                              name="customDate"
                              value={2}
                              onChange={this.mailDateChange}
                              checked={mailPosting.dateType == 2 ? true : false}
                            />
                            <span className="checkmark"></span>
                          </label>
                        </div>
                      </div>
                      <div className="date-picker">
                        <div className="mail-footer-label">
                          {' '}
                          {contentModtranslator('ARTICLE_EDIT.POST_DATE')}
                        </div>

                        <DateInput
                          handleDate={this.handleMailDateChange}
                          type="mailDate"
                          value={
                            mailPosting.dateType == 1
                            ?  article.startDate?  this.formatDateSafari(article.startDate) : ''
                            : this.formatDateSafari(mailPosting.date)
                          }
                          minDate={
                            article.startDate
                              ? this.dateParseSafari(article.startDate)
                              : new Date()
                             
                          }
                          showTimeSelect
                          selected={mailPosting.date? this.dateParseSafari(mailPosting.date) : article.startDate ? this.dateParseSafari(article.startDate): new Date()}
                          disabled={mailPosting.dateType == 1 ? true : false}
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          timeCaption="time"
                          dateFormat="yyyy.MM.dd HH:mm"
                          defaultOption={''}
                          className="form-control date-input"
                        />
                      </div>
                      <div className="sns-action-btn">
                        <div className="calender-icon">
                          <CalenderOutline />
                        </div>
                        <div className="configuration-label">
                          {contentModtranslator('ARTICLE_EDIT.CONFIG_LABEL')}
                        </div>
                        <div className="mail-toggle">
                          <label class="switch">
                            <input
                              name="mailconfig"
                              onChange={this.onChangeMailConfig}
                              checked={mailPosting.config}
                              type="checkbox"
                              id="togBtn"
                            />
                            <div class="slider round">
                              <span class="on"> </span>
                              <span class="off"></span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-buttons">
                  <button
                    onClick={() => this.closeMailModal('save')}
                    className="modal-save-button"
                  >
                    {contentModtranslator('ARTICLE_EDIT.MODAL_SAVE_BUTTON')}
                  </button>
                  <button
                    onClick={() => this.closeMailModal()}
                    className="modal-cancel-button"
                  >
                    {contentModtranslator('ARTICLE_EDIT.MODAL_CANCEL_BUTTON')}
                  </button>
                </div>
              </>
            )}
          </ModalBody>
        </Modal>

        {/* SHOW MAIL RE-SCHEDULE MODAL */}
        <ConfirmationModal
          isActive={scheduleModal}
          title={contentModtranslator('ARTICLE_EDIT.SCHEDULE_MODAL_TITLE')}
          body={contentModtranslator('ARTICLE_EDIT.SCHEDULE_MODAL_BODY')}
          cancelClick={this.toggleMailScheduleModal}
          okClick={() => this.toggleMailScheduleModal('save')}
        />

        {/* MAIL POSTING WARNING MODAL */}

        <ConfirmationModal
          isActive={mailPosting.warningModal}
          title={mailPosting.warningTitle}
          hideSave={mailPosting.hideSave}
          body={mailPosting.warningMessage}
          cancelClick={this.mailPostingWarningModal}
          okClick={() => this.mailPostingWarningModal('save')}
        />
      </>
    );
  }
}
