import React, {Component} from 'react';
import {maliMagazineModtranslator} from '../../modLocalization';
import Style from '../mailGroupDetails.module.scss';
import NcDataTable from '../../../../common-components/NcDataTable';
export default class MailGroupDetailsList extends Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        name: maliMagazineModtranslator('MAIL_MAGAZINE.GROUP_DETAILS.MAIL_ADDRESS'),
        selector: 'email',
        sortable: true,
        cell: (row) => <div className="email-datatable-custom"  onClick={() => this.selectRowClick(row)}> {row.email} </div>
      },
      {
        name: maliMagazineModtranslator('MAIL_MAGAZINE.GROUP_DETAILS.FULL_NAME'),
        selector: 'name',
        sortable: true
      },
      {
        name: maliMagazineModtranslator('MAIL_MAGAZINE.GROUP_DETAILS.COMPANY_NAME'),
        selector: 'company_name',
        sortable: true
      },
      {
        name: maliMagazineModtranslator(
          'MAIL_MAGAZINE.GROUP_DETAILS.DEPARTMENT_NAME'
        ),
        selector: 'department_name',
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
    this.props.editMemberInfo(row.id);
  };
  render() {
    const {memberList} = this.props;
    return (
      <div className={Style.tableWrapper}>
        <div className={`table-responsive  ${Style.table}`}>
          <NcDataTable
            data={[...memberList]}
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
