import React, {Component} from 'react';
import {Prompt} from 'react-router';
import {connect} from 'react-redux';
import moment, { utc } from 'moment';
import ReactHtmlParser from 'react-html-parser';
import draftToHtml from 'draftjs-to-html';
import DefaultLayout from '../../../../containers/DefaultLayout';
import {contentModtranslator} from '../modLocalization';
import AxiosService from '../../../../networks/AxiosService';
import {
  VideoCamSharp,
  ImageSharp,
  Browsers,
  CloseCircleSharp,
  LogoFacebook,
  CalenderOutline,
  DuplicateOutline
} from '../../mod-assets/svgComp';
import queryString from 'query-string';
import NcBreadcrumbs from '../../../../common-components/NcBreadcrumbs/ncBreadcrumbs';
import {withRouter} from 'react-router-dom';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import ApiService from '../../../../networks/ApiServices';
import {getPermissions} from '../../../../redux/actions/auth'
import {ReactComponent as Pencil} from '../mod-assets/svg/pencil-sharp.svg';
import {ReactComponent as Bulb} from '../mod-assets/svg/bulb-sharp.svg';
import {ReactComponent as Search} from '../mod-assets/svg/search-outline.svg';
import RichEditor from '../../components/RichEditor/RichEditor';
import {EditorState, convertToRaw, convertFromRaw} from 'draft-js';
import Facebook from '../mod-assets/svg/logo-facebook.svg';
import Twitter from '../mod-assets/svg/logo-twitter.svg';
import Line from '../mod-assets/svg/line-logo-svgrepo-com.svg';
import Mail from '../mod-assets/svg/mail.svg';
// import Search from '../mod-assets/svg/search-outline.svg';
import NcCheckbox from '../../../../common-components/NcCheckbox';
import DateInput from '../../components/dateInput';
import Toast from '../../../../common-components/Toast';
import {Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import Select from 'react-select';
import RequiredMessage from '../../../../common-components/RequiredMessage';
import Loader from '../../../../common-components/Loader';
import ConfirmationModal from '../../../../common-components/confirmationModal'
import Logger from '../../../../helper/logger'
import MailPosting from '../../components/MailPosting'
import FacebookPosting from '../../components/SnsPosting/Facebook'
import TwitterPosting from '../../components/SnsPosting/Twitter'
import LinePosting from '../../components/SnsPosting/Line'
import getErrorMessage from '../../../../app-constants/ServerErrorInfo';
import {
  trim,
  detectChanges,
  checkEditModePermission,
  detectManageMentTabChanges,
  checkApproveModePermission,
  checkProhibitModePermission,
  zeroPadding,
  checkPageAccess,
  editorContentAsText,
  getTargetedCityTime
} from '../../../../helper';
import Mention from '../../components/Mentions';
import {
  editMod,
  approveMod,
  prohibitMod,
  commentFetchInterval
} from '../../../../app-constants';
import NcThreeStateButton from '../../../../common-components/NcThreeStateButton';
import NcInput from '../../../../common-components/NcInput';
import './article.scss';
import {
  PUBLICATION,
  PUBLICATION_STATUS_ICON,
  APPROVAL_STATUS
} from '../../../../app-constants/rawContent';
import StatusIconWithLabel from '../../components/StatusIconWithLabel';
import {  CopyIcon, SaveIcon, DeleteIcon} from '../../mod-assets/svgComp';
class ArticleEdit extends Component {
  constructor(props) {
    super(props);
    this.tagsMaxValue = 255;
    this.mailSubjectRef = React.createRef();
    this.breadcrumbs = [
      {title: 'コンテンツ', link: '/content'},
      {title: '記事', link: '/content', active: true}
    ];
    this.state = {
      readyUrl: '',
      publicationIcon: PUBLICATION_STATUS_ICON,
      approvalIcon: APPROVAL_STATUS,
      hasTitleError: false,
      selectedMailGroup: [],
      mailGroupList: [],
      approvalCancelationModal: false,
      mailDeliveryModal: false,
      isMailModalOpened: false,
      faceBookModal: false,
      isFacebookModalOpened: false,
      twitterModal: false,
      isTwitterModalOpened: false,
      lineModal: false,
      isLineModalOpened: false,
      mailPosting: {
        isMailDelivered: false,
        scheduleModal: false,
        approvalCancelationModal: false,
        warningModal: false,
        warningMessage: '',
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
        id: null
      },
      facebookData: {
        dateType: 1,
      },
      twitterData: {
        dateType: 1,
      },
      lineData: {
        dateType: 1,
      },
      dateModal: false,
      copyModal: false,
      deleteModal: false,
      approveModal: false,
      publishModal: false,
      requestApproveModal: false,
      requestReviewModal: false,
      showWarningMessage: '',
      warningTitle: '',
      hideModalSaveButton: false,
      saveInProgress: false, // prevent multiple button click
      workInProgress: {
        articleSaveInprogress: false,
        reviewRequestInprogress: false,
        approverRequestInprogress: false,
        mailPost: false
      },
      fields: {
        review: false,
        approve: false,
        stopPublish: true,
        prohibit: false,
        copy: false,
        save: false,
        delete: false,
        preview: false,
        startDate: false,
        endDate: false
      },
      activeTab: 1,
      publishDateConfirmation: false,
      categoryList: [],
      isLoader: false,
      selectedCategory: [],
      selectedReviewer: [],
      selectedApprover: [],
      selectedUser: [],
      reviewerList: null,
      approverList: null,
      commentHistory: [],
      users: [],
      prevEditorState: null,
      editorState: null,
      editorContent: '',
      mentionedInComment: [],
      initialMaxLen: {
        url: 64,
        seoTags: 5120,
        managementTags: 1024
      },
      maxLen: {
        url: 6,
        seoTags: 255,
        managementTags: 1024
      },
      inputValue: {
        managementTags: '',
        seoTags: ''
      },
      ownMedia: {
        display_name: ' '
      },
      checkInProgress: {
        // prevent multiple check request
        title: false
      },
      cache: {
        // prevent re-checking the same value
        title: ''
      },
      articleWarning: {
        startDate: '',
        endDate: ''
      },
      initialTitle: '',
      initialUrl: '',
      articleData: {},
      baseArticle: {}, // base for change detection
      initialStartDate: '',
      initialEndDate: '',
      article: {
        title: '', //editable and unique
        url: '', // editable and unique
        managementTags: [],
        startDate: new Date(new Date().setHours(0,0,0,0)),
        endDate: '',
        description: '',
        editTab: {
          category: [],
          articleLayout: 0, // article layout normal or scroll
          publishingType: 0, // public or members only
          seoTags: [] // remove space inbetween comma [beauty,spa] not [beaut, spa]
        },
        manageMentTab: {
          reviewRequest: '',
          approvalRequest: '',
          reviewConfirmation: 0,
          approvalConfirmation: 0,
          approvalCancelation: 0,
          prohibition: 0 // means not selected
        }
      },
      articleError: {
        title: '',
        url: '',
        managementTags: '',
        description: '',
        editTab: {
          seoTags: ''
        }
      },
      articlePreviewContent: {
        articleTitle: '',
        articleContent: '',
        date: '',
        selectedCategory: []
      }
    };
  }
  setTab(active) {
    this.setState({
      activeTab: active
    });
  }

  // TITLE VALIDATION
  /*
  1. Allow Alphanumeric
  2. Allow all Special Characters
  3. No blank
  4. Maximum text length is 1024 characters
  5. Input text must be unique in system (This item identifies the article data.)
  6. required

*/

  // ***  means allow everything

  onTitleChange = (event) => {
    let {value} = event.target;
    let {articleError, article} = this.state;
    // set article value and remove error
    this.setState({
      article: {
        ...article,
        title: value
      },
      articleError: {
        ...articleError,
        title: ''
      }
    });
  };

  onTitleBlur = (event) => {
    let {value} = event.target;
    let {articleError, article, initialTitle, checkInProgress, cache} = this.state;

    // clear error for empty input
    if (!value) {
      this.setState({
        articleError: {
          ...articleError,
          title: ''
        }
      });
      return;
    }
    // check for uniqueness
    if (cache.title !== value && !checkInProgress.title) {
      if (initialTitle == value) {
        this.setState({
          checkInProgress: {
            url: false
          },
          cache: {
            ...this.state.cache,
            url: value
          },
          articleError: {
            ...articleError,
            url: ''
          }
        });
        return;
      }
      AxiosService.get(ApiService.CHECK_ARTICLE_TITLE(value), false)
        .then((result) => {
          if (result.data) {
            if (result.data.status) {
              this.setState({
                checkInProgress: {
                  title: false
                },
                cache: {
                  ...this.state.cache,
                  title: value
                },
                articleError: {
                  ...articleError,
                  title: ''
                }
              });
            }

            if (!result.data.status) {
              this.setState({
                checkInProgress: {
                  title: false
                },

                articleError: {
                  ...articleError,
                  title: result.data.message
                }
              });
            }
          }
        })
        .catch((error) => {
          Logger(error);
          this.setState({
            checkInProgress: {
              title: false
            },
            cache: {
              ...this.state.cache,
              title: value
            },
            articleError: {
              ...articleError,
              title: error.response && error.response.data.message
            }
          });
        });
      this.setState({
        checkInProgress: {
          title: true
        }
      });
    }
  };

  // ARTICLE URL

  // 1. Allow Alphanumeric
  // 2. Allow only Special Characters (-, _)
  // 3. No space between Characters
  // 4. No blank
  // 5. Maximum text length is 64 characters
  // 6. Disable to edit while approval status is "Approved OK" by any permissions.
  // 7. required

  //***********
  //  UPDATED SPEC
  // **********

  /*
  1. allow only 6 digit number
*/

  onUrlChange = (event) => {
    let value = event.target.value;
    let {article, articleError, maxLen} = this.state;
    let urlValidation = /^(\d{6})$/;
    if (urlValidation.test(value)) {
      this.setState({
        maxLen: {
          ...maxLen,
          url: 6
        }
      });
    } else {
      this.setState({
        maxLen: {
          ...maxLen,
          url: 64
        }
      });
    }
    this.setState({
      article: {
        ...article,
        url: value
      },
      articleError: {
        ...articleError,
        url: ''
      }
    });
  };

  onUrlBlur = (event) => {
    let {value} = event.target;
    let {article, cache, initialUrl, articleError, checkInProgress} = this.state;

    value = value && value.trim();

    if (!value) {
      this.setState({
        articleError: {
          ...articleError,
          url: contentModtranslator('ARTICLE_EDIT.ARTICLE_URL_INVALID')
        }
      });
      return;
    }

    let allowedPattern = /^[\w-]+$/g;
    let patternValidation = /(__|--)/g;

    if (patternValidation.exec(value)) {
      this.setState({
        articleError: {
          ...articleError,
          url: contentModtranslator('ARTICLE_EDIT.ARTICLE_URL_INVALID')
        }
      });
      return;
    }

    if (allowedPattern.test(value)) {
      this.setState({
        articleError: {
          ...articleError,
          url: ''
        }
      });
      // check for uniques
      if (cache.url !== value && !checkInProgress.url) {
        if (initialUrl == value) {
          this.setState({
            checkInProgress: {
              url: false
            },
            cache: {
              ...this.state.cache,
              url: value
            },
            articleError: {
              ...articleError,
              url: ''
            }
          });
          return;
        }
        AxiosService.get(ApiService.CHECK_ARTICLE_URL(value), false)
          .then((result) => {
            if (result.data) {
              if (result.data.status) {
                this.setState({
                  checkInProgress: {
                    url: false
                  },
                  cache: {
                    ...this.state.cache,
                    url: value
                  },
                  articleError: {
                    ...articleError,
                    url: ''
                  }
                });
              }

              if (!result.data.status) {
                this.setState({
                  checkInProgress: {
                    url: false
                  },
                  articleError: {
                    ...articleError,
                    url: result.data.message
                  }
                });
              }
            }
          })
          .catch((error) => {
            Logger(error);
            this.setState({
              checkInProgress: {
                url: false
              },
              cache: {
                ...this.state.cache,
                url: value
              },
              articleError: {
                ...articleError,
                url: error.response.data.message
              }
            });
          });
        this.setState({
          checkInProgress: {
            url: true
          }
        });
      }
    } else {
      this.setState({
        articleError: {
          ...articleError,
          url: contentModtranslator('ARTICLE_EDIT.ARTICLE_URL_INVALID')
        }
      });
    }
  };

  // MANAGEMENT TAGS

  /* 
  1. Allow Full width Japanese Character
  2. Allow Alphanumeric
  3. Allow any special characters
  4. Maximum text length is 1024 characters
  5. Comma "," specifies separator for multiple tags.
*/

  validation = (tags) => {
    let [value] = tags;
    this.onManageMentTagBlur(value.trim());
  };

  onManageMentTagChange = (value) => {
    // let {value} = event.target;
    let {article, articleError, maxLen, initialMaxLen} = this.state;

    let totalLen = value && value.join('').length;

    let characterLeft =
      totalLen <= initialMaxLen.managementTags
        ? initialMaxLen.managementTags - totalLen
        : 0;

    this.setState({
      maxLen: {
        ...maxLen,
        managementTags: characterLeft
      }
    });

    this.setState({
      article: {
        ...article,
        managementTags: value
      },
      articleError: {
        ...articleError,
        managementTags: ''
      }
    });
  };

  tagsInputChange = (tag) => {
    let {inputValue, article} = this.state;
    let value = tag && tag.trim();
    let arr = value && value.split('');
    if (arr.includes(',')) {
      arr.pop();
      let t = arr.join('');
      if (article.managementTags.includes(t)) {
        return;
      }
      arr.length &&
        this.onManageMentTagChange([...article.managementTags, arr.join('')]);
      this.setState({
        inputValue: {
          ...inputValue,
          managementTags: ''
        }
      });
      return;
    }
    this.setState({
      inputValue: {
        ...inputValue,
        managementTags: value
      }
    });
  };

  tagsInputChange = (tag) => {
    let {inputValue, article} = this.state;
    let value = tag;
    let arr = value && value.split('');
    if (arr.includes(',')) {
      arr.pop();
      let t = arr.join('');
      if (article.managementTags.includes(t)) {
        return;
      }
      arr.length &&
        this.onManageMentTagChange([...article.managementTags, arr.join('')]);
      this.setState({
        inputValue: {
          ...inputValue,
          managementTags: ''
        }
      });
      return;
    }
    this.setState({
      inputValue: {
        ...inputValue,
        managementTags: value
      }
    });
  };

  onManageMentTagBlur = (value) => {
    // let {value} = event.target;
    let {article, articleError} = this.state;
    if (!value) {
      this.setState({
        articleError: {
          ...articleError,
          managementTags: ''
        }
      });
      return;
    }
  };

  // START AND END DATE

  /*
  ** start date
      Blank is acceptable. When value is blank, article is imediately published after article is approved.
      Past date should not be allowed to select.
      After approved OK, this part is able to operate by only "Publishing" permission holder.
  ** end date
      Blank is acceptable. When value is blank, article is publishing forever.
      Past date should not be allowed to select.
      After approved OK, this part is able to operate by only "Publishing" permission holder.


  1. blank is allowed
  2. when blank detected show the following message
    - Start date & time is blank. Article is imediately published after approval.
    - End date & time is blank. Article will be published permanetly after approval.
*/

  handleDateChange = (event, name) => {
    let article = {...this.state.article};
   
    article[name] = event ? event : '';
    let manageMentTab = article.manageMentTab
    if (manageMentTab.approvalConfirmation == 2 && this.detectStartEndDateChange(event, name)) {
        this.setState({
          warningModal: true,
          hideModalSaveButton: true,
          warningTitle: contentModtranslator('ARTICLE_EDIT.START_END_DATE_CHANGE_WARNING_TITLE'),
          showWarningMessage: contentModtranslator('ARTICLE_EDIT.START_END_DATE_CHANGE_WARNING'),
        })
    }
 
    this.setState({
      article
    });
  };

  // DESCRIPTION
  /*
  1. Allow Full width Japanese Character
  2. Allow Alphanumeric
  3. Allow any special characters
  4. Allow maximum 5120 characters

*/

  onDescriptionChange = (event) => {
    let value = event.target.value;
    let {article, articleError} = this.state;

    this.setState({
      article: {
        ...article,
        description: value
      },
      articleError: {
        ...articleError,
        description: ''
      }
    });
  };

  defaultRenderTag = (props) => {
    let {
      tag,
      key,
      disabled,
      onRemove,
      classNameRemove,
      getTagDisplayValue,
      ...other
    } = props;
    return (
      <span title={tag} key={key} {...other}>
        {getTagDisplayValue(trim(tag, 6))}
        {!disabled && (
          <a className={classNameRemove} onClick={(e) => onRemove(key)} />
        )}
      </span>
    );
  };
  onDescriptionBlur = (event) => {
    let value = event.target.value;
    let {article, articleError} = this.state;

    if (!value) {
      this.setState({
        article: {
          ...article,
          description: value
        },
        articleError: {
          ...articleError,
          description: ''
        }
      });
      return;
    }
  };
  // ***********
  // EDIT TAB
  // **********

  // CAETGORY

  /* 
  1. Default article category is first item of dropdown list.
  2. List items are set in configuration file in backend.
  3. Selected First choice
  4. required
*/

  onCategoryChagne = (event) => {
    let {article} = this.state
    this.setState({
      article: {
        ...article,
        editTab: {
          ...article.editTab,
          category: [event]
        }
      },
      selectedCategory: [event]
    });
  
  };

  // SEO TAGS

  /*
  1. Allow Full width Japanese Character
  2. Allow Alphanumeric
  3. Allow blank
  4. Allow special characters
  5. Allow maximum 5120 characters

*/

  onEditTabSeoChange = (value) => {
    // let value = event.target.value
    let {
      article,
      article: {editTab},
      articleError,
      maxLen,
      initialMaxLen
    } = this.state;
    let totalLen = value && value.join('').length;

    // removing tag
    if (value.length < editTab.seoTags.length) {
      let [removed] = editTab.seoTags.filter((v) => !value.includes(v));
      this.setState({
        maxLen: {
          ...maxLen,
          seoTags:
            initialMaxLen.seoTags - totalLen >= this.tagsMaxValue
              ? this.tagsMaxValue
              : removed.length
        }
      });
    } else {
      let characterLeft =
        initialMaxLen.seoTags - totalLen >= this.tagsMaxValue
          ? this.tagsMaxValue
          : initialMaxLen.seoTags - totalLen;
      this.setState({
        maxLen: {
          ...maxLen,
          seoTags: characterLeft
        }
      });
    }

    this.setState({
      article: {
        ...article,
        editTab: {
          ...article.editTab,
          seoTags: value
        }
      },
      articleError: {
        ...articleError,
        editTab: {
          ...articleError.editTab,
          seoTags: ''
        }
      }
    });
  };

  seoTagsInputChange = (tag) => {
    let {
      inputValue,
      article,
      article: {editTab}
    } = this.state;
    let value = tag;
    let arr = value && value.split('');
    if (arr.includes(',')) {
      arr.pop();
      let t = arr.join('');
      if (editTab.seoTags.includes(t)) {
        return;
      }
      arr.length && this.onEditTabSeoChange([...editTab.seoTags, arr.join('')]);
      this.setState({
        inputValue: {
          ...inputValue,
          seoTags: ''
        }
      });
      return;
    }
    this.setState({
      inputValue: {
        ...inputValue,
        seoTags: value
      }
    });
  };

  onEditTabSeoChangeBlur = (value) => {
    // let value = event.target.value;
    let {article, articleError} = this.state;

    if (!value) {
      this.setState({
        articleError: {
          ...articleError,
          editTab: {
            ...articleError.editTab,
            seoTags: ''
          }
        }
      });
      return;
    }
  };

  // ARTICLE LAYOUT SETTINGS

  /* 
  Two radio buttons to set attribute to article that article is placed to "scroll section" or not:
  1. "通常記事" Normal Article
    - When article is specified this, article is treated as normal.
  2. "記事スクロールへ配置" Scroll Article
    - When article is specified this, this article is placed to scroll section as well.
  3. selected first choice
*/

  // PUBLISHING SETTINGS

  /* 
  Two radio buttons to set attribute to article that this article is limited to members only or not:
  
  1. "一般公開記事" Normal Article
    - When article is specified this, this (published) article is able to access by anyone.
  2. "会員限定記事" Member's only Article
    - When article is specified this, this (published) article is able to access by logged in member only.
  3. selected first choice
*/

  onPublishingTypeChange = (event) => {
    let {name, value} = event.target;
    let {article} = this.state;
    let editTab = {...article.editTab};
    editTab[name] = value;
    article.editTab = editTab;
    this.setState({
      article
    });
  };

  onReviewConfirmationChange = (value) => {
    if (!this.approvedOnlyPermission()) {
      this.setState({
        // showWarningMessage: contentModtranslator('ARTICLE_EDIT.SAVE_THE_ARTICLE_FIRST'),
        showWarningMessage: contentModtranslator(
          'ARTICLE_EDIT.WARN_MSG_AFTER_APPROVE'
        ),
        warningModal: true
      });
      return;
    }

    if (!checkEditModePermission(editMod.type.review, this.props.permissions)) {
      this.setState({
        // showWarningMessage: contentModtranslator('ARTICLE_EDIT.SAVE_THE_ARTICLE_FIRST'),
        showWarningMessage: contentModtranslator(
          'ARTICLE_EDIT.MSG_YOU_DONT_HAVE_RIGHT_PERMISSION'
        ),
        warningModal: true
      });
      return;
    }
    if (this.isArticleChagned()) {
      this.setState({
        showWarningMessage: contentModtranslator(
          'ARTICLE_EDIT.SAVE_THE_ARTICLE_FIRST'
        ),
        warningModal: true
      });
      return;
    }

    let {article} = this.state;
    let manageMentTab = {...article.manageMentTab};
    manageMentTab.reviewConfirmation = Number(value);
    article.manageMentTab = manageMentTab;
    this.setState({
      article
    });
  };
  onApprovalConfirmationChange = (value) => {
    let {
      article: {manageMentTab}
    } = this.state;
    if (!this.approvedOnlyPermission()) {
      this.setState({
        // showWarningMessage: contentModtranslator('ARTICLE_EDIT.SAVE_THE_ARTICLE_FIRST'),
        showWarningMessage: contentModtranslator(
          'ARTICLE_EDIT.WARN_MSG_AFTER_APPROVE'
        ),
        warningModal: true
      });
      return;
    }

    if (!checkEditModePermission(editMod.type.approval, this.props.permissions)) {
      this.setState({
        // showWarningMessage: contentModtranslator('ARTICLE_EDIT.SAVE_THE_ARTICLE_FIRST'),
        showWarningMessage: contentModtranslator(
          'ARTICLE_EDIT.MSG_YOU_DONT_HAVE_RIGHT_PERMISSION'
        ),
        warningModal: true
      });
      return;
    }

    if (this.isArticleChagned()) {
      this.setState({
        showWarningMessage: contentModtranslator(
          'ARTICLE_EDIT.SAVE_THE_ARTICLE_FIRST'
        ),
        warningTitle: contentModtranslator('ARTICLE_EDIT.COMMON_MODAL_TITLE'),
        hideModalSaveButton: true,
        warningModal: true
      });
      return;
    }

    // show modal for confirmation
    if (value == 2) {
      this.setState({
        approveModal: true,
        approvalValue: value
      });
    } else {
      let {article, fields} = this.state;
      let manageMentTab = {...article.manageMentTab};
      manageMentTab.approvalConfirmation = Number(value);
      article.manageMentTab = manageMentTab;
      this.setState({
        article,
        fields: {
          ...fields,
          stopPublish: true
        }
      });
    }
  };

  confirmApproval = () => {
    let {article, approvalValue, fields} = this.state;
    let manageMentTab = {...article.manageMentTab};
    manageMentTab.approvalConfirmation = approvalValue;
    manageMentTab.approvalCancelation = 0;
    article.manageMentTab = manageMentTab;
    let access = this.props.permissions 
    this.setState({
      article,
      showWarningMessage: contentModtranslator(
        'ARTICLE_EDIT.SAVE_ARTICLE_TO_PERSISIT_APPROVE_OK'
      ),
      warningTitle: contentModtranslator(
        'ARTICLE_EDIT.COMMON_MODAL_TITLE'
      ),
      warningModal: true,
      hideModalSaveButton: true,
      fields: {
        review: true,
        approve: true,
        stopPublish:
          access.includes('Article Approve')
            ? false
            : true,
        prohibit: true,
        copy: this.approvedOnlyPermission(approveMod.type.copy) ? false : true,
        save: false,
        delete: true
      }
    });
  };

  onChangePublishApproval = (event) => {
    let {name, value, checked} = event.target;
    let {
      article,
      article: {manageMentTab}
    } = this.state;
    if (!this.approvedOnlyPermission(approveMod.type.publish)) {
      this.setState({
        // showWarningMessage: contentModtranslator('ARTICLE_EDIT.SAVE_THE_ARTICLE_FIRST'),
        showWarningMessage: contentModtranslator(
          'ARTICLE_EDIT.WARN_MSG_AFTER_APPROVE'
        ),
        warningModal: true
      });
      return;
    }
    if (!checkEditModePermission(editMod.type.publish, this.props.permissions)) {
      this.setState({
        // showWarningMessage: contentModtranslator('ARTICLE_EDIT.SAVE_THE_ARTICLE_FIRST'),
        showWarningMessage: contentModtranslator(
          'ARTICLE_EDIT.MSG_YOU_DONT_HAVE_RIGHT_PERMISSION'
        ),
        warningModal: true
      });
      return;
    }
    if (
      Number(manageMentTab.approvalConfirmation) !== 2 &&
      !manageMentTab.approvalCancelation
    ) {
      this.setState({
        showWarningMessage: contentModtranslator(
          'ARTICLE_EDIT.ARTICLE_NOT_PUBLISHED_YET'
        ),
        warningModal: true
      });
      return;
    }
    
    if (!manageMentTab.approvalCancelation) {
      this.setState({
        publishModal: true,
        publishChecked: checked
      });
    }
    if (manageMentTab.approvalCancelation) {
      let {article, fields} = this.state;
      let manageMentTab = {...article.manageMentTab};
      manageMentTab.approvalCancelation = 0;
      manageMentTab.approvalConfirmation = 0;
      article.manageMentTab = manageMentTab;
      this.setState({
        article,
        fields: {
          ...fields,
          review: false,
          approve: false,
          stopPublish:
            Number(manageMentTab.approvalConfirmation) !== 2 ? true : false
        }
      });
    }
  };

  confirmPublish = () => {
    let {article, publishChecked, fields} = this.state;
    let manageMentTab = {...article.manageMentTab};
    manageMentTab.approvalCancelation = publishChecked;
    manageMentTab.approvalConfirmation = 0;
    manageMentTab.reviewConfirmation = 0;
    article.manageMentTab = manageMentTab;
    this.setState({
      article,
      fields: {
        review: true,
        approve: true,
        stopPublish: false,
        prohibit: false,
        copy: false,
        save: false,
        delete: false
      }
    });
  };

  onChangeProhibitApproval = (event) => {
    let {name, value, checked} = event.target;
    let {article, fields} = this.state;

    // in approve mode no one can prohibit
    if (article.manageMentTab.approvalConfirmation == 2) {
      this.setState({
        // showWarningMessage: contentModtranslator('ARTICLE_EDIT.SAVE_THE_ARTICLE_FIRST'),
        showWarningMessage: contentModtranslator(
          'ARTICLE_EDIT.MSG_YOU_DONT_HAVE_RIGHT_PERMISSION'
        ),
        warningModal: true
      });
      return;
    }

    // before implementing new cr

    // if (!checkEditModePermission(editMod.type.publish, this.props.permissions)) {
    //   this.setState({
    //     // showWarningMessage: contentModtranslator('ARTICLE_EDIT.SAVE_THE_ARTICLE_FIRST'),
    //     showWarningMessage: contentModtranslator('ARTICLE_EDIT.MSG_YOU_DONT_HAVE_RIGHT_PERMISSION'),
    //     warningModal: true
    //   });
    //   return;
    // }

    // after implementing new cr

    if (!checkEditModePermission(editMod.type.prohibit, this.props.permissions)) {
      this.setState({
        // showWarningMessage: contentModtranslator('ARTICLE_EDIT.SAVE_THE_ARTICLE_FIRST'),
        showWarningMessage: contentModtranslator(
          'ARTICLE_EDIT.MSG_YOU_DONT_HAVE_RIGHT_PERMISSION'
        ),
        warningModal: true
      });
      return;
    }

    let manageMentTab = {...article.manageMentTab};
    manageMentTab.prohibition = Number(checked);
    manageMentTab.approvalCancelation = 0;
    manageMentTab.reviewConfirmation = 0;
    manageMentTab.approvalConfirmation = 0;

    article.manageMentTab = manageMentTab;

    let access =
      this.props.permissions || JSON.parse(localStorage.getItem('permissions'));

    let isApprover = access.includes('Article Approve');
    let isPublisher = access.includes('Article Publish');

    this.setState({
      article,
      fields: {
        ...fields,
        review: Number(checked) ? true : false,
        approve: Number(checked) ? true : false,
        copy: Number(checked) ? true : false,
        save: Number(checked) ? true : false,
        delete: Number(checked) ? true : false,
        preview: Number(checked)
          ? isApprover || isPublisher
            ? false
            : true
          : false,
        startDate: Number(checked) ? true : false,
        endDate: Number(checked) ? true : false,
        stopPublish: true
      }
    });
  };

  formatDate = (date, formatter = '-') => {
    if (Date.parse(date)) {
      let d = new Date(date);
      return `${d.getFullYear()}${formatter}${zeroPadding(
        d.getMonth() + 1
      )}${formatter}${zeroPadding(d.getDate())} ${zeroPadding(
        d.getHours()
      )}:${zeroPadding(d.getMinutes())}`;
    }
    return '';
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

  // detect changed before performing operation
  /*
    1. send review request
    2. send approval request
    3. three state toggle button
    4. before logout
    5. before leaving the current page
  */

  isArticleChagned = () => {
    return detectChanges(this.state);
  };

  isManageMentChanges = () => {
    return detectManageMentTabChanges(this.state);
  };

  copyArticle = (value) => {
    if (!this.approvedOnlyPermission(approveMod.type.copy)) {
      this.setState({
        // showWarningMessage: contentModtranslator('ARTICLE_EDIT.SAVE_THE_ARTICLE_FIRST'),
        showWarningMessage: contentModtranslator(
          'ARTICLE_EDIT.WARN_MSG_AFTER_APPROVE'
        ),
        warningModal: true
      });
      return;
    }

    let {origin} = window.location;
    var win = window.open(`${origin}/copy-content?id=${this.id}`, '_blank');
    win.focus();
  };

  handleApprovalSave = () => {
    let {
      article,
      ownMedia,
      articleError,
      workInProgress: {articleSaveInprogress},
      selectedCategory
    } = this.state;

    if (articleSaveInprogress) {
      return;
    }

    if (!this.approvedOnlyPermission(approveMod.type.save)) {
      this.setState({
        // showWarningMessage: contentModtranslator('ARTICLE_EDIT.SAVE_THE_ARTICLE_FIRST'),
        showWarningMessage: contentModtranslator(
          'ARTICLE_EDIT.WARN_MSG_AFTER_APPROVE'
        ),
        warningModal: true
      });
      return;
    }

    // VALIDATION BEFORE SUBMIT
    let error = {};
    // prevent blank article title
    if (!article.title) {
      error.title = contentModtranslator('ARTICLE_EDIT.ARTICLE_TITLE_INVALID');
    }
    // prevent blank article title

    if (!article.url) {
      error.url = contentModtranslator('ARTICLE_EDIT.ARTICLE_URL_INVALID');
    }

    // if error exist abort
    if (!article.title || !article.url) {
      this.setState({
        articleError: {
          ...articleError,
          ...error
        }
      });
      return;
    }

    let prepareArticelData = {
      title: article.title,
      url: article.url,
      articleDescription: article.description,
      articleBody:
        (this.state.editorContent &&
          JSON.stringify(convertToRaw(this.state.editorContent))) ||
        null,
      publishingStart: this.formatDate(article.startDate),
      publishingEnd: this.formatDate(article.endDate),
      articleCategoryId: selectedCategory.length ? selectedCategory[0].value : '',
      ownmediaId: ownMedia.id,
      publishingSetting: article.editTab.articleLayout,
      articleLayout: article.editTab.publishingType,
      articleSeoTag: article.editTab.seoTags.join(','),
      articleManagementTag: article.managementTags.join(','),

      requestedReviewUserId: article.manageMentTab.reviewRequest,
      requestedApprovalUserId: article.manageMentTab.approvalRequest,

      reviewStatus: Number(article.manageMentTab.reviewConfirmation),
      approvalStatus: Number(article.manageMentTab.approvalConfirmation),
      isProhibitedToPublish: Number(article.manageMentTab.prohibition),
      isStoppedToPublish: Number(article.manageMentTab.approvalCancelation)
    };

    AxiosService.put(
      ApiService.UPDATE_ARTICLE(this.id),
      prepareArticelData,
      false,
      false
    )
      .then((result) => {
        if (result.data) {
          let {article, baseArticle, articleData} = this.state;
          Toast.success(result.data.message);
          this.setState({
            article: article,
            prevEditorState: this.state.editorState,
            initialStartDate: article.startDate,
            initialEndDate: article.endDate,
            articleData: {
              ...articleData,
              ...result.data.data
            },
            baseArticle: {
              ...article,
              editTab: {
                ...article.editTab
              },
              manageMentTab: {
                ...article.manageMentTab
              }
            },
            workInProgress: {
              ...this.state.workInProgress,
              articleSaveInprogress: false
            }
          });
        }
        this.saveMailData()
      })
      .catch((error) => {
        Logger(error);
        let apiError = getErrorMessage(error);
        Toast.error(apiError.message);
        this.setState({
          workInProgress: {
            ...this.state.workInProgress,
            articleSaveInprogress: false
          }
        });
      });

    this.setState({
      workInProgress: {
        ...this.state.workInProgress,
        articleSaveInprogress: true
      },
      publishDateConfirmation: false
    });
  };


  handleSave = () => {
    let {article: {manageMentTab}} = this.state
    // for new mail entry creation


    if (manageMentTab.approvalConfirmation == 2) {
      this.setState({
        mailPosting: {
          ...this.state.mailPosting,
          scheduleModal: true
        }
      })
    } else {
      this.saveArticleData()
    }
  };

  saveArticleData = (reScheduleMail, snsList) => {
   
    let {
      article,
      ownMedia,
      articleError,
      workInProgress: {articleSaveInprogress},
      selectedCategory
    } = this.state;

    if (articleSaveInprogress) {
      return;
    }

    

    if (!this.approvedOnlyPermission(approveMod.type.save)) {
      this.setState({
        // showWarningMessage: contentModtranslator('ARTICLE_EDIT.SAVE_THE_ARTICLE_FIRST'),
        showWarningMessage: contentModtranslator('ARTICLE_EDIT.WARN_MSG_AFTER_APPROVE'),
        warningModal: true
      });
      return;
    }

    if (articleError.title || articleError.url) {
      return
    }

    // VALIDATION BEFORE SUBMIT
    let error = {};
    // prevent blank article title
    if (!article.title) {
      error.title = contentModtranslator('ARTICLE_EDIT.ARTICLE_TITLE_INVALID');
    }
    // prevent blank article title

    if (!article.url) {
      error.url = contentModtranslator('ARTICLE_EDIT.ARTICLE_URL_INVALID');
    }

    // if error exist abort
    if (!article.title || !article.url) {
      this.setState({
        articleError: {
          ...articleError,
          ...error
        }
      });
      return;
    }

    let prepareArticelData = {
      title: article.title,
      url: article.url,
      articleDescription: article.description,
      articleBody:
        (this.state.editorContent &&
          JSON.stringify(convertToRaw(this.state.editorContent))) ||
        null,
      publishingStart: this.formatDateSafari(article.startDate),
      publishingEnd: this.formatDateSafari(article.endDate),
      articleCategoryId: selectedCategory.length ? selectedCategory[0].value : '',
      ownmediaId: ownMedia.id,
      publishingSetting: article.editTab.publishingType,
      articleLayout: article.editTab.articleLayout ,
      articleSeoTag: article.editTab.seoTags.join(','),
      articleManagementTag: article.managementTags.join(','),

      requestedReviewUserId: article.manageMentTab.reviewRequest,
      requestedApprovalUserId: article.manageMentTab.approvalRequest,

      reviewStatus: Number(article.manageMentTab.reviewConfirmation),
      approvalStatus: Number(article.manageMentTab.approvalConfirmation),
      isProhibitedToPublish: Number(article.manageMentTab.prohibition),
      isStoppedToPublish: Number(article.manageMentTab.approvalCancelation)
    };


    AxiosService.put(
      ApiService.UPDATE_ARTICLE(this.id),
      prepareArticelData,
      false,
      false
    )
      .then((result) => {
        let {mailPosting} = this.state
        if (result.data) {
          // if (this.checkIfNewMailEntryShouldBeCreated() || mailPosting.config) {
            this.saveMailData(reScheduleMail)
            let [facebook = {}, twitter = {}, line = {}] = snsList || []
          
            this.saveFacebookData(facebook.is_posted)

            this.saveTwitterData(twitter.is_posted)

            this.saveLineData(line.is_posted)
    
          let {article, baseArticle, articleData} = this.state;
          Toast.success(result.data.message);
          this.setState({
            article: article,
            prevEditorState: this.state.editorState,
            initialStartDate: article.startDate,
            initialEndDate: article.endDate,
            articleData: {
              ...articleData,
              ...result.data.data
            },
            baseArticle: {
              ...article,
              editTab: {
                ...article.editTab
              },
              manageMentTab: {
                ...article.manageMentTab
              }
            },
            workInProgress: {
              ...this.state.workInProgress,
              articleSaveInprogress: false
            }
          });
        }

       
      })
      .catch((error) => {
        Logger(error)
        let apiError = getErrorMessage(error);
        Toast.error(apiError.message);
        this.setState({
          workInProgress: {
            ...this.state.workInProgress,
            articleSaveInprogress: false
          }
        });
      });

    this.setState({
      workInProgress: {
        ...this.state.workInProgress,
        articleSaveInprogress: true
      },
      publishDateConfirmation: false,
     
    });
  }

  toggleModal = (value) => {
    let {dateModal} = this.state;
    if (value == 'save') {
      this.setState(
        () => ({
          publishDateConfirmation: true,
          articleWarning: {
            startDate: '',
            endDate: ''
          }
        }),
        () => {
          this.handleSave();
        }
      );
      // this.handleSave()
    }
    this.setState({
      dateModal: !dateModal
    });
  };

  toggleWarningModal = (value) => {
    let {warningModal} = this.state;

    this.setState({
      warningModal: !warningModal
    });
  };

  toggleCopyModal = (value) => {
    let {copyModal} = this.state;
    if (value == 'save') {
      this.setState(
        () => ({
          // publishDateConfirmation: true,
          // articleWarning: {
          //   startDate: '',
          //   endDate: ''
          // }
        }),
        () => {
          // this.handleSave();
        }
      );
    }
    this.setState({
      copyModal: !copyModal
    });
  };

  toggleDeleteModal = (value) => {
    let {deleteModal} = this.state;

    if (!this.approvedOnlyPermission()) {
      this.setState({
        // showWarningMessage: contentModtranslator('ARTICLE_EDIT.SAVE_THE_ARTICLE_FIRST'),
        showWarningMessage: contentModtranslator(
          'ARTICLE_EDIT.WARN_MSG_AFTER_APPROVE'
        ),
        warningModal: true
      });
      return;
    }

    if (value == 'save') {
      this.handleDelete();
    }
    this.setState({
      deleteModal: !deleteModal
    });
  };

  handleDelete = () => {
    AxiosService.remove(ApiService.DELETE_ARTICLE(this.id), false)
      .then((result) => {
        if (result.data) {
          this.props.history.push('/content');
          Toast.error(result.data.message);
        }
      })
      .catch((error) => {
        Logger(error);
        let apiError = getErrorMessage(error);
        Toast.error(apiError.message);
      });
  };

  toggleApproveModal = (value) => {
    let {approveModal} = this.state;
    if (value == 'save') {
      this.confirmApproval();
    }
    this.setState({
      approveModal: !approveModal
    });
  };

  togglePublishModal = (value) => {
    let {publishModal} = this.state;
    if (value == 'save') {
      this.confirmPublish();
    }
    this.setState({
      publishModal: !publishModal
    });
  };

  toggleRequestReviewModal = (value) => {
    let {requestReviewModal} = this.state;
    if (value == 'save') {
      this.confirmReviewRequest();
    }
    this.setState({
      requestReviewModal: !requestReviewModal
    });
  };

  confirmReviewRequest = () => {
    let {
      article: {manageMentTab},
      workInProgress: {approverRequestInprogress},
      baseArticle,
      articleData
    } = this.state;
    AxiosService.get(ApiService.REQUEST_REVIEW(manageMentTab.reviewRequest, this.id))
      .then((result) => {
        Toast.success(result.data.message);
        let data = result.data.data || {};

        this.fetchAllComment();
        this.pendingReview = manageMentTab.reviewRequest;
        this.setState({
          selectedReviewer: null,
          articleData: {
            ...articleData,
            ...data
          },
          workInProgress: {
            ...this.state.workInProgress,
            reviewRequestInprogress: false
          },
          baseArticle: {
            ...baseArticle,
            manageMentTab: {
              ...baseArticle.manageMentTab,
              reviewRequest: manageMentTab.reviewRequest
            }
          }
        });
      })
      .catch((error) => {
        Logger(error);
        let apiError = getErrorMessage(error);
        Toast.error(apiError.message);
        this.setState({
          workInProgress: {
            ...this.state.workInProgress,
            reviewRequestInprogress: false
          }
        });
      });

    this.setState({
      workInProgress: {
        ...this.state.workInProgress,
        reviewRequestInprogress: true
      }
    });
  };

  toggleRequestApproveModal = (value) => {
    let {requestApproveModal} = this.state;
    if (value == 'save') {
      this.confirmApproveRequest();
    }
    this.setState({
      requestApproveModal: !requestApproveModal
    });
  };

  toggleMailScheduleModal = (value) => {
    let {
      article: {startDate}, mailPosting
    } = this.state;
    if (value == 'save') {
    // check mail delivery status
    if (mailPosting.id) {
      AxiosService.get(ApiService.MAIL_SEND_STATUS(mailPosting.id), false)
      .then((result) => {
        let isDeliverid = result.data.data.mail_delivered;
        if (isDeliverid) {
          this.saveArticleData(true)
        } else {
          this.saveArticleData(mailPosting.isCronActivated)
        }
      })
      .catch((error) => {
        Logger(error);
      });
    } else {
      this.saveArticleData(mailPosting.isCronActivated)
    }


        // check sns post delivery status


        AxiosService.get(ApiService.SNS_DELIVERY_CHECK(this.id), false)
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
  
  
          this.saveArticleData(false, [facebook,twitter,line])
        })
        .catch((error) => {
          Logger(error);
        });
      
  

    
    }
    this.setState({
      mailPosting: {
        ...this.state.mailPosting,
        scheduleModal: !this.state.mailPosting.scheduleModal
      }
    });
  };



  

  toggleMailApprovalModal = (value) => {
    let {
      article: {startDate}
    } = this.state;
    if (value == 'save') {
     this.handleApprovalSave()
    
    }
    this.setState({

       approvalCancelationModal: !this.state.approvalCancelationModal
     
    });
  };

  confirmApproveRequest = () => {
    let {
      article: {manageMentTab},
      workInProgress: {approverRequestInprogress},
      baseArticle,
      articleData
    } = this.state;
    AxiosService.get(
      ApiService.REQUEST_APPROVAL(manageMentTab.approvalRequest, this.id)
    )
      .then((result) => {
        Toast.success(result.data.message);
        this.fetchAllComment();
        this.setState({
          selectedApprover: null,
          articleData: {
            ...articleData,
            ...result.data.data
          },
          workInProgress: {
            ...this.state.workInProgress,
            approverRequestInprogress: false
          },
          baseArticle: {
            ...baseArticle,
            manageMentTab: {
              ...baseArticle.manageMentTab,
              approvalRequest: manageMentTab.approvalRequest
            }
          }
        });
      })
      .catch((error) => {
        Logger(error);
        let apiError = getErrorMessage(error);
        Toast.error(apiError.message);
        this.setState({
          workInProgress: {
            ...this.state.workInProgress,
            approverRequestInprogress: false
          }
        });
      });

    this.setState({
      workInProgress: {
        ...this.state.workInProgress,
        approverRequestInprogress: true
      }
    });
  };

  fetchAllComment = () => {
    AxiosService.get(ApiService.GET_ALL_COMMENT(this.id), false)
      .then((result) => {
        if (result.data.data) {
          this.setState({
            commentHistory: result.data.data.list
          });
        }
      })
      .catch((error) => {
        Logger(error);
        // Toast.error(error.response && error.response.data.message);
      });
  };

  isArticleEditable = () => {
    let {
      article: {manageMentTab}
    } = this.state;
    // status is approved and article is not editable
    if (manageMentTab.approvalConfirmation == 2 || manageMentTab.prohibition) {
      return true;
    }
    return false;
  };

  editOnlyPermission = (name) => {
    let {
      article: {manageMentTab}
    } = this.state;

    if (!(manageMentTab.approvalConfirmation == 2) && name) {
      return checkEditModePermission(editMod.type.approval, this.props.permissions);
    }

    return true;
  };

  approvedOnlyPermission = (name, status) => {
    let {
      article: {manageMentTab}
    } = this.state;
    // approve mode only few actions are allowed by specific users
    if (manageMentTab.approvalConfirmation == 2 || status == 2) {
      return checkApproveModePermission(approveMod.type[name], this.props.permissions);
    }

    return true;
  };

  prohibitOnlyPermission = (name, status) => {
    let {
      article: {manageMentTab}
    } = this.state;
    // prohibit mode only few actions are allowed by specific users
    if (manageMentTab.prohibition || status) {
      return checkProhibitModePermission(prohibitMod.type[name], this.props.permissions);
    }

    return false;
  };

  componentDidMount() {
    if (!checkPageAccess(this.props.permissions)) {
      this.props.history.push('/content');
      return;
    }

    

    let commentInterval = setInterval(this.fetchAllComment, commentFetchInterval);

    this.setState({
      commentInterval
    });

    window.onbeforeunload = (e) => {
      // this message will not show up becuase browser policy
      // instead a default message will be shown
      let confirmationMessage =
        'It looks like you have been editing something.If you leave before saving, your changes will be lost.';

      if (this.isArticleChagned() || this.isManageMentChanges()) {
        (e || window.event).returnValue = confirmationMessage;
      }
    };

    let {article} = this.state;

    let art = {...this.state.article};
    let {id} = queryString.parse(window.location.search);
    this.id = id;
    this.setState({
      isLoader: true,
      currentArticleId: this.id,
      article: {
        ...art
      },
      baseArticle: {
        ...art
      }
    });

    AxiosService.get(ApiService.GET_CATEGORY_LIST, false)
      .then((result) => {
        let selectedCategory = [];
        let prepareCategory = [];

        if (result.data.data) {
          result.data.data.list.forEach((cat) => {
            prepareCategory.push({value: cat.id, label: cat.name, slug: cat.slug});
          });
        }

        // first item is default selected
        let [firstChoice] = prepareCategory;
        // selectedCategory.push(firstChoice);

        this.setState({
          // selectedCategory,
          categoryList: prepareCategory
        });
      })
      .catch((error) => {
        Logger(error);
        let apiError = getErrorMessage(error);
        Toast.error(apiError.message);
      });

    AxiosService.get(ApiService.GET_ARTICLE(id), false)
      .then((result) => {
        if (result.data.data) {
          let {article, fields, maxLen, initialMaxLen} = this.state;
          let data = result.data.data;
          let cat = {
            value: data.article_category.id,
            label: data.article_category.name
            
          }
          
          let findSelectedCat = this.state.categoryList.find(c => c.value == cat.value) || {}
          let p = {
            id: findSelectedCat.value,
            name: findSelectedCat.label,
            slug: findSelectedCat.slug
          }

          let selectedCat 

          if (p.id) {
            selectedCat = p 
          } else {
            selectedCat = data.article_category;
          }
        
          cat.slug = selectedCat.slug


          let editorState =
            data.article_body &&
            JSON.parse(data.article_body) &&
            EditorState.createWithContent(
              convertFromRaw(JSON.parse(data.article_body)) || {}
            );
          this.pendingReview = data.requested_review_user_id;
          let art = {
            title: data.title,
            url: data.url,
            description: data.article_description || '',
            managementTags: data.article_management_tags.map((t) => t.tag),
            startDate: data.publishing_start? data.publishing_start: '',
            endDate: data.publishing_end ? data.publishing_end: '',
            editTab: {
              category: [cat],
              articleLayout: data.article_layout,
              publishingType: data.publishing_setting,
              seoTags: data.article_seo_tags.map((t) => t.tag)
            },
            manageMentTab: {
              ...article.manageMentTab,
              reviewRequest: '',
              approvalRequest: '',
              reviewConfirmation: data.review_status,
              approvalConfirmation: data.approval_status,
              approvalCancelation: data.is_stopped_to_publish,
              prohibition: data.is_prohibited_to_publish
            }
          };

          let access =
            this.props.permissions || JSON.parse(localStorage.getItem('permissions'));
          // fields disabled

          if (data.approval_status == 2) {
            this.setState({
              fields: {
                review: true,
                approve: true,
                prohibit: true,
                delete: true,
                copy: !this.approvedOnlyPermission(approveMod.type.copy, 2),
                save: !this.approvedOnlyPermission(approveMod.type.save, 2),
                stopPublish: access.includes('Article Approve') ? false : true
              }
            });
          }

          let isApprover = access.includes('Article Approve');
          let isPublisher = access.includes('Article Publish');

          if (data.is_prohibited_to_publish) {
            this.setState({
              fields: {
                review: true,
                approve: true,
                prohibit: false,
                delete: true,
                copy: true,
                startDate: true,
                endDate: true,
                preview: isApprover || isPublisher ? false : true,
                save: !this.prohibitOnlyPermission(prohibitMod.type.save, true),
                stopPublish: true
              }
            });
          }

          if (data.is_stopped_to_publish) {
            this.setState({
              fields: {
                ...this.state.fields,
                review: true,
                approve: true,
                stopPublish: false
              }
            });
          }

          let totalLen = art.editTab.seoTags && art.editTab.seoTags.join('').length;

          this.setState({
            isLoader: false,
            editorState,
            prevEditorState: editorState,
            articleData: data || {},
            cache: {
              title: data.title,
              url: data.url
            },
            initialTitle: data.title,
            initialUrl: data.url,
            initialStartDate: data.publishing_start,
            initialEndDate: data.publishing_end,
            article: art,
            maxLen: {
              ...maxLen,
              seoTags:
                initialMaxLen.seoTags - totalLen >= this.tagsMaxValue
                  ? this.tagsMaxValue
                  : initialMaxLen.seoTags - totalLen
            },
            baseArticle: {
              ...art,
              editTab: {
                ...art.editTab
              },
              manageMentTab: {
                ...article.manageMentTab,
                reviewConfirmation: data.review_status,
                approvalConfirmation: data.approval_status,
                approvalCancelation: data.is_stopped_to_publish,
                prohibition: data.is_prohibited_to_publish
              }
            },
            selectedCategory: [{value: selectedCat.id, label: selectedCat.name, slug: selectedCat.slug}]
          });
        }
      })
      .catch((error) => {
        Logger(error);
        this.setState({
          isLoader: false,
        })
        let apiError = getErrorMessage(error);
        Toast.error(apiError.message);
      });

    // GET OWN MEDIA

    AxiosService.get(ApiService.OWN_MEDIA(this.id), false)
      .then((result) => {
        if (result.data.data) {
          this.setState({
            ownMedia: result.data.data
          });
        }
      })
      .catch((error) => {
        Logger(error);
        let apiError = getErrorMessage(error);
        Toast.error(apiError.message);
      });

    //get article comments

    this.fetchAllComment();
    // fetch mention user list

    AxiosService.get(ApiService.GET_USER_LIST, false)
      .then((result) => {
        if (result.data.data) {
          let users = [];
          let userList = [];
          result.data.data.list.forEach((user) => {
            userList.push(user.username);
            users.push({
              id: user.id,
              value: user.username,
              label: user.username
            });
          });
          this.setState({
            users,
            userList
          });
        }
      })
      .catch((error) => {
        Logger(error);
        let apiError = getErrorMessage(error);
        Toast.error(apiError.message);
      });
      
  }

  fetchReviewerList = (event) => {
    this.setState({
      reviewerList: []
    });
    AxiosService.get(ApiService.GET_REVIEWER_LIST(3), false)
      .then((result) => {
        let reviewerList = [];
        if (result.data.data) {
          result.data.data.list.forEach((d) => {
            reviewerList.push({
              label: d.username,
              value: d.username,
              id: d.id
            });
          });
        }
        this.setState({
          reviewerList
        });
      })
      .catch((error) => {
        Logger(error);
      });
  };

  fetchApproverList = () => {
    this.setState({
      approverList: []
    });
    AxiosService.get(ApiService.GET_REVIEWER_LIST(4), false)
      .then((result) => {
        let approverList = [];
        if (result.data.data) {
          result.data.data.list.forEach((d) => {
            approverList.push({
              label: d.username,
              value: d.username,
              id: d.id
            });
          });
        }
        this.setState({
          approverList
        });
      })
      .catch((error) => {
        Logger(error);
      });
  };

  componentWillUnmount() {
    window.onbeforeunload = null;
    clearInterval(this.state.commentInterval);
  }

  // SAVE COMMENT
  getTextContent = (commentText, trigger) => {
    let {users, mentionedInComment} = this.state;
    let ctext = commentText && commentText.trim();
    if (!ctext) {
      return;
    }

    let patt = /(@[\w+-.]+ | ＠[\w+-.]+)/g;
    let usersInComment = commentText.match(patt);
    // remove # tag
    usersInComment =
      (usersInComment && usersInComment.map((user) =>(user.replace(trigger, '')).trim())) || [];
    // get mentioned user id
    let usersId = users
      .filter((user) => usersInComment.includes(user.value))
      .map((u) => u.id);

    let body = {
      comment: commentText,
      mentionedUsers: usersId.join(','),
      articleId: this.id
    };

    AxiosService.post(ApiService.SAVE_COMMENT, body, false)
      .then((result) => {})
      .catch((error) => {
        Logger(error);
      });

    let d = getTargetedCityTime();
    let formatedDate = `${d.getFullYear()}-${zeroPadding(
      d.getMonth() + 1
    )}-${zeroPadding(d.getDate())} ${zeroPadding(d.getHours())}:${zeroPadding(
      d.getMinutes()
    )}`;

    this.setState({
      commentHistory: [
        {
          comment: commentText,
          created_at: formatedDate,
          comment_type: 1,
          from_user: {
            username: localStorage.getItem('currentUserName')
          }
        },
        ...this.state.commentHistory
      ]
    });
  };

  commentTemplate(data = {}) {
    let status = {
      '1': 'NG',
      '2': 'OK'
    };

    let commentByText = 'がコメントしました。';
    // normal comemnt type= 1
    if (data.comment_type == 1) {
      return (
        <>
          <div className="description">
            {this.hightlight(data.comment)}
            <br />
            <div>{this.formatDateSafari(data.created_at, '/')}</div>
            <div>
              <span>{data.from_user && data.from_user.username}さん</span>{' '}
              {commentByText}
            </div>
          </div>
        </>
      );
    }
    // review ok or approve ok
    let reviewText = 'がレビュー';

    if (data.comment_type == 2) {
      let st = data.review_status;
      let text = '';
      if (data.is_approve && data.is_review) {
        text = (
          <div>
            <span>{data.from_user && data.from_user.username}さん</span> がレビュー
            <span>{status[st]}</span>, 承認 <span>{status[st]}</span> しました。
          </div>
        );
      } else if (data.is_review) {
        text = (
          <div>
            <span>{data.from_user && data.from_user.username}さん</span> がレビュー
            <span>{status[st]}</span>しました。
          </div>
        );
      } else {
        text = (
          <div>
            <span>{data.from_user && data.from_user.username}さん</span> 承認{' '}
            <span>{status[data.approval_status]}</span> しました。
          </div>
        );
      }
      return (
        <>
          <div className="description">
            <div>{this.formatDateSafari(data.created_at, '/')}</div>
            {text}
          </div>
        </>
      );
    }

    // review request, approve request
    let reviewRequestText = 'へ レビュー依頼しました。';
    let approveRequestText = 'へ 承認依頼しました。';
    if (data.comment_type == 3) {
      let text = '';
      let [user = {}] = data.comment_mentions;
      if (data.is_approve) {
        text = (
          <div>
            <span>
              {data.from_user && data.from_user.username}さんが{' '}
              {user.user && user.user.username}さん
            </span>{' '}
            {approveRequestText}
          </div>
        );
      }
      if (data.is_review) {
        text = (
          <div>
            <span>
              {data.from_user && data.from_user.username}さんが{' '}
              {user.user && user.user.username}さん
            </span>{' '}
            {reviewRequestText}
          </div>
        );
      }
      return (
        <>
          <div className="description">
            <div>{this.formatDateSafari(data.created_at, '/')}</div>
            {text}
          </div>
        </>
      );
    }
  }

  getMentionedUser = (user) => {
    let {mentionedInComment} = this.state;
    this.setState({
      mentionedInComment: [...mentionedInComment, user]
    });
  };

  hightlight(text) {
    let {userList = [], mentionedInComment} = this.state;
    let textarr = (text && text.split(' ')) || [];
    let st = '';
    textarr.forEach((text) => {
      if ((text.includes('@') && userList.includes(text.replace('@', ''))) || text.includes('＠') && userList.includes(text.replace('＠', ''))) {
        st = `${st} <span>${text}</span>`;
        return;
      }
      st = `${st} ${text}`;
    });

    return ReactHtmlParser(st);
  }

  onApproverChange = (selection) => {
    let {article} = this.state;
    let {id} = selection;

    let tab = article.manageMentTab;
    tab.approvalRequest = id;
    article.manageMentTab = {
      ...tab,
      approvalRequest: id
    };

    this.setState({
      selectedApprover: [selection],
      article: {
        ...this.state.article,
        manageMentTab: {
          ...tab
        }
      }
    });
  };

  onReviewerChange = (selection) => {
    let {article} = this.state;
    let {id} = selection;

    let tab = article.manageMentTab;
    tab.reviewRequest = id;
    article.manageMentTab = {
      ...tab,
      reviewRequest: id
    };

    this.setState({
      selectedReviewer: [selection],

      article: {
        ...this.state.article,
        manageMentTab: {
          ...tab
        }
      }
    });
  };

  sendReviewerRequest = () => {
    let {
      article: {manageMentTab},
      workInProgress: {reviewRequestInprogress},
      selectedReviewer
    } = this.state;

    if (!selectedReviewer) {
      return
    }

    if (!manageMentTab.reviewRequest) {
      return;
    }
    if (reviewRequestInprogress) {
      return;
    }

    if (this.isArticleChagned()) {
      this.setState({
        showWarningMessage: contentModtranslator(
          'ARTICLE_EDIT.SAVE_THE_ARTICLE_FIRST'
        ),
        warningModal: true
      });
      return;
    }

    this.setState({
      requestReviewModal: true
    });
  };

  sendApproverRequest = () => {
    let {
      article: {manageMentTab},
      workInProgress: {approverRequestInprogress},
      selectedApprover
    } = this.state;

    if (!selectedApprover) {
      return
    }

    if (!manageMentTab.approvalRequest) {
      return;
    }
    if (approverRequestInprogress) {
      return;
    }

    if (this.isArticleChagned()) {
      this.setState({
        showWarningMessage: contentModtranslator(
          'ARTICLE_EDIT.SAVE_THE_ARTICLE_FIRST'
        ),
        warningModal: true
      });
      return;
    }

    this.setState({
      requestApproveModal: true
    });
  };

  getEditorContent = (content, editorState) => {
    this.setState({
      editorState,
      editorContent: content
    });
   
    
  };
  closeSNSModal() {
    this.setState({snsPostingModal: false});
  }
  openSNSModal() {
    this.setState({snsPostingModal: true});
  }
  openFacebookModal () {
    this.setState({
      faceBookModal: true
    });
  }
  openTwitterModal () {
    this.setState({
      twitterModal: true
    });
  }
  openLineModal () {
    this.setState({
      lineModal: true
    });
  }
  openMailModal() {
    this.setState({
      mailDeliveryModal: true
    });
  }

  isReviewEnabled = () => {
    let {
      article: {manageMentTab}
    } = this.state;

    return !checkEditModePermission(editMod.type.review, this.props.permissions);
  };

  isApproveEnabled = () => {
    return !checkEditModePermission(editMod.type.approval, this.props.permissions);
  };

  isStopPublishEnabled = () => {
    return true;
  };

  isProhibitEnabled = () => {
    return !checkEditModePermission(editMod.type.prohibit, this.props.permissions);
  };

  isCopyEnabled = () => {
    let {articleId} = this.state;
    return articleId ? true : false;
  };

  isDeleteEnabled = () => {
    let {articleId} = this.state;
    return articleId ? true : false;
  };

  // mail posting section

  closeMailModal(type) {
    this.setState({
      mailDeliveryModal: false,
      isMailModalOpened: true
    });
  }

  getMailPostingData = (mailData) => {
    this.setState({
      mailPosting: {
        ...this.state.mailPosting,
        ...mailData
      }
    })
  }

  saveMailData = (resSchedule) => {
    let {mailPosting, article} = this.state
  
  
      let {text, html} = editorContentAsText(mailPosting.editorState)
      let [group] = mailPosting.selectedMailGroup || []
      let date =  mailPosting.dateType == 1 ? this.formatDateSafari(article.startDate) : this.formatDateSafari(mailPosting.date)
      let prepareMailData = {
        articleSubject: mailPosting.subject,
        articleContent: (mailPosting.editorContent && JSON.stringify(convertToRaw(mailPosting.editorContent))) || null,
        groupId: group && group.value,
      //   groupId: 1,
        scheduledDate: date ,
        scheduledTime: date && date.split(' ')[1],
        isScheduleOn: Number(mailPosting.config),
        scheduleType: mailPosting.dateType,
        articleContentHtml: text && html,
        articleId: Number(this.id)
      }

    
    if (!prepareMailData.groupId) {
      return
    }

    if (mailPosting.id && !resSchedule) {
      AxiosService.put(
        ApiService.MAIL_POSTING_UPDATE(mailPosting.id),
        prepareMailData,
        false
      )
        .then((result) => {
          console.log('mail updated')
          Toast.success(result.data.message);
          this.setState({
            mailDeliveryModal: false,
            isMailModalOpened: false,
            workInProgress: {
              ...this.state.workInProgress,
              mailPost: false
            },
            mailPosting: {
              ...mailPosting,
              warningModal: false
            }
          });
        })
        .catch((error) => {
          Logger(error);
          let apiError = getErrorMessage(error);
          Toast.error(apiError.message);
          this.setState({
            workInProgress: {
              ...this.state.workInProgress,
              mailPost: false
            }
          });
        });
    } else {
      AxiosService.post(ApiService.MAIL_POSTING_SAVE, prepareMailData, false)
        .then((result) => {
          console.log('created mail')
          Toast.success(result.data.message);
          this.setState({
            isLoader: false,
            mailDeliveryModal: false,
            isMailModalOpened: false,
            workInProgress: {
              ...this.state.workInProgress,
              mailPost: false
            },
            mailPosting: {
              ...mailPosting,
              id: result.data.data.id,
              warningModal: false,
              scheduleModal: false
            }
          });
        })
        .catch((error) => {
          Logger(error);
          let apiError = getErrorMessage(error);
          Toast.error(apiError.message);
          this.setState({
            workInProgress: {
              ...this.state.workInProgress,
              mailPost: false
            }
          });
        });
    }
   

  }

  saveFacebookData = (resSchedule) => {
    let {facebookData, article} = this.state

  
    let {text, html} = editorContentAsText(facebookData.editorState)
    let date =  facebookData.dateType == 1 ? this.formatDateSafari(article.startDate) : this.formatDateSafari(facebookData.date)
    let prepareFacebookData = {
      body: (facebookData.editorContent && JSON.stringify(convertToRaw(facebookData.editorContent))) || null,
      platformId: Number(facebookData.platformId),
      scheduleDate: date ,
      link: "",
      scheduleTime: date && date.split(' ')[1],
      isScheduleOn: Number(facebookData.config),
      scheduleType: facebookData.dateType,
      bodyHtml: text && html,
      articleId: Number(this.id)
    }

    
    if (!facebookData.platformId || !prepareFacebookData.body) {
      return
    }
    
    

    if (facebookData.id && !resSchedule) {
      AxiosService.put(
        ApiService.SNS_POST_UPDATE(facebookData.id),
        prepareFacebookData,
        false
      )
        .then((result) => {
          Toast.success(result.data.message);
          this.setState({
            mailDeliveryModal: false,
            isMailModalOpened: false,
           
            facebookData: {
              ...facebookData,
              warningModal: false
            }
          });
        })
        .catch((error) => {
          Logger(error);
          let apiError = getErrorMessage(error);
          Toast.error(apiError.message);
          
        });
    } else {
      AxiosService.post(ApiService.SNS_POST_SAVE, prepareFacebookData, false)
        .then((result) => {
          Toast.success(result.data.message);
          this.setState({
            isLoader: false,
            mailDeliveryModal: false,
            isMailModalOpened: false,
            facebookData: {
              ...facebookData,
              id: result.data.data.id,
              warningModal: false,
              scheduleModal: false
            }
          });
        })
        .catch((error) => {
          Logger(error);
          let apiError = getErrorMessage(error);
          Toast.error(apiError.message);
         
        });
    }
   

  }

  saveTwitterData = (resSchedule) => {
    let {twitterData, article} = this.state
  
    let {text, html} = editorContentAsText(twitterData.editorState)
    let date =  twitterData.dateType == 1 ? this.formatDateSafari(article.startDate) : this.formatDateSafari(twitterData.date)
    let prepareTwitterData = {
      body: (twitterData.editorContent && JSON.stringify(convertToRaw(twitterData.editorContent))) || null,
      platformId: Number(twitterData.platformId),
      scheduleDate: date ,
      link: "wwww.link.com",
      scheduleTime: date && date.split(' ')[1],
      isScheduleOn: Number(twitterData.config),
      scheduleType: twitterData.dateType,
      bodyHtml: text && html,
      articleId: Number(this.id)
    }

    if (!twitterData.platformId || !prepareTwitterData.body) {
      return
    }
    

    if (twitterData.id && !resSchedule) {
      AxiosService.put(
        ApiService.SNS_POST_UPDATE(twitterData.id),
        prepareTwitterData,
        false
      )
        .then((result) => {
          Toast.success(result.data.message);
          this.setState({
            mailDeliveryModal: false,
            isMailModalOpened: false,
           
            twitterData: {
              ...twitterData,
              warningModal: false
            }
          });
        })
        .catch((error) => {
          Logger(error);
          let apiError = getErrorMessage(error);
          Toast.error(apiError.message);
          
        });
    } else {
      AxiosService.post(ApiService.SNS_POST_SAVE, prepareTwitterData, false)
        .then((result) => {
          Toast.success(result.data.message);
          this.setState({
            isLoader: false,
            mailDeliveryModal: false,
            isMailModalOpened: false,
            twitterData: {
              ...twitterData,
              id: result.data.data.id,
              warningModal: false,
              scheduleModal: false
            }
          });
        })
        .catch((error) => {
          Logger(error);
          let apiError = getErrorMessage(error);
          Toast.error(apiError.message);
        });
    }
   

  }


  saveLineData = (resSchedule) => {
    let {lineData, article} = this.state
  
    let {text, html} = editorContentAsText(lineData.editorState)
    let date =  lineData.dateType == 1 ? this.formatDateSafari(article.startDate) : this.formatDateSafari(lineData.date)
    let prepareLineData = {
      body: (lineData.editorContent && JSON.stringify(convertToRaw(lineData.editorContent))) || null,
      platformId: Number(lineData.platformId),
      scheduleDate: date ,
      link: "wwww.link.com",
      scheduleTime: date && date.split(' ')[1],
      isScheduleOn: Number(lineData.config),
      scheduleType: lineData.dateType,
      bodyHtml: text && html,
      articleId: Number(this.id)
    }

    if (!lineData.platformId || !prepareLineData.body) {
      return
    }
    

    if (lineData.id && !resSchedule) {
      AxiosService.put(
        ApiService.SNS_POST_UPDATE(lineData.id),
        prepareLineData,
        false
      )
        .then((result) => {
          Toast.success(result.data.message);
          this.setState({
            mailDeliveryModal: false,
            isMailModalOpened: false,
           
            lineData: {
              ...lineData,
              warningModal: false
            }
          });
        })
        .catch((error) => {
          Logger(error);
          let apiError = getErrorMessage(error);
          Toast.error(apiError.message);
          
        });
    } else {
      AxiosService.post(ApiService.SNS_POST_SAVE, prepareLineData, false)
        .then((result) => {
          Toast.success(result.data.message);
          this.setState({
            isLoader: false,
            mailDeliveryModal: false,
            isMailModalOpened: false,
            lineData: {
              ...lineData,
              id: result.data.data.id,
              warningModal: false,
              scheduleModal: false
            }
          });
        })
        .catch((error) => {
          Logger(error);
          let apiError = getErrorMessage(error);
          Toast.error(apiError.message);
         
        });
    }
   

  }


  // SNS POSTING


  closeFacebookModal(type) {
    this.setState({
      faceBookModal: false,
      isFacebookModalOpened: true
    });
  }
  closeTwitterModal(type) {
    this.setState({
      twitterModal: false,
      isTwitterModalOpened: true
    });
  }
  closeLineModal(type) {
    this.setState({
      lineModal: false,
      isLineModalOpened: true
    });
  }

  getFacebookData = (data) => {
    this.setState({
      facebookData: {
        ...data
      }
    })
  }

  getTwitterData = (data) => {
    this.setState({
      twitterData: {
        ...data
      }
    })
  }
  getLineData = (data) => {
    this.setState({
      lineData: {
        ...data
      }
    })
  }

  detectStartEndDateChange = (date, type) => {

    let {article: {startDate, endDate}, initialStartDate, initialEndDate} = this.state
    let isChanged = false
    // detect start date and end date change
    if(date !== initialStartDate && type == 'startDate') {
      isChanged = true
    }

    if (date !== initialEndDate && type == 'endDate') {
      isChanged = true
    }

    return isChanged

  }

  checkIfStartOrEndDateHasChagned = () => {
    
      let {article: {startDate, endDate}, initialStartDate, initialEndDate} = this.state
      let isChanged = false

      // detect start date and end date change
      if(startDate !== initialStartDate) {
        isChanged = true
      }
  
      if (endDate !== initialEndDate) {
        isChanged = true
      }
  
      return isChanged
  }

  findCategory = (selectedCategory = [], categoryList) => {
    let {readyUrl} = this.state
    if (selectedCategory && selectedCategory.length) {

      let [selected] = selectedCategory
      let cat = categoryList.find(cat => cat.value == selected.value)
      return [cat]
    }
  }

  dateParseSafari = (date) => {
    date = date && date.toString()
    if (Date.parse(date && date.replace(/-/g, '/'))) {
      return new Date(date && date.replace(/-/g, '/'))
    }
    return '';
  }

  genSnsUniqueKey = (url, category, ownMedia, startDate, type) => {
    if (category && category.length) {
      let [selected] = category
      return `${selected.slug}${url}${type}${ownMedia.display_name}${startDate}`
    }
  }

  render() {
    let {
      publicationIcon,
      readyUrl,
      approvalIcon,
      activeTab,
      article,
      article: {editTab, manageMentTab},
      articleError,
      selectedCategory,
      articleWarning,
      categoryList,
      maxLen,
      inputValue,
      ownMedia,
      dateModal,
      copyModal,
      deleteModal,
      warningModal,
      approveModal,
      publishModal,
      requestApproveModal,
      requestReviewModal,
      showWarningMessage,
      reviewerList,
      approverList,
      selectedReviewer,
      selectedApprover,
      fields,
      users,
      editorState,
      editorContent,
      warningTitle,
      hideModalSaveButton,
      isLoader,
      articleData,
      snsPostingModal,
      mailDeliveryModal,
      mailPosting,
      approvalCancelationModal,
      isMailModalOpened,
      faceBookModal,
      isFacebookModalOpened,
      facebookData,
      twitterModal,
      isTwitterModalOpened,
      twitterData,
      lineModal,
      isLineModalOpened,
      lineData,
      selectedMailGroup,
      mailGroupList,
      articlePreviewContent
    } = this.state;

    this.hightlight();

    return (
      <DefaultLayout detectArticleChange={() => this.isArticleChagned()}>
        {isLoader ? (
          <Loader />
        ) : (
          <>
            {/* <Prompt
            when={this.isArticleChagned()}
            message='Leave without saving?'
          />  */}

            {/* SHOW COMMON WARNING MODAL */}
            <ConfirmationModal
              isActive={warningModal}
              title={warningTitle}
              hideSave={hideModalSaveButton}
              body={showWarningMessage}
              cancelClick={this.toggleWarningModal}
              okClick={this.toggleWarningModal}
            />

            {/* DATE CONFIRMATION MODAL */}
            <ConfirmationModal
              isActive={dateModal}
              // title={contentModtranslator('ARTICLE_EDIT.MAIL_WITHOUT_SUBJECT')}
              body={
                <>
                  <div>
                    {articleWarning.startDate ? articleWarning.startDate : ''}
                  </div>
                  <div>{articleWarning.endDate ? articleWarning.endDate : ''}</div>
                </>
              }
              cancelClick={this.toggleModal}
              okClick={() => this.toggleModal('save')}
            />

            {/* DELETE CONFIRMATION MODAL */}

            <ConfirmationModal
              isActive={deleteModal}
              title={contentModtranslator('ARTICLE_EDIT.DELETE_CONFIRMATION_TITLE')}
              body={contentModtranslator('ARTICLE_EDIT.DELETE_CONFIRMATION')}
              cancelClick={this.toggleDeleteModal}
              okClick={() => this.toggleDeleteModal('save')}
            />

            {/* APPROVE CONFIRMATION MODAL */}

            <ConfirmationModal
              isActive={approveModal}
              title={contentModtranslator('ARTICLE_EDIT.APPROVE_TITLE')}
              body={contentModtranslator('ARTICLE_EDIT.APPROVE_CONFIRMATION')}
              cancelClick={this.toggleApproveModal}
              okClick={() => this.toggleApproveModal('save')}
            />
            {/* publish CONFIRMATION MODAL */}

            <ConfirmationModal
              isActive={publishModal}
              title={contentModtranslator(
                'ARTICLE_EDIT.STOP_TO_PUBLISH_CONFIRMATION_TITLE'
              )}
              body={contentModtranslator(
                'ARTICLE_EDIT.STOP_TO_PUBLISH_CONFIRMATION'
              )}
              cancelClick={this.togglePublishModal}
              okClick={() => this.togglePublishModal('save')}
            />

            {/* REQUEST REVIEW MODAL */}

            <ConfirmationModal
              isActive={requestReviewModal}
              title={contentModtranslator('ARTICLE_EDIT.REQUEST_REVIEW_APPROVE_MODAL_TITLE')}
              body={contentModtranslator('ARTICLE_EDIT.SEND_REVIEW_CONFIRMATION')}
              cancelClick={this.toggleRequestReviewModal}
              okClick={() => this.toggleRequestReviewModal('save')}
            />

            {/* REQUEST APPROVE MODAL */}

            <ConfirmationModal
              isActive={requestApproveModal}
              title={contentModtranslator('ARTICLE_EDIT.REQUEST_REVIEW_APPROVE_MODAL_TITLE')}
              body={contentModtranslator('ARTICLE_EDIT.SEND_APPROVE_CONFIRMATION')}
              cancelClick={this.toggleRequestApproveModal}
              okClick={() => this.toggleRequestApproveModal('save')}
            />

            {/* SHOW MAIL RE-SCHEDULE MODAL */}
            <ConfirmationModal
              isActive={mailPosting.scheduleModal}
              title={contentModtranslator('ARTICLE_EDIT.ARTICLE_RE_SCHEDULE_TITLE')}
              body={contentModtranslator('ARTICLE_EDIT.ARTICLE_RE_SCHEDULE_BODY')}
              cancelClick={this.toggleMailScheduleModal}
              okClick={() => this.toggleMailScheduleModal('save')}
              isMultipleLine={true}
              firstLine={contentModtranslator('ARTICLE_EDIT.ARTICLE_RE_SCHEDULE_FIRST_LINE')}
              secondLine={contentModtranslator('ARTICLE_EDIT.ARTICLE_RE_SCHEDULE_SECOND_LINE')}
            />

              {/* SHOW MAIL POSTING APPROVAL CANCELATION MODAL */}
              <ConfirmationModal 
              isActive={approvalCancelationModal}
              title={contentModtranslator('ARTICLE_EDIT.MAIL_POSTING_APPROVAL_MODAL_TITLE')}
              body={contentModtranslator('ARTICLE_EDIT.MAIL_POSTING_APPROVAL_MODAL_BODY')}
              cancelClick={this.toggleMailApprovalModal}
              okClick={() => this.toggleMailApprovalModal('save')}
            />

            <div className="article-edit-page padding">
              <Toast />
              <NcBreadcrumbs breadcrumbs={this.breadcrumbs} />
              <div className="aritlce-edit-title">
                {`${contentModtranslator('ARTICLE_EDIT.PAGE_TITLE')} : ${
                  ownMedia.display_name
                }`}
              </div>
              <div className="custom-row">
                <div className="left-side">
                  <div className="artile-input-area">
                    <div className="left-input">
                      <div
                        className={
                          articleError.title ? 'custom-input error' : 'custom-input'
                        }
                      >
                        <div className="label">
                          {' '}
                          {contentModtranslator('ARTICLE_EDIT.ARTICLE_TITLE')}
                          <span className="text-danger">*</span>
                        </div>
                        <div className="input">
                          <input
                            type="text"
                            disabled={this.isArticleEditable()}
                            name=""
                            maxLength="1024"
                            onChange={this.onTitleChange}
                            onBlur={this.onTitleBlur}
                            value={article.title}
                            placeholder={contentModtranslator(
                              'ARTICLE_EDIT.TITLE_PLACEHOLDER'
                            )}
                            className="form-control"
                          />
                          {articleError.title && (
                            <RequiredMessage
                              trimed={false}
                              text={articleError.title}
                            />
                          )}
                        </div>
                      </div>
                      <div
                        className={
                          articleError.url ? 'custom-input error' : 'custom-input'
                        }
                      >
                        <div className="label">
                          {' '}
                          {contentModtranslator('ARTICLE_EDIT.ARTICLE_URL')}
                          <span className="text-danger">*</span>
                        </div>
                        <div className="input">
                          <input
                            type="text"
                            disabled={this.isArticleEditable()}
                            value={article.url}
                            maxLength={maxLen.url}
                            onChange={this.onUrlChange}
                            onBlur={this.onUrlBlur}
                            name=""
                            placeholder={contentModtranslator(
                              'ARTICLE_EDIT.TAGE_PLACEHOLDER'
                            )}
                            className="form-control"
                          />
                          {articleError.url && (
                            <RequiredMessage trimed={false} text={articleError.url} />
                          )}
                        </div>
                      </div>
                      <div className="custom-input">
                        <div className="label">
                          {' '}
                          {contentModtranslator('ARTICLE_EDIT.MANAGEMENT_TAG_NAME')}
                        </div>
                        <div className="input">
                          <TagsInput
                            value={article.managementTags}
                            type="text"
                            onChange={this.onManageMentTagChange}
                            renderTag={this.defaultRenderTag}
                            onChangeInput={this.tagsInputChange}
                            inputValue={inputValue.managementTags}
                            name=""
                            disabled={this.isArticleEditable()}
                            onlyUnique={true}
                            onValidationReject={(tags) => {
                              let [value] = tags;
                              this.onManageMentTagBlur(value.trim());
                            }}
                            placeholder="Add a tag new"
                            tagProps={{
                              className: 'react-tagsinput-tag custom-tag',
                              classNameRemove: 'react-tagsinput-remove'
                            }}
                            inputProps={{
                              className: 'react-tagsinput-input custom-input',
                              placeholder:
                                article.managementTags.length == 0
                                  ? contentModtranslator(
                                      'ARTICLE_EDIT.TAG_NAME_PLACEHOLDER'
                                    )
                                  : '',
                              maxLength: maxLen.managementTags,
                              onBlur: (e) => {
                                this.onManageMentTagBlur(e.target.value);
                              }
                            }}
                            //  className="form-control manageTags"
                            className={
                              articleError.managementTags
                                ? 'form-control manageTags tags-error'
                                : `form-control manageTags ${
                                    this.isArticleEditable() ? ' disabled' : ''
                                  }`
                            }
                          />

                          {articleError.managementTags && (
                            <RequiredMessage text={articleError.managementTags} />
                          )}
                        </div>
                      </div>
                      <div className="custom-input">
                        <div className="label"> </div>
                        <div className="date-range">
                          <div className="left-date">
                            <DateInput
                              handleDate={this.handleDateChange}
                              minDate={article.startDate
                                ? this.dateParseSafari(article.startDate)
                                : new Date()}
                              disabled={
                                (this.isArticleEditable() &&
                                  !this.approvedOnlyPermission(
                                    approveMod.type.date
                                  )) ||
                                fields.startDate
                              }
                              maxDate={
                                article.endDate ? this.dateParseSafari(article.endDate) : null
                              }
                              type="startDate"
                              showTimeSelect
                              value={article.startDate? article.startDate: ''}
                              selected={article.startDate? this.dateParseSafari(article.startDate) : ''}
                              timeFormat="HH:mm"
                              timeIntervals={15}
                              timeCaption="time"
                              dateFormat="yyyy.MM.dd HH:mm"
                              defaultOption={contentModtranslator(
                                'ARTICLE_EDIT.RELEASE_DATE_PLACEHOILDER'
                              )}
                              className="form-control"
                            />
                          </div>
                          <div className="from-to">~</div>
                          <div className="right-date">
                            <DateInput
                                minDate={
                                  article.startDate ? this.dateParseSafari(article.startDate) : new Date()
                                }
                              type="endDate"
                              disabled={
                                (this.isArticleEditable() &&
                                  !this.approvedOnlyPermission(
                                    approveMod.type.date
                                  )) ||
                                fields.endDate
                              }
                              showTimeSelect
                              handleDate={this.handleDateChange}
                              value={article.endDate}
                              selected={article.endDate ? this.dateParseSafari(article.endDate) : this.dateParseSafari(article.startDate)}
                              timeFormat="HH:mm"
                              timeIntervals={15}
                              timeCaption="time"
                              dateFormat="yyyy.MM.dd HH:mm"
                              defaultOption={contentModtranslator(
                                'ARTICLE_EDIT.END_DATE_PLACEHOILDER'
                              )}
                              className="form-control"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="right-input">
                      <div
                        className={
                          articleError.description
                            ? 'custom-input-textarea error '
                            : 'custom-input-textarea'
                        }
                      >
                        <div className="label">
                          {' '}
                          {contentModtranslator('ARTICLE_EDIT.DETAILS')}
                        </div>
                        <div className="input-textarea">
                          <textarea
                            maxLength="5120"
                            onChange={this.onDescriptionChange}
                            disabled={this.isArticleEditable()}
                            onBlur={this.onDescriptionBlur}
                            value={article.description || ''}
                            name=""
                            placeholder={contentModtranslator(
                              'ARTICLE_EDIT.DESCRIPTION_PLACEHOILDER'
                            )}
                            rows="6"
                            className="form-control"
                          >
                            {contentModtranslator(
                              'ARTICLE_EDIT.DETAILS_PLACEHOLDER'
                            )}
                          </textarea>
                          {articleError.description && (
                            <RequiredMessage text={articleError.description} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="article-edit-form">
                    <div className="tab-menu">
                      <div
                        className={
                          activeTab == 1 ? 'list-menu active-tab' : 'list-menu'
                        }
                        onClick={() => this.setTab(1)}
                      >
                        {contentModtranslator('ARTICLE_EDIT.EDIT')}
                      </div>
                      <div
                        className={
                          activeTab == 2 ? 'list-menu active-tab' : 'list-menu'
                        }
                        onClick={() => this.setTab(2)}
                      >
                        {contentModtranslator('ARTICLE_EDIT.MANAGEMENT_TEXT')}
                      </div>
                    </div>
                    {activeTab == 1 ? (
                      <>
                        <div className="edit-form-top">
                          <div className="input-left-side">
                            <div className="input-item edit-padding">
                              <div className="label">
                                {' '}
                                {contentModtranslator('ARTICLE_EDIT.CATEGORY')}
                              </div>
                              <div className="input">
                                <Select
                                  options={categoryList}
                                  isDisabled={this.isArticleEditable()}
                                  value={selectedCategory[0]}
                                  className="category-select"
                                  classNamePrefix="category"
                                  name=""
                                  onChange={this.onCategoryChagne}
                                  placeholder={contentModtranslator(
                                    'ARTICLE_EDIT.CATEGORY_PLACEHOLDER'
                                  )}
                                />
                              </div>
                            </div>
                            <div className="input-item">
                              <div className="label">
                                {contentModtranslator('ARTICLE_EDIT.SEO_TAG')}
                              </div>
                              <div className="input">
                                <TagsInput
                                  value={editTab.seoTags}
                                  type="text"
                                  disabled={this.isArticleEditable()}
                                  maxLength="1024"
                                  renderTag={this.defaultRenderTag}
                                  onChange={this.onEditTabSeoChange}
                                  onChangeInput={this.seoTagsInputChange}
                                  inputValue={inputValue.seoTags}
                                  name=""
                                  onlyUnique={true}
                                  onValidationReject={(tags) => {
                                    let [value] = tags;
                                    this.onEditTabSeoChangeBlur(value.trim());
                                  }}
                                  tagProps={{
                                    className: 'react-tagsinput-tag custom-tag',
                                    classNameRemove: 'react-tagsinput-remove'
                                  }}
                                  inputProps={{
                                    className: 'react-tagsinput-input custom-input',
                                    placeholder:
                                      editTab.seoTags.length == 0
                                        ? contentModtranslator(
                                            'ARTICLE_EDIT.TAG_NAME_PLACEHOLDER'
                                          )
                                        : '',
                                    maxLength: maxLen.seoTags,
                                    onBlur: (e) => {
                                      this.onEditTabSeoChangeBlur(e.target.value);
                                    }
                                  }}
                                  className={
                                   ( articleError.editTab.seoTags || this.isArticleEditable())
                                   ? articleError.editTab.seoTags? 'form-control manageTags tags-error' : 'form-control manageTags disabled'
                                      : 'form-control manageTags'
                                  }
                                />

                                {articleError.editTab.seoTags && (
                                  <RequiredMessage
                                    text={articleError.editTab.seoTags}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="input-right-side edit-padding">
                            <div className="input-item margin-bottom-radio">
                              <div className="label">
                                {' '}
                                {contentModtranslator(
                                  'ARTICLE_EDIT.PLACEMENT_SETTING'
                                )}
                              </div>
                              <div className="radio-button-group">
                                <div className="input-radio">
                                  <label className="select-option">
                                    {' '}
                                    {contentModtranslator(
                                      'ARTICLE_EDIT.REGULAR_ARTICLE'
                                    )}
                                    <input
                                      type="radio"
                                      name="articleLayout"
                                      disabled={this.isArticleEditable()}
                                      onChange={this.onPublishingTypeChange}
                                      value={1}
                                      checked={
                                        editTab.articleLayout == 1 ? true : false
                                      }
                                    />
                                    <span className="checkmark"></span>
                                  </label>
                                </div>
                                <div className="input-radio">
                                  <label className="select-option">
                                    {' '}
                                    {contentModtranslator(
                                      'ARTICLE_EDIT.ARTICLE_SCROLL'
                                    )}
                                    <input
                                      type="radio"
                                      name="articleLayout"
                                      disabled={this.isArticleEditable()}
                                      onChange={this.onPublishingTypeChange}
                                      value={2}
                                      checked={
                                        editTab.articleLayout == 2 ? true : false
                                      }
                                    />
                                    <span className="checkmark"></span>
                                  </label>
                                </div>
                              </div>
                            </div>

                            <div className="input-item">
                              <div className="label">
                                {' '}
                                {contentModtranslator(
                                  'ARTICLE_EDIT.PUBLISH_SETTING'
                                )}
                              </div>
                              <div className="radio-button-group">
                                <div className="input-radio">
                                  <label className="select-option">
                                    {contentModtranslator(
                                      'ARTICLE_EDIT.PUBLIC_ARTICLE'
                                    )}
                                    <input
                                      type="radio"
                                      name="publishingType"
                                      disabled={this.isArticleEditable()}
                                      value={1}
                                      onChange={this.onPublishingTypeChange}
                                      checked={
                                        editTab.publishingType == 1 ? true : false
                                      }
                                    />
                                    <span className="checkmark"></span>
                                  </label>
                                </div>
                                <div className="input-radio">
                                  <label className="select-option">
                                    {contentModtranslator(
                                      'ARTICLE_EDIT.MEMBER_ONLY_ARTICLE'
                                    )}
                                    <input
                                      type="radio"
                                      name="publishingType"
                                      value={2}
                                      disabled={this.isArticleEditable()}
                                      onChange={this.onPublishingTypeChange}
                                      checked={
                                        editTab.publishingType == 2 ? true : false
                                      }
                                    />
                                    <span className="checkmark"></span>
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="social-site">
                              <a
                                href="javascript:void(0)"
                                onClick={() => this.openFacebookModal()}
                              >
                                <div className="link">
                                  {' '}
                                  <img src={Facebook} alt="" />
                                </div>
                              </a>
                              <a
                                href="javascript:void(0)"
                                onClick={() => this.openTwitterModal()}
                              >
                                <div className="link">
                                  {' '}
                                  <img src={Twitter} alt="" />
                                </div>
                              </a>
                              <a
                                href="javascript:void(0)"
                                onClick={() => this.openLineModal()}
                              >
                                <div className="link">
                                  {' '}
                                  <img src={Line} alt="" />
                                </div>
                              </a>
                              <a
                                href="javascript:void(0)"
                                onClick={() => this.openMailModal()}
                              >
                                <div className="link">
                                  {' '}
                                  <img src={Mail} alt="" />
                                </div>
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="editor-divider"></div>

                        <div
                          className={`custom-editor ${
                            this.isArticleEditable() ? ' disabled' : ''
                          }`}
                        >
                          <RichEditor
                            editorState={this.state.editorState}
                            article={article}
                            getEditorContent={this.getEditorContent}
                            disabled={this.isArticleEditable()}
                            articleId={this.state.currentArticleId}
                            previewEnabled={fields.preview}
                            
                          />
                        </div>
                      </>
                    ) : (
                      <div className="management-tab">
                        <div className="management-form">
                          <div className="title">
                            {contentModtranslator(
                              'ARTICLE_EDIT.ARTICLE_CONFIRMATION'
                            )}
                          </div>
                          <div className="request-input">
                            <div className="input">
                              <Select
                                onFocus={this.fetchReviewerList}
                                options={reviewerList || []}
                                value={selectedReviewer && selectedReviewer[0]}
                                isDisabled={this.isArticleEditable()}
                                isLoading={
                                  reviewerList
                                    ? reviewerList.length
                                      ? false
                                      : true
                                    : false
                                }
                                className="approver-select"
                                classNamePrefix="approver"
                                components={{DropdownIndicator}}
                                name=""
                                onChange={this.onReviewerChange}
                                placeholder={contentModtranslator(
                                  'ARTICLE_EDIT.ARTICLE_CONFIRMATION_PLACEHOLDER'
                                )}
                              />
                            </div>
                            <div
                              onClick={this.sendReviewerRequest}
                              className={
                                this.isArticleEditable()
                                  ? 'action-btn disabledBtn'
                                  : 'action-btn'
                              }
                            >
                              {contentModtranslator('ARTICLE_EDIT.REVIEW_REQUEST')}
                            </div>
                          </div>
                          <div className="request-input">
                            <div className="input">
                              <Select
                                onFocus={this.fetchApproverList}
                                options={approverList || []}
                                isDisabled={this.isArticleEditable()}
                                value={selectedApprover && selectedApprover[0]}
                                isLoading={
                                  approverList
                                    ? approverList.length
                                      ? false
                                      : true
                                    : false
                                }
                                className="approver-select"
                                classNamePrefix="approver"
                                components={{DropdownIndicator}}
                                name=""
                                placeholder={contentModtranslator(
                                  'ARTICLE_EDIT.APPROVAL_REQUEST'
                                )}
                                onChange={this.onApproverChange}
                              />
                              {/* <img src={Search} alt="" /> */}
                            </div>

                            <div
                              onClick={this.sendApproverRequest}
                              className={
                                this.isArticleEditable()
                                  ? 'action-btn disabledBtn'
                                  : 'action-btn'
                              }
                            >
                              {contentModtranslator(
                                'ARTICLE_EDIT.APPROVAL_REQUEST_BTN'
                              )}
                            </div>
                          </div>
                          <div className="input-divider"> </div>
                          <div className="title">
                            {' '}
                            {contentModtranslator(
                              'ARTICLE_EDIT.ARTICLE_CONFIRMATION_TEXT'
                            )}{' '}
                          </div>
                          <div className="request-input">
                            <div className="label">
                              {contentModtranslator('ARTICLE_EDIT.REVIEW')}
                            </div>
                            <NcThreeStateButton
                              disabled={this.isReviewEnabled() || fields.review}
                              name="reviewConfirmation"
                              value={manageMentTab.reviewConfirmation}
                              currentValue={manageMentTab.reviewConfirmation}
                              getValue={this.onReviewConfirmationChange}
                            />
                          </div>
                          <div className="request-input">
                            <div className="label">
                              {contentModtranslator('ARTICLE_EDIT.APPROVAL')}
                            </div>
                            <NcThreeStateButton
                              disabled={this.isApproveEnabled() || fields.approve}
                              name="approvalConfirmation"
                              value={manageMentTab.approvalConfirmation}
                              currentValue={manageMentTab.approvalConfirmation}
                              getValue={this.onApprovalConfirmationChange}
                            />
                          </div>
                          <div className="input-divider"> </div>
                          <div className="title">
                            {' '}
                            {contentModtranslator('ARTICLE_EDIT.ARTICLE_STATUS')}
                          </div>
                          <div className="request-input">
                            <NcCheckbox
                              disabled={
                                this.isStopPublishEnabled() && fields.stopPublish
                              }
                              name="approvalCancelation"
                              id="setting-checkobox4"
                              handleChange={this.onChangePublishApproval}
                              checked={
                                manageMentTab.approvalCancelation ? true : false
                              }
                            />
                            <div className="btn-label">
                              {contentModtranslator('ARTICLE_EDIT.SUSPENSION')}{' '}
                            </div>
                          </div>
                          <div className="request-input">
                            <NcCheckbox
                              name="prohibition"
                              disabled={this.isProhibitEnabled() || fields.prohibit}
                              id="setting-checkobox3"
                              handleChange={this.onChangeProhibitApproval}
                              checked={manageMentTab.prohibition ? true : false}
                            />
                            <div className="btn-label">
                              {contentModtranslator(
                                'ARTICLE_EDIT.PROHIBITION_DISCLOUSER'
                              )}{' '}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="edit-action-btn">
                    <button
                      onClick={this.copyArticle}
                      disabled={this.isCopyEnabled() || fields.copy}
                      className={
                        this.isCopyEnabled() || fields.copy
                          ? 'copy-btn primary-color disabledBtn'
                          : 'copy-btn primary-color'
                      }
                    >
                      <CopyIcon />
                      <span>{contentModtranslator('ARTICLE_EDIT.COPY')} </span>
                    </button>
                    <button
                      onClick={this.handleSave}
                      disabled={
                        !this.prohibitOnlyPermission(prohibitMod.type.save) &&
                        fields.save
                      }
                      className={
                        !this.prohibitOnlyPermission(prohibitMod.type.save) &&
                        fields.save
                          ? 'save-btn primary-color disabledBtn'
                          : 'save-btn primary-color'
                      }
                    >
                       <SaveIcon />
                      <span>{contentModtranslator('ARTICLE_EDIT.SAVE')} </span>
                    </button>
                    <button
                      onClick={this.toggleDeleteModal}
                      disabled={this.isDeleteEnabled() || fields.delete}
                      className={
                        this.isDeleteEnabled() || fields.delete
                          ? 'delete-btn warning-color disabledBtn'
                          : 'delete-btn warning-color'
                      }
                    >
                      <DeleteIcon />
                      <span>{contentModtranslator('ARTICLE_EDIT.DELETE')} </span>
                    </button>
                  </div>
                </div>

                <div className="right-side">
                  <div className="article-menu">
                    <StatusIconWithLabel
                      iconType={
                        approvalIcon[articleData.custom_approving_status]
                          ? approvalIcon[articleData.custom_approving_status].NAME
                          : approvalIcon[0].NAME
                      }
                      color={
                        approvalIcon[articleData.custom_approving_status]
                          ? approvalIcon[articleData.custom_approving_status].COLOR
                          : approvalIcon[0].COLOR
                      }
                      labelText={
                        approvalIcon[articleData.custom_approving_status]
                          ? approvalIcon[articleData.custom_approving_status].STATUS
                          : approvalIcon[1].STATUS
                      }
                    />
                  </div>
                  <div className="article-menu">
                    <StatusIconWithLabel
                      iconType={PUBLICATION}
                      color={
                        publicationIcon[articleData.custom_publishing_status]
                          ? publicationIcon[articleData.custom_publishing_status]
                              .COLOR
                          : publicationIcon[0].COLOR
                      }
                      labelText={
                        publicationIcon[articleData.custom_publishing_status]
                          ? publicationIcon[articleData.custom_publishing_status]
                              .STATUS
                          : publicationIcon[1].STATUS
                      }
                    />
                  </div>
                  {/* For only active menu  */}
                  <div className="article-menu">
                    <div className="active-menu-name">
                      {' '}
                      {contentModtranslator('ARTICLE_EDIT.COMMENT')}{' '}
                    </div>
                  </div>
                  <div className="active-details">
                    <Mention
                      userList={users}
                      articleId={this.id}
                      getTextContent={this.getTextContent}
                      getMentionedUser={this.getMentionedUser}
                    />
                    <div className="comment-scroller">
                    {this.state.commentHistory.length
                      ? this.state.commentHistory.map((data) => (
                          <div key={data.id} className="item-list">
                            {this.commentTemplate(data)}
                          </div>
                        ))
                      : ''}
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* SNS Posting modal started  */}

          {
            selectedCategory.length ?  <FacebookPosting 
            faceBookModal={faceBookModal}
            article={article}
            isFacebookModalOpened={isFacebookModalOpened}
            articleId={this.state.currentArticleId}
            closeFacebookModal ={() => this.closeFacebookModal ()}
            getFacebookData={this.getFacebookData}
            localData={facebookData}
            category={this.findCategory(selectedCategory, categoryList)}
            key={this.genSnsUniqueKey(article.url, selectedCategory, ownMedia, article.startDate, 'facebook')}
            url={article.url}
            ownMedia={ownMedia}
            
          /> : ""
          }

          {
             selectedCategory.length ? <TwitterPosting 
             twitterModal={twitterModal}
             article={article}
             isTwitterModalOpened={isTwitterModalOpened}
             articleId={this.state.currentArticleId}
             closeTwitterModal ={() => this.closeTwitterModal ()}
             getTwitterData={this.getTwitterData}
             localData={twitterData}
             category={this.findCategory(selectedCategory, categoryList)}
             url={article.url}
             key={this.genSnsUniqueKey(article.url, selectedCategory, ownMedia, article.startDate, 'twitter')}
             ownMedia={ownMedia}
           /> : ""
          }
           
           {
             selectedCategory.length ?  <LinePosting 
             lineModal={lineModal}
             article={article}
             isLineModalOpened={isLineModalOpened}
             articleId={this.state.currentArticleId}
             closeLineModal ={() => this.closeLineModal ()}
             getLineData={this.getLineData}
             localData={lineData}
             category={this.findCategory(selectedCategory, categoryList)}
             key={this.genSnsUniqueKey(article.url, selectedCategory, ownMedia, article.startDate, 'line')}
             url={article.url}
             ownMedia={ownMedia}
           /> : ''
           }

        {/* SNS Posting modal ended  */}

          {/* Mail delivery Modal started  */}
          <MailPosting 
            mailDeliveryModal={mailDeliveryModal}
            article={article}
            isMailModalOpened={isMailModalOpened}
            articleId={this.state.currentArticleId}
            closeMailModal={() => this.closeMailModal()}
            getMailPostingData={this.getMailPostingData}
            localMailData={mailPosting}
            category={this.findCategory(selectedCategory, categoryList)}
            url={article.url}
            key={this.genSnsUniqueKey(article.url, selectedCategory, ownMedia, article.startDate, 'mail')}
            ownMedia={ownMedia}
          />
        
        
     
      </DefaultLayout>
    );
  }
}

function mapStateToProps(state) {
  return {
    permissions: state.authReducer.permissions
  };
}


export default connect(mapStateToProps, null)(withRouter(ArticleEdit));

function DropdownIndicator() {
  return <Search width="30" height="20" />;
}
