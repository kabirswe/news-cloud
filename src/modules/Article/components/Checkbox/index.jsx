import React from 'react';
import './style.scss';

export default function Checkbox({label, handleChange, id, value, name, isChecked}) {
  const checked = isChecked ? true : false;
  return (
    <label className="container">
      {label}
      <input
        type="checkbox"
        onChange={handleChange}
        value={value}
        className="custom-control-input"
        id={id}
        name={name}
        checked={checked}
      />
      <span className="checkmark"></span>
    </label>
  );
}
