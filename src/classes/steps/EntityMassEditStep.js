/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import StateMachineStep from '../StateMachineStep';

import { MessageNotify } from '../messages';

class EntityMassEditStep extends StateMachineStep {
    getName() {
        return 'EntityMassEditStep';
    }

    MessageInit() {
        // проверить, а задан ли вообще view
        // тоже самое надо сделать и в компоненте и вызать cancel если что-то пошло не так
        return null;
    }

    MessageProceed() {
        return null;
    }

    MessageCancel() {
        return {
            pop: true,
            message: new MessageNotify()
        };
    }

    MessageValidate() {
        return null;
    }
}

export default EntityMassEditStep; 
