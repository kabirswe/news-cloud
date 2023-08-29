import React, { useState, useEffect } from 'react';
import './topTitleComponent.scss';
import NcDateInput from '../../../../common-components/NcDateInput';
import Commonbutton from '../../../../common-components/button/Button';
import {DateDevider} from '../../mod-assets/svgComp';

const TopTitleComponent = (props) => {
  let today = new Date()
  let yestarday = new Date().setDate(new Date().getDate() -1)
  let firstDay = new Date(new Date().setDate(new Date().getDate() - 31))
  const [minDate, setMinDate] = useState(firstDay)
  const [maxDate, setMaxDate] = useState(yestarday)
  // useEffect(() => {
  //   console.log("today=------------------------------",minDate,firstDay)
  //   console.log("new -date =========",minDate, maxDate)
  // }, []);
  return (
    <div className="statistics-top-title-block">
      <h2 className="title-text">{props.title}</h2>
      <span className="date-title">期間</span>
      <NcDateInput
        handleDate={(date)=>setMinDate(date)}
        value={minDate}
        maxDate={maxDate}
        dateFormat="yyyy/MM/dd"
        className="form-control statistics-start-date"
        selected={minDate}
      />
      <DateDevider />
      <NcDateInput
        handleDate={(date)=>setMaxDate(date)}
        minDate={minDate}
        value={maxDate}
        maxDate={today}
        dateFormat="yyyy/MM/dd"
        className="form-control statistics-end-date"
        selected={maxDate}
      />
      <Commonbutton
        className="primary submit-date"
        onClick = {()=>props.sendDate(minDate,maxDate)}
        disabled = {
          minDate == null || minDate == undefined || maxDate == null || maxDate ==undefined
        }
      >適用</Commonbutton>
    </div>
  );
};

export default TopTitleComponent;
