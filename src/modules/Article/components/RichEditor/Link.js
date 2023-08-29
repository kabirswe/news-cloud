import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {EditorState, Modifier} from 'draft-js';
import {Browsers} from "../../mod-assets/svgComp"
import  path from '../../../../routes/path';
export default class Link extends Component {
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

// programmatically insert text into editor

insertText = (text, editorState) => {
    let {onChange} = this.props
    const currentContent = editorState.getCurrentContent(),
            currentSelection = editorState.getSelection();

    const newContent = Modifier.replaceText(
        currentContent,
        currentSelection,
        text
    );

    const newEditorState = EditorState.push(editorState, newContent, 'insert-characters');
    let newState =  EditorState.forceSelection(newEditorState, newContent.getSelectionAfter());
    onChange(newState)
    }

    sendTextToEditor = () => {
    let {editorState, url, isMailPosting} = this.props
    let text = isMailPosting ? url : `{{url:${url}}}`
    this.setState({
        snsData: {
        ...this.state.snsData,
        editorState: this.insertText(text, editorState)
        }
    });
    }



  render() {
    let {isDisabled} = this.props
   
    return (
      <div onClick={() => this.sendTextToEditor()}>
        <div className={isDisabled ? "rdw-option-wrapper disabledBtn" : "rdw-option-wrapper"}>
          Link
        </div>
        
      </div>
    );
  }
}