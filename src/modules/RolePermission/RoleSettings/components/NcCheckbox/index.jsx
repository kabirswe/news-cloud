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
  defaultChecked,
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
              className="custom-control-input"
              id={id}
              name={name}
              defaultChecked={defaultChecked}
              {...rest}
            />
            <label className={`custom-control-label ${Style.ncLabel}`} htmlFor={id}>
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
            className="custom-control-input"
            id={id}
            name={name}
            disabled={disabled}
            defaultChecked={defaultChecked}
            {...rest}
          />

          <label
            className={`custom-control-label ${Style.ncLabel}`}
            htmlFor={id}
          ></label>
        </div>
      )}
    </>
  );
}
