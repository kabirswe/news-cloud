import React from 'react';
import Style from './smallLoader.module.scss';

export default function SmallLoader({className =''}) {
  return (
    <>
        <div className={`${Style.smallLoader} ${className}`}></div>
    </>
  );
}
