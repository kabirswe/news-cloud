import React, {Component} from 'react';
import Style from './../mailGroup.module.scss';
import {maliMagazineModtranslator} from '../../modLocalization';
import NcDataTable from '../../../../common-components/NcDataTable';
export default class MailGroupList extends Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        name: maliMagazineModtranslator('MAIL_MAGAZINE.GROUP.GROUP_NAME'),
        selector: 'group_name',
        sortable: true
      },
      {
        name: maliMagazineModtranslator('MAIL_MAGAZINE.GROUP.COMMENT'),
        selector: 'comments',
        sortable: true
      },
      {
        name: maliMagazineModtranslator('MAIL_MAGAZINE.GROUP.NUMBER'),
        selector: 'group_member_count',
        sortable: true
      }
    ];
    this.state = {
      selectedRows: []
    };
  }
  getSelectedRows = (row) => {
    this.setState(
      {
        selectedRows: row.selectedRows
      },
      () => this.props.selectDeselectAll(this.state.selectedRows)
    );
  };
  selectRowClick = (row) => {
    this.props.groupMailDetails(row.id);
  };
  render() {
    let {groupList} = this.props;
    return (
      <div className={Style.tableWrapper}>
        <div className={`table-responsive `}>
          <NcDataTable
            data={groupList}
            columns={this.columns}
            selectableRows
            onSelectedRowsChange={this.getSelectedRows}
            onRowClicked={this.selectRowClick}
          />
        </div>
      </div>
    );
  }
}
