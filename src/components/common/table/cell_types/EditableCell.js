/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStackEvents } from 'stack-events';
import { Input } from 'airc-shell-core';

import { SYS_ID_PROP } from '../../../../const/Common';
import { KEY_RETURN, KEY_ESCAPE } from 'keycode-js';
// как форматировать?

class EditableCell extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            edit: false,
            loading: false,
            initValue: null,
            value: null
        };

        this.ref = null;

        this.edit = this.edit.bind(this);
        this.cancel = this.cancel.bind(this);
        this.save = this.save.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentDidMount() {
        const { value } = this.props;
        let _value = this.initValue(value);

        this.setState({
            value: _value,
            initValue: _value
        });
    }

    componentDidUpdate(oldProps, oldState) {
        if (this.props.value !== oldProps.value) {
            let _value = this.initValue(this.props.value);

            this.setState({
                value: _value,
                initValue: _value
            })

        }

        if (oldState.edit !== this.state.edit && this.state.edit === true) {
            this.ref.focus();
        }
    }

    initValue(value) {
        const { initier } = this.props;

        if (_.isFunction(initier)) {
            return initier(value);
        }

        return value;
    }

    handleKeyDown(event) {
        switch (event.keyCode) {
            case KEY_RETURN: this.save(); break;
            case KEY_ESCAPE: this.ref.blur(); break;

            default: return null;
        }
    }

    handleFocus() {
        this.props.pushEvents({
            "keydown": this.handleKeyDown
        });
    }

    handleBlur() {
        this.cancel();
    }

    handleChange(event) {
        const { type } = this.props;

        let value = event.target.value;

        if (type === 'number') {
            if (!_.isNaN(Number(value))) {
                this.setState({ value });
            }
        } else {
            this.setState({ value });
        }
    }

    edit(event) {
        event.stopPropagation();
        event.preventDefault();

        this.setState({ edit: true });
    }

    cancel(props = {}) {
        const { initValue } = this.state;

        this.setState({
            edit: false,
            value: initValue,
            ...props
        });

        this.props.popEvents();
    }

    save(newValue = null) {
        const { cell, onSave, entity, prop, preparearer, id, index } = this.props;
        const { value, initValue, loading } = this.state;

        if (loading) return;
        const val = !_.isNull(newValue) ? newValue : value;

        if (_.isFunction(onSave)) {
            if (val !== initValue) {
                this.setState({ loading: true });

                const data = {};
                const v = _.isFunction(preparearer) ? preparearer(val) : val;

                if (!_.isNil(index) && index >= 0) {
                    _.set(data, [entity, index, SYS_ID_PROP], id);
                    _.set(data, [entity, index, prop], v);
                } else {
                    data[prop] = v;
                    data[SYS_ID_PROP] = id;
                }

                onSave(cell, data)
                    .then(() => {
                        this.cancel({ initValue: val, value: val, loading: false })
                    })
                    .catch((e) => {
                        this.error(e);
                        this.setState({ loading: false });
                    });
            }
        }

    }

    error(e) {
        const { onError } = this.props;

        if (_.isFunction(onError)) {
            onError(e);
        }
    }

    format(value) {
        const { formatter } = this.props;

        if (_.isFunction(formatter)) {
            return formatter(value);
        }

        return value;
    }

    defaultRender() {
        const { editable } = this.props;
        const { value, edit, loading } = this.state;

        if (edit) {
            let disabled = loading === true;

            return (
                <Input
                    className="value-input"
                    ref={ref => this.ref = ref}
                    onClick={(event) => event.stopPropagation()}
                    defaultValue={value}
                    value={value}
                    bordered={false}
                    disabled={disabled}
                    onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                    onChange={this.handleChange}
                    size="small"
                />
            );
        }

        if (editable) {
            return (
                <span
                    className="value editable"
                    onClick={this.edit}
                >
                    {this.format(value)}
                </span>
            );
        }

        return (<span className="value">{this.format(value)}</span>);
    }

    render() {
        const { value } = this.state;
        const { renderer } = this.props;

        return (
            <div className="table-editable-cell">
                {renderer && _.isFunction(renderer) ? renderer(value, this.save, this.handleChange) : this.defaultRender()}
            </div>
        );
    }
}

EditableCell.protoTypes = {
    type: PropTypes.string,
    entity: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
    onSave: PropTypes.func.isRequired,
    onError: PropTypes.func,
    editable: PropTypes.bool,
    formatter: PropTypes.func,
    preparearer: PropTypes.func,

};

export default withStackEvents(EditableCell);