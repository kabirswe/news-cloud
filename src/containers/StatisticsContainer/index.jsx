import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import DefaultLayout from '../DefaultLayout';
import LayoutStyle from '../DefaultLayout/defaultLayout.module.scss';
import MenuItem from '../DefaultLayout/components/MenuItem';
import './statistics.module.scss';
import {BarChart, StatsChartSharp} from '../../assets/svgComp';
import {routes} from '../../app-constants';
import {setStatisticsMenu} from '../../redux/actions/common';

const statisticsMenus = ['StatisticsOwnMedia', 'StatisticsVideo'];
class StatisticsContainer extends Component {
  constructor(props) {
    super(props);
    this.routes = routes;
    this.submenus = [
      {
        value: 'オウンドメディア',
        key: 'statisticsOwnMedia',
        url: '/statistics-ownmedia',
        itemClass: '',
        iconClass: '',
        Icon: BarChart,
        module: 'StatisticsOwnMedia'
      },
      {
        value: '動画',
        key: 'statisticsVideo',
        url: '/statistics-video',
        itemClass: '',
        iconClass: '',
        Icon: StatsChartSharp,
        module: 'StatisticsVideo'
      }
    ];
    this.state = {
      activeMenu: 'statistics'
    };
  }

  onMenuChange = (menu) => {
    this.props.history.push(routes[menu]);
    this.props.setStatisticsMenu(menu);
  };

  render() {
    const {activeStatisticsMenu} = this.props;
    return (
      <DefaultLayout>
        <div className="system-settings-container">
          <div className="left-sidenav">
            <ul className={LayoutStyle.navList}>
              {this.submenus
                .filter((m) => statisticsMenus.includes(m.module))
                .map(({key, iconClass, Icon, value}) => {
                  return (
                    <li
                      className={
                        activeStatisticsMenu === key ? 'active-sub-menu' : ' '
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
    activeStatisticsMenu: state.commonReducer.activeStatisticsMenu
  };
}
function mapDispatchToProps(dispatch) {
  return {
    setStatisticsMenu: (menu) => dispatch(setStatisticsMenu(menu))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(StatisticsContainer));
