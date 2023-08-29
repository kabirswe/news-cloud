import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import Style from './styles.module.scss';
import {CloseCircleOutline} from '../../../assets/svgComp';
import {authModtranslator} from '../modLocalization';

class TokenExpired extends Component {
  render() {
    return (
      <div className={Style.tokenExpireContainer}>
        <div className={Style.messageBox}>
          <div className={Style.closeBtnArea}>
            <CloseCircleOutline />
          </div>
          <div className={Style.description}>
            <div className={Style.title}>
              {authModtranslator('TOKEN_EXPIRED.TITLE')}
            </div>
            <div className={Style.activeText}>
              {authModtranslator('TOKEN_EXPIRED.ACTIVATED_TEXT')}
            </div>
            <div className={Style.desctiptionTExt}>
              {authModtranslator('TOKEN_EXPIRED.DESCRIPTION_TEXT1')}
              <br />
              {authModtranslator('TOKEN_EXPIRED.DESCRIPTION_TEXT2')}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(TokenExpired);
