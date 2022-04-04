/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import * as Types from '../actions/Types';
import blacklist from 'blacklist';

import {
    DEVICE_LINK_TOKEN_FIELD_KEY,
    TOKEN_DURATION_FIELD_KEY
} from '../const';

const INITIAL_STATE = {
    deviceLinkTokenData: null,
    deviceTokenTtl: null,

};

const reducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case Types.SET_WIZZARD_DEVICE_LINK_TOKEN:
            if (_.isPlainObject(action.payload)) {
                const { [TOKEN_DURATION_FIELD_KEY]: ttl, [DEVICE_LINK_TOKEN_FIELD_KEY]: token } = action.payload;
                if (_.isString(token) && _.isNumber(ttl)) {
                    const deviceLinkData = blacklist(action.payload, TOKEN_DURATION_FIELD_KEY);

                    return {
                        ...state,
                        deviceLinkTokenData: JSON.stringify(deviceLinkData),
                        deviceTokenTtl: ttl
                    }
                }
            }

            return {
                ...state,
                deviceLinkTokenData: null,
                deviceTokenTtl: null
            }

        case Types.CLEAR_TOKEN_DATA:
            return {
                ...state,
                deviceLinkTokenData: null,
                deviceTokenTtl: null,
            };

        default:
            return state;
    }
};

export default reducer;
