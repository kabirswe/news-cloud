import React from 'react';
import Style from './spinner.module.scss';
import spinIcon from './img/spiner-loader.gif';
export default function SpinnerLoader({className = ''}) {
  return (
    <>
      <div className={`${Style.spinnerLoader} ${className}`}>
        <img src={spinIcon} alt="not found" />
      </div>
    </>
  );
}
