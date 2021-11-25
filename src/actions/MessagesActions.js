/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import {
    SEND_ERROR_MESSAGE,
    SEND_INFO_MESSAGE,
    SEND_SUCCESS_MESSAGE,
    SEND_WARNING_MESSAGE,
    SEND_BREADCRUM_SELECTED
} from './Types'

export const sendError = (text = null, description = null) => {
    return {
        type: SEND_ERROR_MESSAGE,
        payload: {
            text,
            description
        }
    };
};

export const sendSuccess = (text = null, description = null) => {
    return {
        type: SEND_SUCCESS_MESSAGE,
        payload: {
            text,
            description
        }
    };
};

export const sendWarning = (text = null, description = null) => {
    return {
        type: SEND_WARNING_MESSAGE,
        payload: {
            text,
            description
        }
    };
};

export const sendInfo = (text = null, description = null) => {
    return {
        type: SEND_INFO_MESSAGE,
        payload: {
            text,
            description
        }
    };
};

export const sendBreadcrumbSelected = (uid = null) => {
    return {
        type: SEND_BREADCRUM_SELECTED,
        payload: uid
    };
}