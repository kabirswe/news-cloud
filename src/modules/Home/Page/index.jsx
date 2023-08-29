import React, {Component} from 'react';
import {connect} from 'react-redux';
import DefaultLayout from '../../../containers/DefaultLayout';
import {translator} from '../../../localizations';
import './styles.scss';

class Home extends Component {
  render() {
    return (
      <DefaultLayout>
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-12">
              <h1>{translator('DASHBOARD.WELCOME_TEXT')}</h1>
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

export default connect(mapStateToProps)(Home);
