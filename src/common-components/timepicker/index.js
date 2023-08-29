import React, {Component} from 'react';
import 'rc-time-picker/assets/index.css';
import './styles/index.scss';
import TimePicker from 'rc-time-picker';
import moment from 'moment';

export default class Timepicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      addMenu: [{name: null}],
      value: '',
      buttonOff: true,
      addButton: true
    };
  }

  onChange = (value) => {
    if (value) {
      this.props.onChangeEvent(
        this.props.valueIndex,
        value.valueOf(),
        this.props.timeFlag,
        this.props.spotId
      );
    }
  };

  disabledHours = () => {
    // need to work on it. please don't remove
    return Array(6)
      .fill(null)
      .map((x, i) => i);
  };

  render() {
    return (
      <TimePicker
        format={this.props.format}
        showSecond={this.props.showSecond}
        value={moment(this.props.value)}
        defaultValue={this.props.defaultValue}
        defaultOpenValue={moment()}
        // disabledHours={this.props.disabledHours || this.disabledHours}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
