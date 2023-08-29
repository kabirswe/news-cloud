import React, {Component} from 'react';
import Style from '../history.module.scss';
import {maliMagazineModtranslator} from '../../modLocalization';
import NcCheckbox from '../../../../common-components/NcCheckbox';

export default class MailHistoryListItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {index} = this.props;
    return (
      <tr className={Style.userList} key={'user-list'}>
        <td>
          <NcCheckbox
            value=""
            id={`historyList_${index}`}
            is_active=""
            handleChange={() => console.log('test')}
            className={Style.topPadding}
          />
          <span>
            {maliMagazineModtranslator('MAIL_MAGAZINE.HISTORY.GROUP_NAME_FIELD')}
          </span>
        </td>
        <td>2019/09/11/ 00:00:00 </td>
        <td>700</td>
        <td>10</td>
        <td>200</td>
        <td>500</td>
        <td>50%</td>
      </tr>
    );
  }
}
