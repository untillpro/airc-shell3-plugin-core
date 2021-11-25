/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import {
    //SET_CHART_SETTINGS,
    SET_CUSTOM_CHART_ORDER,
    SET_DASHBOARD_DATA,
    SET_DASHBOARD_SETTINGS,
} from './Types';

export const setDashboardData = (data) => {
    return {
        type: SET_DASHBOARD_DATA,
        payload: data
    };
};

export const setDashboardSettings = (settings) => {
    return {
        type: SET_DASHBOARD_SETTINGS,
        payload: settings
    };
};

export const setChartOrder = (chart, order) => {
    return {
        type: SET_CUSTOM_CHART_ORDER,
        payload: { chart, order }
    };
};

export const setChartSettings = () => {
    console.error("setChartSettings action not implemented");
}