/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import * as Types from '../actions/Types';

import {
    TOKEN_FIELD_KEY,
    TOKEN_DURATION_FIELD_KEY
} from '../const';

const INITIAL_STATE = {
    deviceLinkToken: null,
    deviceTokenTtl: null,
};

const reducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case Types.SET_WIZZARD_DEVICE_LINK_TOKEN:
            if (_.isArray(action.payload) && _.isPlainObject(action.payload[0])) {
                const { [TOKEN_DURATION_FIELD_KEY]: ttl, [TOKEN_FIELD_KEY]: token } = action.payload[0];

                if (_.isString(token) && _.isNumber(ttl)) {
                    return {
                        ...state,
                        deviceLinkToken: token,
                        deviceTokenTtl: ttl
                    }
                } else {
                    return {
                        ...state,
                        deviceLinkToken: null,
                        deviceTokenTtl: null
                    }
                }
            }

            return {
                ...state,
                deviceLinkToken: action.payload
            };

        case Types.CLEAR_TOKEN_DATA:
            return {
                ...state,
                deviceLinkToken: null,
                deviceTokenTtl: null,
            };

        default:
            return state;
    }
};

export default reducer;
