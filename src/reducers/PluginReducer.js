/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import * as Types from '../actions/Types';
import { mergeExisting } from '../classes/helpers';

const INITIAL_STATE = {
    data: {},
    view: null,
    entity: null,
    step: null,
    apiInitialized: false,
    pluginInitialized: false,
};

const reducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case Types.API_INITIALIZED:
            return {
                ...state,
                apiInitialized: true
            };

        case Types.INIT_PLUGIN:
            return {
                ...state,
                pluginInitialized: true,
            };

        case Types.SEND_STATE_MACHINE_DATA:
            return mergeExisting(state, action.payload);

        case Types.SET_VIEW:
            return {
                ...state,
                view: action.payload,
                entity: null
            };

        case Types.SET_ENTITY:
            return {
                ...state,
                entity: action.payload
            };

        default:
            return state;
    }
};

export default reducer;
