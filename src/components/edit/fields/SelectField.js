/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Select } from 'airc-shell-core';

import {
    funcOrString
} from '../../../classes/helpers';

const { Option, OptGroup } = Select;

class SelectField extends Component {
    constructor() {
        super();

        this.state = {
            fetched: false,
            data: null,
            loading: false
        };
    }

    componentDidMount() {
        const { field, data, value } = this.props;

        if (!field) return;

        const { manual, selector, options, mapper } = field;

        if (!manual) {
            if (options) {
                let ops = {};

                if (_.isFunction(options)) {
                    ops = options();
                } else if (_.isPlainObject(options)) {
                    ops = options;
                }

                this.setState({
                    data: ops
                });
            } else if (selector) {
                let selectData = null;

                if (typeof selector === 'string') {
                    selectData = _.get(data, selector);
                } else if (typeof selector === 'object') {
                    selectData = selector;
                }

                if (_.isObject(selectData)) {
                    selectData = _.values(selectData);
                }

                if (mapper && typeof mapper === 'function') {
                    selectData = mapper(selectData);
                }

                this.setState({
                    data: selectData
                });
            }
        } else {
            if (_.isPlainObject(value)) {
                this.setState({
                    data: [value]
                });
            }
        }
    }

    fetchData() {
        const { context, field, entity, locations } = this.props;
        const { fetched, loading } = this.state;
        const { api } = context;

        if (!field) return;

        const { manual, resource, accessor } = field;

        if (!manual || fetched || loading) return;

        if (!resource) {
            throw new Error(`"${accessor}" field of "${entity}" entity is in manual mode. "resource" should be provided.`);
        }

        if (!locations || locations.length <= 0) {
            throw new Error(`Please select location for data fetch.`);
        }

        api.collection(resource, locations[0])
            .then(({ resolvedData }) => {
                this.setState({
                    fetched: true,
                    loading: false,
                    data: resolvedData
                })
            });

        this.setState({ loading: true });
    }

    handleChange(value) {
        const { data } = this.state;
        const { onChange, field } = this.props;
        const { accessor, value_accessor } = field;

        if (onChange && typeof onChange === 'function') {
            let val = value;

            if (value_accessor && typeof value_accessor === 'string') {
                const composedData = _.keyBy(data, value_accessor);
                val = _.get(composedData, val);
            }

            let changedData = { [accessor]: val };

            onChange(changedData);
        }
    }

    handleFocus() {
        const { field } = this.props;
        const { fetched } = this.state;
        const { manual } = field;

        if (manual && !fetched) {
            this.fetchData();
        }
    }

    getComponentProps() {
        const { field } = this.props;
        const props = {
            style: { display: "block" }
        };

        if (!field) return props;

        const {
            search,
            placeholder
        } = field;

        if (search) {
            props.showSearch = true;
            props.optionFilterProp = "children";
            props.filterOption = (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }

        if (placeholder) {
            props.placeholder = funcOrString(placeholder);
        }

        return props;
    }

    buildOptions(options) {
        const { field } = this.props;
        const result = [];
        const {
            value_accessor,
            text_accessor
        } = field;

        let group = null;
        let groupOptions = [];
        let count = 0;

        _.forEach(options, (value, text) => {
            const opt_val = value_accessor ? _.get(value, value_accessor) : value;
            const opt_text = String(text_accessor ? _.get(value, text_accessor) : text);

            if (text && String(text).indexOf("---") === 0) {
                if (group !== null) {
                    result.push(<OptGroup key={group} label={group}>{groupOptions}</OptGroup>)

                    groupOptions = [];
                    group = text.slice(3);
                } else {
                    group = text.slice(3);
                }
            } else {
                if (group !== null) {
                    groupOptions.push(
                        <Option
                            key={`value_${opt_val}`}
                            value={opt_val}
                        >
                            {opt_text}
                        </Option>
                    );
                } else {
                    result.push(
                        <Option
                            key={`value_${opt_val}`}
                            value={opt_val}
                        >
                            {opt_text}
                        </Option>
                    );
                }
            }

            count++;

            if (count === _.size(options) && group !== null && groupOptions.length > 0) {
                result.push(<OptGroup key={group} label={group}>{groupOptions}</OptGroup>)
            }
        });

        return result;
    }

    render() {
        const { value, field, disabled } = this.props;
        const { data, loading } = this.state;

        if (!field) return null;

        const { value_accessor } = field;

        let val = '';

        if (!_.isNil(value)) {
            if (_.isObject(value) && value_accessor) {
                val = _.get(value, value_accessor);
            } else {
                val = value;
            }
        }

        const props = this.getComponentProps();

        return (
            <Select
                {...props}
                disabled={disabled}
                value={val}
                loading={loading}
                onChange={(value) => this.handleChange(value)}
                onFocus={() => this.handleFocus()}
            >
                {this.buildOptions(data)}
            </Select>
        );
    }
}

SelectField.propTypes = {
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

export default SelectField;