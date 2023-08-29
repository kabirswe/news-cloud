import React, { Component } from 'react'
import {Bar} from 'react-chartjs-2'

import './style.scss'

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
        // usePointStyle: true,
        boxWidth: 12
      },
      position: 'bottom'
    },
    scales: {
      xAxes: [
        {
          display: true,
          stacked: true,
          gridLines: {
            display: true,
            drawTicks: false
          },
          ticks: {
            padding: 10
          }
        }
      ],
      yAxes: [
        {
            stacked: true,
            gridLines: {
              drawTicks: false
            },
            ticks: {
              padding: 10
            }
        }
      ]
    }
  };
  

export default class VerticalStackedBar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: {
            }
        }
    }
    render() {
        let {data} = this.props
        return (
            <>
            {
              data && data.labels && data.labels.length ? ( <div className="vertical-stacked-bar">
              <span className="left-label">訪問数</span>
               <Bar
                   data={data}
                   options={options}
               />
              </div>) : ""
            }
              
            </>
        )
    }
}
