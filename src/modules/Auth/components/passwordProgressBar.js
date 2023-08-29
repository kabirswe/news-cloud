import React, {Component} from 'react';
import './passwordProgressBar.styles.scss';
import {validatePassword} from '../../../helper';

class PasswordProgressBar extends Component {
  handlePassword = (value) => {
    if (validatePassword(value) === 'strong') {
      this.weakBar.style.width = '26%';
      this.mediumBar.style.width = '26%';
      this.strongBar.style.width = '48%';
    } else if (validatePassword(value) === 'good') {
      this.weakBar.style.width = '26%';
      this.mediumBar.style.width = '26%';
      this.strongBar.style.width = '0%';
    } else if (
      validatePassword(value) === 'weak' ||
      validatePassword(value) === 'invalid'
    ) {
      this.weakBar.style.width = '26%';
      this.mediumBar.style.width = '0%';
      this.strongBar.style.width = '0%';
    } else {
      this.weakBar.style.width = '0%';
      this.mediumBar.style.width = '0%';
      this.strongBar.style.width = '0%';
    }
  };

  render() {
    if (this.props.data) {
      this.handlePassword(this.props.data);
    }
    return (
      <div className="progress" style={{display: !this.props.data && 'none'}}>
        <div
          ref={(ref) => {
            this.weakBar = ref;
          }}
          className="progress-bar progress-bar-weak"
          role="progressbar"
          style={{width: '0%'}}
        />
        <div
          ref={(ref) => {
            this.mediumBar = ref;
          }}
          className="progress-bar progress-bar-medium"
          role="progressbar"
          style={{width: '0%'}}
        />
        <div
          ref={(ref) => {
            this.strongBar = ref;
          }}
          className="progress-bar progress-bar-strong"
          role="progressbar"
          style={{width: '0%'}}
        />
      </div>
    );
  }
}
export default PasswordProgressBar;
