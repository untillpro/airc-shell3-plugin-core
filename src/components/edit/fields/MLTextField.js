/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TextInput, Button, Modal, translate as t } from 'airc-shell-core';
import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Input } from 'antd';

import { SelectLanguageForm } from "../../common";
import { bufferToLangMap, langMapToBuffer } from '../../../classes/helpers';
import { LANGUAGES } from '../../../const';
import { addAvailableLanguage } from '../../../actions';

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
};

class MLTextField extends Component {
    constructor(props) {
        super(props);

        this.state = {
            opened: false,
            newLang: false,
            mlData: {}
        };

        this.handleAddonPress = this.handleAddonPress.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleModalClose = this.handleModalClose.bind(this);
        this.handleMLChange = this.handleMLChange.bind(this);
        this.handleAddLanguage = this.handleAddLanguage.bind(this);
        this.langFormOnChange = this.langFormOnChange.bind(this);
        this.langFormOnCancel = this.langFormOnCancel.bind(this);
    }

    componentDidMount() {
        const { data, field } = this.props;
        const { ml_accessor } = field;

        let ml_base64Str = _.get(data, ml_accessor);
        let mlData = this._getMlArray(ml_base64Str) || {};

        this.setState({ mlData });
    }

    componentDidUpdate(oldProps) {
        const { data, field } = this.props;
        const { ml_accessor } = field;

        let ml_base64Str;
        let ml_base64Str_old;

        if (_.isString(ml_accessor)) {
            ml_base64Str = _.get(data, ml_accessor);
            ml_base64Str_old = _.get(oldProps.data, ml_accessor);
        } else if (_.isFunction(ml_accessor)) {
            ml_base64Str = ml_accessor(data);
            ml_base64Str_old = ml_accessor(oldProps.data);
        }

        if (ml_base64Str !== ml_base64Str_old) {
            this.setState({ mlData: this._getMlArray(ml_base64Str) || {} });
        }
    }

    _getMlArray(mlData) {
        const { isNew, value, lang, defaultLang } = this.props;
        let langMap = {};

        if (isNew && value) {
            langMap[lang] = value;
            langMap[defaultLang] = value;
        } else if (_.isString(mlData)) {
            langMap = bufferToLangMap(mlData);
        }

        return langMap;
    }

    getComponentProps() {
        const { field } = this.props;
        
        let props = {};

        if (!field) return props;

        const {
            allowClear,
            addonBefore,
            prefix,
            size,
            suffix,
            maxLength,
            autofocus
        } = field;

        props.allowClear = !!allowClear;
        if (maxLength && maxLength >= 1) props.maxLength = parseInt(maxLength);
        if (addonBefore) props.addonBefore = addonBefore;
        if (prefix) props.prefix = prefix;
        if (suffix) props.suffix = suffix;
        if (size) props.size = ['small', 'default', 'large'].indexOf(size) >= 0 ? size : 'default';
        if (autofocus) props.autoFocus = true;

        return props;
    }

    handleMLChange(formValues) {
        const { onChange, field } = this.props;
        const { ml_accessor } = field;

        if (_.isPlainObject(formValues) && _.size(formValues) > 0) {
            let mlData = {}

            _.forEach(formValues, (v, k) => mlData[k] = v || "");

            if (_.isFunction(onChange)) {
                let buf = langMapToBuffer(mlData);

                onChange({ [ml_accessor]: buf });
            }
        }

        this.setState({opened: false});
    }

    handleAddonPress() {
        this.setState({ opened: true });
    }

    handleModalClose() {
        this.setState({ opened: false });
    }

    handleInputChange(event) {
        const { value } = event.target;
        const { onChange, field, lang } = this.props;
        const { accessor, ml_accessor } = field;
        const { mlData } = this.state;

        if (_.isFunction(onChange)) {
            mlData[lang] = value;
            onChange({
                [accessor]: value ? String(value) : '',
                [ml_accessor]: langMapToBuffer(mlData)
            });
        }
    }

    handleAddLanguage() {
        this.setState({ newLang: true });
    }

    langFormOnChange(lang) {
        this.props.addAvailableLanguage(lang)
    }

    langFormOnCancel() {
        this.setState({ newLang: false });
    }

    renderNewLang() {
        const { systemLanguages } = this.props;
        const { newLang } = this.state;

        if (newLang) {
            return (
                <Form.Item {...tailLayout}>
                    <SelectLanguageForm 
                        languages={systemLanguages} 
                        onChange={this.langFormOnChange}
                        onCancel={this.langFormOnCancel}
                    />
                </Form.Item>
            );
        }

        return (
            <Form.Item {...tailLayout}>
                <Button type="dashed" onClick={this.handleAddLanguage} icon={<PlusOutlined />} block>
                    {t("Add language", "form")}
                </Button>
            </Form.Item>
        );
    }

    renderAddonButton() {
        const { disabled } = this.props;

        return (
            <Button
                onClick={this.handleAddonPress}
                type="text"
                size="medium"
                icon={<EllipsisOutlined />}
                disabled={disabled}
            />
        );
    }

    renderML() {
        const { systemLanguages } = this.props;
        const { opened, mlData: initialValues } = this.state;

        if (opened !== true) return null;

        return (
            <Modal
                visible
                footer={null}
                title={t("Internationalization", "form")}
                onOk={this.handleMlModalConfirm}
                onCancel={this.handleModalClose}
                size="small"
            >
                <div className="ml-lang-list-container">
                    <Form
                        {...layout}
                        ref={this.formRef}
                        name="ml-form"
                        onFinish={this.handleMLChange}
                        initialValues={initialValues}
                    >
                        {
                            _.map(systemLanguages, (l) => {
                                const lang = LANGUAGES[l];

                                if (_.isPlainObject(lang)) {
                                    return (
                                        <Form.Item name={lang.id} label={lang.name} key={`lang_input_${lang.id}`}>
                                            <Input />
                                        </Form.Item>
                                    );
                                }
                            })
                        }

                        {this.renderNewLang()}

                        <Form.Item {...tailLayout}>
                            <Button type="primary" htmlType="submit">
                                {t("Save", "common")}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        );
    }

    render() {
        const { value, errors, field, disabled } = this.props;

        if (!field) return null;

        const hasErrors = errors && errors.length > 0;

        const props = this.getComponentProps();

        return (
            <>
                <TextInput
                    className="addon-no-padding"
                    {...props}
                    disabled={disabled}
                    input={field}
                    type='text'
                    error={hasErrors}
                    value={value}
                    onChange={!disabled ? this.handleInputChange : null}
                    addonAfter={this.renderAddonButton()}
                />

                {this.renderML()}
            </>
        );
    }
}

MLTextField.propTypes = {
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

const mapStateToProps = (state) => {
    const { systemLanguages, langCode, defaultLangCode } = state.options;
    
    return {
        systemLanguages,
        lang: langCode,
        defaultLang: defaultLangCode
    };
}

const mapDispatchToProps = { 
    addAvailableLanguage
};

export default connect(mapStateToProps, mapDispatchToProps)(MLTextField);