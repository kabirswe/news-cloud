import React from 'react';
import RoleList from '../Roles';
import Style from './roleTable.module.scss';
import {userModtranslator} from '../modLocalization';
export default function RoleTable(props) {
  const {
    medias,
    roleTitleList,
    isRoleSetting,
    setRoleValues,
    isRoleChanged,
    setRolesLength,
    handleChange,
    className = '',
    ownMediaList,
    ownMediaBtnChecked
  } = props || '';
  return (
    <>
      <div className={Style.tableWrapper}>
        <div className={`table-responsive  ${Style.table} ${className}`}>
          <table className="table table-bordred table-striped">
            <thead>
              <tr>
                {isRoleSetting ? (
                  <th>{userModtranslator('USER_MANAGEMENT.ROLL_TEXT')} </th>
                ) : (
                  <>
                    <th>{userModtranslator('USER_MANAGEMENT.DELIVERY_DESTINATION')} </th>
                  </>
                )}
                {roleTitleList &&
                  roleTitleList.map((item, index) => (
                    <th key={`rolelist ${index}`}>{item.display_name}</th>
                  ))}
              </tr>
            </thead>
            <tbody className="scroller">
              {medias.map((media, index) => (
                <RoleList
                  key={`${media} ${index}`}
                  media={media}
                  column={roleTitleList} // renders in column
                  permissions={media.permissions} // renders in row
                  isRoleSetting={isRoleSetting}
                  setRoleValues={setRoleValues}
                  isRoleChanged={isRoleChanged}
                  setRolesLength={setRolesLength}
                  handleChange={handleChange}
                  ownMediaList={ownMediaList}
                  ownMediaBtnChecked={ownMediaBtnChecked}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
