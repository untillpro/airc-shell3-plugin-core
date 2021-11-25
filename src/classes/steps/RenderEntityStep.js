/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import StateMachineStep from '../StateMachineStep';
import { MessageInit, MessageNotify } from '../messages';
import EntityEditStep from './EntityEditStep';

import {
    TYPE_LIST
} from '../contributions/Types';

import {
    FLUSH_LIST_DATA,
} from '../../actions/Types';

import { 
    SAGA_FETCH_LIST_DATA,
    SAGA_PROCESS_DATA,
} from '../../sagas/Types';

import { 
    TYPE_ENTITIES, C_ENTITY_NAME
} from '../contributions/Types';

import {
    checkEntries,
    isValidLocations,
    isValidEntity,
} from '../helpers';

const INITIAL_STATE = {
    entity: null,
    locations: [],
    manual: false,
    showDeleted: false,
    total: 0,
    page: 0,
    pages: -1,
    pageSize: 20,
};

class RenderEntityStep extends StateMachineStep {
    constructor(...args) {
        super(args);

        _.each(INITIAL_STATE, (value, param) => {
            this[param] = value;
        });
    }

    getName() {
        return 'RenderEntityStep';
    }

    MessageInit(msg, context) {
        const { contributions } = context;
        const { entity, locations } = msg;

        if (!isValidEntity(context, entity)) {
            this.error(this.getName() + '.MessageInit() exception: entity not specified or wrong given: ' + entity.toString());
        }

        if (!isValidLocations(locations)) {
            this.error(this.getName() + '.MessageInit() exception: locations not specified or wrong given: ' + locations.toString());
        }

        this.entity = entity;
        this.locations = locations;

        this.manual = !!contributions.getPointContributionValue(TYPE_LIST, entity, 'manual');

        return this.fetchListData(context);
    }

    MessageNotify(msg, context) {
        if (msg.refresh) {
            return this.fetchListData(context);
        } 
        
        return {};
    }

    MessageNeedEdit(msg) {
        return {
            message: new MessageInit(msg),
            newStep: new EntityEditStep()
        };
    }

    MessageNeedMassEdit() {
        //TOIMPLEMENT
        this.error("RenderEntityStep.MessageNeedMassEdit() not implemented yet;")
    }

    MessageCancel() {
        return {
            pop: true,
            message: new MessageNotify(),
            action: {
                type: FLUSH_LIST_DATA
            }
        };
    }

    MessageRefreshData(msg, context) {
        return this.fetchListData(context);
    }

    MessageLanguageChanged(msg, context) {
        return this.fetchListData(context);
    }

    MessageSetLocations(msg, context) {
        return this.fetchListData(context);
    }

    MessageProcessItemData(msg, context) {
        let { entries, data } = msg;
        const { entity } = this;

        if (!entries) this.error('Error occured while MessageDeleteItem(): entries not specified', msg);
        if (!entity) this.error('Entity are not specified.', entity);
        if (!_.isPlainObject(data)) this.error('Wrong item data specified; plain object expected.', data);

        entries = checkEntries(entries);

        if (entries.length === 0) return;

        //throw Error('MessageProcessItemData not changed yet');

        return {
            action: {
                type: SAGA_PROCESS_DATA,
                payload: {
                    entity,
                    data, 
                    entries
                }
            }
        };
    }

    MessageSetPage(msg, context) {
        const { page } = msg;

        if (page >= 0 && typeof page === 'number') {
            this.page = page;
        }

        if (this.manual) {
            return this.fetchListData(context);
        }
    }

    MessageSetPageSize(msg, context) {
        const { pageSize } = msg;

        if (pageSize && typeof pageSize === 'number') {
            this.pageSize = pageSize;
            this.page = 0;
        }

        if (this.manual) {
            return this.fetchListData(context);
        }
    }

    MessageSetShowDeleted(msg, context) {
        const { showDeleted } = msg;

        this.showDeleted = !!showDeleted;

        if (this.manual) {
            return this.fetchListData(context);
        }
    }

    MessageSetOrder(msg, context) {
        const { order } = msg;

        if (order) {
            this.order = order;
        }

        if (this.manual) {
            return this.fetchListData(context);
        }
    }

    MessageSetFilter(msg, context) {
        this.filter = {};

        if (this.manual) {
            return this.fetchListData(context);
        }

        return {
            changedData: {
                list: this.list()
            }
        }
    }
    MessageNeedNavigation(msg, context) {
        /*
            TODO for manual mode - в том плане, что если навигацией достигается конец resolvedData, то для мануального режима надо попробовать взять 
            следующую страницу, и если это удается, то переписать переменные в степе, включая data и resolvedData
        */

        const { id } = msg;

        let prev = null;
        let next = null;

        if (id && id > 0 && this.resolvedData && this.resolvedData.length > 0) {
            const data = this.resolvedData;

            const index = _.findIndex(data, (o) => { return o.id === id; });

            if (index >= 0) {
                if (index > 0) {
                    prev = data[index - 1].id;
                }

                if (data[index + 1]) {
                    next = data[index + 1].id;
                }
            }
        }

        return {
            changedData: {
                prevEntity: prev,
                nextEntity: next
            }
        };
    }

    MessageBreadcrumbSelected(msg) {
        const { uid } = msg;

        if (uid !== this.uid) {
            return {
                pop: true,
                message: msg,
            };
        }
    }

    fetchListData(context) {
        const { entity } = this;

        return {
            action: {
                type: SAGA_FETCH_LIST_DATA,
                payload: entity
            }
        };
    }

    breadcrumb(context) {
        const { contributions } = context;
        let text = this.entity;

        if (contributions) {
            let name = contributions.getPointContributionValue(TYPE_ENTITIES, text, C_ENTITY_NAME);

            if (name && typeof name === 'function') {
                text = name();
            } else {
                text = name;
            }
        }

        return {
            "text": text,
            "uid": this.uid
        };
    }

    detouch() {
        return {
            action: {
                type: FLUSH_LIST_DATA
            }
        };
    }
}

export default RenderEntityStep; 
