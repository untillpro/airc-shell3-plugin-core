/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import v from 'voca';

export const filterString = (source, search, ignoreCase = true) => {
    if (ignoreCase) {
        return v.search(v.lowerCase(source), v.lowerCase(search)) >= 0;
    }

    return v.search(source, search) >= 0;
}

export const filterGroup = (value, values) => {
    if (!values || !_.isArray(values) || values.length === 0) return true;

    return values.indexOf(value) >= 0;
}