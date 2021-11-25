/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Radio } from 'airc-shell-core';

class RadioGroupField extends Component {
    handleChange(event) {
        const { onChange, field } = this.props;
        const { accessor } = field;

        const value = event.target.value;

        if (onChange && typeof onChange === 'function' ) {
            onChange({[accessor]: value});
        }
    }

    getComponentProps() {
        const { field } = this.props;
        const props = {};

        if (field) {
            const {
                size,
                buttonStyle
            } = field;

            if (size) props.size = ['small', 'default', 'large'].indexOf(size) >= 0 ? size : 'default';
            if (buttonStyle) props.buttonStyle = (buttonStyle === 'solid') ? 'solid' : 'outline';
        }

        return props;
    }

    render() {
        const { field, value, disabled } = this.props;

        if (!field) return null;

        const { options, accessor } = field;

        const opts = _.isFunction(options) ? options() : options;

        if (!opts || _.size(opts) <= 0) throw new Error(`There is no options to option group field "${accessor}"`);
        if (typeof opts !== 'object') throw new Error(`Wrong "options" variable type. Object expected.`);

        const props = this.getComponentProps();

        return (
            <Radio.Group
                {...props}
                disabled={disabled}
                onChange={(val) => this.handleChange(val)}
                value={value}
            >
                {_.map(opts, (value, text) => {
                    return (
                        <Radio 
                            key={`${accessor}_option_${value}`} 
                            value={value}
                        >
                            {text}
                        </Radio>
                    );
                })}
            </Radio.Group>
        );
    }
}

RadioGroupField.propTypes = {
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

export default RadioGroupField;