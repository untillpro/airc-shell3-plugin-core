/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import {
    NEED_LINK_DEVICE_TOKEN,
    CLEAR_TOKEN_DATA
} from './Types';

export const requestLinkDeviceToken = (data) => {
    return {
        type: NEED_LINK_DEVICE_TOKEN,
        payload: data || {}
    }
}


export const clearToken = () => {
    return {
        type: CLEAR_TOKEN_DATA
    };
};