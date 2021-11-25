/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import {
    ENTITY_LIST_SET_FILTER,
    ENTITY_LIST_SET_ORDER,
    ENTITY_LIST_SET_PAGE,
    ENTITY_LIST_SET_PAGE_SIZE
} from './Types';

import {
    SAGA_PROCESS_DATA,
    SAGA_SET_LIST_SHOW_DELETED
} from '../sagas/Types';

//TODO implement with saga
export const listProccessData = (entity, entries, data) => {
    return {
        type: SAGA_PROCESS_DATA,
        payload: {
            entity, entries, data
        }
    };
}

export const setListShowDeleted = (val) => {
    return {
        type: SAGA_SET_LIST_SHOW_DELETED,
        payload: !!val
    }
};

export const setListPage = (val) => {
    return {
        type: ENTITY_LIST_SET_PAGE,
        payload: val
    }
};

export const setListPageSize = (val) => {
    return {
        type: ENTITY_LIST_SET_PAGE_SIZE,
        payload: val
    }
};

export const setListFilter = (fitler) => {
    return {
        type: ENTITY_LIST_SET_FILTER,
        payload: fitler
    }
};

export const setListOrder = (order) => {
    return {
        type: ENTITY_LIST_SET_ORDER,
        payload: order
    }
};

