import React, {Component} from 'react';

import RichEditor from '../RichEditor/RichEditor';
import {EditorState, convertToRaw, convertFromRaw, Modifier} from 'draft-js';
import {contentModtranslator} from '../../Content/modLocalization';
import {CloseCircleSharp, CalenderOutline, LogoFacebook} from '../../mod-assets/svgComp';
import NcInput from '../../../../common-components/NcInput';
import DateInput from '../dateInput';
import Select from 'react-select';
import AxiosService from '../../../../networks/AxiosService';
import ApiService from '../../../../networks/ApiServices';
import Toast from '../../../../common-components/Toast';
import Loader from '../../../../common-components/Loader';
import Logger from '../../../../helper/logger';
import ConfirmationModal from '../../../../common-components/confirmationModal';
import {editorContentAsText, zeroPadding} from '../../../../helper';
import {Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';

export default class Facebook extends Component {
  constructor(props) {
    super(props);
    this.mailSubjectRef = React.createRef();
    this.isCloseModal = false;
    this.state = {
      article: this.props.article,
      isLoader: false,
      loadData: true,
      readyUrl: '',
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
      snsData: {
        hideSave: false,
        reSchedule: false,
        approvalCancelationModal: false,
        warningModal: false,
        warningMessage: '',
        warningTitle: '',
        editorState: EditorState.createEmpty(),
        editorContent: null,
        body: '',
        date: '',
        config: false,
        platformId: 1, // facebook platform id
        dateType: 1,
        id: null,
        isCronActivated: false
      }
    };
  }


  handleDateChange = (event, name) => {
    let {snsData} = this.state;
    this.setState({
      snsData: {
        ...snsData,
        date: snsData.dateType == 2? this.formatDateSafari(event) : ''
      }
    });
  };



  dateChange = (event) => {
    let {value} = event.target;
    let {snsData} = this.state;
    this.setState({
      snsData: {
        ...snsData,
        dateType: value
      }
    });
  };

  toggleScheduleModal = (value) => {
    let {
      article: {startDate}
    } = this.state;
    if (value == 'save') {
      this.setState({
        scheduleModal: !this.state.scheduleModal,
        snsData: {
          ...this.state.snsData,
          config: 1,
          reSchedule: true
        }
      });
      return;
    }

    this.setState({
      scheduleModal: !this.state.scheduleModal,
      snsData: {
        ...this.state.snsData
      }
    });
  };

  getEditorContent = (content, editorState) => {
    let {snsData} = this.state;
    this.setState({
      snsData: {
        ...snsData,
        editorState,
        editorContent: content
      }
    });
  };


  onChangeConfig = (event) => {
    let {checked} = event.target;
    let {snsData} = this.state;


    if (!snsData.id) {
      this.setState({
        snsData: {
          ...this.state.snsData,
          config: checked
        }
      });
      return;
    }
    if (checked) {
      AxiosService.get(ApiService.SNS_DELIVERY_CHECK(this.props.articleId), false)
      .then((result) => {
        let list = result.data.data.list;
        let data = {}
        list.map(d => {
         if (d) {
          let key = Object.keys(d)[0]
          data[key] = d[key]
         }
        })

        let facebook = data['1'] || {}
        let twitter = data['2'] || {}
        let line = data['3'] || {}


        if (checked && facebook.is_posted) {
          this.setState({
            scheduleModal: true,
            snsData: {
              ...this.state.snsData
            }
          });
        } else {
          this.setState({
            snsData: {
              ...this.state.snsData,
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
        snsData: {
          ...this.state.snsData,
          config: checked
        }
      });
    }
  };


  saveData = () => {
    let {
      snsData,
      article,
      selectedMailGroup,
    } = this.state;

    let errors = {};

    let {html, text} = editorContentAsText(snsData.editorState);

    if (!text) {
      errors.body = contentModtranslator('ARTICLE_EDIT.SNS_WITHOUT_BODY');
    }


    if (snsData.dateType == 2 && !snsData.date) {
      this.setState({
        snsData: {
          ...snsData,
          warningModal: true,
          hideSave: true,
          saveWithoutSubject: true,
          warningTitle: contentModtranslator(
            'ARTICLE_EDIT.MAIL_POSTING_DATE_MUST_BE_SELECTED_TITLE'
          ),
          warningMessage: contentModtranslator(
            'ARTICLE_EDIT.MAIL_POSTING_DATE_MUST_BE_SELECTED_BODY'
          )
        }
      });
      return;
    }
    

   

    if (errors.body) {
      this.setState({
        snsData: {
          ...snsData,
          warningModal: true,
          hideSave: true,
          warningTitle: contentModtranslator(
            'ARTICLE_EDIT.SNS_WITHOUT_BODY_TITLE'
          ),
          warningMessage: contentModtranslator(
            'ARTICLE_EDIT.SNS_WITHOUT_BODY'
          )
        }
      });
      return;
    }
    this.props.getFacebookData(this.state.snsData);

    this.props.closeFacebookModal();
    this.isCloseModal = true;
    this.setState({
      loadData: true,
      syncWithLocalData: true
    });
  };


  closeFacebookModal(type) {
    let {selectedMailGroup} = this.state;
    if (type == 'save') {
      this.saveData();
      return;
    }

    this.isCloseModal = true;
    
    // this.props.getFacebookData(this.state.snsData);
    this.props.closeFacebookModal();
    this.setState({
      loadData: true,
      syncWithLocalData: true
    });
  }

  getData = () => {
    let {snsData} = this.state;
    // 1 is facebook platform id
    AxiosService.get(ApiService.SNS_POST_GET(this.props.articleId, 1), false)
      .then((result) => {
        let data = result.data.data || {};
        let editorState =
          data.body &&
          JSON.parse(data.body) &&
          EditorState.createWithContent(
            convertFromRaw(JSON.parse(data.body)) || {}
          );
       

        let d = {
          editorState,
          editorContent: editorState && editorState.getCurrentContent(),
          config: data.is_cron_run ? false : data.is_schedule_on,
          isCronActivated: data.is_cron_run,
          dateType: data.schedule_type,
          date:
            (data.schedule_date && `${data.schedule_date} ${data.schedule_time}`) ||
            '',
          id: data.id,
          //   group: selectedMailGroup && selectedMailGroup.value || this.state.selectedMailGroup.length ? this.state.selectedMailGroup[0].value : null
        };
        if (result.data.data.id) {
          this.setState({
            isLoader: false,
            snsData: {
              ...this.state.snsData,
              ...d
            }
          });

           this.props.getFacebookData({
            ...this.state.snsData,
            ...d
          });
          // this.getDeliveryStatus(result.data.data.id)
        }
        this.setState({
          isLoader: false
        });
      })
      .catch((error) => {
        Logger(error);
        this.setState({
          isLoader: false
        });
      });
  };

  warningModal = (type) => {
    let {snsData} = this.state;

    this.setState({
      snsData: {
        ...snsData,
        hideSave: false,
        warningModal: !snsData.warningModal
      }
    });
  };



  formatDateSafari = (date, formatter = '-') => {
    date = date && date.toString()
    if (Date.parse( date && date.replace(/-/g, '/'))) {
    let d = new Date(date.replace(/-/g, '/'));
    return `${d.getFullYear()}${formatter}${zeroPadding(
    d.getMonth() + 1
    )}${formatter}${zeroPadding(d.getDate())} ${zeroPadding(
    d.getHours()
    )}:${zeroPadding(d.getMinutes())}`;
    }
    return '';
    };
  componentDidMount () {
    let {category,url, ownMedia} = this.props
   let [cat={}] = category || []
    let readyUrl = ''
    if (cat.label && url) {
       readyUrl = `${ownMedia.url}/${cat.slug}/${url}`
    }  else {
      readyUrl = `${ownMedia.url}/${url}`
    }
    
   this.setState({
     readyUrl: readyUrl? readyUrl : ''
   })
  }

  componentDidUpdate() {
    let {faceBookModal, isFacebookModalOpened, localData, category} = this.props;
    let {isLoading, loadData, syncWithLocalData, isCloseModal} = this.state;
    if (faceBookModal && !isFacebookModalOpened && loadData) {
      this.setState({
        loadData: false,
        isLoader: true
      });
      this.getData();
    }

    if (isFacebookModalOpened && syncWithLocalData) {
      if (this.isCloseModal) {
        this.isCloseModal = false;
        return;
      }
      this.setState({
        syncWithLocalData: false,
        isCloseModal: false,
        snsData: {
          ...localData
        }
      });
    }

    if (category !== this.state.category) {
      this.setState({
        category: category
      })
    }
  }

  dateParseSafari = (date) => {
    date = date && date.toString()
    if (Date.parse(date && date.replace(/-/g, '/'))) {
      return new Date(date && date.replace(/-/g, '/'))
    }
    return '';
  }



  render() {
    let {
      selectedMailGroup,
      mailGroupList,
      snsData,
      isLoader,
      article,
      readyUrl,
      scheduleModal
    } = this.state;

    let {faceBookModal} = this.props;
    return (
      <>
        <Modal
          size="lg"
          isOpen={faceBookModal}
          modalClassName="custom-close"
          contentClassName="sns-modal"
          backdropClassName="sns-backdrop"
          centered
        >
          <ModalHeader className="sns-modal-header">
            <div className="title-icon">
              <LogoFacebook />
            </div>
            <span>
              {contentModtranslator('ARTICLE_EDIT.SNS_POSTING_MODAL_TITLE')}
            </span>
            <div
              className="custom-close"
              tabIndex={0}
              role="button"
              onClick={() => this.closeFacebookModal()}
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
               
                <div className="input-label-text">
                  {contentModtranslator('ARTICLE_EDIT.MAIL_DELEVERY_TEXT')}
                </div>
                <div className={`sns-post-editor`}>
                  <RichEditor
                    getEditorContent={this.getEditorContent}
                    editorState={snsData.editorState}
                    isImageVideoOff={true}
                    url={readyUrl}
                  />
                </div>
                <div className="mail-footer">
                  <div className="mail-deliver-section sns-footer">
                   
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
                              onChange={this.dateChange}
                              checked={snsData.dateType == 1 ? true : false}
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
                              onChange={this.dateChange}
                              checked={snsData.dateType == 2 ? true : false}
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
                          handleDate={this.handleDateChange}
                          type="mailDate"
                          value={
                            snsData.dateType == 1
                            ?  article.startDate?  this.formatDateSafari(article.startDate) : ''
                            : this.formatDateSafari(snsData.date)
                          }
                          minDate={
                            // snsData.dateType == 1
                            // ?  article.startDate?  this.dateParseSafari(article.startDate) : new Date()
                            // : new Date()
                            snsData.date? this.dateParseSafari(article.startDate) : new Date()
                          }
                          disabled={snsData.dateType == 1 ? true : false}
                          selected={snsData.date? this.dateParseSafari(snsData.date) : article.startDate ? this.dateParseSafari(article.startDate): new Date()}
                          showTimeSelect
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
                              onChange={this.onChangeConfig}
                              checked={snsData.config}
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
                    onClick={() => this.closeFacebookModal('save')}
                    className="modal-save-button"
                  >
                    {contentModtranslator('ARTICLE_EDIT.MODAL_SAVE_BUTTON')}
                  </button>
                  <button
                    onClick={() => this.closeFacebookModal()}
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
          cancelClick={this.toggleScheduleModal}
          okClick={() => this.toggleScheduleModal('save')}
        />

        {/* MAIL POSTING WARNING MODAL */}

        <ConfirmationModal
          isActive={snsData.warningModal}
          hideSave={snsData.hideSave}
          title={snsData.warningTitle}
          body={snsData.warningMessage}
          cancelClick={this.warningModal}
          okClick={() => this.warningModal('save')}
        />
      </>
    );
  }
}
