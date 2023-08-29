
import { ADD_TOAST, type as toastType } from "../../constants/toast";

// options = {type: "", message: ""}

export function addToast(options = {}) {
  return {
    payload: options,
    type: ADD_TOAST
  };
}

export const type = {
    ...toastType
}