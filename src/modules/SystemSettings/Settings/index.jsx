import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';

import {routes} from '../../../app-constants';

class SystemSettings extends Component {
  constructor(props) {
    super(props);
    this.routes = routes;
  }

  componentDidMount() {
    this.props.history.push(routes.role);
  }

  onMenuChange = (menu) => {
    this.props.history.push(routes[menu]);
    this.setState({
      activeMenu: menu
    });
  };

  render() {
    return <></>;
  }
}

export default withRouter(SystemSettings);
