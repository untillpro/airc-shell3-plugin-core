/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import { translate as t } from 'airc-shell-core';

class FieldValidator {
    validate(field, data, embedded_type) {
        const errors = [];

        if (!field) return false;

        const { accessor, min, max, maxLength, minLength, regexp, required, type, rate } = field

        let path = accessor;

        if (embedded_type) {
            path = `${embedded_type}.${path}`;
        }

        if (path) {
            let value = _.get(data, path);

            const req = typeof required === 'function' ? required(field, data) : !!required;

            if (value && (!type || type === 'text' || type === 'string')) {
                value = String(value).trim();
            }

            if (req) this.validateRequired(value, errors);

            if (!_.isNil(value)) {
                if (type === 'number') this.validateNumber(value, errors);
                if (type === 'email') this.validateEmail(value, errors);
                if (!isNaN(Number(min))) this.validateMinValue(value, min, rate, errors);
                if (!isNaN(Number(max))) this.validateMaxValue(value, max, rate, errors);
                if (_.isNumber(minLength)) this.validateMinLengthValue(minLength, value, errors);
                if (_.isNumber(maxLength)) this.validateMaxLengthValue(maxLength, value, errors);
                if (regexp) this.validateRegexp(value, regexp, errors);
            }
        }

        return errors;
    }

    validateMinValue(value, min, rate = 1, errors) {
        let minVal = Number(min);
        const curVal = Number(value);

        if (rate > 0) {
            minVal = minVal * rate;
        }

        if (!_.isNumber(curVal)) {
            errors.push(t("Enter valid number", "errors"));
        } else if (curVal < minVal) {
            errors.push(t("Value should be more than {{value}}", "errors", { value: minVal}));
        }
    }

    validateMaxValue(value, max, rate = 1, errors) {
        let maxVal = Number(max);
        const curVal = Number(value);

        if (rate > 0) {
            maxVal = maxVal * rate;
        }

        if (!_.isNumber(curVal)) {
            errors.push(t("Enter valid number", "errors"));
        } else if (curVal > maxVal) {
            errors.push(t("Value should be less than {{value}}", "errors", { value: maxVal}));
        }
    }

    validateMinLengthValue(minLength, value, errors) {
        const minVal = Number(minLength);
        const curValue = String(value);

        if (curValue.length < minVal) {
            errors.push(t("String length should be more than {{value}}", "errors", {value: minVal}));
        }
    }

    validateMaxLengthValue(maxLength, value, errors) {
        const maxVal = Number(maxLength);
        const curValue = String(value);

        if (curValue.length > maxVal) {
            errors.push(t("String length should be less than {{value}}", "errors", {value: maxVal}));
        }
    }

    validateNumber(value, errors) {
        const curVal = Number(value);
        if (!_.isNumber(curVal)) {
            errors.push(t("Value must be a number", "errors"));
        }
    }

    validateEmail(value, errors) {
        const curVal = String(value);
        var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (!re.test(curVal)) {
            errors.push(t("Enter valid email", "errors"));
        }
    }

    validateRegexp(value, regexp, errors) {
        const re = new RegExp(regexp);
        const curVal = String(value);

        if (!re) {
            errors.push(t("Invalid regexp declared", "errors"));
        } else if (!re.test(curVal)) {
            errors.push(t("Not a valid value", "errors"))
        }
    }

    validateRequired(value, errors) {
        if (_.isNil(value) || value === "") {
            errors.push(t("Required field", "errors"));
        }
    }
}

export const makeValidator = () => {
    const validator = new FieldValidator();

    return function () {
        return validator;
    }();
};