/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import moment from 'moment';

import {
    SELECT_REPORT_TYPE_MESSAGE,
    SELECT_DATETIME_FILTER_PERIOD,
    SET_REPORTS_DATETIME_FILTER,
    SEND_DO_GENERATE_REPORT_MESSAGE,
    SET_REPORT_DATA_FETCHING,
    REPORT_DATA_FETCHING_SUCCESS,
} from '../actions/Types';

const whfrominit = moment("2000-01-01 05:00");
const whtoinit = moment("2000-01-01 05:00");

const INITIAL_STATE = {
    reportType: null,
    fromDateTime: null,
    toDateTime: null,
    workingHoursFrom: whfrominit, // 5 * 3600 seconds
    workingHoursTo: whtoinit, // 17 * 3600 seconds
    filterBy: {},
    props: {},
    mostUsedPeriods: {},
    cashedFilterBy: {},
    cashedProps: {},
    reportData: [],
    loading: false
};

const reducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case SET_REPORT_DATA_FETCHING: 
            return { ...state, loading: !!action.payload };
            
        case REPORT_DATA_FETCHING_SUCCESS: 
            return { ...state, reportData: action.payload, loading: false };

        case SELECT_REPORT_TYPE_MESSAGE:
            if (action.payload && typeof action.payload === 'string') {
                let newState = { ...state, reportType: action.payload };

                if (state.cashedFilterBy &&
                    state.cashedFilterBy[action.payload] &&
                    typeof state.cashedFilterBy[action.payload] === 'object'
                ) {
                    newState.filterBy = state.cashedFilterBy[action.payload]
                } else {
                    newState.filterBy = {}
                }

                if (state.cashedProps &&
                    state.cashedProps[action.payload] &&
                    typeof state.cashedProps[action.payload] === 'object'
                ) {
                    newState.props = state.cashedProps[action.payload]
                } else {
                    newState.props = {}
                }

                return newState;
            }

            return state;

        case SELECT_DATETIME_FILTER_PERIOD:
            let code = action.payload;
            let temp = { ...state.mostUsedPeriods }

            if (!temp) {
                temp = {};
            }

            if (temp[code]) {
                temp[code]++
            } else {
                temp[code] = 1
            }

            return {
                ...state,
                mostUsedPeriods: temp
            };

        /*
            action.payload expected as plain object with keys "from" for "fromDateTime" value and "to" for "toDateTime";
        */
        case SET_REPORTS_DATETIME_FILTER:
            if (_.isPlainObject(action.payload)) {
                const { from, to } = action.payload;

                let newState = { ...state };

                if (from !== undefined) {
                    if (_.isInteger(from) && from > 0) {
                        newState.fromDateTime = from;
                    } else {
                        newState.fromDateTime = null;
                    }
                }

                if (to !== undefined) {
                    if (_.isInteger(to) && to > 0) {
                        newState.toDateTime = to;
                    } else {
                        newState.toDateTime = null;
                    }
                }

                return newState;
            }

            return state;

        case SEND_DO_GENERATE_REPORT_MESSAGE:
            if (action.payload && typeof action.payload === 'object') {
                let newState = { ...state };

                const { report, filterBy, props, from, to } = action.payload;
                const cashFilterBy = state.cashedFilterBy ? { ...state.cashedFilterBy } : {};
                const cashProps = state.cashedProps ? { ...state.cashedProps } : {};

                if (report && filterBy && typeof filterBy === 'object') {
                    cashFilterBy[report] = filterBy;
                    newState.filterBy = filterBy;
                }

                if (report && props && typeof props === 'object') {
                    cashProps[report] = props;
                    newState.props = props;
                }

                if (from !== undefined && (from === null || typeof from === 'number')) {
                    newState.fromDateTime = from;
                }

                if (to !== undefined && (to === null || typeof to === 'number')) {
                    newState.toDateTime = to;
                }

                newState.cashedFilterBy = cashFilterBy;
                newState.cashedProps = cashProps;
                

                return newState
            }

            return state;

        default: return state;
    }
}

export default reducer;
