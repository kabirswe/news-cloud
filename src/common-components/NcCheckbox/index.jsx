import React from 'react';
import Style from './ncCheckbox.module.scss';

export default function NcCheckbox({
  label,
  handleChange,
  id,
  className = '',
  value,
  name,
  isActive,
  disabled,
  checked,
  ...rest
}) {

  return (
    <>
      {label ? (
        <div className={`${Style.ncCheckbox} ${className}`}>
          <div className="custom-control custom-checkbox">
            <input
              onChange={(e) => handleChange(e)}
              type="checkbox"
              vlaue={value}
              className="custom-control-input d-none"
              id={id}
              name={name}
              defaultChecked={isActive && isActive === 0 ? true : false}
              checked={checked}
              // {...rest}
            />
            <label className={`custom-control-label ${disabled ? Style.checkBoxDisabled : ' '} ${Style.ncLabel}`} htmlFor={id}>
              {label}
            </label>
          </div>
        </div>
      ) : (
        <div
          className={`custom-control custom-checkbox ${Style.ncCheckbox} ${className}`}
        >
          <input
            onChange={handleChange}
            type="checkbox"
            vlaue={value}
            className="custom-control-input d-none"
            id={id}
            name={name}
            disabled={disabled}
            checked={checked}
            defaultChecked={isActive === 0 ? true : false}
            // {...rest}
          />

          <label
            className={`custom-control-label  ${disabled ? Style.checkBoxDisabled : ' '} ${Style.ncLabel}`}
            htmlFor={id}
          ></label>
        </div>
      )}
    </>
  );
}
