import React, { Component } from 'react'
import NcButton from '../../../../../common-components/NcButton'
import { zeroPadding } from '../../../../../helper'
import './style.scss'

export default class NcHorizontalStackedBar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showingAll: false
        }
    }

    showAllData = () => {
        this.setState({
            showingAll: true
        })
        this.props.showAll()
    }

    render() {
        let { data, fieldName, className, increaseFieldName, ratioOfIncreaseFieldName } = this.props
        let { showingAll } = this.state
        let totalwidth = data ? data.reduce((a, b) => a + b.users, 0) : 0
        return (
            <>
                <div className={showingAll ? `nc-horizontal-stacked-bar show-all ${className}` : ` nc-horizontal-stacked-bar ${className}`}>
                    {



                        data && data.map((d, index) => (

                            <div key={index}>
                                <div className="country-name">
                                    <span className="count">{index + 1}</span>
                                    <span className="name">{d[fieldName]}</span>
                                </div>
                                <div className="data">
                                    <div className="bar">
                                        <div className="main-bar"></div>
                                        <div style={{ width: (((d.users) * 100) / totalwidth) + '%' }} className="overlaping-bar"></div>
                                    </div>
                                    <div className="statistics-data">
                                        <div className="data-1"><b>{d.users}</b></div>
                                        <div className={`data-2 ${d[increaseFieldName] < 0 ? 'red' : ''}`}>{d[increaseFieldName] > 0 ? '+' : ''}{d[increaseFieldName]}</div>
                                        <div className={`data-3 ${d[increaseFieldName] < 0 ? 'red' : ''}`}>({d[increaseFieldName] > 0 ? '+' : ''}{Math.round(d[ratioOfIncreaseFieldName] * 10) / 10}%)</div>
                                    </div>

                                </div>
                            </div>

                        ))
                    }
                    {
                        (data && !showingAll) ?
                            <div className="show-all-reference">
                                <NcButton callback={this.showAllData}>すべて表示する</NcButton>
                            </div> : ''
                    }
                </div>
            </>
        )
    }
}
