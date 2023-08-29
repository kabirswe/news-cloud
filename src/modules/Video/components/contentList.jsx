import React, {Component} from 'react';
import {rawMaterialModtranslator} from '../modLocalization';
import '../Content/content.scss';
import {images} from '../../../app-constants/images';
import StatusIcon from './statusIcon';
import {
  APPROVAL,
  PUBLICATION,
  REVIEW,
  STATUS,
  PUB_STATUS,
  PUBLICATION_STATUS_ICON,
  APPROVAL_STATUS
} from '../../../app-constants/rawContent';

class ContentList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      publicationIcon: PUBLICATION_STATUS_ICON,
      approvalIcon: APPROVAL_STATUS
    };
  }
  render() {
    const {publicationIcon, approvalIcon} = this.state;
    const {data, activeStaus} = this.props;
    return (
      data &&
      data.map((value, i) => {
        return (
          <div className="row" key={'contentlist' + i}>
            {value.map((row, index) => {
              return (
                <div className="box" key={index}>
                  <div className="boxImage">
                    <img
                      src={row.thumbnail ? row.thumbnail : images.demoImg}
                      alt=""
                    />
                  </div>
                  <div className="boxBottomContent">
                    <div className="mediaTitle">
                      <span>
                        {rawMaterialModtranslator('CONTENT.TITLE')}&nbsp;
                        {row.title}
                      </span>
                      {row.ownmedia ? (
                        <span className="deliveryDestination">
                          {rawMaterialModtranslator('CONTENT.DELIVERY_DESTINATION')}
                          &nbsp;
                          {row.ownmedia.display_name}
                        </span>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                  <div className="boxIconSectionList">
                    <StatusIcon
                      iconType={PUBLICATION}
                      color={
                        publicationIcon[activeStaus.activePublicationIcon]
                          ? publicationIcon[activeStaus.activePublicationIcon].COLOR
                          : publicationIcon[0].COLOR
                      }
                    />
                    <StatusIcon
                      iconType={
                        approvalIcon[activeStaus.activeApprovalIcon]
                          ? approvalIcon[activeStaus.activeApprovalIcon].NAME
                          : approvalIcon[0].NAME
                      }
                      color={
                        approvalIcon[activeStaus.activeApprovalIcon]
                          ? approvalIcon[activeStaus.activeApprovalIcon].COLOR
                          : approvalIcon[0].COLOR
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })
    );
  }
}
export default ContentList;
