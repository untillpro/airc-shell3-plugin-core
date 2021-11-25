/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'airc-shell-core';
import cn from 'classnames';
import { funcOrString } from '../../../classes/helpers';
import { decodeCommand, encodeCommand, isValidCommand } from '../../../classes/helpers';

class CommandsList extends PureComponent {
    constructor() {
        super();

        this._handleChange = this._handleChange.bind(this);

        this.state = {
            commands: {},
            initial: {},
            errors: []
        };
    }

    componentDidMount() {
        const { formContext } = this.props;

        if (formContext && _.isObject(formContext)) {
            formContext.pushValue("submitReducer", this._handleChange);
        }

        this._initComponent();
    }

    componentDidUpdate(oldProps) {
        const { data } = this.props;

        if (data && _.size(data) > 0 && _.size(oldProps.data) === 0) {
            this._initComponent();
        }
    }

    _initComponent() {
        const { field, data } = this.props;
        const { fields, accessor } = field;
        const commands = {};

        if (_.isArray(fields) && fields.length > 0) {
            _.forEach(fields, (fname) => {
                let v = this._getValue(data, fname, accessor);

                if (_.isString(v)) {
                    commands[fname] = decodeCommand(v);
                }
            });
        }

        this.setState({
            commands,
            initial: commands,
            errors: []
        });
    }

    _getValue(data, name, accessor) {
        if (accessor) {
            return _.get(data, [accessor, name]);
        }

        return _.get(data, name);
    }

    async _handleChange() {
        const { field, onChange } = this.props;
        const { commands, initial } = this.state;
        const { fields, accessor } = field;
        const errors = [];
        const result = {};


        if (_.isFunction(onChange) && _.isArray(fields)) {
            return new Promise((resolve, reject) => {

                _.forEach(fields, (fname) => {
                    if (commands[fname]) {
                        if (isValidCommand(commands[fname])) {
                            if (commands[fname] !== initial[fname]) {
                                result[fname] = encodeCommand(commands[fname]);
                            }
                        } else {
                            errors.push(fname);
                        }
                    }
                });

                if (_.size(errors) === 0) {
                    if (accessor && _.isString(accessor)) {
                        onChange({ [accessor]: result });
                    } else {
                        onChange(result);
                    }

                    resolve();
                } else {
                    this.setState({ errors });
                    reject('Some commands are invalid');
                }

            });
        }

        return null;
    }

    _handleRowChange(name, event) {
        const { onChange } = this.props; 
        const { commands } = this.state;


        if (name) {
            const value = event.target.value ? String(event.target.value) : '';
            this.setState({ commands: { ...commands, [name]: value } });

            if (onChange) {
                onChange({[name]: ''});
            }
        }
    }

    _renderRow(name, label) {
        const { disabled } = this.props;
        const { commands, errors } = this.state;

        let hasError = errors.indexOf(name) >= 0;

        return (
            <div className="row">
                <div className={cn("label", { "_has_error": hasError })}>
                    {funcOrString(label)}
                </div>
                <div className={cn("input", { '_has_error': hasError })}>
                    <Input
                        disabled={disabled}
                        value={commands[name] ?? ''}
                        onChange={!disabled ? this._handleRowChange.bind(this, name) : null}
                    />
                </div>
            </div>
        );
    }

    _renderRows() {
        const res = [];
        const { field } = this.props;
        const { fields, labels } = field;

        if (_.size(fields) > 0) {
            for (let i = 0; i < fields.length; i++) {
                res.push(this._renderRow(fields[i], labels[i]));
            }
        }

        return res;
    }
    render() {
        const rows = this._renderRows();

        if (rows.length > 0) {
            return (
                <div className="commands-list-input">
                    {rows}
                </div>
            );
        }

        return null;
    }
}

CommandsList.propTypes = {
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

export default CommandsList;