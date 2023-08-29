import i18next from 'i18next';
import en from './en.json';
import ja from './ja.json';
import {DEFAULT_LANGUAGE} from '../../../../../config';

const videoModalIntance = i18next.createInstance();
videoModalIntance.init({
  interpolation: {
    // React already does escaping
    escapeValue: false
  },
  lng: DEFAULT_LANGUAGE, // 'en' | 'es'
  // Using simple hardcoded resources for simple example
  resources: {
    en,
    ja
  }
});

export function videoModalTranslator(name) {
  return videoModalIntance.t(name);
}

export default videoModalIntance;
