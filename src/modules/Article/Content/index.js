import React, {Component} from 'react';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';
import {withRouter} from 'react-router-dom';
import DefaultLayout from '../../../containers/DefaultLayout';
import FilterBar from '../components/filterBar';
import style from '../Material/rawMaterial.module.scss';
import './content.scss';
import {rawMaterialModtranslator} from '../modLocalization';
import Tab from '../../../common-components/tab/Tab';
import TabPane from '../../../common-components/tab/TabPane';
import ContentList from '../components/contentList';
import {contentPage} from '../../../app-constants/usersConstant';
import path from '../../../routes/path'
import ApiServices from '../../../networks/ApiServices';
import Axios from '../../../networks/AxiosService';
import Toast from '../../../common-components/Toast';
import Loader from '../../../common-components/Loader';
import getErrorMessage from '../../../app-constants/ServerErrorInfo';
import Commonbutton from '../../../common-components/button/Button';
import InfiniteLoader from '../../../common-components/InfiniteLoader'
import InifiniteScroll from 'react-infinite-scroller'
import NcBreadcrumbs from '../../../common-components/NcBreadcrumbs/ncBreadcrumbs';
import {AddCircle} from '../mod-assets/svgComp'
import { connect } from 'react-redux';
import {articlePermissions} from '../../../app-constants';
import {fieldInitialization} from "../../../redux/actions/common";
import {getPermissions} from '../../../redux/actions/auth'
class Content extends Component {
  constructor(props) {
    super(props);
    this.currentStatus = 1
    this.breadcrumbs = [
      {title:"コンテンツ",link:"/content", active: true},
      {
        title: '',
        link: '',
        active: true
      }
    ]
    this.state = {
      isLoader: true,
      nextPage: null,
      hasMore: true,
      infiniteLoader: false,
      contentList: [],
      activeStaus: {
        articleStatus: 1,
        activeTab: 1,
        activePublicationIcon: 1,
        activeApprovalIcon: 1
      },
      searchText: props.globalSearchText
    };
    this.getContentList = this.getContentList.bind(this);
    this.getActiveIndex = this.getActiveIndex.bind(this);
  }
  componentDidMount() {


    let {activeStaus} = this.state;
    let tab = this.activeTabBeasedOnPermission()
    let t = (tab > 2) ? 3 : tab
    this.currentStatus = t
    this.setState({
      activeStaus: {
        ...activeStaus,
        activeTab: t,
        articleStatus: t
      }
    })
  }
  componentDidUpdate = (prevProps)=>{
    const { globalSearchText } = prevProps
    if(globalSearchText !== this.props.globalSearchText){
      this.setState({
        searchText: this.props.globalSearchText
      },
        () => this.getContentList(this.state.activeStaus.articleStatus)
      )
    }

    if (this.currentStatus !== this.state.activeStaus.articleStatus) {
      this.getContentList(this.state.activeStaus.articleStatus)
      this.currentStatus = this.state.activeStaus.articleStatus
    }
   }

  getContentList(articleStatus) {

 
    this.setState({isLoader: true, contentList: [], isAPIProcessing: true});
    const {userId, startDate, endDate, ownMediaId, searchText} = this.state;
    const startDateParam = !!startDate ? moment(startDate).format('YYYY-MM-DD') : '';
    const endDateParam = endDate ? moment(endDate).format('YYYY-MM-DD') : '';

    const param = {articleStatus: articleStatus,to:4,userId,startDate: startDateParam, endDate: endDateParam,ownMediaId,searchText};
    Axios.get(ApiServices.GET_CONTENT_LIST, param, false)
      .then((response) => {
        const result = response.data.data.list;
        let {params, ownMediaId} = response.config
        if (result && params.articleStatus == this.currentStatus && params.ownMediaId && params.searchText == this.state.searchText) {
          this.setState({
            contentList: [...result.data],
            file_url: response.data.data.file_url,
            isLoader: false,
            isAPIProcessing: false,
            hasMore: result.current_page < result.last_page ? true : false,
            nextPage: result.next_page_url ? 2 : 1,
          });
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
  }

  loadMore = () => {
    let {infiniteLoader, nextPage, is} = this.state
    if (infiniteLoader) {
      return
    }
    if (!infiniteLoader) {
      this.setState({
        infiniteLoader: true
      })
    }

    const {userId, startDate, endDate, ownMediaId, searchText}=this.state;
    const startDateParam = !!startDate ? moment(startDate).format('YYYY-MM-DD') : '';
    const endDateParam = endDate ? moment(endDate).format('YYYY-MM-DD') : '';
    const param = {page: nextPage, articleStatus: this.state.activeStaus.articleStatus,userId,startDate: startDateParam,endDate: endDateParam,ownMediaId,searchText};
    Axios.get(ApiServices.GET_CONTENT_LIST, param, false)
      .then((response) => {
        const result = response.data.data.list;
        if (result) {
          this.setState({
            contentList: [...this.state.contentList, ...result.data],
            isLoader: false,
            file_url: response.data.data.file_url,
            isAPIProcessing: false,
            infiniteLoader: false,
            hasMore: result.current_page < result.last_page ? true : false,
            nextPage: result.next_page_url ? (nextPage + 1) : nextPage,
          });
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
  }

  activeTabBeasedOnPermission = () => {
    let perm = {
      "Article Edit": 1,
      "Article Review": 2,
      "Article Approve": 2,
      "Article Publish": 3,
    }
    // if user has multiple permission then highest role value will be applicable
    let activeTab = 1;

    let permissions = this.props.permissions || []
    permissions.forEach(p => {
      if (perm[p] > activeTab) {
        activeTab = perm[p]
      }
    })

    return activeTab
  }

  getActiveIndex(index) {
    let activePublicationIcon = [0, 1, 1, 2];
    let activeApprovalIcon = [0, 1, 2, 5];
    this.setState({
      activeStaus: {
        articleStatus: index,
        activeTab: index,
        activePublicationIcon: activePublicationIcon[index],
        activeApprovalIcon: activeApprovalIcon[index]
      }
    });
    let {isAPIProcessing} = this.state;
    if (!isAPIProcessing) {
      this.getContentList(index);
    }
  }
  setArticleFilterParam = (data) => {
    this.props.fieldInitialization({contentFilterData: data});
    this.setState({
        ...data,
        startDate: !!data.startDate ? data.startDate : '',
        endDate: !!data.endDate ? data.endDate : ''
    },
    ()=>{
      this.getContentList(this.state.activeStaus.articleStatus)
    })
  }
  createNewArticle = () => {
    this.props.history.push(path.contentCreate)
  }
  render() {
    const {
      data,
      contentList,
      isLoader,
      file_url,
      activeStaus,
      hasMore,
      infiniteLoader
    } = this.state;
    return (
      <DefaultLayout>
        {/* <Toast /> */}
        <div className={`${style.container}`}>
          <FilterBar pageType={contentPage} getArticleFilterParam={this.setArticleFilterParam} contentFilterData={this.props.contentFilterData}/>
          <div className={style.RMcontainer}>
            <div className={style.contentBreadCrumb}>
            <NcBreadcrumbs
                breadcrumbs={this.breadcrumbs}
            />
            </div>
            <div className={`${style.RMTitle} ${style.extraMargin}`}>
              <span>{rawMaterialModtranslator('CONTENT.PAGE_TITLE')}</span>
              <Commonbutton
                className={`${style.uploadBtn} primary`}
                onClick={this.createNewArticle}
              >
              <AddCircle />  {rawMaterialModtranslator('CONTENT.NEW_ARTICLE')}
              </Commonbutton>
            </div>
            <div className="contentManagement">
              <Tab
                activeTab={activeStaus.activeTab}
                tabActiveItem={this.getActiveIndex}
                key={activeStaus.activeTab}
              >
                <TabPane
                  tab={1}
                  title={rawMaterialModtranslator('CONTENT.TAB_EDIT')}
                >
                  {isLoader ? (
                    <Loader />
                  ) : contentList.length ? (
                    <InifiniteScroll
                    initialLoad={true} hasMore={hasMore} loadMore={this.loadMore}
                    useWindow={false}
                    threshold={1}
                    loader={infiniteLoader ? <InfiniteLoader /> : ''}
                    >
                    <ContentList file_url={file_url} data={contentList} activeStaus={activeStaus} />

                    </InifiniteScroll>
                  ) : (
                    <div className="dataNotFound">
                      <h4>{rawMaterialModtranslator('CONTENT.DATA_NOT_FOUND')}</h4>
                    </div>
                  )}
                </TabPane>
                <TabPane
                  tab={2}
                  title={rawMaterialModtranslator('CONTENT.TAB_APPROVAL')}
                >
                  {isLoader ? (
                    <Loader />
                  ) : contentList.length ? (
                    <InifiniteScroll
                    initialLoad={true} hasMore={hasMore} loadMore={this.loadMore}
                    useWindow={false}
                    threshold={1}
                    loader={infiniteLoader ? <InfiniteLoader /> : ''}
                    >
                    <ContentList file_url={file_url} data={contentList} activeStaus={activeStaus} />

                    </InifiniteScroll>
                  ) : (
                    <div className="dataNotFound">
                      <h4>{rawMaterialModtranslator('CONTENT.DATA_NOT_FOUND')}</h4>
                    </div>
                  )}
                </TabPane>
                <TabPane
                  tab={3}
                  title={rawMaterialModtranslator('CONTENT.TAB_RELEASE')}
                >
                  {isLoader ? (
                    <Loader />
                  ) : contentList.length ? (
                    <InifiniteScroll
                    initialLoad={true} hasMore={hasMore} loadMore={this.loadMore}
                    useWindow={false}
                    threshold={1}
                    loader={infiniteLoader ? <InfiniteLoader /> : ''}
                    >
                    <ContentList file_url={file_url} data={contentList} activeStaus={activeStaus} />

                    </InifiniteScroll>
                  ) : (
                    <div className="dataNotFound">
                      <h4>{rawMaterialModtranslator('CONTENT.DATA_NOT_FOUND')}</h4>
                    </div>
                  )}
                </TabPane>
              </Tab>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }
}
function mapStateToProps(state) {
  return {
    globalSearchText: state.commonReducer.content,
    contentFilterData: state.commonReducer.contentFilterData,
    permissions: state.authReducer.permissions
  };
}
function mapDispatchToProps(dispatch) {
  return {
    fieldInitialization: (data) => dispatch(fieldInitialization(data))
    
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Content));
