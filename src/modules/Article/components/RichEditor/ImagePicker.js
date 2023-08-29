import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {ImageSharp} from '../../../../assets/svgComp';
import ModalImages from './ModalImages';
import {AtomicBlockUtils} from 'draft-js';
import './scss/imagePicker.scss'

export default class ImagePicker extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    editorState: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.fileInput = React.createRef()
    this.state = {
      modalOpen: false
    };
  }

  // borrowed from
  // https://github.com/jpuri/react-draft-wysiwyg/blob/master/src/controls/Image/index.js
  addEmbededImage = (src, height, width, alt) => {
    const {editorState, onChange} = this.props;
    const entityData = {src, height, width};

    const entityKey = editorState
      .getCurrentContent()
      .createEntity('IMAGE', 'MUTABLE', entityData)
      .getLastCreatedEntityKey();
    const newEditorState = AtomicBlockUtils.insertAtomicBlock(
      editorState,
      entityKey,
      ' '
    );
    onChange(newEditorState);
  };

  openVideosModal = () => {
  
    this.fileInput.current.click();
  };

  clearModalStatus = () => {
    this.setState({modalOpen: false});
  };

  addImageContent = (src, height = '140', width = '200', alt = '') => {
   
    this.addEmbededImage(src, height, width, alt);
  };

  handleImageChange = (event) => {
    let {files} = event.target
    let src = URL.createObjectURL(files[0])
    this.addImageContent(src, "200", "200", 'nothing')
  }

  render() {
    return (
      <div className="image-input" onClick={this.openVideosModal}>
        <div className="rdw-option-wrapper">
          <ImageSharp height="20" width="20" />
        </div>

        <input id="file-input" onChange={this.handleImageChange} ref={this.fileInput} type="file" />
      </div>
    );
  }
}
