import React, {Component} from 'react';
import {
  BulbSharp,
  CheckmarkSharp,
  DocumentText,
  FileTrayStacked,
  PencilSharp
} from '../mod-assets/svgComp';
import {
  APPROVAL,
  PUBLICATION,
  REVIEW,
  STATUS,
  APPROVAL_STATUS
} from '../../../app-constants/rawContent';
class StatusIcon extends Component {
  renderIcon = (contentType) => {
    const {color} = this.props;
    switch (contentType) {
      case PUBLICATION:
        return (
          <div className="boxIconMainLayer">
            <div className="boxIconColorLayer" style={{background: color}}>
              <BulbSharp className="icon" />
            </div>
          </div>
        );
      case REVIEW:
        return (
          <div className="boxIconMainLayer">
            <div className="boxIconColorLayer" style={{background: color}}>
              <FileTrayStacked className="icon" />
            </div>
          </div>
        );
      case APPROVAL:
        return (
          <div className="boxIconMainLayer">
            <div className="boxIconColorLayer" style={{background: color}}>
              <DocumentText className="icon" />
            </div>
          </div>
        );
      case STATUS:
        return (
          <div className="boxIconMainLayer">
            <div className="boxIconColorLayer" style={{background: '#1E99B8'}}>
              <CheckmarkSharp className="iconRight" />
            </div>
          </div>
        );

      case APPROVAL_STATUS[1].NAME:
        return (
          <div className="boxIconMainLayer">
            <div className="boxIconColorLayer" style={{background: color}}>
              <PencilSharp className="iconRight" />
            </div>
          </div>
        );
      case APPROVAL_STATUS[2].NAME:
        return (
          <div className="boxIconMainLayer">
            <div className="boxIconColorLayer" style={{background: color}}>
              <FileTrayStacked className="iconRight" />
            </div>
          </div>
        );

      case APPROVAL_STATUS[3].NAME:
        return (
          <div className="boxIconMainLayer">
            <div className="boxIconColorLayer" style={{background: color}}>
              <CheckmarkSharp   className="topImage ok" />
              <FileTrayStacked className="iconRight" />
            </div>
          </div>
        );
      case APPROVAL_STATUS[4].NAME:
        return (
          <div className="boxIconMainLayer">
            <div className="boxIconColorLayer" style={{background: color}}>
              <CheckmarkSharp   className="topImage ng" />
              <FileTrayStacked className="iconRight" />
            </div>
          </div>
        );
      case APPROVAL_STATUS[5].NAME:
        return (
          <>
            <div className="boxIconMainLayer">
              <div className="boxIconColorLayer" style={{background: color}}>
                <DocumentText className="iconRight" />
              </div>
            </div>
           
          </>
        );
      case APPROVAL_STATUS[6].NAME:
        return (
          <div className="boxIconMainLayer">
            <div className="boxIconColorLayer" style={{background: color}}>
              <CheckmarkSharp   className="topImage ok" />
              <DocumentText className="iconRight" />
            </div>
          </div>
        );
      case APPROVAL_STATUS[7].NAME:
        return (
          <div className="boxIconMainLayer">
            <div className="boxIconColorLayer" style={{background: color}}>
              <CheckmarkSharp   className="topImage ng" />
              <DocumentText className="iconRight" />
            </div>
          </div>
        );

      default:
        return (
          <div className="boxIconMainLayer">
            <div className="boxIconColorLayer">
              <PencilSharp className="icon" />
            </div>
          </div>
        );
    }
  };

  render() {
    const {iconType} = this.props;
    return <>{this.renderIcon(iconType)} </>;
  }
}

export default StatusIcon;