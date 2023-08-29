import React from 'react';
import ItemStyle from './menuItem.module.scss';

export default function MenuItem({name, url, Icon, iconClass = '', itemClass = ''}) {
  return (
    <>
      <a
        onClick={(e) => e.preventDefault()}
        href={url}
        className={`${ItemStyle.menuItem} ${itemClass}`}
        title=""
      >
        <Icon className={`${ItemStyle.icon} ${iconClass}`} />
        <span className={ItemStyle.name}>{name}</span>
      </a>
    </>
  );
}
