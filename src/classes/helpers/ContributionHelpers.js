/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import { translate as t } from 'airc-shell-core';

import { TYPE_LANGUAGE } from '../contributions/Types';

export const addContributionLanguages = (manager, contribution, languages) => {
    if (languages && _.isObject(languages) && _.size(languages) > 0) {
        _.forEach(languages, (lang, code) => {
            if (_.isString(code) && _.isObject(lang)) {
                manager.registerContribution(
                    TYPE_LANGUAGE,
                    contribution,
                    code,
                    lang
                );
            }
        });
    } else {
        throw new Error("Wrong or empty languages map provided");
    }
}

export const contributionTranslate = (entity, code, section, options) => {
    let path = `contributions#${entity}`;

    if (section) {
        path += `.${section}`;
    }

    return t(code, path, options);
};

//funcOrString
export const funcOrString = (value, options = {}) => {
    if (value) {
        if (_.isString(value)) {
            return value;
        } else if (_.isFunction(value)) {
            return value(options);
        }
    }

    return "";
}

//translateOptions

export const translateOptions = (options, entity) => {
    if (!_.isString(entity) || !_.isObject(options)) {
        throw new Error("wrong props provided");
    }

    const res = {};

    _.forEach(options, (value, key) => {
        let k = contributionTranslate(entity, key, "options");

        res[k] = value;
    });

    return res;
}

export const translateOptionValue = (value, options, entity) => {
    let res = '';

    if (_.isNil(value)) return '';

    res = value;

    if (_.isObject(options) && _.size(options) > 0) {
        let k = _.findKey(options, (o) => o === value);

        res = contributionTranslate(entity, k, "options");
    } else {
        res = contributionTranslate(entity, value, "options");
    }

    return res;
}

export const getContributionProps = (fieldProps, propsList, fieldName) => {
    const props = {};

    if (_.isPlainObject(fieldProps) && _.isArray(propsList)) {
        _.forEach(propsList, (propName) => {
            if(_.isNil(fieldProps[propName])) {
                throw new Error(`Contribution prop "${propName}" is not defined or wrong given for field "${fieldName}".`);
            }

            props[propName] = fieldProps[propName];
        });
    }

    return props;
}