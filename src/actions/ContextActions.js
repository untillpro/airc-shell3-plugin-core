/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import {
    ADD_TO_CONTEXT,
    INIT_CONTEXT_LANG
} from './Types';

export const setContext = (key, value) => {
    return {
        type: ADD_TO_CONTEXT,
        payload: {
            key, 
            value
        }
    };
}

export const mergeContext = (data) => {
    return {
        type: ADD_TO_CONTEXT,
        payload: data
    }
}

export const initContextLang = (lang, langCode) => {
    return {
        type: INIT_CONTEXT_LANG,
        payload: { lang, langCode }
    };
}