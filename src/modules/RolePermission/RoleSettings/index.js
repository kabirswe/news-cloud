import React, {Component} from 'react';
import {Modal, ModalHeader, ModalBody, ModalFooter, Alert} from 'reactstrap';
import {connect} from 'react-redux';
import { withRouter } from 'react-router-dom';
import SystemSettingsLayout from '../../../containers/SystemSettingsLayout';
import RoleTable from './components/RoleTable';
import {roleModtranslator} from '../RoleSettings/modLocalization';
import Style from './components/RoleTable/roleTable.module.scss';
import Inputfield from '../../../common-components/inputfield/Inputfield';
import ApiServices from '../../../networks/ApiServices';
import AxiosService from '../../../networks/AxiosService';
import Loader from '../../../common-components/Loader';
import {setSystemSettingsMenu} from '../../../redux/actions/common';
import Toast from '../../../common-components/Toast';
import {routes} from '../../../app-constants';
import RequiredMessage from '../../../common-components/RequiredMessage';
import './role-settings.scss';
import NcBreadcrumbs from '../../../common-components/NcBreadcrumbs/ncBreadcrumbs';
import getErrorMessage from '../../../app-constants/ServerErrorInfo';
import NcButton from '../../../common-components/NcButton';
import {CloseCircleSharp} from './mod-assets/svgComp';
import NcInput from '../../../common-components/NcInput';
import path from '../../../routes/path';
class SystemRoleSettings extends Component {
  constructor(props) {
    super(props);
    this.rolesMap = new Map();
    this.rolesNameMap = new Map();
    this.state = {
      userList: [],
      isLoader: true,
      isCreateInput: false,
      permissoinList: [],
      roleList: [],
      isLoading: true,
      isUpdating: false,
      success: false,
      inputError: false,
      errorMsg: '',
      successMsg: '',
      isRoleNameError: false,
      roleNameErrorMsg: '',
      reloadRole: false,
      isAddingNewRole: false,
      isRoleEditMode: false
    };
    this.saveNewRole = this.saveNewRole.bind(this);
    this.openRoleModal = this.openRoleModal.bind(this);
    this.closeRoleModal = this.closeRoleModal.bind(this);
    this.editRoleName = this.editRoleName.bind(this);
    this.updateRoleName = this.updateRoleName.bind(this);
  }
  openRoleModal() {
    this.setState({
      isOpenRoleModal: true,
      isRoleNameError: false,
      roleNameErrorMsg: '',
      isRoleEditMode: false
    });
  }
  closeRoleModal() {
    this.setState({
      isOpenRoleModal: false,
      isRoleNameError: false,
      roleNameErrorMsg: ''
    });
  }
  handleChange = (event) => {
    let {error, success} = this.state;
    let {checked, name = '', id, value} = event.target;
    let [role, permission_id] = name.split(',');
    role = Number(role);
    if (error) {
      this.setState({
        error: false
      });
    }
    if (success) {
      this.setState({
        success: false
      });
    }

    if (checked) {
      // new permission giving or modifying existing permission

      if (this.rolesMap.has(role)) {
        let perm = this.rolesMap.get(role);
        let isExisting = false; // if permission already exist
        let modified = perm.map((p) => {
          if (p.permission_id == permission_id) {
            // toggle it's status
            p.permission_checked = !p.permission_checked;
            isExisting = true;
            return p;
          }
          return p;
        });
        if (!isExisting) {
          // otherwise save newly given permission

          modified.push({
            permission_id: Number(permission_id),
            permission_checked: true
          });
        }
        this.rolesMap.set(role, [...modified]);
      } else {
        // create if this role does not exist(added new role by pressing save button )
        this.rolesMap.set(role, [
          {permission_id: Number(permission_id), permission_checked: true}
        ]);
      }
    } else {
      // revoke permission
      if (this.rolesMap.has(role)) {
        let perm = this.rolesMap.get(role);
        let modified = perm.map((p) => {
          // find that exact permission that has been revoked
          if (p.permission_id == permission_id) {
            p.permission_checked = !p.permission_checked; // and change its status
            return p;
          }
          return p;
        });
        this.rolesMap.set(role, [...modified]);
      }
    }
  };

  removeWhiteSpace = (str = '') => {
    let removeWhiteSpace = (str && str.replace(/ +/g, ' ')) || '';
    return removeWhiteSpace.trim();
  };

  saveNewRole() {
    let entries = [...this.rolesMap.entries()];
    let {roleList, permissoinList, isRoleEditMode} = this.state;
    let list = [...roleList];
    let roleName = this.roleName.value.trim();
    if (roleName.length && roleName.length <= 50) {
      if (entries.length < 15) {
        if (this.state.isAddingNewRole) {
          return false;
        }
        this.setState({isAddingNewRole: true});
        AxiosService.post(
          ApiServices.ADD_NEW_ROLE,
          {name: this.roleName.value.trim()},
          false
        )
          .then((response) => {
            let result = response.data;
            if (result.status) {
              Toast.success(result.message);
              this.setState({isOpenRoleModal: false, isAddingNewRole: false});
              this.getRolePermissionSetting(true);
            } else {
              this.setState({
                isOpenRoleModal: true,
                isRoleNameError: true,
                roleNameErrorMsg: result.message,
                isAddingNewRole: false
              });
            }
          })
          .catch((err) => {
            const apiError = getErrorMessage(err);
            if (err.response && err.response.status == 422) {
              this.setState({
                isOpenRoleModal: true,
                isRoleNameError: true,
                isAddingNewRole: false,
                roleNameErrorMsg:
                  err.response.data && err.response.data.error
                    ? err.response.data.error.name[0]
                    : apiError.message
              });
            } else {
              this.setState({
                isOpenRoleModal: true,
                isRoleNameError: true,
                roleNameErrorMsg: apiError.message,
                isAddingNewRole: false
              });
            }
          });
      } else {
        this.setState({
          isRoleNameError: true,
          isAddingNewRole: false,
          roleNameErrorMsg: roleModtranslator('ROLES.ROLE_LIMIT_EXCEED')
        });
      }
    } else {
      this.setState({
        inputError: true,
        isRoleNameError: true,
        isAddingNewRole: false,
        roleNameErrorMsg: roleModtranslator('ROLES.UNSAVED_CHANGES')
      });
    }
  }

  updateRoleName() {
    let roleName = this.roleName.value.trim();
    if (roleName.length && roleName.length <= 50) {
      if (this.state.isAddingNewRole) {
        return false;
      }
      this.setState({isAddingNewRole: true});
      AxiosService.put(
        ApiServices.UPDATE_ROLE + this.state.editRoleId,
        {name: this.roleName.value.trim()},
        false
      )
        .then((response) => {
          let result = response.data;
          if (result.status) {
            Toast.success(result.message);
            this.setState({
              isOpenRoleModal: false,
              isRoleEditMode: false,
              isAddingNewRole: false
            });
            this.getRolePermissionSetting(true);
          } else {
            this.setState({
              isOpenRoleModal: true,
              isRoleNameError: true,
              roleNameErrorMsg: result.message,
              isAddingNewRole: false
            });
          }
        })
        .catch((err) => {
          const apiError = getErrorMessage(err);
          if (err.response && err.response.status == 422) {
            this.setState({
              isOpenRoleModal: true,
              isRoleNameError: true,
              isAddingNewRole: false,
              roleNameErrorMsg:
                err.response.data && err.response.data.error
                  ? err.response.data.error.name[0]
                  : apiError.message
            });
          } else {
            this.setState({
              isOpenRoleModal: true,
              isRoleNameError: true,
              roleNameErrorMsg: apiError.message,
              isAddingNewRole: false
            });
          }
        });
    } else {
      this.setState({
        inputError: true,
        isRoleNameError: true,
        isAddingNewRole: false,
        roleNameErrorMsg: roleModtranslator('ROLES.UNSAVED_CHANGES')
      });
    }
  }
  redirectToLogin(error = {}) {
    setTimeout(() => {
      if (error.response && error.response.status == 401) {
        this.props.history.push('/login');
      }
    }, 2000);
  }

  validateRole = () => {
    let entries = [...this.rolesMap.entries()];
    let revokedRoles = [];
    let emptyPermissions = [];
    let formatedData = [];
    for (let [key, value] of entries) {
      let totalPermissions = value.length;
      let revokedPermissions = value.filter((p) => p.permission_checked == false);
      if (totalPermissions == revokedPermissions.length) {
        // no permisson has been given for this role
        revokedRoles.push(key);
      } else if (!value.length) {
        // at least one permission should be present
        emptyPermissions.push(key);
      } else {
        // prepare data for sending in server
        formatedData.push({
          // role_display_name: key,
          role_id: key,
          permissions: value
        });
      }
    }

    return {
      revoked: revokedRoles,
      emptyPermissions,
      data: formatedData
    };
  };
  roleNameInput() {
    this.setState({isRoleNameError: false});
  }
  updateRole = () => {
    let {isUpdating, isCreateInput} = this.state;
    if (isUpdating) {
      // prevent multiple button press while request is being process
      return;
    }
    if (isCreateInput) {
      Toast.error(roleModtranslator('ROLES.UNSAVED_CHANGES'));
      this.setState({
        error: true
      });
      window.scrollTo(0, 0);
      return;
    }
    let {revoked, emptyPermissions, data} = this.validateRole();
    if (revoked.length || emptyPermissions.length) {
      Toast.error(roleModtranslator('ROLES.WARNING'));
      this.setState({
        error: true
      });
      window.scrollTo(0, 0);
      return;
    }
    AxiosService.put(
      ApiServices.UPDATE_PERMISSION,
      {rolePermissions: JSON.stringify(data)},
      false,
      false
    )
      .then((result) => {
        Toast.success(roleModtranslator('ROLES.SUCCESS'));
        this.setState({
          isUpdating: false,
          success: true
        });
        window.scroll(0, 0);
      })
      .catch((error) => {
        this.setState({
          isUpdating: false
        });
        let apiError = getErrorMessage(error);
        Toast.error(apiError.message);
        window.scroll(0, 0);
      });

    // setting true prevents multiple request by pressing save button
    this.setState({
      isUpdating: true
    });
  };

  handleNewRoleChange = () => {
    this.setState({
      error: false,
      inputError: false
    });
  };

  handleKeyDown = (e) => {
    if (e.keyCode == 13) {
      this.saveNewRole(e);
    }
  };

  componentDidMount() {
    this.props.setSystemSettingsMenu('role');
    this.getRolePermissionSetting();
  }

  getRolePermissionSetting(reloadRole = false) {
    this.setState({reloadRole});
    let permissions = AxiosService.get(ApiServices.PERMISSION_LIST, false, false);
    // get roles
    let roles = AxiosService.get(ApiServices.DEFAULT_PERMISSION, false, false);
    Promise.all([permissions, roles])
      .then(([permissions, roles]) => {
        let permissoinList = permissions.data.data.list || [];
        let roleData = roles.data.data.list || [];
        roleData &&
          roleData.forEach((role) => {
            let permissions = [];
            if (role) {
              role.permissions.forEach((perm) => {
                permissions.push({
                  permission_id: perm.id,
                  permission_checked: perm.checked
                });
              });
            }
            //  this.rolesMap.set(this.removeWhiteSpace(role.display_name), permissions);
            this.rolesMap.set(Number(role.id), permissions);
            this.rolesNameMap.set(this.removeWhiteSpace(role.display_name));
          });
        this.setState({
          permissoinList: permissoinList,
          roleList: roleData,
          isLoading: false,
          reloadRole: false
        });
      })
      .catch((error) => {
        let apiError = getErrorMessage(error);
        Toast.error(apiError.message);
        this.setState({reloadRole: false});
        this.redirectToLogin(error);
      });
  }

  editRoleName(param) {
    this.setState({
      isOpenRoleModal: true,
      isRoleEditMode: true,
      editRoleId: param.roleId
    });
    setTimeout(() => {
      this.roleName.value = param.roleName && param.roleName.trim();
    }, 400);
  }
  render() {
    let {
      permissoinList,
      roleList,
      isLoading,
      isUpdating,
      inputError,
      isOpenRoleModal,
      roleNameErrorMsg,
      isRoleNameError,
      reloadRole,
      isAddingNewRole,
      isRoleEditMode
    } = this.state;
    const breadcrumbs = [
      {title: roleModtranslator('ROLES.SYSTEM_SETTING'), link: path.role},
      {title: roleModtranslator('ROLES.BREAD_CRUMB_TITLE'), link: '', active: true}
    ];
    return (
      <SystemSettingsLayout>
        <div className="container-fluid user-management">
          <Toast />
          <NcBreadcrumbs breadcrumbs={breadcrumbs} />
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <div className="row">
                <div className="col-sm-12">
                  <div className="title">
                    {' '}
                    {roleModtranslator('ROLES.BREAD_CRUMB_TITLE')}{' '}
                  </div>
                  {reloadRole ? (
                    <Loader />
                  ) : (
                    <>
                      <div className="row user-role">
                        <div className="col-12 ">
                          {permissoinList && (
                            <RoleTable
                              handleChange={this.handleChange}
                              medias={roleList}
                              isRoleSetting={true}
                              className="system-roles"
                              roleTitleList={permissoinList}
                              editRoleName={this.editRoleName}
                            />
                          )}
                        </div>
                      </div>
                      <div className="create-new-role">
                        <div className="button-groups">
                          <NcButton
                            type="button"
                            className={
                              isUpdating
                                ? `disabledBtn invitationBtn`
                                : `invitationBtn`
                            }
                            callback={() => this.openRoleModal()}
                          >
                            {roleModtranslator('ROLES.CREATE_ROLE')}
                          </NcButton>

                          <NcButton
                            type="button"
                            className={
                              isUpdating
                                ? `disabledBtn invitationBtn`
                                : `invitationBtn`
                            }
                            callback={() => this.updateRole()}
                          >
                            {roleModtranslator('ROLES.UPDATE')}
                          </NcButton>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <Modal
          isOpen={isOpenRoleModal}
          toggle={this.toggleModalRole}
          contentClassName={Style.roleModal}
          backdropClassName={Style.backDrop}
          centered
        >
          <ModalHeader className={Style.modalHeader}>
            {isRoleEditMode
              ? roleModtranslator('ROLES.EDIT_ROLE')
              : roleModtranslator('ROLES.ADD_ROLE')}
            <div
              className={Style.customClose}
              tabIndex={0}
              role="button"
              onClick={() => this.closeRoleModal()}
            >
              <CloseCircleSharp />
            </div>
          </ModalHeader>

          <ModalBody className={Style.modalBody}>
            <NcInput
              leftLabel={true}
              label={roleModtranslator('ROLES.ROLE_NAME')}
              placeholder={roleModtranslator('ROLES.ROLE_NAME_PLACEHOLDER')}
              className={Style.roleInput}
              inputRef={(input) => (this.roleName = input)}
              errorMessage={isRoleNameError ? roleNameErrorMsg : ''}
              onChange={() => this.roleNameInput()}
              maxLength={50}
            />
          </ModalBody>
          <ModalFooter className={Style.modalFooter}>
            <NcButton
              className={
                isAddingNewRole ? `disabledBtn invitationBtn ` : `invitationBtn`
              }
              callback={() =>
                isRoleEditMode ? this.updateRoleName() : this.saveNewRole()
              }
            >
              {roleModtranslator('ROLES.SAVE')}
            </NcButton>

            <NcButton
              className={`${Style.commonButton} ${Style.dangerBtn}`}
              callback={this.closeRoleModal}
            >
              {roleModtranslator('ROLES.CANCEL')}
            </NcButton>
          </ModalFooter>
        </Modal>
      </SystemSettingsLayout>
    );
  }
}

function mapStateToProps(state) {
  return {
    activeSystemMenu: state.commonReducer.activeSystemMenu
  };
}
function mapDispatchToProps(dispatch) {
  return {
    setSystemSettingsMenu: (menu) => dispatch(setSystemSettingsMenu(menu))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(SystemRoleSettings));
