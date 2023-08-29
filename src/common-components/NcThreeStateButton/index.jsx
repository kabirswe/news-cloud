import React, {Component} from 'react';
import './styles.scss';

class NcThreeStateButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wrapperBg: 'inactive-bg',
      selectedVal: props.value
    };
  }

  // usage
  // <NcThreeStateButton
  //       name="radio_button"
  //       value={this.state.radio_button}
  //       getValue={this.changeButton}
  //  />

  componentDidMount() {
    const targetVal = this.state.selectedVal;
    let targetClass;
    if (targetVal == 0) {
      targetClass = 'inactive-bg';
    } else {
      targetClass = 'active-bg';
    }
    this.setState({
      wrapperBg: targetClass,
      selectedVal: targetVal
    });
  }

  buttonChange = (event) => {
    if (this.props.disabled) {
      return
    }
    const targetVal = event.target.value;
    let targetClass;
    if (targetVal == 0) {
      targetClass = 'inactive-bg';
    } else {
      targetClass = 'active-bg';
    }
    this.setState({
      wrapperBg: targetClass,
      selectedVal: targetVal
    });
    this.props.getValue(targetVal);
  };

  render() {
    const {wrapperBg, selectedVal} = this.state;
    const {name, currentValue, disabled} = this.props;
    return (
      <div className={`nc-three-state-button ${disabled ? 'toggle-disabled' : ' '} ${currentValue == 2 ? 'active-bg' : 'inactive-bg'}`}>
        <label htmlFor={`yes_radio_${name}`} id="yes-lbl">
          OK
        </label>
        <input
          type="radio"
          value="2"
          name={name}
          className="ok"
          id={`yes_radio_${name}`}
          onChange={this.buttonChange}
          checked={currentValue == 2}
        />
        <label htmlFor={`no_radio_${name}`} id="no-lbl"></label>
        <input
          type="radio"
          value="0"
          className="nill"
          name={name}
          id={`no_radio_${name}`}
          onChange={this.buttonChange}
          checked={currentValue == 0}
        />
        <label htmlFor={`another_radio_${name}`} id="another-lbl">
          NG
        </label>
        <input
          type="radio"
          value="1"
          className="ng"
          name={name}
          id={`another_radio_${name}`}
          onChange={this.buttonChange}
          checked={currentValue == 1}
        />
        <div className="toggle"></div>
      </div>
    );
  }
}

export default NcThreeStateButton;
