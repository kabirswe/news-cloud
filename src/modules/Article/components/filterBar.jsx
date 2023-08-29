import React, {Component} from 'react';
import moment from 'moment';
import style from '../Material/rawMaterial.module.scss';
import {
  ChevronBackOutline,
  ChevronForwardOutline,
  ChevronDownOutline
} from '../mod-assets/svgComp';
import Commonbutton from '../../../common-components/button/Button';
import {rawMaterialModtranslator} from '../modLocalization';
import Checkbox from './Checkbox/index';
import DateInput from './dateInput';
import ApiServices from '../../../networks/ApiServices';
import getErrorMessage from '../../../app-constants/ServerErrorInfo';
import Toast from '../../../common-components/Toast';
import AxiosServices from '../../../networks/AxiosService';
import {isEmpty} from '../../../helper';

class FilterBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterSlideStatus: true,
      isDataProcessing: this.props.isDataProcessing,
      articleUsernameMenu: [],
      uploadDestination: [],
      startDate: {
        isChecked: false,
        param: 'startDate',
        value: ''
      },
      endDate: {
        isChecked: false,
        param: 'endDate',
        value: ''
      },
      isCheckedUsername: false,
      isCheckedDestination: false,
      isCheckedPeriod: false,
      isUsernameOpen: true,
      isPeriodOpenClose: true,
      isUploadOpenClose: true
    };
    this.usernameOpenClose = this.usernameOpenClose.bind(this);
    this.periodSectionOpenClose = this.periodSectionOpenClose.bind(this);
    this.uploadDestinationOpenClose = this.uploadDestinationOpenClose.bind(this);
  }

  componentDidMount() {
    this.getOwnmediaList();
  }

  getUsersList = () => {
    const param = '';
    const {contentFilterData} = this.props;
    AxiosServices.get(ApiServices.CONTENT_USERT_LIST, param, false)
      .then((response) => {
        const result = response.data;
        if (result.data.list) {
          let users = result.data.list;
          users = users.map((m) => ({...m, isChecked: false}));
          this.setState(
            {
              articleUsernameMenu: users
            },
            () => {
              if (isEmpty(contentFilterData)) {
                this.selectDeselect(true);
                this.sendArticleFilterParam();
              } else {
                this.itemFieldChecked();
                this.props.getArticleFilterParam(contentFilterData, true);
              }
            }
          );
        }
      })
      .catch((error) => {
        this.setState({
          isLoader: false,
          isAPIProcessing: false
        });
        const apiError = getErrorMessage(error);
        Toast.error(apiError);
        window.scroll(0, 0);
      });
  };

  getOwnmediaList = () => {
    const param = '';
    AxiosServices.get(ApiServices.OWN_MEDIA_ALL, param, false)
      .then((response) => {
        const result = response.data;
        if (result.data) {
          let ownMedia = result.data.list;
          ownMedia = ownMedia.map((m) => ({...m, isChecked: false}));
          this.setState(
            {
              uploadDestination: ownMedia
            },
            () => this.getUsersList()
          );
        }
      })
      .catch((error) => {
        this.setState({
          isLoader: false,
          isAPIProcessing: false
        });
        const apiError = getErrorMessage(error);
        Toast.error(apiError);
        window.scroll(0, 0);
      });
  };

  handleSlide = () => {
    this.setState((prevState) => ({
      filterSlideStatus: !prevState.filterSlideStatus
    }));
  };

  handleFilterBar = (barItem) => {
    this.setState((prevState) => ({
      [barItem]: !prevState[barItem]
    }));
  };

  handleAllChecked = (event) => {
    const {articleUsernameMenu, isCheckedUsername} = this.state;
    articleUsernameMenu.forEach((element) => {
      element.isChecked = event.target.checked;
    });
    this.setState({articleUsernameMenu, isCheckedUsername: !isCheckedUsername});
  };

  handleCheckedItem = (event, id) => {
    const {articleUsernameMenu} = this.state;
    let parentWillChecked = true;
    articleUsernameMenu.forEach((element) => {
      if (element.id === id) {
        element.isChecked = event.target.checked;
      }
      if (!element.isChecked) {
        parentWillChecked = false;
      }
    });
    this.setState({articleUsernameMenu, isCheckedUsername: parentWillChecked});
  };

  handleAllUpdateDestination = (event) => {
    const {uploadDestination, isCheckedDestination} = this.state;
    uploadDestination.forEach((element) => {
      element.isChecked = event.target.checked;
    });
    this.setState({uploadDestination, isCheckedDestination: !isCheckedDestination});
  };

  handleUploadDestination = (event, id) => {
    const {uploadDestination} = this.state;
    let parentWillChecked = true;
    uploadDestination.forEach((element) => {
      if (element.id === id) {
        element.isChecked = event.target.checked;
      }
      if (!element.isChecked) {
        parentWillChecked = false;
      }
    });
    this.setState({uploadDestination, isCheckedDestination: parentWillChecked});
  };

  handleDate = (date, type) => {
    const {startDate, endDate} = this.state;
    if (type === 'startDate') {
      startDate.value = !!date ? date : '';
    } else {
      endDate.value = !!date ? date : '';
    }
    this.setState({startDate: startDate, endDate: endDate});

    // if (date) {
    //   let dateTime = new Date(date);
    //   dateTime = moment(dateTime).format('YYYY-MM-DD');
    //   const {startDate, endDate} = this.state;
    //   if (type == 'startDate') {
    //     startDate.value = dateTime;
    //   } else {
    //     endDate.value = dateTime;
    //   }
    //   this.setState({startDate: startDate, endDate: endDate});
    // }
  };

  checkedStartDate = (event) => {
    const {startDate, endDate} = this.state;
    startDate.isChecked = event.target.checked;
    let parentWillChecked = false;
    if (startDate.isChecked && endDate.isChecked) {
      parentWillChecked = true;
    }
    this.setState({startDate, isCheckedPeriod: parentWillChecked});
  };

  checkedEndDate = (event) => {
    const {startDate, endDate} = this.state;
    endDate.isChecked = event.target.checked;
    let parentWillChecked = false;
    if (startDate.isChecked && endDate.isChecked) {
      parentWillChecked = true;
    }
    this.setState({endDate, isCheckedPeriod: parentWillChecked});
  };

  checkStartAndEndDate = (event) => {
    const {startDate, endDate, isCheckedPeriod} = this.state;
    startDate.isChecked = event.target.checked;
    endDate.isChecked = event.target.checked;
    this.setState({
      startDate: startDate,
      endDate: endDate,
      isCheckedPeriod: !isCheckedPeriod
    });
  };

  selectDeselect(status) {
    const {articleUsernameMenu, uploadDestination, startDate, endDate} = this.state;
    articleUsernameMenu.forEach((element) => {
      element.isChecked = status;
    });
    uploadDestination.forEach((element) => {
      element.isChecked = status;
    });
    startDate.isChecked = status;
    endDate.isChecked = status;
    setTimeout(() => {
      this.setState(() => ({
        startDate: startDate,
        endDate: endDate,
        articleUsernameMenu: articleUsernameMenu,
        uploadDestination: uploadDestination,
        isCheckedUsername: status,
        isCheckedPeriod: status,
        isCheckedDestination: status
      }));
    }, 100);
  }

  itemFieldChecked() {
    const {articleUsernameMenu, uploadDestination, startDate, endDate} = this.state;
    const {contentFilterData} = this.props;
    const userIdArr = contentFilterData.userId.split(',');
    const ownMediaIdArr = contentFilterData.ownMediaId.split(',');
    articleUsernameMenu.forEach((element) => {
      element.isChecked = userIdArr.includes(element.id.toString());
      // element.isChecked = true;
    });
    uploadDestination.forEach((element) => {
      element.isChecked = ownMediaIdArr.includes(element.id.toString());
    });

    startDate.isChecked = contentFilterData.hasOwnProperty(startDate.param);

    startDate.value = !!contentFilterData.startDate
      ? contentFilterData.startDate
      : '';
    endDate.isChecked = contentFilterData.hasOwnProperty(endDate.param);
    endDate.value = !!contentFilterData.endDate ? contentFilterData.endDate : '';

    setTimeout(() => {
      this.setState({
        isCheckedUsername: !articleUsernameMenu.find((o) => o.isChecked === false),
        isCheckedDestination: !uploadDestination.find((o) => o.isChecked === false)
      });
      if (
        contentFilterData.hasOwnProperty(startDate.param) &&
        contentFilterData.hasOwnProperty(endDate.param)
      ) {
        this.setState({isCheckedPeriod: true});
      }
    }, 100);
  }

  sendArticleFilterParam() {
    const data = {};
    const {articleUsernameMenu, uploadDestination, startDate, endDate} = this.state;
    data.userId = [];
    articleUsernameMenu.forEach((item) => {
      if (item.isChecked) {
        data.userId.push(item.id);
      }
    });
    data.userId = data.userId.join();
    data.ownMediaId = [];
    uploadDestination.forEach((item) => {
      if (item.isChecked) {
        data.ownMediaId.push(item.id);
      }
    });
    data.ownMediaId = data.ownMediaId.join();
    if (startDate.isChecked) {
      data[startDate.param] = startDate.value;
    }
    // else {
    //   data[startDate.value] = startDate.value;
    // }
    if (endDate.isChecked) {
      data[endDate.param] = endDate.value;
    }
    // else {
    //   data[endDate.param] = '';
    // }
    this.props.getArticleFilterParam(data, true);
  }

  usernameOpenClose(e) {
    const {isUsernameOpen} = this.state;
    this.setState({isUsernameOpen: !isUsernameOpen});
    e.preventDefault();
  }

  periodSectionOpenClose(e) {
    const {isPeriodOpenClose} = this.state;
    this.setState({isPeriodOpenClose: !isPeriodOpenClose});
    e.preventDefault();
  }

  uploadDestinationOpenClose(e) {
    const {isUploadOpenClose} = this.state;
    this.setState({isUploadOpenClose: !isUploadOpenClose});
    e.preventDefault();
  }

  render() {
    const {
      filterSlideStatus,
      articleUsernameMenu,
      uploadDestination,
      endDate,
      startDate,
      isCheckedUsername,
      isCheckedPeriod,
      isCheckedDestination,
      isUsernameOpen,
      isPeriodOpenClose,
      isUploadOpenClose
    } = this.state;
    const {pageType, isDataProcessing} = this.props;
    return (
      <div className={style.containerLeft}>
        <div
          className={style.filterContent}
          style={{display: !filterSlideStatus && 'none'}}
        >
          <div className={style.sectionList}>
            <div className={style.sectionContent}>
              <div>
                <span className={style.filterTitle}>
                  {rawMaterialModtranslator('RAW_MATERIAL.FILTER')}
                </span>
              </div>
              <div>
                <span
                  className={style.barrier}
                  onClick={() => this.selectDeselect(true)}
                >
                  {rawMaterialModtranslator('RAW_MATERIAL.SELECT_ALL')}
                </span>
                <span
                  className={style.barrierLast}
                  onClick={() => this.selectDeselect(false)}
                >
                  {' '}
                  {rawMaterialModtranslator('RAW_MATERIAL.DESELECT')}
                </span>
              </div>
            </div>
            <div className={style.commonButton}>
              <Commonbutton
                className="primary"
                onKeyDown={this.keyPress}
                onClick={() => this.sendArticleFilterParam()}
              >
                {rawMaterialModtranslator('RAW_MATERIAL.APPLY_FILTER')}
              </Commonbutton>
            </div>
          </div>

          <div className={style.sectionList}>
            <div className={style.sectionListHead}>
              <div
                className={style.sectionListHeadIcon}
                onClick={(e) => this.usernameOpenClose(e)}
              >
                {isUsernameOpen ? (
                  <ChevronDownOutline className={style.arrow} title={false} />
                ) : (
                  <ChevronForwardOutline className={style.arrow} title={false} />
                )}
              </div>
              <Checkbox
                value="articleUsernameMenu"
                handleChange={(e) => this.handleAllChecked(e)}
                label={rawMaterialModtranslator('RAW_MATERIAL.VIDEO_STATUS')}
                isChecked={isCheckedUsername}
              />
            </div>
            <div className={style.checkList}>
              {isUsernameOpen &&
                articleUsernameMenu &&
                articleUsernameMenu.map((item, index) => (
                  <Checkbox
                    key={item.id}
                    value={item.id}
                    id={`${item.id}`}
                    label={item.username ? item.username : item.id}
                    isChecked={item.isChecked}
                    handleChange={(e) => this.handleCheckedItem(e, item.id)}
                  />
                ))}
            </div>
          </div>

          <div className={style.sectionList}>
            <div className={style.sectionListHead}>
              <div
                className={style.sectionListHeadIcon}
                onClick={(e) => this.periodSectionOpenClose(e)}
              >
                {isPeriodOpenClose ? (
                  <ChevronDownOutline className={style.arrow} title={false} />
                ) : (
                  <ChevronForwardOutline className={style.arrow} title={false} />
                )}
              </div>
              <Checkbox
                value="PublicationPeriod"
                label={rawMaterialModtranslator('RAW_MATERIAL.PUBLICATION_PERIOD')}
                handleChange={(e) => this.checkStartAndEndDate(e)}
                isChecked={isCheckedPeriod}
              />
            </div>

            <div className={style.checkList}>
              {isPeriodOpenClose && (
                <>
                  <Checkbox
                    value="startDate"
                    isChecked={startDate.isChecked}
                    label={rawMaterialModtranslator('RAW_MATERIAL.START_DATE')}
                    handleChange={(e) => this.checkedStartDate(e)}
                  />
                  <div className={style.dateInputContent}>
                    <DateInput
                      className={style.dateInput}
                      type="startDate"
                      handleDate={this.handleDate}
                      maxDate={new Date(endDate.value)}
                      value={
                        !!startDate.value &&
                        moment(startDate.value).format('YYYY.MM.DD')
                      }
                      defaultOption="YYYY.MM.DD"
                    />
                  </div>
                  <Checkbox
                    value="endDate"
                    // isChecked="true"
                    label={rawMaterialModtranslator('RAW_MATERIAL.END_DATE')}
                    isChecked={endDate.isChecked}
                    handleChange={(e) => this.checkedEndDate(e)}
                  />
                  <div className={style.dateInputContent}>
                    <DateInput
                      minDate={new Date(startDate.value)}
                      className={style.dateInput}
                      type="endtDate"
                      handleDate={this.handleDate}
                      value={
                        !!endDate.value && moment(endDate.value).format('YYYY.MM.DD')
                      }
                      defaultOption="YYYY.MM.DD"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className={style.sectionList}>
            <div className={style.sectionListHead}>
              <div
                className={style.sectionListHeadIcon}
                onClick={(e) => this.uploadDestinationOpenClose(e)}
              >
                {isUploadOpenClose ? (
                  <ChevronDownOutline className={style.arrow} title={false} />
                ) : (
                  <ChevronForwardOutline className={style.arrow} title={false} />
                )}
              </div>
              <Checkbox
                value="uploadDestination"
                label={rawMaterialModtranslator('RAW_MATERIAL.UPLOAD_DESTINATION')}
                handleChange={(e) => this.handleAllUpdateDestination(e)}
                isChecked={isCheckedDestination}
              />
            </div>

            <div className={style.checkList}>
              {isUploadOpenClose &&
                uploadDestination &&
                uploadDestination.map((item, index) => (
                  <Checkbox
                    key={item.id}
                    value={item.id}
                    id={`${item.id}`}
                    label={item.display_name}
                    isChecked={item.isChecked}
                    handleChange={(e) => this.handleUploadDestination(e, item.id)}
                  />
                ))}
            </div>
          </div>
        </div>
        <div
          onClick={this.handleSlide}
          className={style.slideIconContent}
          role="button"
          tabIndex={0}
        >
          {filterSlideStatus ? (
            <ChevronBackOutline className={style.arrow} />
          ) : (
            <ChevronForwardOutline className={style.arrow} />
          )}
        </div>
      </div>
    );
  }
}
export default FilterBar;
