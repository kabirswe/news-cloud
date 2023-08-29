import React, {Component} from 'react';
import {connect} from 'react-redux';
import NcCheckbox from '../../../common-components/NcCheckbox';
import Style from './roles.module.scss';
import {
  userInvitationSetRoleName,
  userInvitationSetRoleValue
} from '../../../redux/actions/users';

export default class RoleList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roleValue: false,
      isMediaChecked: false
    };
  }

  handleRole = (e, role, val = null, allIds = false) => {
   // let {isMediaChecked} = this.state;
   let isMediaChecked = this.props.ownMediaBtnChecked;
    let makeALlEmpty = false;
    if (allIds) {
      if (isMediaChecked) {
        makeALlEmpty = true;
      }
     // this.setState({isMediaChecked: !isMediaChecked});
      this.setState({isMediaChecked: !isMediaChecked});
    }
    this.props.setRoleValues(val, allIds, makeALlEmpty);
  };

  render() {
    const {
      media,
      column,
      setRolesLength,
      setRoleValues,
      isRoleSetting,
      permissions = [],
      handleChange,
      resetRolePermission,
      ownMediaList,
      ownMediaBtnChecked
    } = this.props || '';
    let permObj = {};
    permissions.forEach((perm) => {
      permObj[perm.display_name] = perm.checked;
    });
    return (
      <tr className={Style.roleList}>
        <td>
          <NcCheckbox
            value={media}
            id={`${media} + id1`}
            label={
              ownMediaList && ownMediaList.length
                ? ownMediaList[0].display_name || media
                : media
            }
            handleChange={(e) =>
              setRoleValues ? this.handleRole(e, media, null, true) : {}
            }
            checked={ownMediaBtnChecked ? true: false}
          />
        </td>

        {!!column &&
          column.map((item, index) => (
            <td key={media + item.id}>
              <NcCheckbox
                value={item.id}
                id={`${media + item.id}`}
                handleChange={(e) =>
                  setRoleValues ? this.handleRole(e, media, item.id) : {}
                }
                checked={item.isActive == 0 ? true : false}
              />
            </td>
          ))}
      </tr>
    );
  }
}
