/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';

class ContributionPoint {
    constructor(name) {
        if (!name) throw new Error('ContributionPoint should have name');

        this.name = name;
        this.contributions = {};
    }

    registerContribution(name, contribution) {
        const { contributions } = this;

        if (contributions[name] !== undefined && contributions[name] !== null) {
            if (_.isFunction(contributions[name]) && _.isFunction(contribution)) {
                contributions[name] = contribution;

            } else if (_.isArray(contributions[name]) && !_.isFunction(contribution) ) {
                if (_.isArray(contribution)) {
                    contributions[name] = [...contributions[name], ...contribution];
                } else {
                    contributions[name].push(contribution);
                }
            } else {
                throw new Error(`Missmatched types of existing contribution and value: expected ${this._getExpectedType(contributions[name])} but has ${this._getExistingType(contribution)}`)
            }
        } else {
            if (_.isFunction(contribution) || _.isArray(contribution)) {
                this.contributions[name] = contribution;
            } else {
                this.contributions[name] = [ contribution ];
            }
        }
    }

    getContributuions() {
        return this.contributions;
    }

    getContributuionValue(name, all = false) {
        if (this.contributions[name]) {
            const contribution = this.contributions[name];

            if (_.isArray(contribution)) {
                if (all === true) {
                    return contribution;
                }

                return contribution[0];
            }

            return contribution;
        }

        return null;
    }

    _getExpectedType(object) {
        var type = "";

        if (_.isPlainObject(object)) {
            type = "plain object";
        } else if (_.isFunction(object)) {
            type = "function";
        } else {
            type = "array or scalar";
        }

        return type
    }

    _getExistingType(object) {
        var type = "";

        if (_.isPlainObject(object)) {
            type = "object";
        } else if (_.isFunction(object)) {
            type = "function";
        } else if (_.isArray(object)) {
            type = "array";
        } else {
            type = "scalar";
        }

        return type
    }
}

export default ContributionPoint;
