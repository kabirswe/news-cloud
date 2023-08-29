import React, {Component} from 'react';
import {connect} from 'react-redux';
import './styles/tab.scss';

class Tab extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTabIndex: props.activeTab
    };
  }

  setActiveTab = (el) => {
    if (!el.props.isEnable) {
      this.setState(
        {
          activeTabIndex: parseInt(el.props.tab, 10)
        },
        () => {
          if (!!this.props.tabActiveItem) {
            this.props.tabActiveItem(this.state.activeTabIndex);
          }
          if (!!this.props.tabActiveKey) {
            this.props.tabActiveKey(el.key);
          }
        }
      );
    }
  };

  // setActiveTab = (el) => {
  //   this.setState(
  //     {
  //       activeTabIndex: parseInt(el.props.tab, 10)
  //     },
  //     () => {
  //       if (!!this.props.tabActiveItem) {
  //         this.props.tabActiveItem(this.state.activeTabIndex);
  //       }
  //       if (!!this.props.tabActiveKey) {
  //         this.props.tabActiveKey(el.key);
  //       }
  //     }
  //   );
  // };

  render() {
    const {children} = this.props;
    return (
      <>
        <nav className="nav-container-block">
          {children.map((el, idx) => {
            let content = null;

            if (el && Object.keys(el.props).length > 0) {
              content = (
                <div
                  key={Math.random()}
                  role="button"
                  tabIndex={el.props.tab}
                  className={
                    this.state.activeTabIndex === parseInt(el.props.tab, 10)
                      ? 'active tab_button'
                      : !el.props.isEnable
                      ? 'tab_button'
                      : ' disable tab_button'
                  }
                  onClick={() => {
                    this.setActiveTab(el);
                  }}
                >
                  {el.props.title}{' '}
                </div>
              );
            }
            return content;
          })}
        </nav>
        {children[this.state.activeTabIndex - 1]}
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    lang: state.commonReducer.lang
  };
}

function mapDispatchToProps() {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(Tab);
