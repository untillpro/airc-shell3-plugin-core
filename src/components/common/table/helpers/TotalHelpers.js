/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';

export const NUMBER_TOTAL = "number_total";
export const NUMBER_MIN = "number_min";
export const NUMBER_MAX = "number_max";
export const NUMBER_MEAN = "number_mean";
export const ROW_COUNT = "count";
export const ROW_UNIQ = "uniq";

export const renderTotalCell = (column, items) => {
    const value = getTotalValue(column, items);

    return value;
};

const getTotalValue = (column, items) => {
    const { totalType, accessor } = column;


    switch (totalType) {
        case NUMBER_TOTAL: return getNumberTotalValue(items, accessor);
        case NUMBER_MIN: return getNumberMinValue(items, accessor);
        case NUMBER_MAX: return getNumberMaxValue(items, accessor);
        case NUMBER_MEAN: return getNumberMeanValue(items, accessor);
        case ROW_COUNT: return getRowCountValue(items);
        case ROW_UNIQ: return getRowUnique(items, accessor);

        default: return "";
    }
}

const getNumberTotalValue = (items, accessor) => {

    return items.reduce((sum, row) => accessor(row) + sum, 0) || 0;
};

const getNumberMinValue = (items, accessor) => {
    return items.reduce((min, row) => {
        let val = accessor(row);

        if (min === null || min === undefined) {
            return val;
        }

        return val < min ? val : min;;
    }, null) || 0;
};

const getNumberMaxValue = (items, accessor) => {
    return items.reduce((max, row) => {
        let val = accessor(row);
        return val > max ? val : max;;
    }, 0) || 0;
};

const getNumberMeanValue = (items, accessor) => {
    const total = items.reduce((sum, row) => accessor(row) + sum, 0);
    return items ? (total / items.length) : 0;
};

const getRowCountValue = (items) => {
    return `#${ items ? items.length : 0}`;
};

const getRowUnique = (items, accessor) => {
    let result = [];

    _.forEach(items, (row) => {
        result.push(accessor(row));
    });

    return `#${_.uniq(result).length}`;
}