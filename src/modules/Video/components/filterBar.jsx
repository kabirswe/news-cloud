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
import {
  RAW_VIDEO_STATUS,
  VIDEO_DESTINATION
} from '../../../app-constants/rawContent';
import {rawMaterialPage, contentPage} from '../../../app-constants/usersConstant';
import {isEmpty} from '../../../helper';

class FilterBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterSlideStatus: true,
      videoStatus: RAW_VIDEO_STATUS,
      uploadDestination: VIDEO_DESTINATION,
      startDate: {
        isChecked: false,
        param: 'publicationPeriodStart',
        value: ''
      },
      endDate: {
        isChecked: false,
        param: 'publicationPeriodEnd',
        value: ''
      },
      isCheckedVideoStatus: false,
      isCheckedDestination: false,
      isCheckedPeriod: false,
      isVideoStatusOpen: true,
      isPeriodOpenClose: true,
      isUploadOpenClose: true,
      videoBar: true,
      publicationBar: true,
      uploadBar: true,
      isDataProcessing: this.props.isDataProcessing
    };
    this.videoStatusOpenClose = this.videoStatusOpenClose.bind(this);
    this.periodSectionOpenClose = this.periodSectionOpenClose.bind(this);
    this.uploadDestinationOpenClose = this.uploadDestinationOpenClose.bind(this);
  }

  componentDidMount() {
    const {rawFilterData} = this.props;
    if (isEmpty(rawFilterData)) {
      this.selectDeselect(true);
      setTimeout(() => {
        this.sendVideoListParam();
      }, 300);
    } else {
      this.itemFieldChecked();

      this.props.getVideoList(rawFilterData, true);
    }
  }

  componentWillUnmount = () => {
    this.uploadDestinationOpenClose = undefined;
    this.periodSectionOpenClose = undefined;
    this.videoStatusOpenClose = undefined;
  };

  itemFieldChecked() {
    const {
      videoStatus,
      uploadDestination,
      startDate,
      endDate,
      isCheckedDestination,
      isCheckedVideoStatus,
      isCheckedPeriod
    } = this.state;
    const {rawFilterData} = this.props;
    videoStatus.forEach((element) => {
      if (rawFilterData.hasOwnProperty(element.param)) {
        element.isChecked = true;
      }
    });
    this.setState({
      isCheckedVideoStatus: !videoStatus.find(o => o.isChecked === false)
    });
    uploadDestination.forEach((element) => {
      if (rawFilterData.hasOwnProperty(element.param)) {
        element.isChecked = true;
      }
    });
    this.setState({
      isCheckedDestination: !uploadDestination.find(o => o.isChecked === false)
    });
    startDate.isChecked = rawFilterData.hasOwnProperty(startDate.param);
    startDate.value = !!rawFilterData.publicationPeriodStart ? rawFilterData.publicationPeriodStart : '';
    endDate.isChecked = rawFilterData.hasOwnProperty(endDate.param);
    endDate.value = !!rawFilterData.publicationPeriodEnd ? rawFilterData.publicationPeriodEnd : '';

    if (
      rawFilterData.hasOwnProperty(startDate.param) &&
      rawFilterData.hasOwnProperty(endDate.param)
    ) {
      this.setState({isCheckedPeriod: true});
    }
  }

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
    const {videoStatus, isCheckedVideoStatus} = this.state;
    videoStatus.forEach((element) => {
      element.isChecked = event.target.checked;
    });
    this.setState({videoStatus, isCheckedVideoStatus: !isCheckedVideoStatus});
  };

  handlCheckedItem = (event, id) => {
    const {videoStatus} = this.state;
    let parentWillChecked = true;
    videoStatus.forEach((element) => {
      if (element.id === id) {
        element.isChecked = event.target.checked;
      }
      if (!element.isChecked) {
        parentWillChecked = false;
      }
    });
    this.setState({
      videoStatus,
      isCheckedVideoStatus: parentWillChecked
    });
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
    this.setState({
      uploadDestination,
      isCheckedDestination: parentWillChecked
    });
  };

  handleDate = (date, type) => {
    // if (date) {
    //   let dateTime = new Date(date);
    //   dateTime = moment(dateTime).format('YYYY-MM-DD');
      const {startDate, endDate} = this.state;
      if (type === 'startDate') {
        startDate.value = !!date ? date : '';
      } else {
        endDate.value = !!date ? date : '';
      }
    //   this.setState({startDate: startDate, endDate: endDate});
    // } else {
    //   const {startDate, endDate} = this.state;
    //   if (type == 'startDate') {
    //     startDate.value = '';
    //   } else {
    //     endDate.value = '';
    //   }
      this.setState({startDate: startDate, endDate: endDate});
    //}
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
    const {videoStatus, uploadDestination, startDate, endDate} = this.state;
    videoStatus.forEach((element) => {
      element.isChecked = status;
    });
    uploadDestination.forEach((element) => {
      element.isChecked = status;
    });
    startDate.isChecked = status;
    endDate.isChecked = status;
    this.setState(() => ({
      startDate: startDate,
      endDate: endDate,
      videoStatus: videoStatus,
      uploadDestination: uploadDestination,
      isCheckedVideoStatus: status,
      isCheckedPeriod: status,
      isCheckedDestination: status
    }));
  }

  sendVideoListParam() {
    const data = {};
    const {videoStatus, uploadDestination, startDate, endDate} = this.state;
    videoStatus.forEach((item) => {
      if (item.isChecked) {
        const {param} = item;
        data[param] = item.value;
      }
    });
    uploadDestination.forEach((item) => {
      if (item.isChecked) {
        const {param} = item;
        data[param] = item.value;
      }
    });
    if (startDate.isChecked) {
      data[startDate.param] = startDate.value;
    }
    if (endDate.isChecked) {
      data[endDate.param] = endDate.value;
    }
    this.props.getVideoList(data, true);
  }

  videoStatusOpenClose(e) {
    const {isVideoStatusOpen} = this.state;
    this.setState({isVideoStatusOpen: !isVideoStatusOpen});
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
      videoStatus,
      uploadDestination,
      endDate,
      startDate,
      isCheckedVideoStatus,
      isCheckedPeriod,
      isCheckedDestination,
      isVideoStatusOpen,
      isPeriodOpenClose,
      isUploadOpenClose
    } = this.state;
    const {pageType, isDataProcessing, rawFilterData} = this.props;
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
                onClick={() =>
                  pageType && pageType == rawMaterialPage
                    ? isDataProcessing
                      ? {}
                      : this.sendVideoListParam()
                    : {}
                }
              >
                {rawMaterialModtranslator('RAW_MATERIAL.APPLY_FILTER')}
              </Commonbutton>
            </div>
          </div>

          <div className={style.sectionList}>
            <div className={style.sectionListHead}>
              <div
                className={style.sectionListHeadIcon}
                onClick={(e) => this.videoStatusOpenClose(e)}
              >
                {isVideoStatusOpen ? (
                  <ChevronDownOutline className={style.arrow} title={false} />
                ) : (
                  <ChevronForwardOutline className={style.arrow} title={false} />
                )}
              </div>
              <Checkbox
                value="videoStatus"
                handleChange={(e) => this.handleAllChecked(e)}
                label={rawMaterialModtranslator('RAW_MATERIAL.VIDEO_STATUS')}
                isChecked={isCheckedVideoStatus && {checked: isCheckedVideoStatus}}
              />
            </div>
            <div className={style.checkList}>
              {isVideoStatusOpen &&
                videoStatus &&
                videoStatus.map((item, index) => (
                  <Checkbox
                    key={item.name + index + item.id}
                    value={item.id}
                    id={`${item.id}`}
                    label={item.name}
                    isChecked={item.isChecked}
                    handleChange={(e) => this.handlCheckedItem(e, item.id)}
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
                      value={!!startDate.value && moment(startDate.value).format('YYYY.MM.DD')}
                      defaultOption="YYYY.MM.DD"
                    />
                  </div>
                  <Checkbox
                    value="endDate"
                    label={rawMaterialModtranslator('RAW_MATERIAL.END_DATE')}
                    isChecked={endDate.isChecked}
                    handleChange={(e) => this.checkedEndDate(e)}
                  />
                  <div className={style.dateInputContent}>
                    <DateInput
                      className={style.dateInput}
                      type="endtDate"
                      handleDate={this.handleDate}
                      minDate={new Date(startDate.value)}
                      value={!!endDate.value && moment(endDate.value).format('YYYY.MM.DD')}
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
                    key={item.name + index + item.id}
                    value={item.id}
                    id={`${item.id}`}
                    label={item.name}
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
