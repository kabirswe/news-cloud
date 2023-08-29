import React from 'react';
import './style.scss';

export default function Switch({label, handleChange, value, name}) {
  return (
    <label className="switch">
      <input
        type="checkbox"
        id="togBtn"
        onChange={handleChange}
        name={name}
        value={value}
      />
      <div className="slider round">{label}</div>
    </label>
  );
}
