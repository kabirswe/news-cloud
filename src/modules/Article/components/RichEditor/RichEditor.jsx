import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import draftToHtml from 'draftjs-to-html';
import deepEqual from 'deep-equal'
import {Editor} from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import {EditorState, convertToRaw, convertFromRaw, Entity} from 'draft-js';
// import {ImageSharp} from '../../mod-assets/svgComp'
import ImageSharp from '../../mod-assets/svg/image-sharp.svg';
import DefaultLayout from '../../../../containers/DefaultLayout';
import './scss/richEditor.scss';
import VideoPicker from './VideoPicker';
import Preview from './Preview'
import Link from './Link'

import AxiosServices from '../../../../networks/AxiosService';
import ApiServices from '../../../../networks/ApiServices';
import {editorContentAsText} from '../../../../helper'
class RichEditor extends Component {
  constructor(props) {
    super(props);
    this.editor = React.createRef()
    this.uploadImageCallBack = this.uploadImageCallBack.bind(this);
    this.state = {
      contentState: null,
      editorState: EditorState.createEmpty()
    };
  }
  onEditorStateChange = (editorState) => {
    if (this.props.disabled) {
      return;
    }
    
    const contentState = editorState.getCurrentContent();

    this.setState({
      contentState,
      editorState
    });
   
    this.props.getEditorContent(contentState, editorState);
  };
   uploadImageCallBack(file) {
     return this.uploadToS3(file).then(url => {
      return {
        data: {link: url}
      }
    })
  }
  uploadToS3 = (file) => {
    let formData = new FormData();
    let {articleId} = this.props
    formData.append('images[]', file);
    if (articleId) {
      formData.append('articleId', articleId)
    }
    return AxiosServices.post(ApiServices.UPLOAD_IMAGE, formData, false, true)
      .then((result) => {
        let data = result.data.data;
        let url = `${data.file_url}${data.list &&
          data.list[0]}`;
        return url;
      })
      .catch((error) => {
 
      });
  };

makeEmbedLink = (text) => {
    let link =  text.replace("watch?v=", 'embed/')
    return link
}

extractFromIframe = (text) => {
    let extractSrcRegex = /src="(.*?)"/g;
    let [src] = text.match(extractSrcRegex)
    let extractLink = /"(.*?)"/g
    let [link] = src.match(extractLink)
    return link && link.replace('"','').replace('"','')
}

  embedCallback = (url) => {
    let modifiedLink = ''

    if (url.startsWith('<iframe')) {
       return modifiedLink = this.extractFromIframe(url)
      
    }
    if (url.includes('watch?v=')) {
       return modifiedLink = this.makeEmbedLink(url)
    }

    return url
  }


  render() {
    let {isImageVideoOff,articlePreviewContent, GenLink, isMailPosting} = this.props;
    let imageSetting = isImageVideoOff
      ? {icon: undefined}
      : {
        icon: '/assets/img/image.png',
        uploadCallback: this.uploadImageCallBack,
        previewImage: true
      };

    return (
      <>
       <Editor
                toolbarClassName="nkRichEditorToolbar"
                wrapperClassName="nkRichEditorWrapper"
                editorClassName="nkRichEditor"
                toolbarCustomButtons={isImageVideoOff ? [<Link isMailPosting={isMailPosting} url={this.props.url} />] : [<VideoPicker articleId={this.props.articleId} />, <Preview  editorState={this.props.editorState || this.state.editorState}  article={this.props.article} isDisabled={this.props.previewEnabled} articlePreviewContent={articlePreviewContent}/>]}
                toolbar={{
                  options: isImageVideoOff ? ['inline',, 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker',   'remove', 'history'] :  ['inline',, 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link',   'remove', 'history','embedded','image',],
                   inline: {
                    options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'],
                    bold: { className: 'bordered-option-classname' },
                    italic: { className: 'bordered-option-classname' },
                    underline: { className: 'bordered-option-classname' },
                    strikethrough: { className: 'bordered-option-classname' },
                    code: { className: 'bordered-option-classname' },
                  },
                  fontFamily: {
                    options: ["ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro","Osaka", "メイリオ", "Meiryo", "ＭＳ Ｐゴシック", "MS PGothic",'Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana'],
                  
                  },
                  list: { inDropdown: true },
                  textAlign: { inDropdown: true },
                  link: { inDropdown: true },
                  history: { inDropdown: true },
                  image: imageSetting,
                  embedded: {
                    embedCallback: this.embedCallback,
                  },
                }}
                name="editor"
                editorState={this.props.editorState || this.state.editorState}
                onEditorStateChange={this.onEditorStateChange}
                ref={this.props.refs}
              />
      </>
    );
  }
}
function mapStateToProps(state) {
  return {
    lang: state.commonReducer.lang
  };
}
export default withRouter(connect(mapStateToProps)(RichEditor));
