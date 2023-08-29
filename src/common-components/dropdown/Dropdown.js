import React from 'react';
import './styles/Dropdown.scss';
import {generateKey} from '../../helper';

const DropDown = (props) => {
  let dropdown = [];
  if (props.defaultOption) {
    dropdown.push(
      <option key={generateKey()} value="">
        {props.defaultOption}
      </option>
    );
  }
  if (props.persistPrevious) {
    dropdown = [];
    dropdown.push(
      <option key={generateKey()} value={props.optionsState.id}>
        {props.optionsState.title}
      </option>
    );
  }
  if (!!props.data) {
    for (let i = 0; i < props.data.length; i++) {
      dropdown.push(
        <option
          key={props.data[i].id}
          value={props.data[i].id}
          disabled={props.data[i].disable === 0}
        >
          {props.data[i].title}
        </option>
      );
    }
  }

  return (
    <select
      className="mdb-select md-form common-dropdown"
      id={props.id}
      onChange={props.onChange}
      disabled={props.disableStatus}
      value={!!props.optionsState && props.optionsState.id}
      key={generateKey()}
      name={props.inputName}
    >
      {dropdown}
      {props.children}
    </select>
  );
};

export default DropDown;
