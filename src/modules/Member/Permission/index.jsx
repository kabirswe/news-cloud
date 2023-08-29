import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import DefaultLayout from '../../../containers/DefaultLayout';
import Style from '../List/member.module.scss';
import {memberModtranslator} from '../modLocalization';
import PermissionList from './permissionList';

class Permission extends Component {
  render() {
    return (
      <DefaultLayout>
        <div className="container-fluid">
          <div className={`row ${Style.memberComponent}`}>
            <div className={`col-lg-12  ${Style.pageHeading}`}>
              <div className={`${Style.pageTitle}`}>
                {memberModtranslator('MEMBER.PERMISSION.PAGE_TITLE')}
              </div>
            </div>
            <div className="col-lg-12">
              <PermissionList />
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }
}

function mapStateToProps(state) {
  return {
    lang: state.commonReducer.lang
  };
}

export default withRouter(connect(mapStateToProps)(Permission));
