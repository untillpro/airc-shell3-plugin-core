/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import {
    SELECT_REPORT_TYPE_MESSAGE,
    SELECT_DATETIME_FILTER_PERIOD,
    SET_REPORTS_DATETIME_FILTER,
    SET_REPORT_DATA_FETCHING,
    SEND_DO_GENERATE_REPORT_MESSAGE
} from './Types';

export const selectReportType = (code) => {
    return {
        type: SELECT_REPORT_TYPE_MESSAGE,
        payload: code
    };
};

//TODO - implment with saga
export const sendDoGenerateReport = (report, from, to, filterBy, props) => {
    return {
        type: SEND_DO_GENERATE_REPORT_MESSAGE,
        payload: { report, from, to, filterBy, props }
    };
};

export const selectFilterPeriod = (periodCode) => {
    return {
        type: SELECT_DATETIME_FILTER_PERIOD,
        payload: periodCode
    }
};

export const setDatetimeFilter = (values) => {
    return {
        type: SET_REPORTS_DATETIME_FILTER,
        payload: values
    };
}

export const setReportDataFetching = (val) => {
    return {
        type: SET_REPORT_DATA_FETCHING,
        payload: val
    };
}