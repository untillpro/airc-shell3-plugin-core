/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import {
    INIT_PLUGIN,
    SET_LOCATIONS
} from '../actions/Types';

const INITIAL_STATE = {
    locations: [1],
    locationsOptions: {
        1: "UI Development",
        2: "Server Development",
        3: "QA",
        4: "Demo",
        5: "Location 5",
    },
}

const reducer = (state = INITIAL_STATE, action) => {
    const payload = action.payload || {};
    let newState = null;

    switch (action.type) {
        case INIT_PLUGIN:
            console.log("INIT_PLUGIN: ", payload);

            if (_.isPlainObject(payload.options)) {
                newState = { ...state };

                if (_.isArray(payload.options.locations)) {
                    newState.locations = payload.options.locations;
                }

                if (_.isPlainObject(payload.options.locationsOptions)) {
                    newState.locationsOptions = payload.options.locationsOptions;
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
