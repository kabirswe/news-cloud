import React from 'react';
import './styles/Input.scss';

const Inputfield = (props) => {
  const active = props.textAlign ? 'right-input-text' : '';
  const isError = props.isError || '';
  const isDisabled = props.isDisabled || false;
  const disabledClass = isDisabled ? 'disabled' : '';
  const isMultiple = props.isMultiple ? true : false;
  return (
    <input
      className={`input-box ${active} ${isError} ${disabledClass}`}
      placeholder={props.placeHolder}
      type={props.textType}
      autoComplete="off"
      name={props.inputName}
      ref={props.inputRef}
      value={props.inputValue}
      onChange={props.onchangeCallback}
      onKeyUp={props.keyupCallback}
      onInput={props.keyupCallback}
      onBlur={props.blurCallback}
      onMouseLeave={props.onMouseLeave}
      defaultValue={props.defaultValue}
      maxLength={!!props.maxLength ? props.maxLength : null}
      disabled={isDisabled}
      multiple={isMultiple}
    />
  );
};
export default Inputfield;
