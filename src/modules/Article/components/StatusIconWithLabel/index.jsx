import React from 'react'
import StatusIcon from '../statusIcon'
import './styles.scss'

const StatusIconWithLabel = ({iconType,color,labelText,className}) => {
    return (
        <div className={`statusIconWithLabel ${className}`}>
            <StatusIcon iconType={iconType} color={color}/>
            <label>{labelText}</label>
        </div>
    )
}

export default StatusIconWithLabel
