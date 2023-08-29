import React from 'react';
import {Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import './modal.scss';
import Commonbutton from '../button/Button';
import {translator} from '../../localizations';
import {CloseCircleSharp} from '../../modules/Video/mod-assets/svgComp';

export default function ConfirmationModal(props) {
  return (
    <div key={!!props.index ? props.index : ''}>
      <Modal
        isOpen={props.isActive}
        backdrop="static"
        className="common-cancel-modal-container"
      >
        <ModalHeader toggle={() => props.cancelClick()}>
          {' '}
          {props.title}{' '}
          <div
            className="customClose"
            tabIndex={0}
            role="button"
            onClick={() => {
              props.cancelClick();
            }}
          >
            <CloseCircleSharp />
          </div>
        </ModalHeader>

        <ModalBody>
          {
            props.isMultipleLine ? <div className="message-conatiner-multiple">
              {
                props.firstLine && <div className="message-multiple-line">{props.firstLine}</div>
              }
              {
                props.secondLine && <div className="message-multiple-line top-gap">{props.secondLine}</div>
              }
            </div>
            :
            <div className="message-conatiner">
              <div className="text-container">{props.body}</div>
          </div>
          }
          </ModalBody>
        <ModalFooter>
          <div className="button-group">
          <div className='button-content'>
              <Commonbutton
                className="primary btnShape"
                onClick={() => props.okClick()}
              >
                {translator('CONFIRM_MODAL.BUTTON_YES')}
              </Commonbutton>
            </div>
            <div className={props.hideSave ? 'd-none': "button-content right"}>
              <Commonbutton
                className="primary btnShape"
                onClick={() => props.cancelClick()}
              >
                {translator('CONFIRM_MODAL.BUTTON_NO')}
              </Commonbutton>
            </div>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}
