/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';

import StateMachineStep from '../StateMachineStep';
import { Logger } from 'airc-shell-core';
import { MessageInit, MessageNotify } from '../messages';

import {
    isValidLocations,
    isValidEntity,
} from '../helpers';

import {
    TYPE_COLLECTION,
    TYPE_TEXT,
    C_COLLECTION_ENTITY,
} from '../contributions/Types';

import {
    FLUSH_ENTITY_DATA,
} from '../../actions/Types';

import {
    SAGA_FETCH_ENTITY_DATA,
    SAGA_PROCESS_ENTITY_DATA,
} from '../../sagas/Types';

class EntityEditStep extends StateMachineStep {
    constructor(...args) {
        super(args);

        this.data = null;
        this.classifiers = null;
        this.next = null;
        this.prev = null;
        this.entries = null;
        this.entity = null;
        this.locations = null;
    }

    getName() {
        return 'EntityEditStep';
    }

    _data() {
        return {
            data: this.data,
            classifiers: this.classifiers,
            next: this.next,
            prev: this.prev
        };
    }

    MessageInit(msg, context) {
        const { entries, copy, entity, locations } = msg;

        if (!isValidEntity(context, entity)) {
            this.error(this.getName() + '.MessageInit() exception: entity not specified or wrong given: ' + entity.toString());
        }

        if (!isValidLocations(locations)) {
            this.error(this.getName() + '.MessageInit() exception: locations not specified or wrong given: ' + locations.toString());
        }

        Logger.log("EntityEditStep.MessageInit(): ", entries);

        this.entity = entity;
        this.locations = locations;
        this.entries = entries;
        this.copy = !!copy;

        return this.fetchData(context);
    }

    MessageNeedEdit(msg) {
        return {
            pop: true,
            message: new MessageInit(msg),
            newStep: new EntityEditStep()
        };
    }

    MessageCancel(msg) {
        const { refresh } = msg;

        return {
            pop: true,
            message: new MessageNotify({ refresh: !!refresh }),
            action: {
                type: FLUSH_ENTITY_DATA
            }
        };
    }

    MessageProceed(msg, context) {
        let { entries, entity, locations } = this;
        const { data } = msg;

        Logger.log(entries, "=================================== MessageProceed: Entries: ");

        if (msg.entity && typeof msg.entity === 'string') {
            entity = msg.entity
        }

        if (msg.locations) {
            locations = _.isArray(msg.locations) ? msg.locations : [msg.locations];
        }

        if ("entries" in msg) {
            entries = msg.entries;
        }

        if (this.copy) {
            entries = null;
        }

        if (!entries || entries.length <= 0) {
            if (locations && locations.length > 0) {
                entries = locations.map((wsid) => {
                    return { id: null, wsid };
                });
            } else {
                this.error('Proceed data error: locations are not specefied');
            }
        }



        return {
            action: {
                type: SAGA_PROCESS_ENTITY_DATA,
                payload: {
                    entity, data, entries
                }
            }
        };
    }

    MessageLanguageChanged(msg, context) {
        return this.fetchData(context);
    }

    MessageValidate(msg, context) {
        return null;
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

    fetchData(context) {
        const { contributions } = context;
        let entity = contributions.getPointContributionValue(TYPE_COLLECTION, this.entity, C_COLLECTION_ENTITY) || this.entity;

        return {
            action: {
                type: SAGA_FETCH_ENTITY_DATA,
                payload: {
                    entity,
                    isCopy: this.copy,
                    id: _.size(this.entries) > 0 ? this.entries[0].id : null,
                    wsid: this.locations[0]
                }
            }
        };

    }

    breadcrumb(context) {
        let text = "Edit item";
        let evtType = 'new_entity';

        if (this.copy) {
            evtType = 'copy_entity';
        } else if (_.size(this.entity) > 0) {
            evtType = 'edit_entity';
        }

        if (this.entity) {
            const { contributions } = context;

            if (contributions) {
                let name = contributions.getPointContributionValue(TYPE_TEXT, this.entity, evtType);

                if (name && typeof name === 'function') {
                    text = name();
                } else {
                    text = name;
                }
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
                type: FLUSH_ENTITY_DATA
            }
        };
    }

}

export default EntityEditStep;
