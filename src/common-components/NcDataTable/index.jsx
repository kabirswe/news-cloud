import React from 'react';
import DataTable, {createTheme} from 'react-data-table-component';
import './styles.scss';
import Commonbutton from '../button/Button';
import Loader from '../Loader';

const CustomLoader = () => (
  <div style={{height: '100px'}}>
    <Loader />
  </div>
);

function convertArrayOfObjectsToCSV(array) {
  let result;

  const columnDelimiter = ',';
  const lineDelimiter = '\n';
  const keys = Object.keys(array[0]);

  result = '';
  result += keys.join(columnDelimiter);
  result += lineDelimiter;

  array.forEach((item) => {
    let ctr = 0;
    keys.forEach((key) => {
      if (ctr > 0) result += columnDelimiter;
      result += item[key];
      ctr++;
    });
    result += lineDelimiter;
  });

  return result;
}

function downloadCSV(array) {
  const link = document.createElement('a');
  let csv = convertArrayOfObjectsToCSV(array);
  if (csv == null) return;

  const filename = 'export.csv';

  if (!csv.match(/^data:text\/csv/i)) {
    csv = `data:text/csv;charset=utf-8,${csv}`;
  }

  link.setAttribute('href', encodeURI(csv));
  link.setAttribute('download', filename);
  link.click();
}
const Export = ({onExport}) => (
  <Commonbutton
    className="primary button-width"
    onClick={(e) => onExport(e.target.value)}
  >
    Export
  </Commonbutton>
);

createTheme('NcDataTableTheme', {
  text: {
    primary: '#777',
    secondary: '#777'
  }
});

const NcDataTable = ({columns, data, exportCsv, widthHistoryMail, ...rest}) => {
  /*
  widthHistoryMail for only mail history details list
  */
  const customStyles = {
    rows: {
      style: {
        minHeight: '44px' // override the row height
      }
    },
    headCells: {
      style: {
        paddingLeft: widthHistoryMail ? '34px':'8px', // override the cell padding for head cells
        paddingRight: '8px',
        color:'#777',
        fontWeight: 'normal'
      }
    },
    cells: {
      style: {
        paddingLeft: widthHistoryMail ? '34px': '8px', // override the cell padding for data cells
        paddingRight: '8px'
        // '&:not(:last-of-type)': {
        //   borderRightStyle: 'solid',
        //   borderRightWidth: '1px'
        // }
      }
    }
  };

  // const customStyles = {
  //   header: {
  //     style: {
  //       minHeight: '44px'
  //     }
  //   },
  //   headRow: {
  //     style: {
  //       borderTopStyle: 'solid',
  //       borderTopWidth: '1px'
  //     }
  //   },
  //   headCells: {
  //     style: {
  //       '&:not(:last-of-type)': {
  //         borderRightStyle: 'solid',
  //         borderRightWidth: '1px'
  //       }
  //     }
  //   },
  //   cells: {
  //     style: {
  //       '&:not(:last-of-type)': {
  //         borderRightStyle: 'solid',
  //         borderRightWidth: '1px'
  //       }
  //     }
  //   }
  // };
  const actionsMemo = React.useMemo(
    () => <Export onExport={() => downloadCSV(data)} />,
    []
  );

  const paginationOptions = {
    rowsPerPageText: 'ページあたりの行数',
    rangeSeparatorText: 'の',
    selectAllRowsItem: false,
    selectAllRowsItemText: 'みんな'
  };
  return (
    <DataTable
      columns={columns}
      data={data}
      customStyles={customStyles}
      className="nc-data-table"
      theme="NcDataTableTheme"
      fixedHeader
      pagination
      paginationComponentOptions={paginationOptions}
      paginationRowsPerPageOptions={[10, 25, 50, 100]}
      striped
      noDataComponent="何もデータが見つかりませんでした。"
      // dense
      actions={exportCsv && actionsMemo}
      selectableRowsVisibleOnly
      {...rest}
      progressComponent={<CustomLoader />}
    />
  );
};

export default NcDataTable;
