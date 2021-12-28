/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import moment from 'moment';

export const dashboardFrom = (state) => {
    if (state.dashboards.from) {
        if (typeof state.dashboards.from === 'object') {
            return state.dashboards.from;
        }

        return state.dashboards.from;
    }

    return moment().startOf('day'); 
};

export const dashboardFromValue = (state) => {
    if (state.dashboards.from) {
        if (typeof state.dashboards.from === 'object') {
            return state.dashboards.from.valueOf();
        }
    }

    return moment().startOf('day').valueOf();
};

export const dashboardTo = (state) => {
    if (state.dashboards.to) {
        if (typeof state.dashboards.to === 'object') {
            return state.dashboards.to;
        }
    }

    return moment().add(1, 'days').endOf('day');
};

export const dashboardToValue = (state) => {
    if (state.dashboards.to) {
        if (typeof state.dashboards.to === 'object') {
            return state.dashboards.to.valueOf();
        }

        return state.dashboards.to;
    }

    return moment().add(1, 'days').endOf('day').valueOf();
};

export const dashboardVisibility = (state) => {
    if (_.isPlainObject(state.dashboards.visibility)) {
        return state.dashboards.visibility;
    }

    return {};
}

export const dashboardCustomOrder = (state) => {
    if (_.isPlainObject(state.dashboards.customOrder)) {
        return state.dashboards.customOrder;
    }

    return {};
}

export const dashboardData = (state) => {
    return state.dashboards.data;
}

export const dashboardLoading = (state) => {
    return state.dashboards.loading === true;
}

export const dashboardSound = (state) => {
    return state.dashboards.sound === true;
}
