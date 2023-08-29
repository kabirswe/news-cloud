import React from 'react';
import {useHistory} from 'react-router-dom';
import NcCheckbox from '../../../common-components/NcCheckbox';
import Style from './userList.module.scss';
import {images} from '../modConstants/images';
import {userModtranslator} from '../modLocalization';

export default function UserList(props) {
  const history = useHistory();
  const {userList} = props;
  return (
    <>
      {userList &&
        userList.map((user, index) => (
          <tr className={Style.userList} key={`user-list${index}`}>
            <td onClick={() => history.push(`/edit-user?${user.id}`)}>
              {/* {user.user_detail && user.user_detail.image ? (
                <img className="user-profile" src={user.user_detail.image} alt="" />
              ) : (
                <img className="user-profile" src={images.profileUserImage} alt="" />
              )} */}
              {user.username}
            </td>
            <td onClick={() => history.push(`/edit-user?${user.id}`)}>
              {' '}
              {user.user_detail ? user.user_detail.fullname || '' : ''}
            </td>
            <td onClick={() => history.push(`/edit-user?${user.id}`)}>
              {user.email}
            </td>
            <td>
              {user.roles
                ? user.roles.length
                  ? user.roles.map((item) => item.display_name).join(', ')
                  : ''
                : ''}
            </td>
            <td onClick={() => history.push(`/edit-user?${user.id}`)}>
              {user.first_login_at}
            </td>
            <td onClick={() => history.push(`/edit-user?${user.id}`)}>
              {user.last_login_at}
            </td>
            <td>
              <NcCheckbox
                value={user.id}
                id={user.id}
                isActive={user.is_active}
                handleChange={() => props.userBlockUnBlock(user.id)}
              />
            </td>
            <td>
              {!user.locked ? userModtranslator('USER_MANAGEMENT.LOCKED') : ''}
            </td>
          </tr>
        ))}
    </>
  );
}
