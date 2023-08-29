import React from 'react';
import Style from './infiniteLoader.module.scss';

export default function Loader({className =''}) {
  return (
    <>
       <div className={Style.wrapper}>
       <div className={`${Style.loader} ${className}`}></div>
       </div>
    </>
  );
}
