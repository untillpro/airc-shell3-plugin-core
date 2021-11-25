/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import { contributionTranslate } from '../helpers';

class IContributor {
    /**
     * 
     * @param {ContributionManager} manager - use manager to register contributions
     * 
     */

    t(code, section = null, options = null) {
        return contributionTranslate(this.entity(), code, section, options);
    }
    
    register() {
        throw new Error(`Class ${this.constructor.name} should implement register() method`);
    }

    entity() {
        throw new Error(`Class ${this.constructor.name} should implement entity() method`);
    }
}

export default IContributor;
