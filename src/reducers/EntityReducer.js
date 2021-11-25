/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import { mergeExisting } from '../classes/helpers';

import { 
    FLUSH_ENTITY_DATA,
    SET_ENTITY_LOADING,
    ENTITY_DATA_FETCH_SUCCEEDED
} from '../actions/Types';

const INITIAL_STATE = {
    id: null,
    classifiers: {},
    data: null,
    isNew: false,
    isCopy: false,
    loading: false,
};

const reducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case FLUSH_ENTITY_DATA: 
            return INITIAL_STATE;
            
        case ENTITY_DATA_FETCH_SUCCEEDED: 
            const newState =  mergeExisting(state, action.payload);

            newState.loading = false;

            return newState;

        case SET_ENTITY_LOADING: 
            return { ...state, loading: !!action.payload};
            
        default: return state;
    }

}

export default reducer;
