import React, { Component } from 'react'
import {HorizontalBar} from 'react-chartjs-2'

// import './style.scss'

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
            display: false
          }
        }
      ],
      yAxes: [
        {
            stacked: true,
            gridLines: {
                display: false
              }
        }
      ]
    }
  };
  

export default class HorizontalStackedBar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [
                  {
                    label: 'My First dataset',
                    backgroundColor: 'rgba(255,99,132,0.2)',
                    borderColor: 'rgba(255,99,132,1)',
                    borderWidth: 1,
                    barThickness: 8,
                    hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                    hoverBorderColor: 'rgba(255,99,132,1)',
                    data: [65, 59, 80, 81, 56, 55, 40]
                  },
                  {
                    label: 'My Second dataset',
                    backgroundColor: 'gray',
                    barThickness: 8,
                    borderColor: 'rgba(255,99,132,1)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                    hoverBorderColor: 'rgba(255,99,132,1)',
                    data: [100, 100, 100, 100, 100, 100, 100]
                  }
                ]
            }
        }
    }
    render() {
        let {data} = this.state
        return (
            <>
            {
              data && data.labels && data.labels.length ? ( <div className="vertical-stacked-bar">
               <HorizontalBar
                   data={data}
                   options={options}
               />
              </div>) : ""
            }
              
            </>
        )
    }
}
