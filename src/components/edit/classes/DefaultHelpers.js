/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import moment from 'moment';

function time(attrs) {
    let timestamp = attrs[0];
    let format = attrs[1] || 'DD.MM.YYYY';

    return moment(timestamp).format(format);
};

function date(attrs) {
    let timestamp = attrs[0];
    let format = attrs[1] || 'hh:mm';

    return moment(timestamp).format(format);
};

function format(value) {
    let val = _.toNumber(value);

    if (_.isNumber(val)) {
        return (val / 10000).toLocaleString('en', { minimumFractionDigits: 2 });
    }

    return '';
}

function sum(attrs, fn) {
    const items = attrs[0];
    const prop = attrs[1].toString();

    let sum = 0;

    if (_.isArray(items)) {
        items.forEach((item) => {
            console.log("sum item: ", item);
            sum += item[prop];
        });
    }

    console.log("Sub result: ", sum);
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

function groupBy(attrs, fn) {
    let items = _.isArray(attrs[0]) ? attrs[0] : [];
    let groupField = _.isString(attrs[1]) ? attrs[1] : null;
    let order = attrs[2] === 'desc' ? 'desc' : 'asc';

    let groups = {};

    if (items.length <= 0 && !groupField) {
        return '';
    }

    items.forEach(item => {
        let v = _.get(item, groupField);

        if (!groups[v]) {
            groups[v] = [];
        }

        groups[v].push(item);
    });

    let keys = _.keys(groups);

    if (keys.length > 0) {
        keys = keys.sort();
        if (order === 'desc') {
            keys = keys.reverse();
        }
    }

    let res = [];

    _.forEach(keys, (key) => {
        let payload = { groupKey: key, groupValues: groups[key] };
        res.push(fn(payload));
    });

    return res.join('');
}

const DefaultHelpers = {
    time,
    date,
    condition,
    attribute,
    value,
    groupBy,

    sum,
    maximum,
    count,
    minimum,
    average,
    formatNumber
};

export default DefaultHelpers;