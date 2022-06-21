/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import {
    INIT_PLUGIN,
    SET_LOCATIONS
} from '../actions/Types';

import {
    LOCATION_DISPLAY_NAME_PROP
} from '../const/Common';

const INITIAL_STATE = {
    locations: [],
    locationsOptions: {},
    locationsList: []
}

const reducer = (state = INITIAL_STATE, action) => {
    const payload = action.payload || {};
    let newState = null;

    switch (action.type) {
        case INIT_PLUGIN:
            console.log("INIT_PLUGIN: ", action.payload);

            if (_.isPlainObject(payload.options)) {
                newState = { ...state };

                if (_.isArray(payload.options.locations)) {
                    newState.locations = payload.options.locations;
                }

                if (_.isPlainObject(payload.options.locationsOptions)) {
                    newState.locationsOptions = payload.options.locationsOptions;
                }

                if (_.isArray(payload.options.locationsList)) {
                    newState.locationsList = payload.options.locationsList;

                    newState.locationsOptions = newState.locationsList.reduce((options, location) => {
                        options[location.id] = location.descriptor[LOCATION_DISPLAY_NAME_PROP];

                        return options;
                    }, {});
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
