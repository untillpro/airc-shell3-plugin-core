/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import EditableCell from './EditableCell';
import { DatePicker } from 'airc-shell-core';

const defaultFormat = "LLLL";

class DateTimeCell extends PureComponent {
    constructor(props) {
        super(props);

        this.format = this.format.bind(this);
        this.value = this.value.bind(this);
        this.renderInput = this.renderInput.bind(this);
    }

    value(value) {
        return value ? Number(value) : null;
    }

    format() {
        const { format } = this.props;

        return _.isString(format) ? format : defaultFormat;
    }

    type() {
        switch (this.props.type) {
            case "time": return "time";
            default: return "date";
        }
    }

    renderInput(value, onSave, onChange) {
        const { editable } = this.props;

        if (editable === true) {
            return (
                <DatePicker
                    key={`dt_${value}`}
                    picker={this.type()}
                    format={this.format()}
                    defaultValue={value > 0 ? moment(value) : null}
                    onChange={onSave}
                    size={"small"}
                />
            );
        }

        let formatedValue = '';

        if (value) {
            formatedValue = moment(value).format(this.format());
        }

        return formatedValue;
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

DateTimeCell.propTypes = {
    format: PropTypes.string,
    editable: PropTypes.bool,
};

export default DateTimeCell