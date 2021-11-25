/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import { mergeExisting, mergeDeep } from '../classes/helpers';

import {
    SET_LIST_COLUMNS_VISIBILITY,
    LIST_DATA_FETCH_SUCCEEDED,
    PROCESS_DATA_FETCH_SUCCEEDED,
    SET_COLLECTION_LOADING,
    FLUSH_LIST_DATA,

    ENTITY_LIST_SET_SHOW_DELETED,
    ENTITY_LIST_SET_PAGE,
    ENTITY_LIST_SET_PAGE_SIZE,
    ENTITY_LIST_SET_FILTER,
    ENTITY_LIST_SET_ORDER,
} from '../actions/Types';

const INITIAL_STATE = {
    data: null,
    resolvedData: null,
    classifiers: null,
    manual: false,
    showDeleted: false,
    page: 0,
    pages: -1,
    pageSize: 20,
    loading: false,
    order: [
        {
            id: "id",
            desc: false
        }
    ],
    columnsVisibility: {"ID": false, "id": false, "Id": false}
};

const reducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case LIST_DATA_FETCH_SUCCEEDED: 
            let newState = mergeExisting(state, action.payload);
            newState.loading = false;

            if (action.payload.Data && typeof action.payload.Data === "object") {
                newState.classifiers = _.get(action.payload.Data, "classifiers");
                newState.total = _.get(action.payload.Data, "meta.total") || 0;

                /*
                    if (t && t > 0 && pageSize > 0) {
                        this.total = parseInt(t);
                        this.pages = Math.ceil(t / pageSize);
                    } else {
                        this.pages = 0;
                    }
                */
            }

            return newState;
        case PROCESS_DATA_FETCH_SUCCEEDED: 
            const { result, data } = action.payload;

            if (_.isArray(result) && _.size(result) > 0 && _.isPlainObject(data)) {
                const resolvedData = [ ...state.resolvedData ];

                _.each(result, (d) => {
                    if (d && d.result === "ok" && d.ID && d.ID > 0) {
                        const index = _.findIndex(resolvedData, o => o.id === d.ID);

                        if (index >= 0) {
                            resolvedData[index] = mergeDeep(resolvedData[index], data);
                        };
                    }
                });

                return { ...state, resolvedData }; 
            }

            return state;

        case SET_COLLECTION_LOADING: 
            return { ...state, loading: !!action.payload};

        case SET_LIST_COLUMNS_VISIBILITY: 
            return {
                ...state,
                columnsVisibility: action.payload
            };

        case FLUSH_LIST_DATA: 
            return {
                ...state,
                data: null,
                resolvedData: null,
                classifiers: null,
            };

        case ENTITY_LIST_SET_SHOW_DELETED: 
            return { ...state, showDeleted: action.payload };

        case ENTITY_LIST_SET_PAGE: 
            return { ...state, page: action.payload };

        case ENTITY_LIST_SET_PAGE_SIZE: 
            return { ...state, pageSize:action.payload };

        case ENTITY_LIST_SET_FILTER: 
            return { ...state, filter: action.payload};

        case ENTITY_LIST_SET_ORDER: 
            return { ...state, order: action.payload};

        default: return state;
    }

}

export default reducer;
