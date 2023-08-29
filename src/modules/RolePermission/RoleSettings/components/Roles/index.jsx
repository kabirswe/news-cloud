import React, {Component} from 'react';
import {connect} from 'react-redux';
import NcCheckbox from '../NcCheckbox';
import Style from './roles.module.scss';
import {
  userInvitationSetRoleName,
  userInvitationSetRoleValue
} from '../../../../../redux/actions/users';
import {
  SYSTEM_SETTING_DISABLE_ROLE_ID,
  SYSTEM_SETTING_DISABLE_PERMISSION_ID
} from '../../../../../app-constants/usersConstant';

class RoleList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roleValue: false
    };
  }

  render() {
    const {
      media,
      column,
      isRoleSetting,
      permissions = [],
      handleChange,
      roleId
    } = this.props;
    let permObj = {};
    permissions.forEach((perm) => {
      permObj[perm.display_name] = perm.checked;
    });
    return (
      <tr className={Style.roleList}>
        {isRoleSetting ? null : (
          <td>
            <NcCheckbox
              value={media}
              id={`${media} + id1`}
              name={`${media},''`}
              handleChange={handleChange}
            />
          </td>
        )}
        <td
          onClick={() => this.props.editRoleName({roleName: media, roleId: roleId})}
          style={{cursor: 'pointer'}}
        >
          {media}
        </td>
        {!!column &&
          column.map((item, index) => (
            <td key={media + item.id}>
              {roleId == SYSTEM_SETTING_DISABLE_ROLE_ID &&
              item.id == SYSTEM_SETTING_DISABLE_PERMISSION_ID ? (
                <NcCheckbox
                  value={item.id}
                  id={`${media + item.id}`}
                  name={`${roleId},${item.id},${item.display_name}`}
                  defaultChecked={permObj[item.display_name]}
                  disabled={true}
                  className={`${Style.disabledBtn}`}
                />
              ) : (
                <NcCheckbox
                  value={item.id}
                  id={`${media + item.id}`}
                  name={`${roleId},${item.id},${item.display_name}`}
                  defaultChecked={permObj[item.display_name]}
                  handleChange={handleChange}
                />
              )}
            </td>
          ))}
      </tr>
    );
  }
}
function mapStateToProps(state) {
  return {
    rolesValue: state.usersReducer.rolesValue
  };
}
function mapDispatchToProps(dispatch) {
  return {
    userInvitationSetRoleName: (param) => dispatch(userInvitationSetRoleName(param)),
    userInvitationSetRoleValue: (param) =>
      dispatch(userInvitationSetRoleValue(param))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RoleList);
