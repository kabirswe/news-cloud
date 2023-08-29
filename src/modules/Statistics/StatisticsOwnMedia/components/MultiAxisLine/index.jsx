import React, {Component} from 'react';
import {Line} from 'react-chartjs-2';

import './style.scss';

const options = {
  // responsive: true,
  maintainAspectRatio: false,
  tooltip: {
    mode: 'label',
    shared: false
  },
  elements: {
    line: {
      fill: false,
      tension: 0.01
    }
  },
  legend: {
    display: true,

    labels: {
      boxWidth: 12
    },
    position: 'bottom'
  },
  scales: {
    xAxes: [
      {
        ticks: {
          padding: 10
        },
        display: true,
        gridLines: {
          display: true,
          drawTicks: false
        }
      }
    ],
    yAxes: [
      {
        ticks: {
          padding: 10
        },
        type: 'linear',
        display: true,
        position: 'left',
        id: 'y-axis-1',
        gridLines: {
          display: true,
          drawTicks: false
        }
      },
      {
        type: 'linear',
        display: true,
        position: 'right',
        id: 'y-axis-2',
        gridLines: {
          display: false
        }
      }
    ]
  }
};

export default class MultiAxisLine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {}
    };
  }
  render() {
    let {data} = this.props;
    return (
      <>
        {data && data.labels && data.labels.length ? (
          <div className="multi-axis-chart">
            <span className="left-label">閲覧数</span>
            <span className="right-label">訪問者数</span>

            <Line data={data} id="multi-axis-line-chart" options={options} />
          </div>
        ) : (
          ''
        )}
      </>
    );
  }
}
