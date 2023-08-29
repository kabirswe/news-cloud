import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import DefaultLayout from '../../../containers/DefaultLayout';
import Style from './member.module.scss';
import {memberModtranslator} from '../modLocalization';
import Commonbutton from '../../../common-components/button/Button';
import {PeopleSharp, PersonAddSharp} from '../mod-assets/svgComp';
import path from '../../../routes/path';
import {
  fieldInitialization,
  getMemberList,
  memberFileDownload,
  memberFileUpload,
  memberInvitation
} from '../../../redux/actions/Member';
import Loader from '../../../common-components/Loader';
import Toast from '../../../common-components/Toast';
import NcDataTable from '../../../common-components/NcDataTable';
import {generateKey, isObjectEmpty, modifyMemberData} from '../../../helper';
import AlertModal from '../../../common-components/alertModal';
import NcBreadcrumbs from '../../../common-components/NcBreadcrumbs/ncBreadcrumbs';
import NcCheckbox from '../../../common-components/NcCheckbox';
import SpinnerLoader from '../../../common-components/spinnerLoader';
import NcButton from '../../../common-components/NcButton';
import ConfirmationModal from '../../../common-components/confirmationModal';

class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDataProcessing: false,
      selectedRows: [],
      clearSelectedRows: false,
      showAlert: false,
      showInviteAlert: false,
      showAlertMsg: '',
      serachQuery: '',
      filteredData: this.props.memberList,
      searchText: '',
      actionName: '',
      tableLoading: true,
      isHardDelete: false
    };
    this.columns = [
      {
        name: memberModtranslator('MEMBER.MEMBER_ID'),
        selector: 'username',
        sortable: true
      },
      {
        name: memberModtranslator('MEMBER.FULL_NAME'),
        selector: 'fullname',
        sortable: true
      },
      {
        name: memberModtranslator('MEMBER.MAIL_ADDRESS'),
        selector: 'email',
        grow: 2,
        sortable: true,
        cell: (row) => (
          <div
            className="email-datatable-custom"
            onClick={() => this.handleUserEdit(row)}
          >
            {' '}
            {row.email}{' '}
          </div>
        )
      },
      {
        name: memberModtranslator('MEMBER.INVITATION_FIELD'),
        selector: 'invitation_status',
        sortable: true
      },
      {
        name: memberModtranslator('MEMBER.FIRST_DAY'),
        selector: 'first_login_at',
        sortable: true
      },
      {
        name: memberModtranslator('MEMBER.PARTICIPATION_DAY'),
        selector: 'last_login_at',
        sortable: true
      }
    ];
  }

  componentDidMount() {
    this.props.fieldInitialization({
      selectedMemberId: '',
      selectedMember: {}
    });
    this.props.getMemberList();
  }

  componentWillUnmount() {
    this.props.fieldInitialization({
      memberList: []
    });
  }

  searchHandleChange = (searchQuery) => {
    const data = modifyMemberData(this.props.memberList);
    const filteredData = data.filter(
      (item) =>
        (item.username &&
          item.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.email &&
          item.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.fullname &&
          item.fullname.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.invitation_status &&
          item.invitation_status
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (item.first_login_at &&
          item.first_login_at.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.last_login_at &&
          item.last_login_at.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return filteredData;
  };

  handleAddMember = () => {
    this.props.fieldInitialization({
      selectedMemberId: '',
      apiSuccess: '',
      selectedMember: {}
    });
    this.props.history.push(path.memberSave);
  };

  handleUserEdit = (row) => {
    this.props.fieldInitialization({
      selectedMemberId: row.id,
      apiSuccess: '',
      selectedMember: {}
    });
    this.props.history.push(path.memberSave);
  };

  handleFileDownload = () => {
    this.setState({tableLoading: false}, () => {
      this.setState({actionName: 'download'});
      this.props.memberFileDownload();
    });
  };

  getSelectedRows = (row) => {
    this.setState(
      {
        selectedRows: row.selectedRows
      },
      () => console.log(this.state.selectedRows)
    );
  };

  handleInvitation = (e) => {
    const {selectedRows} = this.state;
    const memberIds = [];
    const param = '';
    if (!isObjectEmpty(selectedRows)) {
      this.setState({showInviteAlert: true});
    } else {
      Toast.error(memberModtranslator('MEMBER.MEMBER_REQUIRED_TEXT'));
    }
  };

  handleInvitationComfirmation() {
    this.setState({showInviteAlert: false});
    const {selectedRows} = this.state;
    const memberIds = [];
    let param = '';
    selectedRows.forEach((item) => {
      memberIds.push(item.id);
    });
    if (!!memberIds) {
      param = memberIds.join();
      if (!!param) {
        this.props.memberInvitation({members: param});
        this.setState({clearSelectedRows: true});
        Toast.clear();
      }
    }
  }

  cancelClick = () => {
    this.setState(() => ({
      showAlert: false,
      showAlertMsg: '',
      file: ''
    }));
  };

  onChangeFile(event) {
    // event.stopPropagation();
    event.preventDefault();
    const actionKey = event.target.name;
    const file = event.target.files[0];
    console.log(!!file.name.match(/.(csv)$/i));

    if (file) {
      this.setState({file}, () => {
        const maxFileSize = 2 * 1024 * 1024; // max allow 2MB

        if (!file.name.match(/.(csv)$/i) || file.size >= maxFileSize) {
          if (!file.name.match(/.(csv)$/i)) {
            Toast.error(memberModtranslator('MEMBER.CSV_ERROR.FORMAT'));
          } else {
            Toast.error(memberModtranslator('MEMBER.CSV_ERROR.SIZE'));
          }
          window.scrollTo(0, 0);
        } else {
          Toast.clear();
          this.setState({actionName: actionKey});
          if (actionKey === 'delete') {
            this.setState(() => ({
              showAlert: true
            }));
          } else {
            const formData = new FormData();
            formData.append('members', this.state.file);
            formData.append('deleteType', this.state.isHardDelete ? 1 : 0);
            this.setState({tableLoading: true}, () => {
              // this.setState({actionName: actionKey});
              this.props.memberFileUpload({param: formData, type: actionKey});
              this.setState({isHardDelete: false});
            });
          }
        }
      });
    }
  }

  handleCSV = () => {
    const {actionName} = this.state;
    this.setState(
      () => ({
        showAlert: false
      }),
      () => {
        const formData = new FormData();
        formData.append('members', this.state.file);
        formData.append('deleteType', this.state.isHardDelete ? 1 : 0);
        this.setState({tableLoading: true}, () => {
          this.props.memberFileUpload({param: formData, type: actionName});
          this.setState({isHardDelete: false});
        });
      }
    );
  };

  handleDeleteType = (event) => {
    this.setState({isHardDelete: event.target.checked});
  };

  render() {
    const {memberList, globalSearchText, isBtnActive, isLoadingInvite} = this.props;
    const {actionName} = this.state;
    const breadcrumbs = [
      {
        title: memberModtranslator('MEMBER.MEMBER_LINK'),
        link: path.memberList,
        active: true
      },
      {
        title: '',
        link: '',
        active: true
      }
    ];
    return (
      <DefaultLayout>
        {/* <AlertModal */}
        {/*  key={generateKey()} */}
        {/*  isActive={this.state.showAlert} */}
        {/*  body={this.state.showAlertMsg} */}
        {/*  cancelClick={() => this.cancelClick()} */}
        {/* /> */}

        <ConfirmationModal
          key={generateKey()}
          isActive={this.state.showInviteAlert}
          title={memberModtranslator('MEMBER.MODAL_TITLE_INVITE')}
          body={memberModtranslator('MEMBER.INVITE_TEXT')}
          okClick={() => this.handleInvitationComfirmation()}
          cancelClick={() =>
            this.setState(() => ({
              showInviteAlert: false,
              clearSelectedRows: true
            }))
          }
        />
        <ConfirmationModal
          key={generateKey()}
          isActive={this.state.showAlert}
          title={memberModtranslator('MEMBER.MODAL_TITLE')}
          body={memberModtranslator('MEMBER.DELETE_TEXT_CSV')}
          okClick={() => this.handleCSV()}
          cancelClick={() => this.cancelClick()}
        />
        {!this.props.loading ? (
          <div className="container-fluid">
            <div className={`row ${Style.memberComponent}`}>
              <div className={`col-lg-12  ${Style.pageHeading}`}>
                <NcBreadcrumbs breadcrumbs={breadcrumbs} />
                <Toast />
                <div className={`${Style.pageTitle}`}>
                  {memberModtranslator('MEMBER.PAGE_TITLE')}
                </div>
                <div className={Style.memberBtnContent}>
                  <div className={Style.memberBtnContentSpace}>
                    <div className={`${Style.commonButton} ${Style.invite}`}>
                      <Commonbutton
                        className="default-white"
                        onClick={(e) => this.handleInvitation(e)}
                      >
                        <PeopleSharp className={Style.icon} />
                        {memberModtranslator('MEMBER.INVITATION')}
                      </Commonbutton>
                    </div>
                    <div className={`${Style.commonButton} ${Style.addMember}`}>
                      <Commonbutton
                        className="default-white"
                        type="button"
                        onClick={() => this.handleAddMember()}
                      >
                        <PersonAddSharp className={Style.icon} />
                        {memberModtranslator('MEMBER.MEMBER_ADDITION')}
                      </Commonbutton>
                    </div>
                    <div className={`${Style.commonButton} ${Style.download}`}>
                      <Commonbutton
                        className={`primary-medium ${isBtnActive &&
                          actionName === 'download' &&
                          'csvLoder'}`}
                        onClick={() => this.handleFileDownload()}
                        disabled={
                          (isObjectEmpty(memberList) && true) ||
                          (this.props.isBtnActive && actionName !== 'download')
                        }
                      >
                        {memberModtranslator('MEMBER.CSV_DOWNLOAD')}
                        {isBtnActive && actionName === 'download' && (
                          <SpinnerLoader />
                        )}
                      </Commonbutton>
                    </div>
                    <div className={`${Style.commonButton} ${Style.csvAdd}`}>
                      <input
                        id="myInput"
                        type="file"
                        name="upload"
                        key={generateKey()}
                        ref={(ref) => (this.upload = ref)}
                        style={{display: 'none'}}
                        onChange={this.onChangeFile.bind(this)}
                      />
                      <Commonbutton
                        className={`primary-medium ${isBtnActive &&
                          actionName === 'upload' &&
                          'csvLoder'}`}
                        onClick={() => {
                          this.upload.click();
                        }}
                        disabled={this.props.isBtnActive && actionName !== 'upload'}
                      >
                        {memberModtranslator('MEMBER.CSV_addition')}
                        {isBtnActive && actionName === 'upload' && <SpinnerLoader />}
                      </Commonbutton>
                    </div>
                    {/* <div className={`${Style.commonButton} ${Style.csvDelete}`}> */}
                    {/*  <input */}
                    {/*    id="myInputDelete" */}
                    {/*    type="file" */}
                    {/*    name="delete" */}
                    {/*    key={generateKey()} */}
                    {/*    ref={(ref) => (this.delete = ref)} */}
                    {/*    style={{display: 'none'}} */}
                    {/*    onChange={this.onChangeFile.bind(this)} */}
                    {/*  /> */}
                    {/*  <Commonbutton */}
                    {/*    className="danger" */}
                    {/*    onClick={() => { */}
                    {/*      this.delete.click(); */}
                    {/*    }} */}
                    {/*    disabled={ */}
                    {/*      (isObjectEmpty(memberList) && true) || */}
                    {/*      this.props.isBtnActive */}
                    {/*    } */}
                    {/*  > */}
                    {/*    {memberModtranslator('MEMBER.CSV_delete')} */}
                    {/*  </Commonbutton> */}
                    {/* </div> */}
                  </div>
                </div>
              </div>
              <div className={`col-lg-12 ${Style.memberPagination}`}>
                <NcDataTable
                  columns={this.columns}
                  data={
                    !!globalSearchText
                      ? this.searchHandleChange(globalSearchText)
                      : modifyMemberData(this.props.memberList)
                  }
                  selectableRows
                  clearSelectedRows={this.state.clearSelectedRows}
                  progressPending={this.state.tableLoading && this.props.isBtnActive}
                  onSelectedRowsChange={this.getSelectedRows}
                  onRowClicked={this.handleUserEdit}
                />
              </div>
              <div className={`col-lg-12 ${Style.memberPagination}`}>
                {!isObjectEmpty(this.props.memberList) && (
                  <div className={Style.memberDeleteContent}>
                    <div className={Style.deleteText}>
                      <NcCheckbox
                        className={`${Style.disabledBtn}`}
                        id="deletedId"
                        label=""
                        handleChange={(event) => this.handleDeleteType(event)}
                        checked={this.state.isHardDelete}
                      />
                      <div className="">
                        <span>
                          {memberModtranslator('MEMBER.DELETE_ALERT_TEXT')}
                        </span>
                      </div>
                      <div className={`${Style.commonButton} ${Style.csvDelete}`}>
                        <input
                          id="myInputDelete"
                          type="file"
                          name="delete"
                          key={generateKey()}
                          ref={(ref) => (this.delete = ref)}
                          style={{display: 'none'}}
                          onChange={this.onChangeFile.bind(this)}
                        />
                        <Commonbutton
                          className={`danger ${isBtnActive &&
                            actionName === 'delete' &&
                            'csvLoder'}`}
                          onClick={() => {
                            this.delete.click();
                          }}
                          disabled={
                            (isObjectEmpty(memberList) && true) ||
                            (isBtnActive && actionName !== 'delete')
                          }
                        >
                          {memberModtranslator('MEMBER.CSV_delete')}
                          {isBtnActive && actionName === 'delete' && (
                            <SpinnerLoader />
                          )}
                        </Commonbutton>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Loader />
        )}
      </DefaultLayout>
    );
  }
}

function mapStateToProps(state) {
  return {
    lang: state.commonReducer.lang,
    globalSearchText: state.commonReducer.globalSearchText,
    loading: state.memberReducer.loading,
    memberList: state.memberReducer.memberList,
    isBtnActive: state.memberReducer.isBtnActive
  };
}
function mapDispatchToProps(dispatch) {
  return {
    fieldInitialization: (data) => dispatch(fieldInitialization(data)),
    getMemberList: () => dispatch(getMemberList()),
    memberFileDownload: () => dispatch(memberFileDownload()),
    memberInvitation: (data) => dispatch(memberInvitation(data)),
    memberFileUpload: (data) => dispatch(memberFileUpload(data))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(List));
