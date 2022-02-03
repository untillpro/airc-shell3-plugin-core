/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import { Logger, translate as t } from 'airc-shell-core';
import { Base64 } from 'js-base64';

import Stream from '../Stream';

import {
    PERIOD_VALUE_TYPE,
    WEEK_DAY,
    PAYMENT_KIND,
    ORDER_BUTTON_TYPES
} from '../../const';

export const isValidLocations = (locations) => {
    if (!locations || !_.isArray(locations) || locations.length === 0) {
        return false;
    }

    for (let l of locations) {
        if (!_.isInteger(l) || l < 0) {
            return false;
        }
    }

    return true;
};

export const checkColumnDeclaration = (declaration) => {
    if (!_.isPlainObject(declaration)) return false;

    const { Header, accessor } = declaration;

    if (!Header || typeof Header !== 'string') {
        Logger.error(`column field "Header" wrong specified; string is expected but got `, typeof Header)
        return false;
    }

    if (!accessor || (typeof accessor !== 'string' && typeof accessor !== 'function')) {
        Logger.error(`column field "accessor" wrong specified; string is expected but got `, typeof accessor)
        return false;
    }

    return true;
}

export const generateId = makeIncrementGenerator(1);
export const generateTempId = makeLoopGenerator(65536, 1);

export const reduce = (data, func1 = null, func2 = null) => {
    let accum = null;

    if (!func1 || typeof func1 !== 'function') return data;

    if (!func2 || typeof func2 !== 'function') {
        func2 = (value, key) => typeof value === 'object';
    }

    if (_.isArray(data)) {
        accum = [];
    } else {
        accum = {};
    }

    _.reduce(data, (result, value, key) => {
        if (func2(value, key)) result[key] = reduce(value, func1, func2);
        else func1(result, value, key);
        return result;
    }, accum);

    return accum;
};

export const isObject = (item) => {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

export const mergeDeep = (target, ...sources) => {
    if (!sources.length) return target;

    const source = sources.shift();

    if (_.isPlainObject(target) && _.isPlainObject(source)) {
        for (const key in source) {
            if (_.isPlainObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else if (_.isArray(source[key]) && _.isArray(target[key])) {

                let newArray = _.isArray(target[key]) ? [...target[key]] : [];
                //let newArray = [];

                console.log("mergeDeep.newArray: ", newArray);
                console.log("mergeDeep.source[key]: ", source[key]);

                source[key].forEach((elem, index) => {
                    if (elem === null) {
                        newArray[index] = null;
                    } else if (elem !== undefined) {
                        newArray[index] = _.merge({}, target[key][index], elem);
                    }
                });

                console.log("mergeDeep.newArray result: ", newArray);

                newArray = _.reduce(newArray, (arr, item) => {
                    if (item !== null) arr.push(item);
                    return arr;
                }, []);

                Object.assign(target, { [key]: newArray });
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}

export const mergeExisting = (target, source) => {
    if (!_.isPlainObject(target) || !_.isPlainObject(source)) {
        throw new Error(`target and source object should be a plain objects`);
    }

    const result = { ...target };

    _.forEach(source, (value, key) => {
        if (key in result) {
            result[key] = value
        }
    });

    return result;
}

export const getFileSize = (sizeInBytes) => {
    let bytes = parseInt(sizeInBytes, 10);
    let kbytes = 0;
    let mbytes = 0;

    let unit = '';
    let unitFull = '';
    let value = '';

    if (bytes && bytes > 0) {
        kbytes = bytes / 1024 | 0;
        mbytes = kbytes / 1024 | 0;
    } else {
        return {};
    }

    if (mbytes > 0) {
        unit = 'MB';
        unitFull = "megabytes";
        value = `${mbytes}`;
    } else if (kbytes > 0) {
        unit = 'KB';
        unitFull = "kilobytes";
        value = `${kbytes}`;
    } else {
        unit = 'B';
        unitFull = "bytes";
        value = `${bytes}`;
    }

    return {
        bytes,
        kbytes,
        mbytes,
        unit,
        unitFull,
        formated: `${value} ${unit}`,
        formatedFull: `${value} ${unitFull}`
    }
}

export const formatPriceValue = (value, currency) => {
    if (currency && _.isPlainObject(currency)) {
        const { sym_alignment, symbol, round } = currency;

        let formatedValue = Number(value).toFixed(round || 2).toString();

        if (_.isString(symbol)) {

            if (sym_alignment) {
                return `${formatedValue}${symbol}`;
            }

            return `${symbol}${formatedValue}`;
        }

        return formatedValue;
    }

    return value;
}

export const formatNumber = (amount, decimalCount = 2, decimal = ".", thousands = " ") => {
    try {
        decimalCount = Math.abs(decimalCount);
        decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

        const negativeSign = amount < 0 ? "-" : "";

        let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
        let j = (i.length > 3) ? i.length % 3 : 0;

        return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
    } catch (e) {
        console.error(e)
    }
}


export function makeIncrementGenerator(startFrom = 1) {
    var currentCount = startFrom || 0;

    return function () {
        return currentCount++;
    };
}

export function makeLoopGenerator(maxValue, startFrom = 1) {
    var currentCount = startFrom || 0;

    return function () {
        if (currentCount >= maxValue) {
            currentCount = startFrom;
        }

        return currentCount++;;
    };
}

export const bufferToLangMap = (base64str) => {
    if (base64str === null) return null;

    let res = {};

    try {
        let decodedStr = Base64.toUint8Array(base64str);

        let s = new Stream(decodedStr);

        let n = s.readBigUInt();

        if (n <= 140) {
            let code;

            code = s.next();

            while (code != null) {
                let value = s.next();

                res[code] = value;

                code = s.next()
            }
        }
    } catch (e) {
        console.error(e);
        return null;
    }

    return res.length === 0 ? null : res;
}

export const langMapToBuffer = (langMap) => {
    let s = new Stream([]);

    try {
        let str = JSON.stringify(langMap) || "";

        s.alloc(str.length * 4);

        s.writeBigInt(_.size(langMap));

        _.forEach(langMap, (value, code) => {
            s.writeBigInt(_.size(code));
            s.write(code);

            let v = value ? String(value) : "";
            s.writeBigInt(_.size(v));
            s.write(v);
        });

        let bytes = s.bytes();
        let res = Base64.fromUint8Array(new Uint8Array(bytes));

        return res;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export const immutableArrayMerge = (...arrays) => {
    const resultArray = [];

    if (arrays.length > 0) {
        arrays.forEach(array => {
            if (array && array.length > 0) {
                for (let i = 0; i < array.length; i++) {
                    if (array[i] !== undefined) {
                        resultArray[i] = array[i];
                    }
                }
            }
        });
    }

    return resultArray;
}

export const valueFromClassifierField = (value, accessor, defaultValue) => {
    let resultValue = defaultValue !== undefined ? defaultValue : value;

    try {
        if (_.isPlainObject(value)) {
            let tempValue = _.get(value, accessor);

            if (tempValue !== undefined) {
                resultValue = tempValue;
            }
        }
    } catch (e) {
        resultValue = defaultValue || value;
    }

    return resultValue;
}

export const getPaymentKind = (kind) => {
    return t(PAYMENT_KIND[kind], "payment_kind");
}

export const getPaymentKindsOptions = () => {
    const options = {};

    if (PAYMENT_KIND && _.size(PAYMENT_KIND) > 0) {
        _.forEach(PAYMENT_KIND, (v, k) => {
            const name = t(PAYMENT_KIND[k], "payment_kind");
            options[name] = parseInt(k);
        });
    }

    return options;
};

export const getWeekDay = (num) => {
    return t(WEEK_DAY[num], "week_day");
};

export const getWeekDayOptions = () => {
    const options = {};

    if (WEEK_DAY && _.size(WEEK_DAY) > 0) {
        _.forEach(WEEK_DAY, (v, k) => {
            const name = t(WEEK_DAY[k], "week_day");
            options[name] = parseInt(k);
        });
    }

    return options;
};

export const getPeriodValueType = (num) => {
    return t(PERIOD_VALUE_TYPE[num], "period_value_types");
};

export const getPeriodValueTypesOptions = () => {
    const options = {};

    if (PERIOD_VALUE_TYPE && _.size(PERIOD_VALUE_TYPE) > 0) {
        _.forEach(PERIOD_VALUE_TYPE, (v, k) => {
            const name = t(PERIOD_VALUE_TYPE[k], "period_value_types");
            options[name] = parseInt(k);
        });
    }

    return options;
};

export const getOrderButtonTypesOptions = () => {
    const options = {};

    if (ORDER_BUTTON_TYPES && _.size(ORDER_BUTTON_TYPES) > 0) {
        _.forEach(ORDER_BUTTON_TYPES, (v, k) => {
            const name = t(k, "order_button_types");
            options[name] = v;
        });
    }

    return options;
}

export const getDynamicValue = (cell, key, props, isExport) => {
    let val = null;
    const { accessor, classifier_link, value_accessor, /*, defaultValue */ } = props;

    if (cell[accessor]) {
        _.forEach(cell[accessor], (row, index) => {
            if (_.get(row, classifier_link) === key) {
                val = row;
                val._index = index;
            }
        });
    }

    if (isExport && value_accessor) {
        return _.get(val, value_accessor);
    }

    return val;
};

export const buildExportData = (data, columns, type) => {
    const result = [];
    const restrictedIds = ["row-selector", "actions"]

    if (_.isObject(data) && _.size(data) > 0 && _.isArray(columns) && _.size(columns) > 0) {
        _.forEach(data, (v, k) => {
            const row = {};

            columns.forEach(column => {
                if (!_.isNil(column.id) && _.indexOf(restrictedIds, column.id) === -1) {
                    row[column.Header] = column.accessor(v, true);
                }
            });

            result.push(row);
        });
    }

    return result;
};

export const legalMultiply = (A, B, decimalPlaces = 2) => {
    let m = Math.pow(10, 4);
    let valueA = A * m ^ 0;
    let valueB = B * m ^ 0;

    return bankRounding(valueA * valueB / m ** 2, decimalPlaces);
};

export const bankRounding = (num, decimalPlaces = 2) => {
    var d = decimalPlaces || 0;
    var m = Math.pow(10, d);
    var n = +(d ? num * m : num).toFixed(8); // Avoid rounding errors
    var i = Math.floor(n), f = n - i;
    var e = 1e-8; // Allow for rounding errors in f
    var r = (f > 0.5 - e && f < 0.5 + e) ? ((i % 2 === 0) ? i : i + 1) : Math.round(n);

    return d ? r / m : r;
};