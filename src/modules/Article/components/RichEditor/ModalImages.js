import React from 'react';
import {Modal, ModalHeader, ModalBody} from 'reactstrap';
import './scss/modalVidoes.scss';
import {videoModalTranslator} from './modLocalization';
import AxiosServices from '../../../../networks/AxiosService';
import ApiServices from '../../../../networks/ApiServices';
import {ToastContainer, toast} from 'react-toastify';

export default class ModalImages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: props.modalOpen,
      images: []
    };
  }



  toggle = () => {
    this.setState({modal: !this.state.modal}, () => {
      this.props.clearModalStatus();
    });
  };

  addImage = (event, image) => {
    event.target.parentNode.classList.add('tr-selected');
    setTimeout(() => {
      this.toggle();
      // this.props.addImageToContent(image);
      this.props.addImageToContent('https://via.placeholder.com/200x140');
    }, 1000);
  };

  render() {
    return (
      <>
        <div>
          <Modal
            className="modalVideos"
            isOpen={this.state.modal}
            toggle={this.toggle}
          >
            <ModalHeader toggle={this.toggle}>
              {videoModalTranslator('VIDEO_MODAL.MODAL_TITLE')}
            </ModalHeader>
            <ModalBody>
              <div className={`table-responsive`}>
                <table className="table table-bordred table-striped">
                  <thead>
                    <tr>
                      <th>{videoModalTranslator('VIDEO_MODAL.VIDEO')}</th>
                      <th>{videoModalTranslator('VIDEO_MODAL.TITLE')}</th>
                      <th>{videoModalTranslator('VIDEO_MODAL.UPLOAD_DATE')}</th>
                      <th>{videoModalTranslator('VIDEO_MODAL.PLATFORM')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(15).keys()].map((image) => (
                      <tr
                        key={image}
                        role="button"
                        onClick={(e) => this.addImage(e, image)}
                      >
                        <td>
                          <div className="video-thumb">
                            <img src="https://via.placeholder.com/100x80" />
                          </div>
                        </td>
                        <td>はたらく車</td>
                        <td>2020/02/10 </td>
                        <td>Youtube </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ModalBody>
          </Modal>
        </div>
      </>
    );
  }
}
