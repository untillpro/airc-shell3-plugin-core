/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TextInput } from 'airc-shell-core';

class TextField extends Component {
    handleChange(event) {
        const { onChange, field } = this.props;
        const { accessor } = field;

        if (onChange && typeof onChange === 'function' ) {
            const value = event.target.value ? String(event.target.value) : '';
            
            onChange({[accessor]: value});
        }
    }

    handlePressEnter(event) {
        const { field } = this.props;

        if (!field) return;


        const { onPressEnter } = field;

        if (onPressEnter && typeof onPressEnter === 'function') {
            onPressEnter(event);
        }
    }

    getComponentProps() {
        const { field } = this.props;
        const props = {};

        if (!field) return props;

        const {
            allowClear,
            addonAfter,
            addonBefore,
            prefix,
            size,
            suffix,
            maxLength,
            autofocus
        } = field;
        
        props.allowClear = !!allowClear;
        if (maxLength && maxLength >= 1) props.maxLength = parseInt(maxLength);
        if (addonAfter) props.addonAfter = addonAfter;
        if (addonBefore) props.addonBefore = addonBefore;
        if (prefix) props.prefix = prefix;
        if (suffix) props.suffix = suffix;
        if (size) props.size = ['small', 'default', 'large'].indexOf(size) >= 0 ? size : 'default';
        if (autofocus) props.autoFocus = true;
        
        return props;
    }

    render() {
        const { value, errors, field, disabled } = this.props;

        if (!field) return null;

        const {
            password,
            type,
            value_accessor
        } = field;

        const hasErrors = errors && errors.length > 0;

        const props = this.getComponentProps();

        const val = value_accessor ? _.get(value, value_accessor) : value;

        return (
            <TextInput 
                {...props}
                disabled={disabled}
                input={field}
                type={password ? 'password' : type || 'text'}
                error={hasErrors}
                value={val !== undefined ? val : ''}
                onChange={!disabled ? (event) => this.handleChange(event) : null}
            />
        );
    }
}

TextField.propTypes = {
    formContext: PropTypes.object,
    locations: PropTypes.arrayOf(PropTypes.number),
    autoFocus: PropTypes.bool,
    entity: PropTypes.string,
    context: PropTypes.object,
    field: PropTypes.object.isRequired,
    disabled: PropTypes.bool,
    showError: PropTypes.bool,
    errors: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.any,
    data: PropTypes.object,
    classifiers: PropTypes.object,
    isNew: PropTypes.bool,
    isCopy: PropTypes.bool,
};

export default TextField;