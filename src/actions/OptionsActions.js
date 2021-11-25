/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import {
    ADD_AVAILABLE_LANGUAGE,
} from './Types';

import {
    SAGA_SET_PLUGIN_LANGUAGE
} from '../sagas/Types';

export const setLanguage = (langCode) => {
    return {
        type: SAGA_SET_PLUGIN_LANGUAGE,
        payload: langCode
    };
};

export const addAvailableLanguage = (lang) => {
    return {
        type: ADD_AVAILABLE_LANGUAGE,
        payload: lang
    };
};



