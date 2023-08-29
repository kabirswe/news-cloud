import React, {Component} from 'react';
import {maliMagazineModtranslator} from '../../modLocalization';
import Style from '../historyDetails.module.scss';
import NcCheckbox from '../../../../common-components/NcCheckbox';
import NcDataTable from '../../../../common-components/NcDataTable';
export default class MailHistoryDetailsList extends Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        name: maliMagazineModtranslator(
          'MAIL_MAGAZINE.HISTORY_DETAILS.MAIL_ADDRESS'
        ),
        selector: 'email',
        sortable: true,
        cell: (row) => <div className="email-datatable-custom" onClick={() => this.selectRowClick(row)}> {row.email} </div>
      },
      {
        name: maliMagazineModtranslator('MAIL_MAGAZINE.HISTORY_DETAILS.FULL_NAME'),
        selector: 'name',
        sortable: true
      },
      {
        name: maliMagazineModtranslator('MAIL_MAGAZINE.HISTORY_DETAILS.STATUS'),
        selector: 'delivery_status',
        sortable: true
      },
      {
        name: maliMagazineModtranslator(
          'MAIL_MAGAZINE.HISTORY_DETAILS.OPEING_STATUS'
        ),
        selector: 'open_status',
        sortable: true
      }
    ];
    this.state = {
      selectedRows: []
    };
  }
  selectRowClick = (row) => {
    this.props.mailHistoryEmailPopup(row.id);
  };
  render() {
    const {mailHistoryList} = this.props;
    return (
      <div className="row">
        <div className="col-lg-12">
          <div className={Style.tableWrapper}>
            <div className={`table-responsive  ${Style.table}`}>
              <NcDataTable
                data={[...mailHistoryList]}
                columns={this.columns}
                onRowClicked={this.selectRowClick}
                widthHistoryMail={true}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
