/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import {
    SEND_STATE_MACHINE_DATA,
    SEND_CANCEL_MESSAGE,
    SEND_SELECT_VIEW_MESSAGE,
    SEND_SELECT_ENTITY_MESSAGE,
    SEND_NEED_FETCH_LIST_DATA,
    SEND_NEED_EDIT_FORM_MESSAGE,
    SEND_NEED_MASSEDIT_FORM_MESSAGE,
    SEND_NEED_ITEM_PROCESS_DATA,
    SEND_NEED_DUPLICATE_ITEM_MESSAGE,
    SEND_NEED_UNIFY_ITEM_MESSAGE,
    SEND_NEED_REMOVE_ITEM_MESSAGE,
    SEND_NEED_REDUCE_ITEM_MESSAGE,
    SEND_NEED_PROCCESS_DATA_MESSAGE,
    SEND_NEED_VALIDATE_DATA_MESSAGE,
    SEND_NEED_DATA_REFRESH,
    SEND_FORM_NEED_NAVIGATION,
    SEND_LANGUAGE_CHANGED_MESSAGE
} from './Types';

export const dispatch = (action) => {
    if (action && typeof action === 'object') {
        return action;
    }

    return { type: "NOA_ACTION" };
};

export const sendStateMachineResult = (step, data) => {
    return {
        type: SEND_STATE_MACHINE_DATA,
        payload: {
            step,
            ...data
        }
    };
};

export const sendCancelMessage = (data = {}) => {
    return {
        type: SEND_CANCEL_MESSAGE,
        payload: data
    };
};

export const sendSelectViewMessage = (view, locations) => {
    return {
        type: SEND_SELECT_VIEW_MESSAGE,
        payload: { view, locations }
    }
};

export const sendSelectEntityMessage = (entity, locations) => {
    return {
        type: SEND_SELECT_ENTITY_MESSAGE,
        payload: { entity, locations }
    }
};

export const sendNeedFetchListDataMessage = (props) => {
    return {
        type: SEND_NEED_FETCH_LIST_DATA,
        payload: props

    };
};

export const sendNeedRefreshDataMessage = () => {
    return {
        type: SEND_NEED_DATA_REFRESH
    };
}

export const sendNeedEditFormMessage = (entries = [], locations, entity) => {
    return {
        type: SEND_NEED_EDIT_FORM_MESSAGE,
        payload: { entries, locations, entity }
    };
};

export const sendNeedMassEditFormMessage = (entries = [], locations, entity) => {
    return {
        type: SEND_NEED_MASSEDIT_FORM_MESSAGE,
        payload: { entries, locations, entity }
    };
};

export const sendNeedCopyFormMessage = (entries = [], locations, entity) => {
    return {
        type: SEND_NEED_DUPLICATE_ITEM_MESSAGE,
        payload: {
            entries, locations, entity, copy: true
        }
    };
};

export const sendNeedUnifyFormMessage = (entries = [], locations, entity) => {
    return {
        type: SEND_NEED_UNIFY_ITEM_MESSAGE,
        payload: { entries, locations, entity }
    };
};

export const sendNeedProcessMessage = (entries, data) => {
    return {
        type: SEND_NEED_ITEM_PROCESS_DATA,
        payload: { entries, data }
    };
};

// removing entites items by id; 
export const sendNeedRemoveMessage = (entries) => {
    return {
        type: SEND_NEED_REMOVE_ITEM_MESSAGE,
        payload: entries
    };
};

export const sendNeedReduceMessage = (entries) => {
    return {
        type: SEND_NEED_REDUCE_ITEM_MESSAGE,
        payload: entries
    };
};

// updating or creating entity item
export const sendNeedProccessMessage = (data) => {
    return {
        type: SEND_NEED_PROCCESS_DATA_MESSAGE,
        payload: data
    };
}

// validate entity item data
export const sendNeedValidateMessage = (data) => {
    return {
        type: SEND_NEED_VALIDATE_DATA_MESSAGE,
        payload: data
    };
}

// send message to receive 

export const sendNeedFormNavigation = (id) => {
    return {
        type: SEND_FORM_NEED_NAVIGATION,
        payload: id
    };
}

// send message that language was changed

export const sendLanguageChanged = (lng) => {
    return {
        type: SEND_LANGUAGE_CHANGED_MESSAGE,
        payload: lng
    };
}