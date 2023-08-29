import React from 'react';
import './button.scss';

const NcButton = (props) => {
  return (
    <button
      type={props.type !== undefined ? props.type : 'button'}
      onClick={props.callback}
      className={`ncButton  ${props.className}`}
      disabled={props.isDisable}
    >
      {props.children}
    </button>
  );
};

export default NcButton;
