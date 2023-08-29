import React, { Component } from 'react';
import StatisticsContainer from '../../../containers/StatisticsContainer';
import TopTitleComponent from '../components/TopTitleComponent';
import StatisticsBlock from '../components/StatisticsBlock';
import './statisticsVideo.scss';
import NcBreadcrumbs from '../../../common-components/NcBreadcrumbs/ncBreadcrumbs';
import NcButton from '../../../common-components/NcButton';
import { statisticsModtranslator } from '../modLocalization';
import Pie from "../StatisticsOwnMedia/components/Pie";
import LineChart from '../components/LineChart'
import moment from 'moment';
import AxiosServices from '../../../networks/AxiosService';
import ApiService from '../../../networks/ApiServices'
import Loader from '../../../common-components/InfiniteLoader';
import { ChevronDownOutline } from '../../../assets/svgComp'
import Toast from '../../../common-components/Toast';
import { withRouter } from 'react-router-dom';
class StatisticsVideo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab1: true,
      activeTab2: false,
      youtubeSummeryViews: [],
      youtubeSummeryEvaluationLike: [],
      youtubeSummeryTrafficSource: [],
      youtubeSummeryRankOfViews: [],
      youtubeSummeryRankOfViewsPagination: 1,
      youtubeSummeryRankOfViewsSorting: true,
      averageViewTime: 0,
      startDate: '',
      endDate: '',
      processedBy: 0,
      isLoading: {
        youtubeSummeryViews: true,
        youtubeSummeryEvaluationLike: true,
        youtubeSummeryTrafficSource: true,
        youtubeSummeryRankOfViews: true,
        averageViewTime: true,
      },
      errors: {
        youtubeSummeryViews: '',
        youtubeSummeryEvaluationLike: '',
        youtubeSummeryTrafficSource: '',
        youtubeSummeryRankOfViews: '',
        averageViewTime: '',
      }
    };
  }
  onTabChange = (name) => {
    console.log(name);
    this.setState({
      activeTab1: false,
      activeTab2: false,
      [name]: true
    });
  };
  get31DaysBeforeFromToday() {
    let today = new Date()
    let priorDate = new Date().setDate(today.getDate() - 31)
    return new Date(priorDate)
  }
  convertSecondsToHMS = (dataInSeconds) => {
    let hour = parseInt(dataInSeconds / 3600)
    let remainder = dataInSeconds % 3600
    let minitue = parseInt(remainder / 60)
    let seconds = remainder % 60
    console.log("hour ----minitue-----seconds", hour, minitue, seconds);
    return `${hour} 時間 ${minitue} 分 ${seconds} 秒`
  }
  redirectToLogin = (error = {}) => {
    setTimeout(() => {
      if (error.response && error.response.status == 401) {
        this.props.history.push('/login');
      }
    }, 2000);
  }
  filterDateWise = (minDate, maxDate) => {
    Toast.clear()
    let startDate = moment(minDate == null ? undefined : minDate).format('YYYY-MM-DD')
    let endDate = moment(maxDate == null ? undefined : maxDate).format('YYYY-MM-DD')
    this.credentialsCheckYoutubeAnalyticsGoogleAnalyticsAndSearchConsole('youtube')
    this.setState({
      startDate: startDate,
      endDate: endDate,
      processedBy: 1,
      youtubeSummeryRankOfViewsPagination: 1,
      isLoading: {
        youtubeSummeryViews: true,
        youtubeSummeryEvaluationLike: true,
        youtubeSummeryTrafficSource: true,
        youtubeSummeryRankOfViews: true,
        averageViewTime: true,
      },
      errors: {
        youtubeSummeryViews: '',
        youtubeSummeryEvaluationLike: '',
        youtubeSummeryTrafficSource: '',
        youtubeSummeryRankOfViews: '',
        averageViewTime: '',
      }
    })
    this.callAllApi(startDate, endDate, 1, 1)
    console.log("props date passed to aprent", minDate, maxDate)
  }
  credentialsCheckYoutubeAnalyticsGoogleAnalyticsAndSearchConsole = async (checkingCriteria) => {
    return AxiosServices.get(ApiService.CREDENTIALS_CHECK_YOUTUBE_ANALYTICS_GOOGLE_ANALYTICS_AND_SEARCH_CONSOLE, false)
      .then(result => {
        let data = result.data.data
      }).catch(error => {
        let errorMessage = '';
        if(error.response === undefined){
          errorMessage = '何かがうまくいかなかった'
        }
        else {
          let status = error.response.status
          this.redirectToLogin(error)
          if(status == 401 || status==403){
            errorMessage = error.response.data.message
          }
          else if(checkingCriteria == 'youtube'){
            errorMessage += error.response.data.message.youtube
          }
        }
        if(errorMessage != ''){
          Toast.error(errorMessage)
        }
      })
  }
  ///YOUTUBE API
  getYoutubeSummeryViews = (startDate, endDate, processedBy = 0) => {
    AxiosServices.get(ApiService.YOUTUBE_SUMMERY_VIEWS(startDate, endDate, processedBy), false)
      .then(result => {
        let data = result.data.data.youtube ?? []
        let sourceData = {
          labels: [],
          data: []
        }
        data.forEach((d) => {
          sourceData.labels.push(d.date)
          sourceData.data.push(d.views)
        })
        let lineChartData = {
          labels: sourceData.labels,
          datasets: [{
            label: "視聴回数",
            type: 'line',
            data: sourceData.data,
            fill: false,
            borderColor: '#008ECD',
            backgroundColor: '#008ECD',
            pointBorderColor: '#008ECD',
            pointBackgroundColor: '#008ECD',
            pointHoverBackgroundColor: '#008ECD',
            pointHoverBorderColor: '#008ECD',
            yAxisID: 'y-axis-1',
          }]
        }
        this.setState({
          youtubeSummeryViews: lineChartData,
          isLoading: {
            ...this.state.isLoading,
            youtubeSummeryViews: false
          }
        })
        console.log("SUMMERY VIEWS ========", data)
      }).catch(error => {
        let errorMessage = error.response === undefined ? '何かがうまくいかなかった' : error.response.data.message
        this.setState({
          youtubeSummeryViews: [],
          isLoading: {
            ...this.state.isLoading,
            youtubeSummeryViews: false
          },
          errors: {
            ...this.state.errors,
            youtubeSummeryViews: errorMessage
          }
        })
        console.log('error ', error.response)
      })
  }
  getYoutubeSummeryEvaluationLike = (startDate, endDate, processedBy = 0) => {
    AxiosServices.get(ApiService.YOUTUBE_SUMMERY_EVALUATION_LIKE(startDate, endDate, processedBy), false)
      .then(result => {
        let data = result.data.data.youtube ?? []
        let sourceData = {
          labels: [],
          data: []
        }
        data.forEach((d) => {
          sourceData.labels.push(d.date)
          sourceData.data.push(d.likes)
        })
        let lineChartData = {
          labels: sourceData.labels,
          datasets: [{
            label: "高評価数",
            type: 'line',
            data: sourceData.data,
            fill: false,
            borderColor: '#008ECD',
            backgroundColor: '#008ECD',
            pointBorderColor: '#008ECD',
            pointBackgroundColor: '#008ECD',
            pointHoverBackgroundColor: '#008ECD',
            pointHoverBorderColor: '#008ECD',
            yAxisID: 'y-axis-1',
          }]
        }
        this.setState({
          youtubeSummeryEvaluationLike: lineChartData,
          isLoading: {
            ...this.state.isLoading,
            youtubeSummeryEvaluationLike: false
          }
        })
        console.log("SUMMERY EVALUATION LIKES ========", data)
      }).catch(error => {
        let errorMessage = error.response === undefined ? '何かがうまくいかなかった' : error.response.data.message
        this.setState({
          youtubeSummeryEvaluationLike: [],
          isLoading: {
            ...this.state.isLoading,
            youtubeSummeryEvaluationLike: false
          },
          errors: {
            ...this.state.errors,
            youtubeSummeryEvaluationLike: errorMessage
          }
        })
        console.log('error ', error.response)
      })
  }
  getYoutubeSummeryTrafficSource = (startDate, endDate, processedBy = 0) => {
    AxiosServices.get(ApiService.YOUTUBE_SUMMERY_TRAFFIC_SOURCE(startDate, endDate, processedBy), false)
      .then(result => {
        let data = result.data.data.youtube ?? []
        let sourceData = {
          labels: [],
          data: []
        }
        data.forEach(d => {
          sourceData.labels.push(d.source)
          sourceData.data.push(d.users)
        })
        let pieData = {
          labels: sourceData.labels,
          type: 'pie',
          datasets: [
            {
              backgroundColor: [
                '#008ECD',
                '#ED7D31',
                '#A5A5A5',
                '#FFC000',
                '#5B9BD5',
                '#70AD47',
                '#34495e'
              ],
              pointStyle: 'rect',
              data: sourceData.data
            }
          ]
        }
        this.setState({
          youtubeSummeryTrafficSource: pieData,
          isLoading: {
            ...this.state.isLoading,
            youtubeSummeryTrafficSource: false
          }
        })
        console.log("SUMMERY TRAFFIC SOURCE ========", data)
      }).catch(error => {
        let errorMessage = error.response === undefined ? '何かがうまくいかなかった' : error.response.data.message
        this.setState({
          youtubeSummeryTrafficSource: [],
          isLoading: {
            ...this.state.isLoading,
            youtubeSummeryTrafficSource: false
          },
          errors: {
            ...this.state.errors,
            youtubeSummeryTrafficSource: errorMessage
          }
        })
        console.log('error ', error.response)
      })
  }
  getYoutubeSummeryRankOfViews = (startDate, endDate, processedBy = 0, pagination = 1) => {
    AxiosServices.get(ApiService.YOUTUBE_SUMMERY_RANK_OF_VIEWS(startDate, endDate, processedBy, pagination), false)
      .then(result => {
        let data = result.data.data.youtube ?? []
        this.setState({
          youtubeSummeryRankOfViews: data,
          isLoading: {
            ...this.state.isLoading,
            youtubeSummeryRankOfViews: false
          }
        })
        console.log("SUMMERY RANK OF VIEWS ========", data)
      }).catch(error => {
        let errorMessage = error.response === undefined ? '何かがうまくいかなかった' : error.response.data.message
        this.setState({
          youtubeSummeryRankOfViews: [],
          isLoading: {
            ...this.state.isLoading,
            youtubeSummeryRankOfViews: false
          },
          errors: {
            ...this.state.errors,
            youtubeSummeryRankOfViews: errorMessage
          }
        })
        console.log('error ', error.response)
      })
  }
  getYoutubeAverageViewTime = (startDate, endDate, processedBy = 0) => {
    AxiosServices.get(ApiService.YOUTUBE_AVERAGE_VIEW_TIME(startDate, endDate, processedBy), false)
      .then(result => {
        let data = result.data.data.average_view_time ?? 0
        this.setState({
          averageViewTime: this.convertSecondsToHMS(data)
        })
        console.log("AVERAGE VIEW TIME ========", data)
      }).catch(error => {
        let errorMessage = error.response === undefined ? '何かがうまくいかなかった' : error.response.data.message
        this.setState({
          averageViewTime: this.convertSecondsToHMS(0),
          errors: {
            ...this.state.errors,
            averageViewTime: errorMessage
          }
        })
        console.log('error ', error.response)
      })
  }

  getAllYoutubeSummeryRankOfViews = () => {
    let { startDate, endDate, processedBy } = this.state
    this.setState({
      youtubeSummeryRankOfViewsPagination: 0
    })
    this.getYoutubeSummeryRankOfViews(startDate, endDate, processedBy, 0)
  }
  youtubeSummeryRankOfViewsSorting = () => {
    let { youtubeSummeryRankOfViews, youtubeSummeryRankOfViewsSorting } = this.state
    youtubeSummeryRankOfViews.sort((a, b) => {
      let asc = a.views - b.views
      return youtubeSummeryRankOfViewsSorting ? asc : asc * -1
    })
    this.setState({
      youtubeSummeryRankOfViews: youtubeSummeryRankOfViews,
      youtubeSummeryRankOfViewsSorting: !youtubeSummeryRankOfViewsSorting
    })
  }
  callAllApi = (startDate, endDate, processedBy = 0, pagination = 1) => {
    this.credentialsCheckYoutubeAnalyticsGoogleAnalyticsAndSearchConsole('youtube')
    this.getYoutubeSummeryViews(startDate, endDate, processedBy)
    this.getYoutubeSummeryEvaluationLike(startDate, endDate, processedBy)
    this.getYoutubeSummeryTrafficSource(startDate, endDate, processedBy)
    this.getYoutubeSummeryRankOfViews(startDate, endDate, processedBy, pagination)
    this.getYoutubeAverageViewTime(startDate, endDate, processedBy)
  }
  componentDidMount() {
    let startDate = moment(this.get31DaysBeforeFromToday()).format('YYYY-MM-DD')
    let endDate = moment(new Date(new Date().setDate(new Date().getDate() - 1))).format('YYYY-MM-DD')
    console.log("date printing", startDate, endDate)
    // All api call
    this.callAllApi(startDate, endDate)
  }

  render() {
    const breadcrumbs = [
      {
        title: statisticsModtranslator('STATISTICS.OWNMEDIA.PAGE_TITLE_1'),
        link: '#'
      },
      {
        title: '動画サマリー',
        link: '',
        active: true
      }
    ];
    const {
      activeTab1,
      activeTab2,
      youtubeSummeryViews,
      youtubeSummeryEvaluationLike,
      youtubeSummeryTrafficSource,
      youtubeSummeryRankOfViews, youtubeSummeryRankOfViewsPagination, youtubeSummeryRankOfViewsSorting,
      averageViewTime,
      isLoading,
      errors
    } = this.state;
    return (
      <StatisticsContainer>
        <div className="statistics-container-video">
          <Toast />
          <NcBreadcrumbs breadcrumbs={breadcrumbs} />
          <TopTitleComponent title="動画サマリー" sendDate={this.filterDateWise} />
          <div className="tab-button-block">
            <button
              type="button"
              className={activeTab1 ? 'active' : ''}
              onClick={() => this.onTabChange('activeTab1')}
            >
              YouTube
          </button>
            {/* <button
              type="button"
              className={activeTab2 ? 'active' : ''}
              onClick={() => this.onTabChange('activeTab2')}
            >
              Vimeo
          </button> */}
          </div>
          <div
            className={`statistics-container-block ${activeTab1 ? 'active' : ''}`}
          >
            <div className="statistics-top-block">
              <div className="left-block">
                <StatisticsBlock title="視聴回数とユニーク視聴者の推移">
                  {
                    errors.youtubeSummeryViews !== '' ? <div className="statistics-error">{errors.youtubeSummeryViews}</div> :
                      isLoading.youtubeSummeryViews ? <Loader /> : <LineChart data={youtubeSummeryViews} />
                  }
                </StatisticsBlock>
              </div>
              <div className="right-block">
                <StatisticsBlock title="高評価数の推移">
                  {
                    errors.youtubeSummeryEvaluationLike !== '' ? <div className="statistics-error">{errors.youtubeSummeryEvaluationLike}</div> :
                      isLoading.youtubeSummeryEvaluationLike ? <Loader /> : <LineChart data={youtubeSummeryEvaluationLike} />
                  }
                </StatisticsBlock>
              </div>
            </div>
            <div className="statistics-bottom-block">
              <div className="left-block">
                <StatisticsBlock title="トラフィックソース">
                  {
                    errors.youtubeSummeryTrafficSource !== '' ? <div className="statistics-error">{errors.youtubeSummeryTrafficSource}</div> :
                      isLoading.youtubeSummeryTrafficSource ? <Loader /> : <Pie data={youtubeSummeryTrafficSource} />
                  }
                </StatisticsBlock>
              </div>
              <div className="right-block">
                <div className="keyword-block">
                  <StatisticsBlock title="視聴回数順位">
                    {
                      errors.youtubeSummeryRankOfViews !== '' ? <div className="statistics-error">{errors.youtubeSummeryRankOfViews}</div> :
                        isLoading.youtubeSummeryRankOfViews ? <Loader /> :
                          <>
                            <div className="header-block">
                              <div className="sl-no"></div>
                              <div className="video-name">動画名</div>
                              <div className={`no-of-views ${youtubeSummeryRankOfViewsSorting ? '' : 'rotate'}`} onClick={() => this.youtubeSummeryRankOfViewsSorting()}>視聴回数 <ChevronDownOutline /></div>
                            </div>
                            <div className="body-block">
                              {
                                youtubeSummeryRankOfViews.map((row, index) => {
                                  return (
                                    <div className="block">
                                      <div className="sl-no">{index + 1}</div>
                                      <div className="video-name">
                                        {row.video_title}<span></span>
                                      </div>
                                      <div className="no-of-views">
                                        {row.views}
                                        {/* <span>+50 (+5.3%)</span> */}
                                      </div>
                                    </div>
                                  )
                                })
                              }
                            </div>
                            {
                              youtubeSummeryRankOfViewsPagination ?
                                <div className="button-block">
                                  <span>動画名をクリックすると個別の動画の統計を表示します。</span>
                                  <NcButton className="submit-date" callback={() => this.getAllYoutubeSummeryRankOfViews()}>すべて表示する</NcButton>
                                </div> : ''
                            }
                          </>
                    }
                  </StatisticsBlock>
                </div>
              </div>
            </div>
            <div className="statistics-last-block">
              <div className="left-block">
                <div className="view-block">
                  <StatisticsBlock title="平均視聴時間">
                    {
                      errors.averageViewTime !== '' ? <div className="statistics-error">{errors.averageViewTime}</div> :
                        <span>{averageViewTime}</span>
                    }
                  </StatisticsBlock>
                </div>
              </div>
            </div>
          </div>
          <div
            className={`statistics-container-block tab2 ${
              activeTab2 ? 'active' : ''
              }`}
          ></div>
        </div>
      </StatisticsContainer>
    );
  }
}
export default withRouter(StatisticsVideo)
