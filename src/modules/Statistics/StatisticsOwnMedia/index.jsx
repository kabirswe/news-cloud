/*eslint-disable */
import React, { Component } from 'react';
import StatisticsContainer from '../../../containers/StatisticsContainer';
import TopTitleComponent from '../components/TopTitleComponent';
import StatisticsBlock from '../components/StatisticsBlock';
import './statisticsOwnMedia.scss';
import NcBreadcrumbs from '../../../common-components/NcBreadcrumbs/ncBreadcrumbs';
import NcButton from '../../../common-components/NcButton';
import { statisticsModtranslator } from '../modLocalization';
import Axios from 'axios'
import { zeroPadding } from '../../../helper'
import ApiService from '../../../networks/ApiServices'
import AxiosService from '../../../networks/AxiosService'
import MultiAxisLine from './components/MultiAxisLine'
import Pie from './components/Pie'
import VerticalStackedBar from './components/VerticalStackedBar'
import NcHorizontalStackedBar from './components/NcHorizontalStackedBar'
import Loader from '../../../common-components/InfiniteLoader'
import moment from 'moment'
import { ChevronDownOutline } from '../../../assets/svgComp'
import Toast from '../../../common-components/Toast';
import { withRouter } from 'react-router-dom';
class StatisticsOwnMedia extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab1: true,
      activeTab2: false,
      activeTab3: false,
      startDate: '',
      endDate: '',
      processedBy: 0,
      noOfViews: {
        pageViews: null,
        noOfIncreaseOfView: null,
        ratioOfIncreaseOfView: null
      },
      noOfVisitors: {
        visitors: null,
        noOfIncreaseOfVisitor: null,
        ratioOfIncreaseOfVisitor: null
      },
      averagePageView: {
        averagePageViews: null,
        noOfIncreaseOfAveragePageView: null,
        ratioOfIncreaseOfAveragePageView: null
      },
      averageStayTime: {
        minute: null,
        second: null,
        noOfIncreaseOfAverageStayTime: null,
        ratioOfIncreaseOfAverageStayTime: null
      },
      sourceRoute: null,
      sourceReference: null,
      transitionOfAccess: null, // site tab transition
      transitionOfVisit: null, // visitor tab transition
      visitAndRevisit: {
        newVisit: {
          users: null,
          noOfIncreaseOfNewVisit: null,
          ratioOfIncreaseOfRevisit: null
        },
        reVisit: {
          users: null,
          noOfIncreaseOfNewVisit: null,
          ratioOfIncreaseOfRevisit: null
        }
      },
      userAge: null,
      userSex: null,
      userDevice: null,
      ownMediaContentPageViews: [],
      ownMediaContentPageViewsSorting: {
        views: true,
        users: true,
        average_stay_time: true,
      },
      ownMediaContentPageViewsPagination: 1,
      ownMediaKeywordSearchConsole: [],
      ownMediaKeywordSearchConsolePagination: 1,
      ownMediaKeywordSearchConsoleSorting: {
        clicks: true,
        displays: true,
        search_rank: true
      },
      userCity: null,
      userCountry: null,
      isLoading: {
        transition: true,
        transitionOfVisit: true,
        sourceRoute: true,
        sourceReference: true,
        age: true,
        sex: true,
        device: true,
        country: true,
        city: true,
        ownMediaContentPageViews: true,
        ownMediaKeywordSearchConsole: true
      },
      errors: {
        siteViews: '',
        visitors: '',
        siteTransition: '',
        siteAveragePageView: '',
        siteAverageStayTime: '',
        siteSourceRoute: '',
        siteSourceReference: '',
        transitionOfVisitAndRevisit: '',
        newAndReturnVisitors: '',
        usersAge: '',
        usersSex: '',
        usersDevice: '',
        usersCountry: '',
        usersCity: '',
        ownMediaContentPageViews: '',
        ownMediaKeywordSearchConsole: ''
      }
    };
  }

  onTabChange = (name) => {
    let { activeTab1, activeTab2, activeTab3 } = this.state
    if (!this.state[name]) {
      Toast.clear()
      this.emptyAllError()
      this.setState({
        isLoading: {
          transition: true,
          transitionOfVisit: true,
          sourceRoute: true,
          sourceReference: true,
          age: true,
          sex: true,
          device: true,
          country: true,
          city: true,
          ownMediaContentPageViews: true,
          ownMediaKeywordSearchConsole: true
        }
      })
    }
    this.setState({
      activeTab1: false,
      activeTab2: false,
      activeTab3: false,
      [name]: true
    });
    let { startDate, endDate, processedBy } = this.state
    if (name == "activeTab1" && !activeTab1) {
      this.tabOneApi(startDate, endDate, processedBy)
    }
    else if (name == "activeTab2" && !activeTab2) {
      this.tabTwoApi(startDate, endDate, processedBy)
    }
    else if (name == "activeTab3" && !activeTab3) {
      this.tabThreeApi(startDate, endDate, processedBy)
    }
  };

  get31DaysBeforeFromToday() {
    let today = new Date()
    let priorDate = new Date().setDate(today.getDate() - 31)
    return new Date(priorDate)
  }
  redirectToLogin = (error = {}) => {
    setTimeout(() => {
      if (error.response && error.response.status == 401) {
        this.props.history.push('/login');
      }
    }, 2000);
  }
  formatDate = (date, formatter = '-') => {
    if (Date.parse(date)) {
      let d = new Date(date);
      return `${d.getFullYear()}${formatter}${zeroPadding(
        d.getMonth() + 1
      )}${formatter}${zeroPadding(d.getDate())}`;
    }
    return '';
  };
  convertSecondsToMS = (dataInSeconds) => {
    // let hour = parseInt(dataInSeconds / 3600)
    // let remainder = dataInSeconds % 3600
    let minitue = parseInt(dataInSeconds / 60)
    let seconds = parseInt(dataInSeconds) % 60
    // console.log("hour ----minitue-----seconds", minitue, seconds);
    return `${minitue}' ${seconds}"`
  }
  emptyAllError = () => {
    this.setState({
      errors: {
        siteViews: '',
        visitors: '',
        siteTransition: '',
        siteAveragePageView: '',
        siteAverageStayTime: '',
        siteSourceRoute: '',
        siteSourceReference: '',
        transitionOfVisitAndRevisit: '',
        newAndReturnVisitors: '',
        usersAge: '',
        usersSex: '',
        usersDevice: '',
        usersCountry: '',
        usersCity: '',
        ownMediaContentPageViews: '',
        ownMediaKeywordSearchConsole: ''
      }
    })
  }

  credentialsCheckYoutubeAnalyticsGoogleAnalyticsAndSearchConsole = async (checkingCriteria) => {
    return AxiosService.get(ApiService.CREDENTIALS_CHECK_YOUTUBE_ANALYTICS_GOOGLE_ANALYTICS_AND_SEARCH_CONSOLE, false)
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
          else {
            if(checkingCriteria == 'analytics'){
              errorMessage += error.response.data.message.analytics
            }
            if(checkingCriteria == 'search'){
              errorMessage += error.response.data.message.analytics + error.response.data.message.search
            }
          }
        }
        if(errorMessage !== ""){
          Toast.error(errorMessage)
        }
      })
  }

  // SITE TAB
  getSiteViews = (startDate, endDate, processedBy = 0) => {
    AxiosService.get(ApiService.OWN_MEDIA_SITE_VIEWS(startDate, endDate, processedBy), false)
      .then(result => {
        let data = result.data.data
        this.setState({
          noOfViews: {
            pageViews: data.page_views,
            noOfIncreaseOfView: data.no_of_increase_of_view,
            ratioOfIncreaseOfView: data.ratio_of_increase_of_view
          }
        })
      }).catch(error => {
        let errorMessage = error.response === undefined ? '何かがうまくいかなかった' : error.response.data.message
        this.setState({
          noOfViews: {
            pageViews: 0,
            noOfIncreaseOfView: 0,
            ratioOfIncreaseOfView: 0
          },
          errors: {
            ...this.state.errors,
            siteViews: 'ERROR: ' + errorMessage
          }
        })
        console.log('error ', error)
      })
  }

  getVisitors = (startDate, endDate, processedBy = 0) => {
    AxiosService.get(ApiService.OWN_MEDIA_SITE_VISITORS(startDate, endDate, processedBy), false)
      .then(result => {
        let data = result.data.data
        this.setState({
          noOfVisitors: {
            visitors: data.visitors,
            noOfIncreaseOfVisitor: data.no_of_increase_of_visitor,
            ratioOfIncreaseOfVisitor: data.ratio_of_increase_of_visitor
          }
        })
      }).catch(error => {
        let errorMessage = error.response === undefined ? '何かがうまくいかなかった' : error.response.data.message
        this.setState({
          errors: {
            ...this.state.errors,
            visitors: 'ERROR: ' + errorMessage
          },
          noOfVisitors: {
            visitors: 0,
            noOfIncreaseOfVisitor: 0,
            ratioOfIncreaseOfVisitor: 0
          }
        })
        console.log('error ', error)
      })
  }

  getSiteAveragePageView = (startDate, endDate, processedBy = 0) => {
    AxiosService.get(ApiService.OWN_MEDIA_AVERAGE_VIEW(startDate, endDate, processedBy), false)
      .then(result => {
        let data = result.data.data
        this.setState({
          averagePageView: {
            averagePageViews: data.average_page_views,
            noOfIncreaseOfAveragePageView: data.no_of_increase_of_average_view_page,
            ratioOfIncreaseOfAveragePageView: data.ratio_of_increase_of_average_view_page
          }
        })
      }).catch(error => {
        let errorMessage = error.response === undefined ? '何かがうまくいかなかった' : error.response.data.message
        this.setState({
          averagePageView: {
            averagePageViews: 0,
            noOfIncreaseOfAveragePageView: 0,
            ratioOfIncreaseOfAveragePageView: 0
          },
          errors: {
            ...this.state.errors,
            siteAveragePageView: 'ERROR: ' + errorMessage
          }
        })
        console.log('error ', error)
      })
  }

  getSiteAverageStayTime = (startDate, endDate, processedBy = 0) => {
    AxiosService.get(ApiService.OWN_MEDIA_AVERAGE_STAYTIME(startDate, endDate, processedBy), false)
      .then(result => {
        let data = result.data.data
        let time = data.average_stay_time ?? 0
        let inMinutes = (time && time / 60).toFixed(2)

        let [minute, second] = `${inMinutes}`.split('.')
        second = parseInt((second*60)/100)
        this.setState({
          averageStayTime: {
            minute,
            second,
            noOfIncreaseOfAverageStayTime: data.no_of_increase_of_average_stay_time,
            ratioOfIncreaseOfAverageStayTime: data.ratio_of_increase_of_average_stay_time
          }
        })
      }).catch(error => {
        let errorMessage = error.response === undefined ? '何かがうまくいかなかった' : error.response.data.message
        this.setState({
          averageStayTime: {
            minute: 0,
            second: 0,
            noOfIncreaseOfAverageStayTime: 0,
            ratioOfIncreaseOfAverageStayTime: 0
          },
          errors: {
            ...this.state.errors,
            siteAverageStayTime: 'ERROR: ' + errorMessage
          }
        })
        console.log('error ', error)
      })
  }

  getSiteTransition = (startDate, endDate, processedBy = 0) => {
    let views = AxiosService.get(ApiService.OWN_MEDIA_TRANSITION_VIEWS(startDate, endDate, processedBy), false)
    let visits = AxiosService.get(ApiService.OWN_MEDIA_TRANSITION_VISITS(startDate, endDate, processedBy), false)
    Axios.all([views, visits]).then(Axios.spread((...response) => {
      let [views, visits] = response
      let viewsData = views.data.data.transition || []
      let visitsData = visits.data.data.transition || []
      let chartData = {
        label: [],
        viewData: [],
        visitData: []
      }

      viewsData.forEach((d, index) => {
        chartData.label.push(d.date)
        chartData.viewData.push(d.page_views)
        chartData.visitData.push(visitsData[index].visits)
      })
      let data = {
        labels: chartData.label,
        datasets: [{
          label: '閲覧数',
          type: 'line',
          data: chartData.viewData,
          fill: false,
          borderColor: '#008ECD',
          backgroundColor: '#008ECD',
          pointBorderColor: '#008ECD',
          pointBackgroundColor: '#008ECD',
          pointHoverBackgroundColor: '#008ECD',
          pointHoverBorderColor: '#008ECD',
          yAxisID: 'y-axis-1',
        }, {
          type: 'line',
          label: '訪問者数',
          data: chartData.visitData,
          fill: false,
          backgroundColor: '#FF420E',
          borderColor: '#FF420E',
          hoverBackgroundColor: '#FF420E',
          hoverBorderColor: '#FF420E',
          yAxisID: 'y-axis-2',
        }]
      }
      this.setState({
        transitionOfAccess: data,
        isLoading: {
          ...this.state.isLoading,
          transition: false
        }
      })

    })).catch(error => {
      let errorMessage = error.response === undefined ? '何かがうまくいかなかった' : error.response.data.message
      this.setState({
        transitionOfAccess: [],
        isLoading: {
          ...this.state.isLoading,
          transition: false
        },
        errors: {
          ...this.state.errors,
          siteTransition: 'ERROR: ' + errorMessage
        }
      })
    })

  }

  getSiteSourceRoute = (startDate, endDate, processedBy = 0) => {
    AxiosService.get(ApiService.OWN_MEDIA_SOURCE_ROUTE(startDate, endDate, processedBy), false)
      .then(result => {
        let data = result.data.data.source_route_site

        let sourceData = {
          labels: [],
          data: []
        }

        data.forEach(d => {
          sourceData.labels.push(d.channel_grouping)
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
              data: sourceData.data
            }
          ]
        }

        this.setState({
          sourceRoute: pieData,
          isLoading: {
            ...this.state.isLoading,
            sourceRoute: false
          }
        })
      }).catch(error => {
        console.log('error ', error.response)
        let errorMessage = error.response === undefined ? '何かがうまくいかなかった' : error.response.data.message
        this.setState({
          sourceRoute: [],
          isLoading: {
            ...this.state.isLoading,
            sourceRoute: false
          },
          errors: {
            ...this.state.errors,
            siteSourceRoute: 'ERROR: ' + errorMessage
          }
        })
      })

  }

  getSiteSourceReference = (startDate, endDate, processedBy = 0, pagination = 1) => {
    AxiosService.get(ApiService.OWN_MEDIA_SOURCE_REFERENCE(startDate, endDate, processedBy, pagination), false)
      .then(result => {
        let data = result.data.data.source_reference

        this.setState({
          sourceReference: data,
          isLoading: {
            ...this.state.isLoading,
            sourceReference: false
          }
        })
      }).catch(error => {
        console.log('error ', error)
        let errorMessage = error.response === undefined ? '何かがうまくいかなかった' : error.response.data.message
        this.setState({
          sourceReference: [],
          isLoading: {
            ...this.state.isLoading,
            sourceReference: false
          },
          errors: {
            ...this.state.errors,
            siteSourceReference: 'ERROR: ' + errorMessage
          }
        })
      })
  }

  // VISITOR TAB

  getTransitionOfVisitAndRevisit = (startDate, endDate, processedBy = 0) => {
    AxiosService.get(ApiService.OWN_MEDIA_VISITOR_TRANSITION_OF_VISITOR(startDate, endDate, processedBy), false)
      .then(result => {
        let data = result.data.data.visitors
        let newUser = data.new
        let returnUser = data.returning
        let newLength, returnLength;
        newLength = newUser.length
        returnLength = returnUser.length
        let d = {
          'newUser': newUser,
          'returnUser': returnUser
        }
        let hasMoreData = newLength >= returnLength ? 'newUser' : 'returnUser'

        let transitionData = {
          labels: [],
          newUser: [],
          returnUser: []
        }
        let td = d[hasMoreData]
        let count = td.length
        for (let i = 0; i < count; i++) {
          transitionData.labels.push(td[i].date)
          if (newUser[i]) {
            transitionData.newUser.push(newUser[i].users)
          }
          if (returnUser[i]) {
            transitionData.returnUser.push(returnUser[i].users)
          }
        }

        let verticalBarData = {

          labels: transitionData.labels,
          datasets: [
            {
              label: '新規訪問数',
              backgroundColor: '#008ECD',
              borderColor: '#008ECD',
              borderWidth: 1,
              hoverBackgroundColor: '#008ECD',
              hoverBorderColor: '#008ECD',
              barThickness: 8,
              data: transitionData.newUser
            },
            {
              label: '再訪問数',
              barThickness: 8,
              backgroundColor: '#ED7D31',
              borderColor: '#ED7D31',
              borderWidth: 1,
              hoverBackgroundColor: '#ED7D31',
              hoverBorderColor: '#ED7D31',
              data: transitionData.returnUser
            }
          ]

        }

        this.setState({
          transitionOfVisit: verticalBarData,
          isLoading: {
            ...this.state.isLoading,
            transitionOfVisit: false
          }
        })
      }).catch(error => {
        let errorMessage = error.response === undefined ? '何かがうまくいかなかった' : error.response.data.message
        this.setState({
          transitionOfVisit: [],
          isLoading: {
            ...this.state.isLoading,
            transitionOfVisit: false
          },
          errors: {
            ...this.state.errors,
            transitionOfVisitAndRevisit: 'ERROR: ' + errorMessage
          }
        })
      })

  }

  getNewAndReturnVisitors = (startDate, endDate, processedBy = 0) => {
    let emptyAllObject = {
      users: 0,
      noOfIncreaseOfNewVisit: 0,
      ratioOfIncreaseOfRevisit: 0
    }
    AxiosService.get(ApiService.OWN_MEDIA_VISITORS(startDate, endDate, processedBy), false)
      .then(result => {
        let data = result.data.data.visitors
        let visitData = {
          'Returning Visitor': emptyAllObject,
          'New Visitor': emptyAllObject
        }

        data.forEach(d => {
          visitData[d.user_type].users = d.users
          visitData[d.user_type].noOfIncreaseOfNewVisit = d.no_of_increase_of_new_visit
          visitData[d.user_type].ratioOfIncreaseOfRevisit = d.ratio_of_increase_of_revisit
        })
        let visitRevisit = {
          newVisit: visitData['New Visitor'],
          reVisit: visitData['Returning Visitor']
        }
        this.setState({
          visitAndRevisit: visitRevisit
        })
      }).catch(error => {
        let errorMessage = error.response === undefined ? '何かがうまくいかなかった' : error.response.data.message
        this.setState({
          visitAndRevisit: {
            newVisit: emptyAllObject,
            reVisit: emptyAllObject
          },
          errors: {
            ...this.state.errors,
            newAndReturnVisitors: 'ERROR: ' + errorMessage
          }
        })
        console.log('error ', error)
      })
  }

  getUsersAge = (startDate, endDate, processedBy = 0) => {
    AxiosService.get(ApiService.OWN_MEDIA_VISITOR_AGE(startDate, endDate, processedBy), false)
      .then(result => {
        let data = result.data.data.visitors


        let sourceData = {
          labels: [],
          data: []
        }

        data.forEach(d => {
          sourceData.labels.push(d.age)
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
              data: sourceData.data
            }
          ]
        }

        this.setState({
          userAge: pieData,
          isLoading: {
            ...this.state.isLoading,
            age: false
          }
        })
      }).catch(error => {
        console.log('error ', error)
        let errorMessage = error.response === undefined ? '何かがうまくいかなかった' : error.response.data.message
        this.setState({
          userAge: [],
          isLoading: {
            ...this.state.isLoading,
            age: false
          },
          errors: {
            ...this.state.errors,
            usersAge: 'ERROR: ' + errorMessage
          }
        })
      })

  }
  getUsersSex = (startDate, endDate, processedBy = 0) => {
    AxiosService.get(ApiService.OWN_MEDIA_VISITOR_SEX(startDate, endDate, processedBy), false)
      .then(result => {
        let data = result.data.data.visitors


        let sourceData = {
          labels: [],
          data: []
        }

        data.forEach(d => {
          sourceData.labels.push(d.gender)
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
              data: sourceData.data
            }
          ]
        }

        this.setState({
          userSex: pieData,
          isLoading: {
            ...this.state.isLoading,
            sex: false
          }
        })
      }).catch(error => {
        console.log('error ', error)
        let errorMessage = error.response === undefined ? '何かがうまくいかなかった' : error.response.data.message
        this.setState({
          userSex: [],
          isLoading: {
            ...this.state.isLoading,
            sex: false
          },
          errors: {
            ...this.state.errors,
            usersSex: 'ERROR: ' + errorMessage
          }
        })
      })

  }

  getUsersDevice = (startDate, endDate, processedBy = 0) => {
    AxiosService.get(ApiService.OWN_MEDIA_VISITOR_DEVICE(startDate, endDate, processedBy), false)
      .then(result => {
        let data = result.data.data.visitors

        let sourceData = {
          labels: [],
          data: []
        }

        data.forEach(d => {
          sourceData.labels.push(d.device_category)
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
          userDevice: pieData,
          isLoading: {
            ...this.state.isLoading,
            device: false
          }
        })
      }).catch(error => {
        console.log('error ', error)
        let errorMessage = error.response === undefined ? '何かがうまくいかなかった' : error.response.data.message
        this.setState({
          userDevice: [],
          isLoading: {
            ...this.state.isLoading,
            device: false
          },
          errors: {
            ...this.state.errors,
            usersDevice: 'ERROR: ' + errorMessage
          }
        })
      })
  }

  getUsersCountry = (startDate, endDate, processedBy = 0, pagination = 1) => {
    AxiosService.get(ApiService.OWN_MEDIA_VISITOR_COUNTRY(startDate, endDate, processedBy, pagination), false)
      .then(result => {
        let data = result.data.data.visitors

        this.setState({
          userCountry: data,
          isLoading: {
            ...this.state.isLoading,
            country: false
          }
        })
      }).catch(error => {
        console.log('error ', error)
        let errorMessage = error.response === undefined ? '何かがうまくいかなかった' : error.response.data.message
        this.setState({
          userCountry: [],
          isLoading: {
            ...this.state.isLoading,
            country: false
          },
          errors: {
            ...this.state.errors,
            usersCountry: 'ERROR: ' + errorMessage
          }
        })
      })
  }

  getUsersCity = (startDate, endDate, processedBy = 0, pagination = 1) => {
    AxiosService.get(ApiService.OWN_MEDIA_VISITOR_CITY(startDate, endDate, processedBy, pagination), false)
      .then(result => {
        let data = result.data.data.visitors

        this.setState({
          userCity: data,
          isLoading: {
            ...this.state.isLoading,
            city: false
          }
        })
      }).catch(error => {
        console.log('error ', error)
        let errorMessage = error.response === undefined ? '何かがうまくいかなかった' : error.response.data.message
        this.setState({
          userCity: [],
          isLoading: {
            ...this.state.isLoading,
            city: false
          },
          errors: {
            ...this.state.errors,
            usersCity: 'ERROR: ' + errorMessage
          }
        })
      })
  }

  //CONTENT TAB
  getOwnMediaContentPageViews = (startDate, endDate, processedBy = 0, pagination = 1) => {
    AxiosService.get(ApiService.OWN_MEDIA_CONTENT_PAGE_VIEWS(startDate, endDate, processedBy, pagination), false)
      .then(result => {
        let data = result.data.data.pages ?? []
        this.setState({
          ownMediaContentPageViews: data,
          isLoading: {
            ...this.state.isLoading,
            ownMediaContentPageViews: false
          }
        })
      }).catch(error => {
        console.log('error ', error.response);
        let errorMessage = error.response === undefined ? '何かがうまくいかなかった' : error.response.data.message
        this.setState({
          ownMediaContentPageViews: [],
          isLoading: {
            ...this.state.isLoading,
            ownMediaContentPageViews: false
          },
          errors: {
            ...this.state.errors,
            ownMediaContentPageViews: 'ERROR: ' + errorMessage
          }
        })
      })
  }

  getOwnMediaKeywordSearchConsole = (startDate, endDate, processedBy = 1, pagination = 1) => {
    AxiosService.get(ApiService.OWN_MEDIA_KEYWORD_SEARCH_CONSOLE(startDate, endDate, processedBy, pagination), false)
      .then(result => {
        let data = result.data.data.search ?? []
        this.setState({
          ownMediaKeywordSearchConsole: data,
          isLoading: {
            ...this.state.isLoading,
            ownMediaKeywordSearchConsole: false
          }
        })
      }).catch(error => {
        console.log('error ', error);
        let errorMessage = error.response === undefined ? '何かがうまくいかなかった' : error.response.data.message
        this.setState({
          ownMediaKeywordSearchConsole: [],
          isLoading: {
            ...this.state.isLoading,
            ownMediaKeywordSearchConsole: false
          },
          errors: {
            ...this.state.errors,
            ownMediaKeywordSearchConsole: 'ERROR: ' + errorMessage
          }
        })
      })
  }

  filterByDate = (minDate, maxDate) => {
    let startDate = moment(minDate == null ? undefined : minDate).format('YYYY-MM-DD')
    let endDate = moment(maxDate == null ? undefined : maxDate).format('YYYY-MM-DD')
    let { activeTab1, activeTab2, activeTab3 } = this.state
    Toast.clear()
    this.emptyAllError()
    this.setState({
      ownMediaKeywordSearchConsolePagination: 1,
      ownMediaContentPageViewsPagination: 1,
      startDate: startDate,
      endDate: endDate,
      processedBy: 1,
      isLoading: {
        transition: true,
        transitionOfVisit: true,
        sourceRoute: true,
        sourceReference: true,
        age: true,
        sex: true,
        device: true,
        country: true,
        city: true,
        ownMediaContentPageViews: true,
        ownMediaKeywordSearchConsole: true
      }
    })
    if (activeTab1) {
      this.tabOneApi(startDate, endDate, 1)
    }
    else if (activeTab2) {
      this.tabTwoApi(startDate, endDate, 1)
    }
    else if (activeTab3) {
      this.tabThreeApi(startDate, endDate, 1)
    }
  }

  showAllSourceReference = () => {
    let { startDate, endDate, processedBy } = this.state
    this.getSiteSourceReference(startDate, endDate, processedBy, 0)
  }

  showAllCountry = () => {
    let { startDate, endDate, processedBy } = this.state
    this.getUsersCountry(startDate, endDate, processedBy, 0)
  }

  showAllCity = () => {
    let { startDate, endDate, processedBy } = this.state
    this.getUsersCity(startDate, endDate, processedBy, 0)
  }

  showAllOwnMediaContentPageViews = () => {
    let { startDate, endDate, processedBy } = this.state
    this.setState({
      ownMediaContentPageViewsPagination: 0,
    })
    this.getOwnMediaContentPageViews(startDate, endDate, processedBy, 0)
  }
  showAllOwnMediaKeywordSearchConsole = () => {
    let { startDate, endDate, processedBy } = this.state
    this.setState({
      ownMediaKeywordSearchConsolePagination: 0
    })
    this.getOwnMediaKeywordSearchConsole(startDate, endDate, processedBy, 0)
  }
  ownMediaContentPageViewsSorting = (column) => {
    let { ownMediaContentPageViews, ownMediaContentPageViewsSorting } = this.state;
    ownMediaContentPageViews.sort((a, b) => {
      let asc = a[column] - b[column]
      return this.state.ownMediaContentPageViewsSorting[column] ? asc : asc * -1;
    })
    this.setState({
      ownMediaContentPageViews: ownMediaContentPageViews,
      ownMediaContentPageViewsSorting: {
        views: true,
        users: true,
        average_stay_time: true,
        [column]: !ownMediaContentPageViewsSorting[column]
      }
    })
  }
  ownMediaKeywordSearchConsoleSorting = (column) => {
    let { ownMediaKeywordSearchConsole, ownMediaKeywordSearchConsoleSorting } = this.state;
    ownMediaKeywordSearchConsole.sort((a, b) => {
      let asc = a[column] - b[column]
      return this.state.ownMediaKeywordSearchConsoleSorting[column] ? asc : asc * -1;
    })
    this.setState({
      ownMediaKeywordSearchConsole: ownMediaKeywordSearchConsole,
      ownMediaKeywordSearchConsoleSorting: {
        clicks: true,
        displays: true,
        search_rank: true,
        [column]: !ownMediaKeywordSearchConsoleSorting[column]
      }
    })
  }

  tabOneApi = (startDate, endDate, processedBy=0) => {
    //SITE TAB
    this.credentialsCheckYoutubeAnalyticsGoogleAnalyticsAndSearchConsole('analytics')
    // GET NO OF VIEW
    this.getSiteViews(startDate, endDate, processedBy)
    // GE NO OF VISITORS
    this.getVisitors(startDate, endDate, processedBy)
    // GET TRANSITION VIEWS AND VISITS
    this.getSiteTransition(startDate, endDate, processedBy)
    // GET AVERAGE PAGE VIEW
    this.getSiteAveragePageView(startDate, endDate, processedBy)
    // GET AVERAGE STAY TIME
    this.getSiteAverageStayTime(startDate, endDate, processedBy)
    // GET SOURCE ROUTE
    this.getSiteSourceRoute(startDate, endDate, processedBy)
    // GET SOURCE REFERENCE
    this.getSiteSourceReference(startDate, endDate, processedBy)
  }
  tabTwoApi = (startDate, endDate, processedBy = 0, pagination = 1) => {
    // VISITORS TAB
    this.credentialsCheckYoutubeAnalyticsGoogleAnalyticsAndSearchConsole('analytics')
    // GET NEW AND RETURN VISITOR
    this.getNewAndReturnVisitors(startDate, endDate, processedBy)
    //  TRANSITION OF VISIT AND REVISIT
    this.getTransitionOfVisitAndRevisit(startDate, endDate, processedBy)
    //  GET USERS AGE
    this.getUsersAge(startDate, endDate, processedBy)
    //  GET USERS SEX
    this.getUsersSex(startDate, endDate, processedBy)
    //  GET USERS DEVICE
    this.getUsersDevice(startDate, endDate, processedBy)
    //  GET USERS SEX
    // GET USERS COUNTRY
    this.getUsersCountry(startDate, endDate, processedBy)
    // GET USERS CITY
    this.getUsersCity(startDate, endDate, processedBy)
  }
  tabThreeApi = (startDate, endDate, processedBy = 0, pagination = 1) => {
    // CONTENT TAB
    this.credentialsCheckYoutubeAnalyticsGoogleAnalyticsAndSearchConsole('search')
    // GET CONTENT VIEWS
    this.getOwnMediaContentPageViews(startDate, endDate, processedBy)
    // GET KEYWORD SEARCH CONSOLE DATA
    this.getOwnMediaKeywordSearchConsole(startDate, endDate, processedBy, 1)
    // this.getOwnMediaKeywordSearchConsole("2019-11-31", endDate, processedBy)
  }
  componentDidMount() {
    let startDate = this.formatDate(this.get31DaysBeforeFromToday())
    let endDate = this.formatDate(new Date(new Date().setDate(new Date().getDate() - 1)))
    this.emptyAllError()
    this.setState({
      startDate,
      endDate,
    })
    this.tabOneApi(startDate, endDate)
  }
  render() {
    const breadcrumbs = [
      {
        title: statisticsModtranslator('STATISTICS.OWNMEDIA.PAGE_TITLE_1'),
        link: '#'
      },
      {
        title: statisticsModtranslator('STATISTICS.OWNMEDIA.PAGE_TITLE_2'),
        link: '',
        active: true
      }
    ];
    const {
      activeTab1,
      activeTab2,
      activeTab3,
      noOfViews,
      noOfVisitors,
      transitionOfAccess,
      transitionOfVisit,
      sourceRoute,
      sourceReference,
      averagePageView,
      averageStayTime,
      visitAndRevisit,
      userAge,
      userDevice,
      userSex,
      userCity,
      ownMediaContentPageViews, ownMediaContentPageViewsSorting, ownMediaContentPageViewsPagination,
      ownMediaKeywordSearchConsole, ownMediaKeywordSearchConsolePagination, ownMediaKeywordSearchConsoleSorting,
      userCountry,
      isLoading,
      errors
    } = this.state;
    return (
      <StatisticsContainer>
        <div className="statistics-container">
          <Toast />
          <NcBreadcrumbs breadcrumbs={breadcrumbs} />
          <TopTitleComponent title="オウンドメディア" sendDate={this.filterByDate} />
          <div className="tab-button-block">
            <button
              type="button"
              className={activeTab1 ? 'active' : ''}
              onClick={() => this.onTabChange('activeTab1')}
            >
              サイト
            </button>
            <button
              type="button"
              className={activeTab2 ? 'active' : ''}
              onClick={() => this.onTabChange('activeTab2')}
            >
              訪問者
            </button>
            <button
              type="button"
              className={activeTab3 ? 'active' : ''}
              onClick={() => this.onTabChange('activeTab3')}
            >
              コンテンツ
            </button>
          </div>
          <div
            className={`statistics-container-block ${activeTab1 ? 'active' : ''}`}
          >
            <div className="statistics-top-block">
              <div className="left-block">
                <div className="view-block">
                  <StatisticsBlock title="閲覧数">
                    {
                      errors.siteViews != '' ? <div className="statistics-error">{errors.siteViews}</div> :
                        <>
                          <p className="pv-digit">
                            {
                              noOfViews.pageViews ? <>{noOfViews.pageViews}<span>pv</span></> : ''
                            }
                          </p>
                          <p className={`digit ${noOfViews.noOfIncreaseOfView < 0 ? 'red' : ''}`}>
                            {noOfViews.noOfIncreaseOfView > 0 ? '+' : ''}
                            {noOfViews.noOfIncreaseOfView}&nbsp;&nbsp;
                      <span>(
                        {noOfViews.noOfIncreaseOfView > 0 ? '+' : ''}
                              {Math.round(noOfViews.ratioOfIncreaseOfView * 10) / 10}%
                        )</span>
                          </p>
                        </>
                    }
                  </StatisticsBlock>
                </div>
                <div className="visitors-block">
                  <StatisticsBlock title="訪問者数">
                    {
                      errors.visitors != '' ? <div className="statistics-error">{errors.visitors}</div> :
                        <>
                          <p className="pv-digit">
                            {
                              noOfVisitors ? <> {noOfVisitors.visitors}<span>人</span></> : ''
                            }
                          </p>
                          <p className={`digit ${noOfVisitors.noOfIncreaseOfVisitor < 0 ? 'red' : ''}`}>
                            {noOfVisitors.noOfIncreaseOfVisitor > 0 ? '+' : ''}
                            {noOfVisitors.noOfIncreaseOfVisitor}&nbsp;&nbsp;
                      <span>(
                        {noOfVisitors.noOfIncreaseOfVisitor > 0 ? '+' : ''}
                              {Math.round(noOfVisitors.ratioOfIncreaseOfVisitor * 10) / 10}%
                        )</span>
                          </p>
                        </>
                    }
                  </StatisticsBlock>
                </div>
                <div className="view-page-block">
                  <StatisticsBlock title="平均閲覧ページ">
                    {
                      errors.siteAveragePageView != '' ? <div className="statistics-error">{errors.siteAveragePageView}</div> :
                        <>
                          <p className="pv-digit font-12">
                            {
                              averagePageView.averagePageViews ? <> {averagePageView.averagePageViews.toFixed(2)}<span>ページ</span> </> : ''
                            }
                          </p>
                          <p className={`digit ${averagePageView.noOfIncreaseOfAveragePageView < 0 ? 'red' : ''}`}>
                            {averagePageView.noOfIncreaseOfAveragePageView > 0 ? '+' : ''}
                            {Math.round(averagePageView.noOfIncreaseOfAveragePageView * 10) / 10}&nbsp;&nbsp;
                      <span>(
                        {averagePageView.noOfIncreaseOfAveragePageView > 0 ? '+' : ''}
                              {Math.round(averagePageView.ratioOfIncreaseOfAveragePageView * 10) / 10}%
                        )</span>
                          </p>
                        </>
                    }
                  </StatisticsBlock>
                </div>
                <div className="stay-time-block">
                  <StatisticsBlock title="平均滞在時間">
                    {
                      errors.siteAverageStayTime != '' ? <div className="statistics-error">{errors.siteAverageStayTime}</div> :
                        <>
                          <p className="pv-digit font-12">
                            {
                              averageStayTime.minute ? <> {averageStayTime.minute}<span>分 </span>
                                {averageStayTime.second}<span>秒</span> </> : ''
                            }
                          </p>
                          <p className={`digit ${averageStayTime.noOfIncreaseOfAverageStayTime < 0 ? 'red' : ''}`}>
                            {averageStayTime.noOfIncreaseOfAverageStayTime > 0 ? '+' : ''}
                            {Math.round(averageStayTime.noOfIncreaseOfAverageStayTime * 10) / 10}&nbsp;&nbsp;
                        <span>(
                          {averageStayTime.noOfIncreaseOfAverageStayTime > 0 ? '+' : ''}
                              {Math.round(averageStayTime.ratioOfIncreaseOfAverageStayTime * 10) / 10}%
                          )</span>
                          </p>
                        </>
                    }
                  </StatisticsBlock>
                </div>
              </div>
              <div className="right-block">
                <StatisticsBlock title="アクセス推移">
                  {
                    errors.siteTransition !== '' ? <div className="statistics-error">{errors.siteTransition}</div> :
                      isLoading.transition ? <Loader /> : <MultiAxisLine data={transitionOfAccess} />
                  }
                </StatisticsBlock>
              </div>
            </div>
            <div className="statistics-bottom-block">
              <div className="left-block">
                <StatisticsBlock title="サイト訪問経路">
                  {
                    errors.siteSourceRoute !== '' ? <div className="statistics-error">{errors.siteSourceRoute}</div> :
                      isLoading.sourceRoute ? <Loader /> : <Pie data={sourceRoute} />
                  }
                </StatisticsBlock>
              </div>
              <div className="right-block">
                <StatisticsBlock title="参照元">
                  {
                    errors.siteSourceReference !== '' ? <div className="statistics-error">{errors.siteSourceReference}</div> :
                      isLoading.sourceReference ? <Loader /> :
                        <NcHorizontalStackedBar
                          fieldName="reference"
                          increaseFieldName="no_of_increase_of_source_of_reference"
                          ratioOfIncreaseFieldName="ratio_of_increase_of_source_of_reference"
                          showAll={this.showAllSourceReference}
                          data={sourceReference}
                        />
                  }

                </StatisticsBlock>
              </div>
            </div>
          </div>
          {/* TAB 2 */}
          <div
            className={`statistics-container-block tab2 ${
              activeTab2 ? 'active' : ''
              }`}
          >
            <div className="statistics-top-block">
              <div className="left-block">
                <div className="view-block">
                  <StatisticsBlock title="新規訪問数">
                    {
                      errors.newAndReturnVisitors !== '' ? <div className="statistics-error">{errors.newAndReturnVisitors}</div> :
                        <>
                          <p className="pv-digit">
                            {
                              visitAndRevisit.newVisit.users ? <> {visitAndRevisit.newVisit.users}
                                <span>回</span> </> : ''
                            }

                          </p>
                          <p className={`digit ${visitAndRevisit.newVisit.noOfIncreaseOfNewVisit < 0 ? 'red' : ''}`}>
                            {visitAndRevisit.newVisit.noOfIncreaseOfNewVisit > 0 ? '+' : ''}
                            {visitAndRevisit.newVisit.noOfIncreaseOfNewVisit}&nbsp;&nbsp;
                      <span>(
                        {visitAndRevisit.newVisit.noOfIncreaseOfNewVisit > 0 ? '+' : ''}
                              {Math.round(visitAndRevisit.newVisit.ratioOfIncreaseOfRevisit * 10) / 10}%
                        )</span>
                          </p>
                        </>
                    }
                  </StatisticsBlock>
                </div>
                <div className="visitors-block">
                  <StatisticsBlock title="再訪問数">
                    {
                      errors.newAndReturnVisitors !== '' ? <div className="statistics-error">{errors.newAndReturnVisitors}</div> :
                        <>
                          <p className="pv-digit">
                            {
                              visitAndRevisit.reVisit.users ? <> {visitAndRevisit.reVisit.users}<span>回</span></> : ''
                            }
                          </p>
                          <p className={`digit ${visitAndRevisit.reVisit.noOfIncreaseOfNewVisit < 0 ? 'red' : ''}`}>
                            {visitAndRevisit.reVisit.noOfIncreaseOfNewVisit > 0 ? '+' : ''}
                            {visitAndRevisit.reVisit.noOfIncreaseOfNewVisit}&nbsp;&nbsp;
                      <span>(
                        {visitAndRevisit.reVisit.noOfIncreaseOfNewVisit > 0 ? '+' : ''}
                              {Math.round(visitAndRevisit.reVisit.ratioOfIncreaseOfRevisit * 10) / 10}%
                        )</span>
                          </p>
                        </>
                    }
                  </StatisticsBlock>
                </div>
              </div>
              <div className="right-block">
                <StatisticsBlock title="訪問数推移">
                  {
                    errors.transitionOfVisitAndRevisit !== '' ? <div className="statistics-error">{errors.transitionOfVisitAndRevisit}</div> :
                    isLoading.transitionOfVisit ? <Loader /> : <VerticalStackedBar data={transitionOfVisit} />
                  }
                </StatisticsBlock>
              </div>
            </div>
            <div className="statistics-middle-block">
              <div className="left-block">
                <StatisticsBlock title="性別">
                  {
                    errors.usersAge !== '' ? <div className="statistics-error">{errors.usersAge}</div> :
                    isLoading.age ? <Loader /> : <Pie data={userAge} />
                  }
                </StatisticsBlock>
              </div>
              <div className="middle-block">
                <StatisticsBlock title="年齢">
                  {
                    errors.usersSex !== '' ? <div className="statistics-error">{errors.usersSex}</div> :
                    isLoading.sex ? <Loader /> : <Pie data={userSex} />
                  }
                </StatisticsBlock>
              </div>
              <div className="right-block">
                <StatisticsBlock title="デバイス">
                  {
                    errors.usersDevice !== '' ? <div className="statistics-error">{errors.usersDevice}</div> :
                    isLoading.device ? <Loader /> : <Pie data={userDevice} />
                  }
                </StatisticsBlock>
              </div>
            </div>
            <div className="statistics-bottom-block">
              <div className="left-block">
                <StatisticsBlock title="国">
                  {
                    errors.usersCountry !== '' ? <div className="statistics-error">{errors.usersCountry}</div> :
                    isLoading.country ? <Loader /> :
                      <NcHorizontalStackedBar
                        className="country"
                        fieldName="country"
                        increaseFieldName="no_of_increase_of_visitors_country"
                        ratioOfIncreaseFieldName="ratio_of_increase_of_visitors_country"
                        showAll={this.showAllCountry}
                        data={userCountry}
                      />
                  }
                </StatisticsBlock>
              </div>
              <div className="right-block">
                <StatisticsBlock title="市町村">
                  {
                    errors.usersCity !== '' ? <div className="statistics-error">{errors.usersCity}</div> :
                    isLoading.city ? <Loader /> :
                      <NcHorizontalStackedBar
                        className="city"
                        fieldName="city"
                        increaseFieldName="no_of_increase_of_visitors_city"
                        ratioOfIncreaseFieldName="ratio_of_increase_of_visitors_city"
                        showAll={this.showAllCity}
                        data={userCity}
                      />
                  }
                </StatisticsBlock>
              </div>
            </div>
          </div>
          <div
            className={`statistics-container-block tab3 ${
              activeTab3 ? 'active' : ''
              }`}
          >
            <div className="statistics-top-block">
              <div className="page-block">
                <StatisticsBlock title="ページ">
                  {
                    errors.ownMediaContentPageViews !== '' ? <div className="statistics-error">{errors.ownMediaContentPageViews}</div> :
                    isLoading.ownMediaContentPageViews ? <Loader /> :
                      <>
                        <div className="header-block">
                          <div className="title">タイトル</div>
                          <div className={`view ${ownMediaContentPageViewsSorting.views ? '' : 'rotate'}`} onClick={() => this.ownMediaContentPageViewsSorting("views")}>閲覧数 <ChevronDownOutline /></div>
                          <div className={`visitor ${ownMediaContentPageViewsSorting.users ? '' : 'rotate'}`} onClick={() => this.ownMediaContentPageViewsSorting("users")}>訪問者数 <ChevronDownOutline /></div>
                          <div className={`time ${ownMediaContentPageViewsSorting.average_stay_time ? '' : 'rotate'}`} onClick={() => this.ownMediaContentPageViewsSorting("average_stay_time")}>平均滞在時間 <ChevronDownOutline /></div>
                        </div>
                        <div className="body-block">
                          {
                            ownMediaContentPageViews.map((row, index) => {
                              return (
                                <div className="block" key={index}>
                                  <div className="title">
                                    <p>{row.title}</p>
                                  </div>
                                  <div className="view">
                                    {row.views}
                                    <span className={`${row.no_of_increase_of_page_views < 0 ? 'red' : ''}`}>
                                      {row.no_of_increase_of_page_views > 0 ? '+' : ''}
                                      {row.no_of_increase_of_page_views}{' '}
                                      ({row.no_of_increase_of_page_views > 0 ? '+' : ''}
                                      {Math.round(row.ratio_of_increase_of_page_views * 10) / 10}%)
                                      </span>
                                  </div>
                                  <div className="visitor">
                                    {row.users}
                                    <span className={`${row.no_of_increase_of_page_visitors < 0 ? 'red' : ''}`}>
                                      {row.no_of_increase_of_page_visitors > 0 ? '+' : ''}
                                      {row.no_of_increase_of_page_visitors}{' '}
                                      ({row.no_of_increase_of_page_visitors > 0 ? '+' : ''}
                                      {Math.round(row.ratio_of_increase_of_page_visitors * 10) / 10}%)
                                      </span>
                                  </div>
                                  <div className="time">
                                    {this.convertSecondsToMS(row.average_stay_time)}
                                    <span className={`${row.no_of_increase_of_page_avg_stay_time < 0 ? 'red' : ''}`}>
                                      {row.no_of_increase_of_page_avg_stay_time > 0 ? '+' : ''}{' '}
                                      {Math.round(row.no_of_increase_of_page_avg_stay_time * 10) / 10}
                                      ({row.no_of_increase_of_page_avg_stay_time > 0 ? '+' : ''}
                                      {Math.round(row.ratio_of_increase_of_page_avg_stay_time * 10) / 10}%)
                                      </span>
                                  </div>
                                </div>
                              )
                            })
                          }
                          {/* <div className="block">
                      <div className="title">
                        浅田舞、前髪を作ったイメチェン＆スリットから美脚を披露し「かわいすぎる！」「前髪！」の声
                      </div>
                      <div className="view">
                        1212 <span>+50 (+5.3%)</span>
                      </div>
                      <div className="visitor">
                        900 <span>+50 (+5.3%)</span>
                      </div>
                      <div className="time">
                        5'14" <span>+50 (+5.3%)</span>
                      </div>
                    </div> */}
                        </div>
                        {
                          ownMediaContentPageViewsPagination ? <div className="button-block">
                            <NcButton className="submit-date" callback={() => this.showAllOwnMediaContentPageViews()}>すべて表示する</NcButton>
                          </div> : ''
                        }
                      </>
                  }
                </StatisticsBlock>
              </div>
            </div>
            <div className="statistics-bottom-block">
              <div className="keyword-block">
                <StatisticsBlock title="検索キーワード">
                  {
                    errors.ownMediaKeywordSearchConsole !== '' ? <div className="statistics-error">{errors.ownMediaKeywordSearchConsole}</div> :
                    isLoading.ownMediaKeywordSearchConsole ? <Loader /> :
                      <>
                        <div className="header-block">
                          <div className="title">キーワード</div>
                          <div className={`view ${ownMediaKeywordSearchConsoleSorting.clicks ? '' : 'rotate'}`} onClick={() => this.ownMediaKeywordSearchConsoleSorting("clicks")}>クリック数 <ChevronDownOutline /></div>
                          <div className={`visitor ${ownMediaKeywordSearchConsoleSorting.displays ? '' : 'rotate'}`} onClick={() => this.ownMediaKeywordSearchConsoleSorting("displays")}>表示数 <ChevronDownOutline /></div>
                          <div className={`time ${ownMediaKeywordSearchConsoleSorting.search_rank ? '' : 'rotate'}`} onClick={() => this.ownMediaKeywordSearchConsoleSorting("search_rank")}>検索順位 <ChevronDownOutline /></div>
                        </div>
                        <div className="body-block">
                          {
                            ownMediaKeywordSearchConsole.map((row, index) => {
                              return (
                                <div className="block" key={index}>
                                  <div className="title">{row.keywords}</div>
                                  <div className="view">
                                    {row.clicks}
                                    <span className={`${row.no_of_increase_of_clicks < 0 ? 'red' : ''}`}>
                                      {row.no_of_increase_of_clicks > 0 ? '+' : ''}
                                      {row.no_of_increase_of_clicks}{' '}
                                      ({row.no_of_increase_of_clicks > 0 ? '+' : ''}
                                      {Math.round(row.ratio_of_increase_of_clicks * 10) / 10}%)
                                    </span>
                                  </div>
                                  <div className="visitor">
                                    {row.displays}
                                    <span className={`${row.no_of_increase_of_displays < 0 ? 'red' : ''}`}>
                                      {row.no_of_increase_of_displays > 0 ? '+' : ''}
                                      {row.no_of_increase_of_displays}{' '}
                                      ({row.no_of_increase_of_displays > 0 ? '+' : ''}
                                      {Math.round(row.ratio_of_increase_of_displays * 10) / 10}%)
                                    </span>
                                  </div>
                                  <div className="time">
                                    {row.search_rank}
                                    <span className={`${row.no_of_increase_of_page_avg_search_rank < 0 ? 'red' : ''}`}>
                                      {row.no_of_increase_of_page_avg_search_rank > 0 ? '+' : ''}
                                      {row.no_of_increase_of_page_avg_search_rank}{' '}
                                      ({row.no_of_increase_of_page_avg_search_rank > 0 ? '+' : ''}
                                      {Math.round(row.ratio_of_increase_of_page_avg_search_rank * 10) / 10}%)
                                    </span>
                                  </div>
                                </div>
                              )
                            })
                          }
                          {/* <div className="block">
                      <div className="title">しめじ</div>
                      <div className="view">
                        1212 <span>+50 (+5.3%)</span>
                      </div>
                      <div className="visitor">
                        900 <span>+50 (+5.3%)</span>
                      </div>
                      <div className="time">
                        1 <span>+50 (+5.3%)</span>
                      </div>
                    </div> */}
                        </div>
                        {
                          ownMediaKeywordSearchConsolePagination ?
                            <div className="button-block">
                              <NcButton className="submit-date" callback={() => this.showAllOwnMediaKeywordSearchConsole()}>すべて表示する</NcButton>
                            </div> : ''
                        }
                      </>
                  }</StatisticsBlock>
              </div>
            </div>
          </div>
        </div>
      </StatisticsContainer>
    );
  }
}
export default withRouter(StatisticsOwnMedia)