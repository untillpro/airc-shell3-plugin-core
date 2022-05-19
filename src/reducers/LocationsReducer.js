/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import {
    INIT_PLUGIN,
    SET_LOCATIONS
} from '../actions/Types';

const INITIAL_STATE = {
    locations: [],
    locationsOptions: {},
    locationData: {},
}

const reducer = (state = INITIAL_STATE, action) => {
    const payload = action.payload || {};
    let newState = null;

    switch (action.type) {
        case INIT_PLUGIN:
            //console.log("INIT_PLUGIN: ", action.payload);

            if (_.isPlainObject(payload.options)) {
                newState = { ...state };

                if (_.isArray(payload.options.locations)) {
                    newState.locations = payload.options.locations;
                }

                if (_.isPlainObject(payload.options.locationsOptions)) {
                    newState.locationsOptions = payload.options.locationsOptions;
                }

                if (_.isPlainObject(payload.options.locationData)) {
                    newState.locationData = payload.options.locationData;
                }

                return newState;
            }

            return state;

        case SET_LOCATIONS:
            if (!_.isArray(payload) || payload.length <= 0) return state;

            return {
                ...state,
                locations: payload
            }

        default: return state;
    }
};

export default reducer;
