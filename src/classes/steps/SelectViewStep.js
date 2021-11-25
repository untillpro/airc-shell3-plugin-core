/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import StateMachineStep from '../StateMachineStep';

import RenderViewStep from './RenderViewStep'; 

import { MessageInit } from '../messages';

class SelectViewStep extends StateMachineStep {
    getName() {
        return 'SelectViewStep';
    }

    MessageInit(_, context) {
        const { view } = context;

        if (view) {
            return {
                newStep: new RenderViewStep(view),
                message: new MessageInit()
            };
        }

        return null;
    }

    MessageSelectView(msg) {
        const { view } = msg;

        if (view && typeof view === 'string') {
            return {
                newStep: new RenderViewStep(view),
                changedData: {
                    view
                }
            };
        }
    }

    breadcrumb() {
        return {
            "text": "Main",
            "uid": this.uid
        };
    }
}

export default SelectViewStep; 
