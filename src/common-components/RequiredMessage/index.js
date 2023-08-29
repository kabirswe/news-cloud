import React from 'react';
import PropTypes from 'prop-types';
import {Label} from 'reactstrap';
import './styles/index.scss';
import { trim } from '../../helper';


const RequiredMessage = (props) => {
  return (
    <div className={`${props.customClass}`}>
     {
       props.trimed ?  <span title={props.text} className="text-msg">{trim(props.text, props.textLen)}</span> :
        <span className="text-msg">{props.text}</span>
     }
    </div>
  );
};
RequiredMessage.propTypes = {
  text: PropTypes.string.isRequired,
  trimed: PropTypes.bool,
  textLen: PropTypes.string
};

export default RequiredMessage;
