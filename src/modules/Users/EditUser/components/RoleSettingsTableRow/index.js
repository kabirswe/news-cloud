import React, {Component} from 'react';
import _ from 'lodash';
import NcCheckbox from '../../../../../common-components/NcCheckbox';
import './role-settings-table-row.scss';
import userConst from '../../../../../app-constants/usersConstant';
export default class TableRow extends Component {
  render() {
    let {
      media,
      tempArray,
      onChangeCallBack,
      onChangeCallSelectAll,
      checkedAll,
      unCheckedAll,
      allCheckedUnchecked,
      defaultView,
      invitationStatus,
      ownMediaList
    } = this.props;
     return (
      <tr className="table-row-content">
        <td>
          {tempArray && (
            <NcCheckbox
              value="0"
              id="media"
              isActive={allCheckedUnchecked}
              checked={allCheckedUnchecked == 0 ? true: false}
              handleChange={onChangeCallSelectAll}
              disabled={invitationStatus  == userConst.INVITATION_ACCEPTED ? false : true}
              className={invitationStatus  != userConst.INVITATION_ACCEPTED ?  `disabledInput`:''}
            /> 
          )}
          <p> {
              ownMediaList && ownMediaList.length
                ? ownMediaList[0].display_name  || media
                : media
            } </p>
        </td>
        {checkedAll &&
          tempArray &&
          tempArray.map((value, index) => (
            <td key={index}>
              <small style={{display: 'none'}}>{value}</small>
              <NcCheckbox
                value={value}
                isActive={value}
                id={index + 2}
                handleChange={onChangeCallBack}
                disabled={invitationStatus  == userConst.INVITATION_ACCEPTED ? false : true}
                className={invitationStatus  != userConst.INVITATION_ACCEPTED ?  `disabledInput`:''}
              />
            </td>
          ))
          }
        {unCheckedAll &&
          tempArray &&
          tempArray.map((item, index) => (
            <td key={index}>
              <NcCheckbox
                value={item}
                isActive={item}
                id={index + 2}
                handleChange={onChangeCallBack}
                disabled={invitationStatus  == userConst.INVITATION_ACCEPTED ? false : true}
                className={invitationStatus  != userConst.INVITATION_ACCEPTED ?  `disabledInput`:''}
              />
            </td>
          ))}
        {defaultView &&
          tempArray &&
          tempArray.map((item, index) => (
            <td key={index}>
              <NcCheckbox
                value={item}
                isActive={item}
                id={index + 2}
                handleChange={onChangeCallBack}
                disabled={invitationStatus  == userConst.INVITATION_ACCEPTED ? false : true}
                className={invitationStatus  != userConst.INVITATION_ACCEPTED ?  `disabledInput`:''}
              />
            </td>
          ))}
      </tr>
    );
  }
}
