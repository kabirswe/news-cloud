import React from 'react';

import NcCheckbox from '../NcCheckbox';
import Style from './ncCheckboxLabel.module.scss';

export default function NcCheckBoxWithLabel({
  id,
  handleChange,
  value,
  labelClass = '',
  className = '',
  label
}) {
  return (
    <>
      <div className={`${Style.checkboxLabel} ${className}`}>
        <NcCheckbox handleChange={handleChange} id={id} vlaue={value} />
        <label className={`${Style.label} ${labelClass}`} htmlFor={id}>
          {label}
        </label>
      </div>
    </>
  );
}
