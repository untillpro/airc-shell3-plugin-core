/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';

class ContributionSet {
    constructor(name, data) {
        if (!name) throw new Error('ContributionSet should have name');
        this.name = name;

        if (_.isPlainObject(data)) {
            this.data = new Map(Object.entries(data));
        } else {
            this.data = new Map();
        }
    }

    set(key, value) {
        this.data.set(key, value);
        return this;
    }

    get(key) {
        return this.data.get(key);
    }

    has(key) {
        return this.data.has(key);
    }

    delete(key) {
        return this.data.delete(key);
    }

    clear() {
        return this.data.clear();
    }

    size() {
        return this.data.size;
    }

    map() {
        return new Map(this.data);
    }

    entries() {
        return this.data.entries();
    }

    values() {
        return this.data.values();
    }

    keys() {
        return this.data.keys();
    }

    [Symbol.iterator] () {
        return this.data[Symbol.iterator]();
    }
}

export default ContributionSet;