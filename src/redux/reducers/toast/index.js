import {ADD_TOAST, REMOVE_TOAST} from '../../constants/toast'

export const initialState = {
    type: "",
    message: ""
  };
  

export default function toasts(state = initialState, action) {
    const { payload, type } = action;
  
    switch (type) {
       case ADD_TOAST: 
        return {...state, ...payload};
      default:
        return state;
    }
  }