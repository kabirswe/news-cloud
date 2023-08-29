import React from 'react';
import './style.scss';

export default function Switch({
  label,
  handleChange,
  value,
  name,
  defaultValue,
  disabled,
  styleName
}) {
  return (
    <label className={`switch ${styleName}`}>
      <input
        type="checkbox"
        id="togBtn"
        onChange={handleChange}
        name={name}
        value={value}
        defaultChecked={defaultValue}
        {...disabled}
      />
      <div className="slider round">{label}</div>
    </label>
  );
}
