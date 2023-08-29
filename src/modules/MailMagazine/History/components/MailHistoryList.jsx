import React, {Component} from 'react';
import {maliMagazineModtranslator} from '../../modLocalization';
import Style from '../history.module.scss';
import NcCheckbox from '../../../../common-components/NcCheckbox';
import MailHistoryListItem from './MailHistoryListItem';
import NcDataTable from '../../../../common-components/NcDataTable';

export default class MailMagazineList extends Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        name: maliMagazineModtranslator('MAIL_MAGAZINE.HISTORY.GROUP_NAME'),
        selector: 'group_name',
        sortable: true
      },
      {
        name: maliMagazineModtranslator('MAIL_MAGAZINE.HISTORY.DELIVERY_DATE'),
        selector: 'delivery_date',
        sortable: true,
        cell: (row) => <div className="email-datatable-custom" onClick={() => this.selectRowClick(row)}> {row.delivery_date} </div>
      },
      {
        name: maliMagazineModtranslator('MAIL_MAGAZINE.HISTORY.DELIVERED'),
        selector: 'email_delivered',
        sortable: true
      },
      {
        name: maliMagazineModtranslator('MAIL_MAGAZINE.HISTORY.DELIVER_ERROR'),
        selector: 'email_sent_error',
        sortable: true
      },
      {
        name: maliMagazineModtranslator('MAIL_MAGAZINE.HISTORY.ALREADY_READ'),
        selector: 'email_read',
        sortable: true
      },
      {
        name: maliMagazineModtranslator('MAIL_MAGAZINE.HISTORY.UNREAD'),
        selector: 'email_unread',
        sortable: true
      },
      {
        name: maliMagazineModtranslator('MAIL_MAGAZINE.HISTORY.READ_RATE'),
        selector: 'email_read_ratio',
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
    this.props.mailHistoryDetails(row);
  };
  render() {
    let {mailList} = this.props;
    return (
      <div className={Style.tableWrapper}>
        <div className={`table-responsive  ${Style.table}`}>
          <NcDataTable
            data={[...mailList]}
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
