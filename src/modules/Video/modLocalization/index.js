import i18next from 'i18next';
import en from './en.json';
import ja from './ja.json';
import {DEFAULT_LANGUAGE} from '../../../config';

const rawMaterialModInstance = i18next.createInstance();
rawMaterialModInstance.init({
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

export function rawMaterialModtranslator(name) {
    return rawMaterialModInstance.t(name);
}

export default rawMaterialModInstance;