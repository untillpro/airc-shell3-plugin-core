/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'airc-shell-core';
import { funcOrString } from '../../../classes/helpers';

class CheckboxField extends Component {
    handleChange(event) {
        const { onChange, field } = this.props;
        const { accessor } = field;

        const value = Number(event.target.checked);

        if (onChange && typeof onChange === 'function' ) {
            onChange({[accessor]: value});
        }
    }

    render() {
        const { field, value, disabled } = this.props;

        if (!field) return null;

        return (
            <Checkbox
                disabled={disabled}
                onChange={(val) => this.handleChange(val)}
                checked={!!value}
            >
                {funcOrString(field.text)}
            </Checkbox>
        );
    }
}

CheckboxField.propTypes = {
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

export default CheckboxField;