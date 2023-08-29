import React from 'react';
import {Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import moment from 'moment';
import AxiosService from '../../../../networks/AxiosService';
import ApiService from '../../../../networks/ApiServices';
import './scss/modalVidoes.scss';
import {videoModalTranslator} from './modLocalization';
import {
  CarretDownOutline,
  CarretUpOutline,
  CloseCircleSharp
} from '../../mod-assets/svgComp';
import {zeroPadding} from '../../../../helper';
import Loader from '../../../../common-components/Loader';
import NcDataTable from '../../../../common-components/NcDataTable';
import InifiniteScroll from 'react-infinite-scroller';
import InfiniteLoader from '../../../../common-components/InfiniteLoader';
import {split} from 'lodash';
export default class ModalVideos extends React.Component {
  constructor(props) {
    super(props);
    this.videoType = {
      '1': 'Youtube',
      '2': 'Vimeo'
    };
    this.videoUrlType = {
      '1': "file_url_youtube",
      '2': "file_url_vimeo"
    }
    this.scrollParent = React.createRef;
    this.scrollParentRef = null;
    this.state = {
      modal: props.modalOpen,
      data: [],
      currentPage: 0,
      isLoading: false,
      initialLoad: true,
      nextPage: 1,
      hasMore: true,
      apiFailed: false,
      infiniteLoader: false,
      isSortTitleASC: false,
      isSortDateASC: false,
      isSortPlatformASC: false,
      hasTitleSorted: false,
      hasPlatformSorted: false,
      hasDateSorted: false
    };
    this.columns = [
      {
        name: videoModalTranslator('VIDEO_MODAL.VIDEO'),
        selector: 'thumbnail',
        grow: true,
        cell: (row) => (
          <img
            src={row.thumbnail}
            height={40}
            width={70}
            onClick={(event) => {
              this.addVideo(event, row);
            }}
          />
        )
      },
      {
        name: videoModalTranslator('VIDEO_MODAL.TITLE'),
        selector: 'title',
        sortable: true
      },
      {
        name: videoModalTranslator('VIDEO_MODAL.UPLOAD_DATE'),
        selector: 'publishing_time',
        sortable: true
      },
      {
        name: videoModalTranslator('VIDEO_MODAL.PLATFORM'),
        selector: 'type',
        sortable: true
      }
    ];
    this.videoSortByName = this.videoSortByName.bind(this);
    this.videoSortByDate = this.videoSortByDate.bind(this);
    this.videoSortByPlatform = this.videoSortByPlatform.bind(this);
  }

  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
    this.props.clearModalStatus();
  };

  addVideo = (event, video) => {
    let {file_url} = this.state;
    event.target.parentNode.classList.add('tr-selected');
    this.toggle();
    this.props.addVideoToContent(video.url, video.video_id);
  };

  componentDidMount() {
    this.setState({
      isLoading: true
    });
  }

  loadMore = (page) => {
    let {infiniteLoader, nextPage, apiFailed, initialLoad, currentPage} = this.state;
    if (currentPage == nextPage) {
      return;
    }
    if (initialLoad) {
      this.setState({
        initialLoad: false
      });
    }
    if (!infiniteLoader) {
      this.setState({
        infiniteLoader: true
      });
    }

    let param = {
      page: nextPage
    };
    AxiosService.get(ApiService.MEDIA_LIST, param, false)
      .then((result) => {
       
        let data = result.data.data || {};
        let processed = data.list.map((d) => {
          let dt
          if (d.publishing_time) {
           dt = new Date(d.publishing_time.replace(/-/g, '/'))
          }
          let formated,urlType
          if (dt) {
           formated = `${dt.getFullYear()}-${zeroPadding(
              dt.getMonth() + 1
            )}-${zeroPadding(dt.getDate())} ${zeroPadding(
              dt.getHours()
              )}:${zeroPadding(dt.getMinutes())}`;
            urlType = this.videoUrlType[d.type]
          }
          return {
            ...d,
            type: d && this.videoType[d.type],
            publishing_time: formated,
            url: `${data[urlType]}${d.media_id}`
          };
        });

        this.setState({
          data: [...this.state.data, ...processed],

          infiniteLoader: false,
          initialLoad: false,
          file_url: data.file_url,
          hasMore: data.current_page < data.last_page ? true : false,
          nextPage: data.next_page_url ? nextPage + 1 : nextPage
        });
      })
      .catch((error) => {
        this.setState({
          isLoading: false
        });
      });

    this.setState({
      currentPage: nextPage
    });
  };

  videoSortByName() {
    let {isSortTitleASC} = this.state;
    let data = this.state.data;
    if (isSortTitleASC) {
      var sortedData = data.sort(function(a, b) {
        let titleA = a.title.toLowerCase();
        let titleB = b.title.toLowerCase();
        if (titleA > titleB) return -1;
        if (titleA < titleB) return 1;
        return 0;
      });
    } else {
      var sortedData = data.sort(function(a, b) {
        let titleA = a.title.toLowerCase();
        let titleB = b.title.toLowerCase();
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    this.setState({
      data: [...sortedData],
      isSortTitleASC: !isSortTitleASC,
      hasTitleSorted: true
    });
  }
  videoSortByDate() {
    let {isSortDateASC} = this.state;
    let data = this.state.data;
    if (isSortDateASC) {
      var sortedData = data.sort(function(a, b) {
        if (a.publishing_time && b.publishing_time) {
          let dateA = new Date(a.publishing_time.replace(/-/g, '/'));
        let dateB = new Date(b.publishing_time.replace(/-/g, '/'));
        return dateB - dateA;
        }
      });
    } else {
      var sortedData = data.sort(function(a, b) {
        if (a.publishing_time && b.publishing_time) {
          let dateA = new Date(a.publishing_time.replace(/-/g, '/'));
        let dateB = new Date(b.publishing_time.replace(/-/g, '/'));
        return dateA - dateB;
        }
      });
    }

    this.setState({
      data: [...sortedData],
      isSortDateASC: !isSortDateASC,
      hasDateSorted: true
    });
  }
  videoSortByPlatform() {
    let {isSortPlatformASC} = this.state;
    let data = this.state.data;
    if (isSortPlatformASC) {
      var sortedData = data.sort(function(a, b) {
        let typeA = a.type.toLowerCase();
        let typeB = b.type.toLowerCase();
        if (typeA > typeB) return -1;
        if (typeA < typeB) return 1;
        return 0;
      });
    } else {
      var sortedData = data.sort(function(a, b) {
        let typeA = a.type.toLowerCase();
        let typeB = b.type.toLowerCase();
        if (typeA < typeB) return -1;
        if (typeA > typeB) return 1;
        return 0;
      });
    }
    this.setState({
      data: [...sortedData],
      isSortPlatformASC: !isSortPlatformASC,
      hasPlatformSorted: true
    });
  }

  formatDateSafari = (date, formatter = '-') => {
    if (!date) return
    if (Date.parse(date.replace(/-/g, '/'))) {
    let d = new Date(date.replace(/-/g, '/'));
    return `${d.getFullYear()}${formatter}${zeroPadding(
    d.getMonth() + 1
    )}${formatter}${zeroPadding(d.getDate())} ${zeroPadding(
    d.getHours()
    )}:${zeroPadding(d.getMinutes())}`;
    }
    return '';
    };
  render() {
    let {
      isLoading,
      data,
      infiniteLoader,
      hasMore,
      initialLoad,
      file_url,
      isSortTitleASC,
      isSortDateASC,
      isSortPlatformASC,
      hasTitleSorted,
      hasDateSorted,
      hasPlatformSorted
    } = this.state;
    let tableLoading = true;
    if (data != null) {
      tableLoading = false;
    }
    data = data == null ? [] : data;
    return (
      <>
        <div>
          <Modal
            className="modalVideos"
            isOpen={this.state.modal}
            toggle={this.toggle}
          >
            <ModalHeader toggle={this.toggle}>
              {videoModalTranslator('VIDEO_MODAL.MODAL_TITLE')}
              <div
                className="custom-close"
                tabIndex={0}
                role="button"
                onClick={() => this.toggle()}
              >
                <CloseCircleSharp />
              </div>
            </ModalHeader>
            <ModalBody>
              {
                <div className={`table-responsive`}>
                  <table className="table table-bordred table-striped">
                    <thead>
                      <tr>
                        <th>
                          <span>{videoModalTranslator('VIDEO_MODAL.VIDEO')}</span>
                        </th>
                        <th>
                          <span onClick={() => this.videoSortByName()}>
                            {videoModalTranslator('VIDEO_MODAL.TITLE')}
                            {hasTitleSorted && !isSortTitleASC ? (
                              <CarretUpOutline
                                fill="#767676"
                                width="10px"
                                height="13px"
                              />
                            ) : (
                              <CarretDownOutline
                                fill="#767676"
                                width="10px"
                                height="13px"
                              />
                            )}
                          </span>
                        </th>
                        <th>
                          <span onClick={() => this.videoSortByDate()}>
                            {videoModalTranslator('VIDEO_MODAL.UPLOAD_DATE')}{' '}
                            {hasDateSorted && !isSortDateASC ? (
                              <CarretUpOutline
                                fill="#767676"
                                width="10px"
                                height="13px"
                              />
                            ) : (
                              <CarretDownOutline
                                fill="#767676"
                                width="10px"
                                height="13px"
                              />
                            )}
                          </span>
                        </th>
                        <th>
                          <span onClick={() => this.videoSortByPlatform()}>
                            {videoModalTranslator('VIDEO_MODAL.PLATFORM')}{' '}
                            {hasPlatformSorted && !isSortPlatformASC ? (
                              <CarretUpOutline
                                fill="#767676"
                                width="10px"
                                height="13px"
                              />
                            ) : (
                              <CarretDownOutline
                                fill="#767676"
                                width="10px"
                                height="13px"
                              />
                            )}
                          </span>
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      <InifiniteScroll
                        initialLoad={true}
                        hasMore={hasMore}
                        loadMore={this.loadMore}
                        useWindow={false}
                        threshold={1}
                        loader={infiniteLoader ? <InfiniteLoader /> : ''}
                      >
                        {data &&
                          data.map((video) => (
                            <tr
                              key={video.id}
                              role="button"
                              onClick={(e) => this.addVideo(e, video)}
                            >
                              <td>
                                <div className="video-thumb">
                                  <img src={`${file_url}${video.thumbnail}`} />
                                </div>
                              </td>
                              <td>{video.title}</td>
                              <td> {this.formatDateSafari(video.publishing_time, '/')} </td>
                              <td>{video.type} </td>
                            </tr>
                          ))}
                      </InifiniteScroll>
                    </tbody>
                  </table>
                </div>
              }
            </ModalBody>
          </Modal>
        </div>
      </>
    );
  }
}
