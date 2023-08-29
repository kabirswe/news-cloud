import React from 'react';
import RoleList from '../Roles';
import Style from './roleTable.module.scss';
export default function RoleTable({
  medias,
  roleTitleList,
  handleChange,
  isRoleSetting,
  className = '',
  editRoleName
}) {
  return (
    <>
      <div className={Style.tableWrapper}>
        <div className={`table-responsive  ${Style.table} ${className}`}>
          <table className="table table-bordred table-striped">
            <thead>
              <tr>
                {isRoleSetting ? (
                  <th>ロール</th>
                ) : (
                  <>
                    <th>配信先</th>
                  </>
                )}
                {roleTitleList &&
                  roleTitleList.map((item, index) => (
                    <th key={`rolelist ${index}`}>{item.display_name_jp}</th>
                  ))}
              </tr>
            </thead>
            <tbody className="scroller">
              {medias.map((media, index) => (
                <RoleList
                  key={`${media} ${index}`}
                  media={media.display_name}
                  roleId={media.id}
                  column={roleTitleList} // renders in column
                  permissions={media.permissions} // renders in row
                  isRoleSetting={isRoleSetting}
                  handleChange={handleChange}
                  editRoleName={editRoleName}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
