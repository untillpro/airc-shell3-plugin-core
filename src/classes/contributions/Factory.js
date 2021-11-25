/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import Manager from './Manager';

const Factory = (managers) => {
    const manager = new Manager();

    _.each(managers, (entity) => {
        if (_.size(entity) > 0) {
            _.each(entity, (EntityClass) => {
                const entity = new EntityClass();
                entity.register(manager);
            });
        }
    });

    manager.resolve();

    return manager;
};

export default Factory;
