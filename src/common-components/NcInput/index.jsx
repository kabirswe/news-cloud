import React from 'react';
import InputStyle from './ncInput.module.scss';
import RequiredMessage from '../RequiredMessage';

export default function NcInput({
  label,
  className = '', // custom class for overriding style
  isRequired,
  inputRef,
  error,
  errorMessage,
  leftLabel,
  ...rest
}) {
  return (
    <>
      <div className={`${InputStyle.ncInput} ${leftLabel && InputStyle.leftLabel} ${className}`}>
        {label && (
          <label htmlFor="" className={`${InputStyle.commonLabel}`}>
            {label}
            {isRequired && <span className="text-danger">*</span>}
          </label>
        )}
        <div className="input-div">
          <input
            className={`form-control ${(error || errorMessage) && 'error'}`}
            {...rest}
            ref={inputRef}
            autoComplete="off"
            autoFocus="off"
          />
          {errorMessage && (<RequiredMessage customClass={InputStyle.requiredMsg} text={errorMessage}/>)}
        </div>
      </div>
    </>
  );
}
