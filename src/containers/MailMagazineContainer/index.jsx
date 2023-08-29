import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import DefaultLayout from '../DefaultLayout';
import LayoutStyle from '../DefaultLayout/defaultLayout.module.scss';
import MenuItem from '../DefaultLayout/components/MenuItem';
import './mailMagazine.module.scss';
import {Mail, MailOpen} from '../../assets/svgComp';
import {routes} from '../../app-constants';
import {setMailMagazineMenu} from '../../redux/actions/common';
import Toast from '../../common-components/Toast';

const mailMagazineMenus = ['MailGroup', 'MailHistory'];
class MailMagazineContainer extends Component {
  constructor(props) {
    super(props);
    this.routes = routes;
    this.submenus = [
      {
        value: 'メール一覧',
        key: 'mailGroup',
        url: '/mail-group',
        itemClass: '',
        iconClass: '',
        Icon: Mail,
        module: 'MailGroup'
      },
      {
        value: 'メール履歴',
        key: 'mailHistory',
        url: '/mail-history',
        itemClass: '',
        iconClass: '',
        Icon: MailOpen,
        module: 'MailHistory'
      }
    ];
    this.state = {
      activeMenu: 'mail'
    };
  }

  onMenuChange = (menu) => {
    this.props.history.push(routes[menu]);
    this.props.setMailMagazineMenu(menu);
  };

  render() {
    const {activeMailMagazineMenu} = this.props;
    return (
      <DefaultLayout>
        <div className="system-settings-container">
          <div className="left-sidenav">
            <ul className={LayoutStyle.navList}>
              {this.submenus
                .filter((m) => mailMagazineMenus.includes(m.module))
                .map(({key, url, iconClass, Icon, value}) => {
                  return (
                    <li
                      className={
                        activeMailMagazineMenu === key ? 'active-sub-menu' : ' '
                      }
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
    activeMailMagazineMenu: state.commonReducer.activeMailMagazineMenu
  };
}
function mapDispatchToProps(dispatch) {
  return {
    setMailMagazineMenu: (menu) => dispatch(setMailMagazineMenu(menu))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(MailMagazineContainer));
