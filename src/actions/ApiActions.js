/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import * as Types from './Types';

export const apiInitDone = () => {
    return {
        type: Types.API_INITIALIZED
    }
};

export const initPlugin = (payload) => {
    return {
        payload,
        type: Types.INIT_PLUGIN,
    };
};

export const sendData = (data) => {
    return {
        type: Types.SET_DATA,
        payload: data
    };
};

export const selectEntity = (entity) => {
    return {
        type: Types.SET_ENTITY,
        payload: entity
    };
};

export const setColumnsVisibility = (data) => {
    return {
        type: Types.SET_LIST_COLUMNS_VISIBILITY,
        payload: data
    };
};

export const toggleDeletedRowsView = () => {
    return {
        type: Types.TOGGLE_DELETED_ROWS_VIEW
    };
};

// TEMP FUNCTION - ONLY FOR TESTING AND DEBUGING
export const setLocation = (locations) => {
    //TODO right
    return {
        type: Types.SET_LOCATIONS,
        payload: locations
    };
};

export const toggleLocationSelector = () => {
    return {
        type: Types.TOGGLE_LOCATIONS_SELECTOR
    };
};