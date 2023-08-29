import React, { Component } from 'react';
import { Pie } from 'react-chartjs-2';

import './style.scss';

const options = {
  // responsive: true,
  maintainAspectRatio: false,
  tooltips: {
    mode: 'label'
  },
  elements: {
    line: {
      fill: false
    }
  },
  legend: {
    display: true,

    labels: {
      boxWidth: 12
    },
    position: 'right'
  },
  scales: {
    xAxes: [

    ],
    yAxes: [

    ]
  }
};

export default class PieChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        
      }
    };
  }
  render() {
    let { data } = this.props;
    return (
      <>
       {
         data && data.labels && data.labels.length ? ( 
         <div className="nc-pie">
         <Pie
           data={data}
           id="nc-pie-chart"
           options={options}
         />
       </div>
       ): ""
       }
      </>
    );
  }
}
