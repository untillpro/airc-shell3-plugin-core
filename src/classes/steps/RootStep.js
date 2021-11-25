/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import StateMachineStep from '../StateMachineStep';
import { MessageInit } from '../messages';
import SelectViewStep from './SelectViewStep'; 
import DashboardStep from './DashboardStep'; 

class RootStep extends StateMachineStep {
    constructor(firstStep = null) {
        super(firstStep);

        this.firstStep = firstStep;
    }

    getName() {
        return 'RootStep';
    }

    MessageInit() {
        let step = null;

        switch (this.firstStep) {
            case "dashboard": step = new DashboardStep(); break;
            default: step = new SelectViewStep(); break;
        }


        return {
            newStep: step,
            message: new MessageInit()
        };
    }

    MessageSelectView(msg) {
        return null;
    }
}

export default RootStep; 
