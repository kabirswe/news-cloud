import i18next from 'i18next';
import en from './en.json';
import ja from './ja.json';
import {DEFAULT_LANGUAGE} from '../../../config';

const maliMagazineModInstance = i18next.createInstance();
maliMagazineModInstance.init({
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

export function maliMagazineModtranslator(name) {
    return maliMagazineModInstance.t(name);
}

export default maliMagazineModInstance;