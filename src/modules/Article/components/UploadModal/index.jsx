import React from 'react';
import {Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import {rawMaterialModtranslator} from '../../modLocalization';
import './modal.scss';
import Commonbutton from '../../../../common-components/button/Button';

export default function UploadModal(props) {
  return (
    <div>
      <Modal
        isOpen={props.isActive}
        backdrop="static"
        className="common-cancel-modal-container"
      >
        <ModalHeader toggle={() => props.cancelClick()}>
          {' '}
          {rawMaterialModtranslator('RAW_MATERIAL.MODAL_TITLE')}
        </ModalHeader>

        <ModalBody>
          <div className="message-conatiner">
            <div className="text-container">
              {rawMaterialModtranslator('RAW_MATERIAL.MODAL_BODY_TEXT')}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="button-group">
            <div className="button-content">
              <Commonbutton
                className="primary btnShape"
                callback={() => props.okClick()}
              >
                {rawMaterialModtranslator('RAW_MATERIAL.BUTTON_YES')}
              </Commonbutton>
            </div>
            <div className="button-content right">
              <Commonbutton
                className="primary btnShape"
                callback={() => props.cancelClick()}
              >
                {rawMaterialModtranslator('RAW_MATERIAL.BUTTON_NO')}
              </Commonbutton>
            </div>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}
