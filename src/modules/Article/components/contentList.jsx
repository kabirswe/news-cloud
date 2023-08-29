import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {rawMaterialModtranslator} from '../modLocalization';
import './contentList.scss';
import {images} from '../../../app-constants/images';
import StatusIcon from './statusIcon';
import {
  APPROVAL,
  PUBLICATION,
  REVIEW,
  STATUS,
  PUBLICATION_STATUS_ICON,
  APPROVAL_STATUS
} from '../../../app-constants/rawContent';
import path from '../../../routes/path';
import StatusIconWithLabel from './StatusIconWithLabel';

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
    const {data, activeStaus, file_url} = this.props;
    return (
      <div className="RMcontainerDataListWrapper">
        {data &&
          data.map((row, index) => {
            return (
              <div  
                onClick={() =>
                  this.props.history.push(`/edit-content?id=${row.id}`)
                } 
                className="box" 
                key={index}
              >
                <div
                  className="boxImage"
                 
                >
                  <img src={ row.thumbnail ? `${file_url}${row.thumbnail}` : images.demoImg} alt="" />
                </div>
                <div className="boxBottomContent">
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
                <div className="boxIconSectionList">
                  <StatusIconWithLabel
                    iconType={PUBLICATION}
                    color={
                      publicationIcon[row.custom_publishing_status]
                        ? publicationIcon[row.custom_publishing_status].COLOR
                        : publicationIcon[0].COLOR
                    }
                  />
                  <StatusIconWithLabel
                    iconType={
                      approvalIcon[row.custom_approving_status]
                        ? approvalIcon[row.custom_approving_status].NAME
                        : approvalIcon[0].NAME
                    }
                    color={
                      approvalIcon[row.custom_approving_status]
                        ? approvalIcon[row.custom_approving_status].COLOR
                        : approvalIcon[0].COLOR
                    }
                  />
                </div>
              </div>
            );
          })}
      </div>
    );
  }
}
export default withRouter(ContentList);
