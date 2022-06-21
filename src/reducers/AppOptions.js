/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import moment from 'moment';
import lc from 'langcode-info';

import {
    INIT_PLUGIN,
    SET_PLUGIN_LANGUAGE,
    TOGGLE_LOCATIONS_SELECTOR,
    ADD_AVAILABLE_LANGUAGE
} from '../actions/Types';

const INITIAL_STATE = {
    defaultLanguage: 'en',
    currentLanguage: null,
    langCode: '0000',
    defaultLangCode: '0000',
    maxUploadImageSize: 102400,
    showLocationSelector: true,
    show_selector: false,
    defaultCurrency: {
        code: "Euro",
        digcode: 0,
        eurozone: 1,
        id: 5000000058,
        name: "Euro",
        rate: 1,
        round: 2,
        state: 1,
        sym_alignment: 1,
        symbol: "€"
    },
    currency: null,
    systemLanguages: ["0000", "0406", "0413", "040C", "0407", "0419"]
};

const reducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case INIT_PLUGIN:
            const { options } = action.payload;

            if (_.isPlainObject(options)) {
                const { currentLanguage, defaultLanguage } = options;
                const newState = { ...state };

                if (_.isPlainObject(currentLanguage) && currentLanguage.hex) {
                    let clang = lc.langByHex(currentLanguage.hex);

                    newState.langCode = clang.hex();
                    newState.currentLanguage = clang.lex();
                }

                if (_.isPlainObject(defaultLanguage) && defaultLanguage.hex) {
                    let dlang = lc.langByHex(defaultLanguage.hex);
                    newState.defaultLangCode = dlang.hex();
                    newState.defaultLanguage = dlang.lex();
                }

                return newState;
            }

            return state;

        case SET_PLUGIN_LANGUAGE:
            if (_.isString(action.payload)) {
                const lang = lc.langByHex(action.payload);

                moment.locale(lang.locale());

                return {
                    ...state,
                    langCode: lang.hex(),
                    currentLanguage: lang.lex()
                };
            }

            return state;

        case TOGGLE_LOCATIONS_SELECTOR:
            return {
                ...state,
                show_selector: !state.show_selector
            };
            
        case ADD_AVAILABLE_LANGUAGE:

            return {
                ...state,
                systemLanguages: _.uniq([...state.systemLanguages, action.payload])
            };

        default: return state;
    }
};

export default reducer;
