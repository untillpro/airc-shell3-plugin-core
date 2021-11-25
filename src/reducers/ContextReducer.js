/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import lc from 'langcode-info';

import {
    ADD_TO_CONTEXT,
    INIT_CONTEXT_LANG,
    SET_PLUGIN_LANGUAGE
} from '../actions/Types';

const INITIAL_STATE = {
    lang: "en",
    langCode: "0000",
    manager: null,
    api: null
};

const reducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case ADD_TO_CONTEXT:
            const { key, value } = action.payload;

            if (key && typeof key === 'string' && value !== undefined) {
                return {
                    ...state,
                    [key]: value
                };

            } else if (_.isPlainObject(action.payload)) {
                return {
                    ...state,
                    ...action.payload
                }
            }

            return state;

        case SET_PLUGIN_LANGUAGE:
            if (_.isString(action.payload)) {
                const lang = lc.langByHex(action.payload);

                return {
                    ...state,
                    langCode: lang.hex(),
                    lang: lang.lex()
                };
            }

            return state;

        case INIT_CONTEXT_LANG:
            if (_.isPlainObject(action.payload)) {
                const { lang, langCode } = action.payload;

                if (_.isString(lang) && _.isString(langCode)) {
                    return { ...state, langCode, lang };
                }
            }

            return state;

        default: return state
    }
};

export default reducer;
