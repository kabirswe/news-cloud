import React, { Component } from 'react'
import { Line } from 'react-chartjs-2'

import "./styles.scss"
import Loader from '../../../../common-components/InfiniteLoader'

const options = {
    maintainAspectRatio: false,
    tooltips: {
        mode: 'label'
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
            boxWidth: 12,
            // usePointStyle: true
        },
        position: 'bottom'
    },
    scales: {
        xAxes: [
            {
                display: true,
                gridLines: {
                    display: false
                },
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
                },
            },
        ]
    }
};

export default class LineChart extends Component {
    constructor(props) {
        super(props)
        this.state = {
            update: false,
            data: {}
        }
    }
    render() {
        let { data } = this.props
        return (
            <>
                {
                    data && data.labels && data.labels.length ? (
                        <div className="line-chart">
                            <span className="left-label">{data.datasets[0].label}</span>
                            <Line
                                data={data}
                                id="line-chart"
                                options={options}
                            />
                        </div>
                    ) : ""
                }

            </>
        )
    }
}
