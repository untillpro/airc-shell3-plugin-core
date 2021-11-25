/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Popover, Button, ColorPicker, ColorPreview } from 'airc-shell-core';

class ColorPickerField extends Component {
    constructor() {
        super();

        this.state = {
            visible: false
        };
    }

    handleChange(value) {
        const { onChange, field } = this.props;
        const { accessor } = field;

        if (onChange && typeof onChange === 'function' ) {
            const val = this.hexToValue(value);
            onChange({ [ accessor ]: val });
        }    
    }

    handleVisibleChange(visible) {
        this.setState({visible});
    }

    valueToHex(value) {
        return value ? value.toString(16) : '000';
    }

    hexToValue(hex) {
        let val = String(hex).replace('#', '') || 0;

        return parseInt(val, 16);
    }

    getValue() {
        const { value } = this.props;

        return this.valueToHex(value);
    }

    getPicker() {
        const { field } = this.props;
        const type = field ? field.picker : 'block';
        
        return <ColorPicker 
            type={type} 
            value={this.getValue()}
            onChange={(value) => this.handleChange(value)}
        />;
    }

    render() {
        const { field, disabled } = this.props;
        const { visible } = this.state;

        if (!field) return null;

        const content = this.getPicker();
        const val = this.getValue();

        return (
            <div className="color-picker">
                <Popover 
                    placement="bottom" 
                    content={content} 
                    trigger={"click"}
                    visible={disabled ? false : visible}
                    onVisibleChange={(visible) => this.handleVisibleChange(visible)}
                >
                    <Button disabled={disabled}>
                        <ColorPreview 
                            color={val} 
                            showValue
                        />
                    </Button>
                </Popover>
            </div>
        );
    }
}

ColorPickerField.propTypes = {
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

export default ColorPickerField;