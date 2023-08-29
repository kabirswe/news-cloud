import React, {Component} from 'react';
import {memberModtranslator} from '../modLocalization';
import Style from '../List/member.module.scss';
import NcCheckbox from '../../../common-components/NcCheckbox';
import PermissionListItem from './permissionListItem';

export default class PermissionList extends Component {
  render() {
    return (
      <div className={Style.tableWrapper}>
        <div className={`table-responsive  ${Style.table}`}>
          <table className="table table-bordred table-striped">
            <thead>
              <tr>
                <th>{memberModtranslator('MEMBER.MEMBER_NAME')}</th>
                <th>{memberModtranslator('MEMBER.MAIL_ADDRESS')}</th>
                <th className="text-center">
                  <NcCheckbox
                    value=""
                    id="abc"
                    is_active=""
                    handleChange={() => console.log('test')}
                    label="Owned Media-1"
                  />
                </th>
                <th className="text-center">
                  <NcCheckbox
                    value=""
                    id="def"
                    is_active=""
                    handleChange={() => console.log('test')}
                    label="Owned Media-2"
                  />
                </th>
                <th className="text-center">
                  <NcCheckbox
                    value=""
                    id="ghi"
                    is_active=""
                    handleChange={() => console.log('test')}
                    label="Owned Media-3"
                  />
                </th>
                <th className="text-center">
                  <NcCheckbox
                    value=""
                    id="jkl"
                    is_active=""
                    handleChange={() => console.log('test')}
                    label="Owned Media-4"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(15).keys()].map((index) => (
                <PermissionListItem index={index} key={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
