import React from 'react';
import {connect} from 'react-redux';
import DropdownStyle from './headerDropdown.module.scss';
import {setLanguage} from '../../../../redux/actions/common';
import i18next, {translator} from '../../../../localizations';

class HeaderDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: 'user'};
    this.menuList = ['user', 'admin', 'login', 'signup'];
    this.state = {
      currLang: 'ja',
      langs: [
        {
          key: 'en',
          value: 'English'
        },
        {
          key: 'ja',
          value: 'Japanese'
        }
      ]
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const {setCurrentLanguage} = this.props;
    this.setState({
      [event.target.name]: event.target.value,
      currLang: event.target.value
    });
    i18next.changeLanguage(event.target.value);
    setCurrentLanguage(event.target.value);
  }

  render() {
    const {langs, currLang} = this.state;
    const {lang} = this.props;
    return (
      <>
        <div className={DropdownStyle.dropDownArea}>
          <select
            className={DropdownStyle.headerDropdown}
            value={currLang || lang}
            onChange={this.handleChange}
          >
            {langs.map(({key, value}) => (
              <option key={key} value={key}>
                {translator(`LANGUAGE.${value.toUpperCase()}`)}
              </option>
            ))}
          </select>
        </div>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    lang: state.commonReducer.lang
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setCurrentLanguage: (data) => dispatch(setLanguage(data))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HeaderDropdown);
