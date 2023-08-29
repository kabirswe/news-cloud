import React from 'react';
import {connect} from 'react-redux';
import {store} from '../../stores';
import {addToast, type} from '../../redux/actions/toast';
import {CloseOutline} from '../../assets/svgComp';
import './toast.scss'

class Toast extends React.Component {
  static success(message) {
    store.dispatch(
      addToast({
        type: type.success,
        message
      })
    );
  }

  static info(message) {
    store.dispatch(
      addToast({
        type: type.info,
        message
      })
    );
  }

  static warning(message) {
    store.dispatch(
      addToast({
        type: type.warning,
        message
      })
    );
  }

  static error(message) {
    store.dispatch(
      addToast({
        type: type.error,
        message
      })
    );
  }

  static clear() {
    store.dispatch(
      addToast({
        type: type.clear,
        message: ''
      })
    );
  }

  render() {
    let {toast, addToast} = this.props;
    return <>{showToast(toast.type, toast.message, addToast)}</>;
  }
}

function mapStateToProps(state) {
  return {
    toast: state.toast
  };
}

function mapDispatchToProps(dispacth) {
  return {
    addToast: () => dispacth(addToast({type: type.clear, message: ''}))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Toast);

function showToast(toastType, message, clearToast) {
  switch (toastType) {
    case type.success:
      return (
        <div className={`alert nc-alert-success fade show`} role="alert">
            {message}
        <button type="button" className="close" aria-label="Close">
          <span aria-hidden="true" onClick={clearToast}><CloseOutline /></span>

        </button>
      </div>
      );
    case type.info:
      return (
        <div className={`alert nc-alert-info fade show`} role="alert">
            {message}
        <button type="button" className="close" aria-label="Close">
          <span aria-hidden="true" onClick={clearToast}><CloseOutline /></span>

        </button>
      </div>
      );
    case type.warning:
      return (
        <div className={`alert nc-alert-warning fade show`} role="alert">
            {message}
        <button type="button" className="close" aria-label="Close">
          <span aria-hidden="true" onClick={clearToast}><CloseOutline /></span>

        </button>
      </div>
      );
    case type.error:
      return (
        <div className={`alert nc-alert-error fade show`} role="alert">
            {message}
        <button type="button" className="close" aria-label="Close">
          <span aria-hidden="true" onClick={clearToast}><CloseOutline /></span>

        </button>
      </div>
      );
    case type.clear:
      return <></>;
  }

  window.scroll(0,0)
}