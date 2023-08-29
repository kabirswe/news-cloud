import React, {Component} from 'react';
import Style from './member.module.scss';
import NcCheckbox from '../../../common-components/NcCheckbox';

export default class MemberListItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {index, item} = this.props;
    return (
      <tr className={Style.userList} key="user-list" onClick={() => this.props.userEdit(item.id)}>
        <td>
          <NcCheckbox
            value=""
            id="abc_123"
            is_active=""
            handleChange={() => console.log('test')}
            label={item.username}
          />
        </td>
        <td>{item.fullname}</td>
        <td>{item.email}</td>
        <td>{item.invitation_status}</td>
        <td>2020/02/10 20:20</td>
        <td>2020/02/10 20:20</td>
      </tr>
    );
  }
}
