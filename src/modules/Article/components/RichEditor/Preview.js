import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom'
import PropTypes from 'prop-types';
import moment, { utc } from 'moment';
import {editorContentAsText, zeroPadding} from '../../../../helper'
import {setPreviewArticleData} from '../../../../redux/actions/common';
import {Browsers} from "../../mod-assets/svgComp"
import  path from '../../../../routes/path';
class Preview extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    editorState: PropTypes.object
  };
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false
    };
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
  
  openArticlePreview(){
    if (this.props.isDisabled) {
      return
    }
    let article = this.props.article
    let articleTitle = article.title.trim();
    article.articleTitle = articleTitle
    article.date = article.startDate;
    let {html, text} = editorContentAsText(this.props.editorState);
    article.articleContent = html;
   
    // this.props.setPreviewArticleData(article)
  
    localStorage.setItem("articleData", JSON.stringify(article))
    localStorage.setItem("articleDate", article.startDate)
  
    if(articleTitle && article.articleContent){
     
      // this.props.history.push(path.contentPreview)
      
      window.open(path.contentPreview, '_blank');
    }
  }
  render() {
    let {isDisabled} = this.props
    return (
      <div onClick={() => this.openArticlePreview()}>
        <div className={isDisabled ? "rdw-option-wrapper disabledBtn" : "rdw-option-wrapper"}>
          <Browsers fill="#2f2f2f" height="20" width="20" />
        </div>
        
      </div>
    );
  }
}
function mapDispatchToProps(dispatch) {
  return {
    setPreviewArticleData: (data) => dispatch(setPreviewArticleData(data)),
  };
}


export default connect(null, mapDispatchToProps)(withRouter(Preview));