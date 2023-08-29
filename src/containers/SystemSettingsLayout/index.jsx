import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import DefaultLayout from '../DefaultLayout';
import LayoutStyle from '../DefaultLayout/defaultLayout.module.scss';
import MenuItem from '../DefaultLayout/components/MenuItem';
import './system-settings.scss';
import {Briefcase, Key, LocationSharp, GoogleAnalytics} from '../../assets/svgComp';
import {routes} from '../../app-constants';
import {setSystemSettingsMenu} from '../../redux/actions/common';
import {systemMenus} from '../../routes';
import Toast from '../../common-components/Toast';
import path from '../../routes/path';

class SystemSettings extends Component {
  constructor(props) {
    super(props);
    this.routes = routes;
    this.submenus = [
      {
        value: 'ロール設定',
        key: 'role',
        url: '/role-permission',
        itemClass: '',
        iconClass: '',
        Icon: Briefcase,
        module: 'RolePermission'
      },
      {
        value: 'API認証 設定',
        key: 'sns',
        url: '/sns-module',
        itemClass: '',
        iconClass: '',
        Icon: Key,
        module: 'Sns'
      },
      {
        value: 'プラットフォーム',
        key: 'location',
        itemClass: '',
        iconClass: '',
        url: '/',
        Icon: LocationSharp,
        module: 'Media'
      },
      {
        value: '統計認証設定',
        key: 'statistics_setting',
        itemClass: '',
        iconClass: '',
        url: '/statistics-setting',
        Icon: GoogleAnalytics,
        module: 'StatisticsSetting'
      }
    ];
    this.state = {
      activeMenu: 'sns'
    };
  }

  onMenuChange = (menu) => {
    this.props.history.push(routes[menu]);
    this.props.setSystemSettingsMenu(menu);
  };

  render() {
    const {activeSystemMenu} = this.props;
    return (
      <DefaultLayout>
        <div className="system-settings-container">
          <div className="left-sidenav">
            <ul className={LayoutStyle.navList}>
              {this.submenus
                .filter((m) => systemMenus.includes(m.module))
                .map(({key, url, iconClass, Icon, value}) => {
                  return (
                    <li
                      className={activeSystemMenu === key ? 'active-sub-menu' : ' '}
                      onClick={() => this.onMenuChange(key)}
                      key={key}
                    >
                      <MenuItem name={value} Icon={Icon} iconClass={iconClass} />
                    </li>
                  );
                })}
            </ul>
          </div>
          <div className="right-content">{this.props.children}</div>
        </div>
      </DefaultLayout>
    );
  }
}

function mapStateToProps(state) {
  return {
    activeSystemMenu: state.commonReducer.activeSystemMenu
  };
}
function mapDispatchToProps(dispatch) {
  return {
    setSystemSettingsMenu: (menu) => dispatch(setSystemSettingsMenu(menu))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(SystemSettings));
