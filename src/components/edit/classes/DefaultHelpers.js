/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import moment from 'moment';

const DECIMAL_MULTYPLIER = 10000;

function time(attrs) {
    let timestamp = attrs[0];
    let format = attrs[1] || 'HH:mm';

    return moment(timestamp).format(format);
};

function date(attrs) {
    let timestamp = attrs[0];
    let format = attrs[1] || 'dd.MM.yyyy';

    return moment(timestamp).format(format);
};

function format(value, isCurrency) {
    let val = _.toNumber(value);

    if (_.isNumber(val)) {
        if (isCurrency) {
            return (val / DECIMAL_MULTYPLIER).toLocaleString('en', { minimumFractionDigits: 2 });
        } else {
            return val.toLocaleString('en', { minimumFractionDigits: 2 });
        }
    }

    return '';
}

function sum(attrs, fn) {
    const items = attrs[0];
    const prop = attrs[1].toString();
    const isCurrency = attrs[2] === 1;

    let sum = 0;

    if (_.isArray(items)) {
        items.forEach((item) => {
            sum += item[prop];
        });
    }

    return format(sum, isCurrency);
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
    const isCurrency = attrs[2] === 1;

    if (_.isArray(items)) {
        let max = 0;

        items.forEach((item) => {
            max = Math.max(max, _.toNumber(item[prop]));
        });

        return format(max, isCurrency);
    }

    return null;
}

function minimum(attrs, fn) {
    const items = attrs[0];
    const prop = attrs[1];
    const isCurrency = attrs[2] === 1;

    if (_.isArray(items)) {
        let min = null;

        items.forEach((item) => {
            if (_.isNil(min)) {
                min = _.toNumber(item[prop]);
            } else {
                min = Math.min(min, _.toNumber(item[prop]));
            }
        });

        return format(min, isCurrency);
    }

    return null;
}

function average(attrs, fn) {
    const items = attrs[0];
    const prop = attrs[1];
    const isCurrency = attrs[2] === 1;

    if (_.isArray(items)) {
        let total = 0;
        let count = items.length;

        items.forEach((item) => {
            total += _.toNumber(item[prop]);
        });

        return format(total / count, isCurrency);
    }

    return 0;
}


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
    const num = attrs[0];
    const isCurrency = attrs[1] === 1;

    return format(num, isCurrency);
}

function groupBy(attrs, fn) {
    let items = _.isArray(attrs[0]) ? attrs[0] : [];
    let groupField = _.isString(attrs[1]) ? attrs[1] : null;
    let order = attrs[2] === 'desc' ? 'desc' : 'asc';

    let groups = {};

    if (items.length <= 0 || !groupField) {
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