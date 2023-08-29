import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import ManageRole from './containers/ManageRole';
import {routes} from './routes';
import {allowedAccess} from './routes/access';
import {mapRoutesWithDb} from './routes/mapRoutes';
import {routePrepare, getPermissions} from './redux/actions/auth';
import IdleTimer from 'react-idle-timer'
import format from 'date-fns/format'

import {store} from './stores';

class App extends Component {
  constructor(props) {
    super(props);
    this.access = null;
    this.userId = null;
    this.idleTimer = null
    this.timeout = process.env.REACT_APP_IDLE_TIME && Number(process.env.REACT_APP_IDLE_TIME)
    this.handleOnActive = this.handleOnActive.bind(this)
    this.handleOnIdle = this.handleOnIdle.bind(this)
    this.handleReset = this.handleReset.bind(this)
    this.handlePause = this.handlePause.bind(this)
    this.handleResume = this.handleResume.bind(this)
    this.state = {
      isLoggedIn: false,
      remaining: this.timeout,
      isIdle: false,
      lastActive: new Date(),
      elapsed: 0,

      currentRoutes:
        routes && routes.filter((r) => allowedAccess.common.includes(r.path))
    };
  }

  handleOnActive () {
    this.setState({ isIdle: false })
  }

  handleOnIdle () {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUserID');
    localStorage.removeItem('currentUserName');
    localStorage.removeItem('activeMenu');
    localStorage.removeItem('permissions');
    localStorage.setItem("nc-logout-event", Math.random())
    let {pathname} = window.location
    if (pathname == '/login') return
    this.setState({ isIdle: true })
    store.dispatch({type: "CLEAR_LOGIN_DATA_SUCCESS"})
    window.location.reload()
  }

  handleReset () {
    this.idleTimer.reset()
  }

  handlePause () {
    this.idleTimer.pause()
  }

  handleResume () {
    this.idleTimer.resume()
  }

  componentDidMount() {
    this.setState({
      remaining: this.idleTimer.getRemainingTime(),
      lastActive: this.idleTimer.getLastActiveTime(),
      elapsed: this.idleTimer.getElapsedTime()
    })

    window.addEventListener('storage', (event) => {
      if (event.key == 'nc-logout-event') {
         this.setState({ isIdle: true })
         window.location.reload()
      }
    })
  }

  getLoggedInUserRoutes = (permissions) => {
    this.genRoutes(permissions);
  };

  genRoutes = (permissions) => {
    if (!permissions) return;
    const protectedRoutes = [];
    permissions.forEach((pages) => {
      if (pages && mapRoutesWithDb[pages]) {
        protectedRoutes.push(...mapRoutesWithDb[pages]);
      }
    });

    const initRoutes = routes.filter((p) => protectedRoutes.includes(p.path));
    this.setState({
      currentRoutes: [...this.state.currentRoutes, ...initRoutes]
    });
  };

  handleLogin = () => {
    const {isLoggedIn} = this.state;
    this.setState({
      isLoggedIn: !isLoggedIn
    });
  };

  render() {
    const {currentRoutes, isIdle} = this.state;
    return (
      <>
        <Router>
          <Switch>
            <Route exact path="/">
              <Redirect to="/content" />
            </Route>
            {
              isIdle ? <Route>
              <Redirect to="/login" />
            </Route> : ''
            }
            {currentRoutes.map((route) => (
              <ManageRole
                exact
                key={route.path}
                path={route.path}
                getProtectedRoutes={this.getLoggedInUserRoutes}
                access={this.access}
                extact
                component={route.component}
              />
            ))}
          </Switch>
        </Router>

        <IdleTimer
          ref={ref => { this.idleTimer = ref }}
          onActive={this.handleOnActive}
          onIdle={this.handleOnIdle}
          timeout={this.timeout}
        />
      </>
    );
  }
}

export default App;
