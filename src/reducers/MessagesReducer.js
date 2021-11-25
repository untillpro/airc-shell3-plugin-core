/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import {
    SEND_ERROR_MESSAGE,
    SEND_INFO_MESSAGE,
    SEND_SUCCESS_MESSAGE,
    SEND_WARNING_MESSAGE
} from '../actions/Types';

const INITIAL_STATE = {
    error: null,
    success: null,
    warning: null,
    info: null
};

const reducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case SEND_ERROR_MESSAGE: 
            return {
                ...state,
                error: action.payload
            };

        case SEND_INFO_MESSAGE: 
            return {
                ...state,
                info: action.payload
            };

        case SEND_SUCCESS_MESSAGE: 
            return {
                ...state,
                success: action.payload
            };

        case SEND_WARNING_MESSAGE: 
            return {
                ...state,
                warning: action.payload
            };
        default: return state;
    }
};

export default reducer;
