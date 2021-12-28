/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
//import moment from 'moment';
import {
    //INIT_PLUGIN,
    SET_CUSTOM_CHART_ORDER,
    SET_DASHBOARD_DATA,
    SET_CHART_SETTINGS,
    SET_DASHBOARD_SETTINGS,
    SET_DASHBOARD_LOADING,
    DASHBOARD_DATA_FETCHING_SUCCESS
} from '../actions/Types';

const INITIAL_STATE = {
    loading: false,
    data: [],
    from: null,
    to: null,
    settings: {},
    customOrder: {},
    visibility: {},
    sound: true
};

const reducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case DASHBOARD_DATA_FETCHING_SUCCESS:
            return {
                ...state,
                loading: false,
                data: action.payload || []
            };

        case SET_DASHBOARD_LOADING:
            return {
                ...state,
                loading: !!action.payload
            };

        case SET_DASHBOARD_DATA:
            return {
                ...state,
                data: action.payload || []
            };

        case SET_CUSTOM_CHART_ORDER:

            return {
                ...state,
                customOrder: {
                    ...state.customOrder,
                    [action.payload.chart]: action.payload.order
                },
            };

        case SET_CHART_SETTINGS:
            return state;

        case SET_DASHBOARD_SETTINGS:
            if (_.isPlainObject(action.payload)) {
                return {
                    ...state,
                    ...action.payload
                };
            }

            return state;

        default: return state;
    }

}

export default reducer;