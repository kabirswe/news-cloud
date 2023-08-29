import React, {Component} from 'react';
import Style from '../List/member.module.scss';
import NcCheckbox from '../../../common-components/NcCheckbox';

export default class PermissionListItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {index} = this.props;

    return (
      <tr className={Style.userList} key={'user-list'}>
        <td>{`User Full Name ${index}`} </td>
        <td>{`user_email_${index}_@mail.com `}</td>
        <td className="text-center">
          <NcCheckbox
            value=""
            id={`abc_${index}`}
            is_active=""
            handleChange={() => console.log('test')}
          />
        </td>
        <td className="text-center">
          <NcCheckbox
            value=""
            id={`def_${index}`}
            is_active=""
            handleChange={() => console.log('test')}
          />
        </td>
        <td className="text-center">
          <NcCheckbox
            value=""
            id={`ghi_${index}`}
            is_active=""
            handleChange={() => console.log('test')}
          />
        </td>
        <td className="text-center">
          <NcCheckbox
            value=""
            id={`jkl_${index}`}
            is_active=""
            handleChange={() => console.log('test')}
          />
        </td>
      </tr>
    );
  }
}
