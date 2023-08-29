import React, {Component} from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import DatePicker, {registerLocale} from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ja from 'date-fns/locale/ja';
import './dateInput.scss'

registerLocale('ja', ja);
class DateInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: null
    };
  }

  handleChange = (date) => {
    this.setState({
      startDate: date
    });
    this.props.handleDate(date, this.props.type);
  };

  render() {
    return (
      <DatePicker
        selected={this.state.startDate}
        onChange={this.handleChange}
        disabled={this.props.disabled}
        minDate={this.props.minDate }
        className={this.props.className}
        dateFormat={this.props.dateFormat || 'yyyy.MM.dd (E)'}
        placeholderText={this.props.defaultOption}
        locale={ja}
        {...this.props}
      />
    );
  }
}

export default DateInput;

DateInput.propTypes = {
  handleDate: PropTypes.func.isRequired,
  className: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired
};
