import React, {Component} from 'react';

export default class TabPane extends Component {
  render() {
    return (
      <>
        <div>
          <div className="tab-pane-container">{this.props.children}</div>
        </div>
      </>
    );
  }
}
