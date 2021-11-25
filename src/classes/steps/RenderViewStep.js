/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import StateMachineStep from '../StateMachineStep';

import RenderEntityStep from './RenderEntityStep'; 
import ReportViewStep from './ReportViewStep'; 
import { MessageInit, MessageNotify } from '../messages';

import {
    SET_ENTITY
} from '../../actions/Types';

import { 
    TYPE_VIEWS, C_VIEW_NAME
} from '../contributions/Types';

class RenderViewStep extends StateMachineStep {
    constructor(view) {
        super(view);

        this.view = view;
    }

    getName() {
        return 'RenderViewStep';
    }

    MessageInit(msg) {
        const { entity } = msg;

        if (entity && typeof entity === 'string') {
            return {
                newStep: new RenderEntityStep(),
                message: new MessageInit({entity})
            };
        }

        return null;
    }

    MessageSelectEntity(msg) {
        const { entity } = msg;

        if (entity && typeof entity === 'string') {
            return {
                newStep: new RenderEntityStep(),
                message: new MessageInit(msg),
                action: {
                    type: SET_ENTITY,
                    payload: entity
                }
            };
        }
    }

    MessageGenerateReport(msg, context) {
        return {
            newStep: new ReportViewStep(),
            message: new MessageInit(msg),
        };
    }

    MessageCancel() {
        return {
            pop: true,
            message: new MessageNotify()
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

    breadcrumb(context) {
        const { contributions } = context;
        let text = this.view;

        if (contributions) {
            let name = contributions.getPointContributionValue(TYPE_VIEWS, text, C_VIEW_NAME);

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
}

export default RenderViewStep; 
