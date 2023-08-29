import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FolderOpen, VideocamSharp} from '../../../../assets/svgComp';
import ModalVideos from './ModalVideos';
import {AtomicBlockUtils} from 'draft-js';
import AxiosService from '../../../../networks/AxiosService'
import ApiService from '../../../../networks/ApiServices'
export default class VideoPicker extends Component {
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
  // borrowed from
  // https://github.com/jpuri/react-draft-wysiwyg/blob/master/src/controls/Embedded/index.js
  addEmbededVideo = (embeddedLink, height, width, videoId) => {
    const {editorState, onChange, articleId} = this.props;
    const src = embeddedLink;
    const entityKey = editorState
      .getCurrentContent()
      .createEntity('EMBEDDED_LINK', 'MUTABLE', {src, height, width})
      .getLastCreatedEntityKey();
    const newEditorState = AtomicBlockUtils.insertAtomicBlock(
      editorState,
      entityKey,
      ' '
    );
    onChange(newEditorState);
    // api for event logging
    AxiosService.get(ApiService.VIDEO_TRACKING_FOR_LOGGER(videoId, articleId), false)
    .then(result => {}).catch(error => {
      console.log('error', error)
    })
  };
  openVideosModal = () => {
    this.setState({modalOpen: true});
  };
  clearModalStatus = () => {
    this.setState({modalOpen: false});
  };
  addVideoToContent = (videoUrl, videoId) => {
    this.addEmbededVideo(videoUrl, '200', '200', videoId);
    // this.clearModalStatus()
  };
  render() {
    return (
      <div onClick={this.openVideosModal}>
        <div className="rdw-option-wrapper">
          <VideocamSharp height="20" width="20" />
        </div>
        {this.state.modalOpen && (
          <ModalVideos
            modalOpen={this.state.modalOpen}
            clearModalStatus={this.clearModalStatus}
            addVideoToContent={this.addVideoToContent}
          />
        )}
      </div>
    );
  }
}