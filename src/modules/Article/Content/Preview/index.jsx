import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {zeroPadding} from '../../../../helper'
import moment from 'moment';
import ReactHtmlParser from 'react-html-parser';
import DefaultLayout from '../../../../containers/DefaultLayout';
import './preview.scss';

class Statistics extends Component {
  constructor() {
    super();
    this.d = new Date()
    this.date = `${this.d.getFullYear()}-${zeroPadding(this.d.getMonth() + 1)}-${zeroPadding(this.d.getDate())}`
    this.state = {
      articlePreviewData: null
    }
  }

    formatDateSafari = (date, formatter = '-') => {
      date = date && date.toString()
      if (Date.parse(date && date.replace(/-/g, '/'))) {
      let d = new Date(date.replace(/-/g, '/'));
      return `${d.getFullYear()}${formatter}${zeroPadding(
      d.getMonth() + 1
      )}${formatter}${zeroPadding(d.getDate())}`;
      }
      return '';
      };
    
    componentDidMount () {


      let article = localStorage.articleData && JSON.parse(localStorage.getItem("articleData"))
      let articleDate = localStorage.getItem("articleDate")
      article.date = articleDate 
      this.setState({
        articlePreviewData : article
      })
    }


  render() {
    let {articlePreviewData} = this.state;
    let selectedCat = articlePreviewData && articlePreviewData.editTab && articlePreviewData.editTab.category
    return (
      <DefaultLayout>
        <div className="article-preview-page">
          <div className="date-area">
          <time>
              {
              articlePreviewData &&  articlePreviewData.date ? this.formatDateSafari(articlePreviewData.date, '.'): this.formatDateSafari(this.date, '.')}
            </time>
          </div>
          <div className="tags">
            {
              selectedCat && selectedCat.map((item, index) => (
                <span key={'category' + item.label}> {item.label}</span>
              ))}
          </div>
          <h1 className="title">
            {articlePreviewData && articlePreviewData.articleTitle}
          </h1>
          <div className="description">
            {articlePreviewData &&
              ReactHtmlParser(articlePreviewData.articleContent)}
          </div>
        </div>
      </DefaultLayout>
    );
  }
}

function mapStateToProps(state) {
  return {
    articlePreviewData: state.commonReducer.articlePreviewData
  };
}
function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Statistics));
