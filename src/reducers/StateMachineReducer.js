/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import * as Messages from '../classes/messages';
import * as Types from '../actions/Types';

import { STATE_FIELD_NAME, STATUS_ACTIVE, STATUS_DELETED } from '../const/Common';

const INITIAL_STATE = {
    message: new Messages.MessageInit(),
    isGlobal: false,
    shouldPop: false
};

const reducer = (state = INITIAL_STATE, action) => {
    let message = null;
    let isGlobal = false;
    let shouldPop = false;
    
    switch (action.type) {
        case Types.SEND_INIT_MESSAGE: 
            message = new Messages.MessageInit(action.payload);
            break;

        case Types.SEND_CANCEL_MESSAGE:
            message = new Messages.MessageCancel(action.payload);
            break;

        case Types.SEND_SELECT_VIEW_MESSAGE:
            isGlobal = true;
            shouldPop = true;
            message = new Messages.MessageSelectView(action.payload);
            break;
            
        case Types.SEND_SELECT_ENTITY_MESSAGE:
            message = new Messages.MessageSelectEntity(action.payload);
            break;

        case Types.SEND_NEED_DATA_REFRESH: 
            message = new Messages.MessageRefreshData();
            break;

        case Types.SEND_NEED_EDIT_FORM_MESSAGE:
            message = new Messages.MessageNeedEdit(action.payload);

            break;

        case Types.SEND_NEED_MASSEDIT_FORM_MESSAGE:
            if (_.isArray(action.payload) && action.payload.length > 0) {
                message = new Messages.MessageNeedMassEdit({ entries: action.payload });
            }
            
            break;

        case Types.SEND_NEED_PROCCESS_DATA_MESSAGE: 
            message = new Messages.MessageProceed({data: action.payload});
            break;

        case Types.SEND_NEED_DUPLICATE_ITEM_MESSAGE: 
            message = new Messages.MessageNeedEdit(action.payload);

            break;

        case Types.SEND_NEED_ITEM_PROCESS_DATA: 
            if (!_.isNil(action.payload) && _.isPlainObject(action.payload)) {
                message = new Messages.MessageProcessItemData(action.payload);
            }
            break;

        case Types.SEND_NEED_REMOVE_ITEM_MESSAGE:
            if (_.isArray(action.payload)) {
                message = new Messages.MessageProcessItemData({ entries: action.payload, data: {[STATE_FIELD_NAME]: STATUS_DELETED}});
            }
            break;

        case Types.SEND_NEED_REDUCE_ITEM_MESSAGE:
            if (_.isArray(action.payload)) {
                message = new Messages.MessageProcessItemData({ entries: action.payload, data: {[STATE_FIELD_NAME]: STATUS_ACTIVE}});
            }
            break;

        case Types.SEND_FORM_NEED_NAVIGATION:
            message = new Messages.MessageNeedNavigation({id: action.payload});
            isGlobal = true;
            break;

        case Types.SEND_DO_GENERATE_REPORT_MESSAGE:
            message = new Messages.MessageGenerateReport(action.payload);
            break;

        case Types.SEND_LANGUAGE_CHANGED_MESSAGE:   
            message = new Messages.MessageLanguageChanged(action.payload);
            break;  
        
        case Types.SET_LOCATIONS: 
            message = new Messages.MessageSetLocations(action.payload);
            break;  

        case Types.SEND_BREADCRUM_SELECTED: 
            message = new Messages.MessageBreadcrumbSelected({uid: action.payload});
            break;  

        default: break;
    }

    if (message) {
        return {
            ...state,
            message,
            isGlobal,
            shouldPop
        };
    }

    return state;
};

export default reducer;
