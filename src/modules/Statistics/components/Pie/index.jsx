import React, { Component } from 'react';
import { Pie } from 'react-chartjs-2';

import './style.scss';
import { findLastKey } from 'lodash';
import Loader from '../../../../common-components/InfiniteLoader';

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
      usePointStyle: true,
      pointStyle: 'rect'
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
      update: false,
      data: {}
    };
  }
  componentDidUpdate(prevProps){
    if (prevProps.data !== this.props.data) {
      this.setState({
        update: true,
        data: {
          labels: this.props.labels,
          type: 'pie',
          datasets: [
            {
              backgroundColor: [
                '#2ecc71',
                '#3498db',
                '#95a5a6',
                '#9b59b6',
                '#f1c40f',
                '#e74c3c',
                '#34495e',
              ],
              data: this.props.data
            }
          ]
        }
      })
    }
  }
  render() {
    let { data, update} = this.state;
    return (
      <>
        {
          update ?
          <div className="nc-pie">
          <Pie
            data={data}
            id="nc-pie-chart"
            options={options}
          />
        </div> : <Loader/>
        }
      </>
    );
  }
}
