import React from 'react';
import './statisticsBlock.scss';

const StatisticsBlock = (props) => {
  return (
    <div className="statistics-block-area">
      <div className="title">{props.title}</div>
      <div className="statistics-block">{props.children}</div>
    </div>
  );
};

export default StatisticsBlock;
