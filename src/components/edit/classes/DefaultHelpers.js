/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';

function format(value) {
    if (_.isNumber(value)) {
        return (value / 10000).toLocaleString('en', { minimumFractionDigits: 2 });
    }

    return '';
}

function sum(attrs, fn) {
    const items = attrs[0];
    const prop = attrs[1].toString();

    let sum = 0;

    if (_.isArray(items)) {
        items.forEach((item) => {
            sum += _.toNumber(item[prop]);
        });
    }

    return format(sum);
}

function count(attrs, fn) {
    const items = attrs[0];

    if (_.isArray(items)) {
        return _.size(items);
    }

    return 0;
}

function maximum(attrs, fn) {
    const items = attrs[0];
    const prop = attrs[1];

    if (_.isArray(items)) {
        let max = 0;

        items.forEach((item) => {
            max = Math.max(max, _.toNumber(item[prop]));
        });

        return format(max);
    }

    return null;
}

function minimum(attrs, fn) {
    const items = attrs[0];
    const prop = attrs[1];

    if (_.isArray(items)) {
        let min = null;

        items.forEach((item) => {
            if (_.isNil(min)) {
                min = _.toNumber(item[prop]);
            } else {
                min = Math.min(min, _.toNumber(item[prop]));
            }
        });

        return format(min);
    }

    return null;
}

function average(attrs, fn) {
    const items = attrs[0];
    const prop = attrs[1];

    if (_.isArray(items)) {
        let total = 0;
        let count = items.length;

        items.forEach((item) => {
            total += _.toNumber(item[prop]);
        });

        return format(total / count);
    }

    return 0;
}

function condition(attrs, fn) {
    let prop = attrs[0];
    let value = attrs[1];

    if (this.settings && this.settings[prop] === value) {
        return fn(this);
    }

    return '';
};

function attribute(attrs) {
    let prop = attrs[0];
    let name = attrs[1]

    if (this.settings && this.settings[prop]) {
        return `${name}="${this.settings[prop]}"`;
    }


    return '';
};

function value(attrs) {
    let prop = attrs[0];
    let dflt = attrs[1] || null

    if (this.settings && this.settings[prop]) {
        return this.settings[prop];
    } else if (dflt && typeof dflt !== 'object') {
        return dflt;
    }

    return '';
};

function formatNumber(attrs) {
    return format(attrs[0]);
}

const DefaultHelpers = {
    condition,
    attribute,
    value,

    sum,
    maximum,
    count,
    minimum,
    average,
    formatNumber
};

export default DefaultHelpers;