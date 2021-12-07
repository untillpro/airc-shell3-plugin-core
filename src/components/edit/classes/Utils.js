/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import isEqual from 'react-fast-compare';

export const simpleMutateCheck = (data, oldData, field, embedded_type) => {
    const { accessor } = field;

    let path = accessor || null ;

    if (embedded_type) {
        path = [embedded_type, path];
    }

    const v1 = _.get(data, path);
    const v2 = _.get(oldData, path);

    return !isEqual(v1,v2);
};

export const tablePlanMutateCheck = (newData, oldData, field) => {
    const { accessor, width_accessor, height_accessor, image_accessor } = field;

    let res = false;

    if (_.isString(accessor)) {
        let oldValue = _.get(oldData, accessor);
        let newValue = _.get(newData, accessor);

        res = !isEqual(newValue, oldValue);
    }

    if (!res && _.isString(width_accessor)) {
        let oldValue = _.get(oldData, width_accessor);
        let newValue = _.get(newData, width_accessor);

        res = !isEqual(newValue, oldValue) || res;
    }

    if (!res && _.isString(height_accessor)) {
        let oldValue = _.get(oldData, height_accessor);
        let newValue = _.get(newData, height_accessor);

        res = !isEqual(newValue, oldValue) || res;
    }

    if (!res && _.isString(image_accessor)) {
        let oldValue = _.get(oldData, image_accessor);
        let newValue = _.get(newData, image_accessor);

        res = !isEqual(newValue, oldValue) || res;
    }

    return res;
};

export const mlTextMutateCheck = (newData, oldData, field) => {
    const { accessor, ml_accessor } = field;

    if (_.get(newData, accessor) !== _.get(oldData, accessor)) {
        return true;
    }

    if (ml_accessor) {
        let ml_base64Str;
        let ml_base64Str_old;

        if (_.isString(ml_accessor)) {
            ml_base64Str = _.get(newData, ml_accessor);
            ml_base64Str_old = _.get(oldData, ml_accessor);
        } else if (_.isFunction(ml_accessor)) {
            ml_base64Str = ml_accessor(newData);
            ml_base64Str_old = ml_accessor(oldData);
        }

        return ml_base64Str !== ml_base64Str_old;
    }
}
