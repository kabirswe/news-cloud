import React from 'react';
import {ToastContainer, toast} from 'react-toastify';
import {translator} from '../../../localizations';
import {Link} from 'react-router-dom';
import {userModtranslator} from '../modLocalization';
import Style from './userListTable.module.scss';
import UserList from '../UserList';
import 'react-toastify/dist/ReactToastify.css';
import AxiosService from '../../../networks/AxiosService';
import ApiServices from '../../../networks/ApiServices';
import Toast from '../../../common-components/Toast';
import NcDataTable from '../../../common-components/NcDataTable';
import NcInput from '../../../common-components/NcInput';
import NcButton from '../../../common-components/NcButton';
import NcCheckbox from '../../../common-components/NcCheckbox';
import getErrorMessage from '../../../app-constants/ServerErrorInfo';
import userConst from '../../../app-constants/usersConstant';
const invitationStatus = [
  userModtranslator('USER_MANAGEMENT.INVITATION_STATUS.NOT_YET'),
  userModtranslator('USER_MANAGEMENT.INVITATION_STATUS.SENT'),
  userModtranslator('USER_MANAGEMENT.INVITATION_STATUS.ACCEPTED')
];


class UserListTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userBlockListStatus: [],
      apiSuccess: false,
      isDataProcessing: false,
      selectedRows: [],
      isBlockDataChanged: false,
      sendInvitationProcessing: false
    };
    this.userBlockUnBlock = this.userBlockUnBlock.bind(this);
    this.findIndexPostion = this.findIndexPostion.bind(this);
    this.sendUserInvitation = this.sendUserInvitation.bind(this);
    this.columns = [
      {
        name: userModtranslator('USER_MANAGEMENT.USERNAME'),
        selector: 'username',
        sortable: true
      },
      {
        name: userModtranslator('USER_MANAGEMENT.FULL_NAME'),
        selector: 'user_detail.fullname',
        sortable: true
      },
      {
        name: userModtranslator('USER_MANAGEMENT.EMAIL_ADDRESS'),
        selector: 'email',
        sortable: true,
        grow: 2,
        cell: (row) => <div className="email-datatable-custom">
         <Link to={`/edit-user?${row.id}`} style={{ textDecoration:'none', color:'#777' }}>  {row.email} </Link></div>,
      },
      {
        name: userModtranslator('USER_MANAGEMENT.ROLE'),
        selector: 'roles',
        sortable: true,
      },
      {
        name: userModtranslator('USER_MANAGEMENT.INVITATION'),
        selector: 'invitation_status',
        sortable: true,
        cell: (row) => invitationStatus[row.invitation_status] || ''
      },
      {
        name: userModtranslator('USER_MANAGEMENT.PARTICIPATION_DAY'),
        selector: 'first_login_at',
        sortable: true,
        cell: (row) => <div style={{minWidth:'130px'}}>
        <Link to={`/edit-user?${row.id}`} style={{ textDecoration:'none', color:'#777' }}>  {row.first_login_at} </Link></div>,
      },
      {
        name: userModtranslator('USER_MANAGEMENT.LAST_DAY'),
        selector: 'last_login_at',
        sortable: true,
        cell: (row) => <div style={{minWidth:'130px'}}>
        <Link to={`/edit-user?${row.id}`} style={{ textDecoration:'none', color:'#777' }}>  {row.last_login_at} </Link></div>,
      },

      {
        name: userModtranslator('USER_MANAGEMENT.BLOCK'),
        selector: 'is_active',
        sortable: true,
        cell: (row) => (
          <input
            type="checkbox"
            defaultChecked={row.is_active == 0 ? true : false}
            value={row.is_active}
            disabled={
              row.invitation_status != userConst.INVITATION_ACCEPTED ? true : false
            }
            className={
              row.invitation_status != userConst.INVITATION_ACCEPTED
                ? `disabledInput`
                : ''
            }
            onClick={() => this.userBlockUnBlock(row.id)}
          />
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true
      },
      {
        name: userModtranslator('USER_MANAGEMENT.LOCK'),
        selector: 'locked',
        sortable: true,
        cell: (row) =>
          !row.locked ? <div className={Style.lockedText}> {userModtranslator('USER_MANAGEMENT.LOCKED')} </div> : ''
      }
    ];
  }

  async userBlockList(isDataProcessing) {
    if (isDataProcessing) {
      return false;
    }
    this.props.resetAddUserForm();
    let {isBlockDataChanged} = this.state;
    if (!isBlockDataChanged) {
      Toast.error(userModtranslator('USER_MANAGEMENT.BLOCK_UNBLOCK_ERROR'));
      return false;
    }
    this.setState({isDataProcessing: true});
    let update = await AxiosService.put(
      ApiServices.USERS_BLOCK_UNBLOCK,
      {users: JSON.stringify(this.state.userBlockListStatus)},
      false
    )
      .then((response) => {
        const {message} = response.data;
        Toast.success(message);
        this.setState({isDataProcessing: false});
      })
      .catch((error) => {
        let apiError = getErrorMessage(error);
        Toast.error(apiError.message);
        this.setState({isDataProcessing: false});
      });
  }

  findIndexPostion(userId) {
    const {userBlockListStatus} = this.state;
    for (let index = 0; index < userBlockListStatus.length; index++) {
      if (userBlockListStatus[index].user_id === userId) {
        return index;
      }
    }
  }

  userBlockUnBlock(user_id) {
    const {userBlockListStatus} = this.state;
    const userIndex = this.findIndexPostion(user_id);
    setTimeout(() => {
      if (userBlockListStatus[userIndex]) {
        userBlockListStatus[userIndex].is_active =
          userBlockListStatus[userIndex].is_active === 0 ? 1 : 0;
        this.setState({
          userBlockListStatus: userBlockListStatus,
          isBlockDataChanged: true
        });
      }
    }, 100);
  }

  componentDidMount() {
    const {userList} = this.props;
    const {userBlockListStatus} = this.state;
    userList &&
      userList.map((user, index) => {
        const userInfoWithStatus = {
          user_id: user.id,
          is_active: user.is_active
        };
        userBlockListStatus.push(userInfoWithStatus);
      });
    this.setState({userBlockListStatus: userBlockListStatus});
  }

  getSelectedRows = (row) => {
    this.setState(
      {
        selectedRows: row.selectedRows
      }
    );
  };
  selectRowClick = (row) => {
    this.props.goEditUserPage(row.id);
  };
  updateState = (state) => {
    this.setState({selectedRows: state.selectedRows});
  };
  sendUserInvitation() {
    this.props.resetAddUserForm();
    let {selectedRows} = this.state;
    if (selectedRows.length) {
      let selectedUser = [];
      selectedRows.forEach((user) => {
        selectedUser.push(user.id);
      });
      this.setState({sendInvitationProcessing: true});
      let users = selectedUser.join(',');
      AxiosService.post(ApiServices.BULK_USER_INVITATION, {users: users}, false)
        .then((response) => {
          const data = response.data;
          if (data.status) {
            Toast.success(data.message);
          } else {
            Toast.error(data.message);
          }
          this.setState({sendInvitationProcessing: false});
          this.props.resetUserList();
        })
        .catch((error) => {
          let apiError = getErrorMessage(error);
          Toast.error(apiError.message);
          this.setState({sendInvitationProcessing: false});
        });
    } else {
      this.setState({sendInvitationProcessing: false});
      Toast.error(userModtranslator('USER_MANAGEMENT.USER_SELECT_ERROR'));
    }
  }
  render() {
    const {userList} = this.props;
    const {
      apiSuccess,
      isDataProcessing,
      isBlockDataChanged,
      sendInvitationProcessing
    } = this.state;
    return (
      <>
        <div className={Style.tableWrapper}>
          <div className="row">
            <div className="col-sm-12">{/* <Toast /> */}</div>
          </div>
          <NcDataTable
            data={userList}
            columns={this.columns}
            selectableRows
            onSelectedRowsChange={this.getSelectedRows}
            onRowClicked={this.selectRowClick}
            selectableRowsComponentProps={{defaultChecked: 0}}
          />
        </div>
        <div className={`float-right ${Style.invitationBlockBtnArea}`}>
          <NcButton
            type="button"
            className={
              sendInvitationProcessing
                ? `${Style.invitationBtn} ${Style.disabledBtn} `
                : `${Style.invitationBtn} `
            }
            callback={() => this.sendUserInvitation()}
          >
            {userModtranslator('USER_MANAGEMENT.INVITATION')}
          </NcButton>

          <NcButton
            type="button"
            className={
              isDataProcessing
                ? `${Style.invitationBtn} ${Style.disabledBtn} `
                : `${Style.invitationBtn} `
            }
            callback={() => this.userBlockList(isDataProcessing)}
          >
            {userModtranslator('USER_MANAGEMENT.SAVE')}
          </NcButton>
        </div>
      </>
    );
  }
}
export default UserListTable;
