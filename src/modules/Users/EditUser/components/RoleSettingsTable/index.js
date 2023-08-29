import React, {Component} from 'react';
import {Table} from 'reactstrap';
import TableRow from '../RoleSettingsTableRow';
import './role-settings-table.scss';
import {userModtranslator} from '../../../modLocalization';
export default class RoleSettingsTable extends Component {
  render() {
    let {ownMediaList} = this.props;
    return (
      <div className="table-container">
        <Table striped>
          <thead>
            <tr>
              <th>{userModtranslator('USER_MANAGEMENT.DELIVERY_DESTINATION')}</th>
              {this.props.roleTitleList &&
                this.props.roleTitleList.map((item, index) => (
                  <th key={`rolelist ${index}`}>{item.display_name} </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {this.props.medias.map((media, index) => (
              <TableRow
                key={`${media} ${index}`}
                media={media}
                column={this.props.roleTitleList}
                tempArray={this.props.tempArray}
                checkedAll={this.props.checkedAll}
                unCheckedAll={this.props.unCheckedAll}
                allCheckedUnchecked={this.props.allCheckedUnchecked}
                defaultView={this.props.defaultView}
                onChangeCallSelectAll={this.props.onChangeCallSelectAll}
                onChangeCallBack={this.props.onChangeCallBack}
                invitationStatus={this.props.invitationStatus}
                ownMediaList={ownMediaList}
              />
            ))}
          </tbody>
        </Table>
      </div>
    );
  }
}
