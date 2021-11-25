/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate as t } from 'airc-shell-core';
import { Form, Select, Button } from 'antd';

import { LANGUAGES } from '../../const';

const { Option } = Select;

class SelectLanguageForm extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            value: null,
            languages: []
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleFinish = this.handleFinish.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    componentDidMount() {
        const { languages: selected } = this.props;

        if (_.size(LANGUAGES) > 0) {
            let languages = [];

            _.forEach(LANGUAGES, (langObj) => {
                if (_.isPlainObject(langObj)) {
                    if (langObj.id && selected.indexOf(langObj.id) < 0) {
                        languages.push({
                            code: langObj.id,
                            name: langObj.name
                        });
                    }
                }
            });

            this.setState({ languages });
        } else {
            throw new Error('No languages available. Check LANGUAGES const file.');
        }
    }

    handleChange(value) {
        this.setState({ value })
    }

    handleFinish(values) {
        const { onChange } = this.props;
        const { value } = this.state;

        if (_.isString(value) && _.isFunction(onChange)) {
            onChange(value);
        }
    }

    handleCancel() {
        const { onCancel } = this.props;

        if (_.isFunction(onCancel)) {
            onCancel();
        }
    }

    renderSelector() {
        const { languages } = this.state;

        return (
            <Form.Item 
                label={t("Language", "form")}
            >
                <Select
                    style={{ width: 150 }}
                    showSearch
                    placeholder={t("Select a language", "form")}
                    optionFilterProp="children"
                    onChange={this.handleChange}
                >
                    {languages.map(lang => {
                        return (<Option key={lang.code} value={lang.code}>{lang.name}</Option>);
                    })}
                </Select>
            </Form.Item>
        );
    }

    render() {
        return (
            <div className="ant-form ant-form-inline">
                {this.renderSelector()}

                <Form.Item>
                    <Button type="primary" onClick={this.handleFinish}>
                        {t("Submit", "common")}
                    </Button>
                </Form.Item>

                <Form.Item>
                    <Button onClick={this.handleCancel}>
                        {t("Cancel", "common")}
                    </Button>
                </Form.Item>
            </div>
        );
    }
}

SelectLanguageForm.propTypes = {
    onCancel: PropTypes.func,
    languages: PropTypes.array
};

export default SelectLanguageForm;