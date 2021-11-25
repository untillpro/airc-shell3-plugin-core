/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { PureComponent } from 'react';
import EditableCell from './EditableCell';
import { Checkbox } from 'airc-shell-core';

class BooleanCell extends PureComponent {
    constructor(props) {
        super(props);

        this.format = this.format.bind(this);
        this.value = this.value.bind(this);
        this.renderInput = this.renderInput.bind(this);
    }

    format(value) {
        return value;
    }

    value(value) {
        return value ? 1 : 0;
    }

    renderInput(value, onSave, onChange) {
        const { editable } = this.props;

        if (editable === true) {
            return (
                <Checkbox
                    onClick={(event) => event.stopPropagation()}
                    checked={!!value}
                    onChange={(evt) => onSave(evt.target.checked)}
                />
            );
        }

        return (<Checkbox
            onClick={(event) => event.stopPropagation()}
            checked={!!value}
            disabled
        />);
    } 

    render() {
        return <EditableCell 
            {...this.props} 
            formatter={this.format} 
            type="number" 
            preparearer={this.value}
            renderer={this.renderInput}
        />;
    }
}

export default BooleanCell