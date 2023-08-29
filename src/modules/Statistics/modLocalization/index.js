import i18next from 'i18next';
import en from './en.json';
import ja from './ja.json';
import {DEFAULT_LANGUAGE} from '../../../config';

const statisticsModInstance = i18next.createInstance();
statisticsModInstance.init({
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

export function statisticsModtranslator(name) {
  return statisticsModInstance.t(name);
}

export default statisticsModInstance;
