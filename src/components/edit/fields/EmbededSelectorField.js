/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
    EllipsisOutlined
} from '@ant-design/icons';

import { TextInput, Modal, translate as t} from 'airc-shell-core';
import EmbeddedManagerSelectField from './EmbeddedManagerSelectField'

class EmbededSelectorField extends PureComponent {
    constructor() {
        super();

        this.state = {
            open: false
        };

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.openSelector = this.openSelector.bind(this);
        this.handleSelectorChange = this.handleSelectorChange.bind(this);
    }
    
    handleChange(value) {
        const { onChange, field } = this.props;
        const { accessor } = field;

        if (onChange && typeof onChange === 'function') {
            onChange({[accessor]: value});
        }
    }

    handleSelectorChange(event) {
        if (!event.target.value) {
            this.handleChange(null);
        }
    }

    handleItemSelect(value) {
        this.handleChange(value);

        this.setState({
            open: false
        });
    }

    handleKeyPress(event) {
        event.preventDefault();

        if (event.keyCode === 8) {
            this.handleChange(null);
        }
        return false;
    }

    getComponentProps() {
        const { field } = this.props;
        const props = {};

        if (!field) return props;

        const {
            allowClear,
            addonAfter,
            addonBefore,
            prefix,
            size,
            suffix,
            maxLength
        } = field;

        props.allowClear = !(allowClear === false);

        if (maxLength && maxLength >= 1) props.maxLength = parseInt(maxLength);
        if (addonAfter) props.addonAfter = addonAfter;
        if (addonBefore) props.addonBefore = addonBefore;
        if (prefix) props.prefix = prefix;
        if (suffix) props.suffix = suffix;
        if (size) props.size = ['small', 'default', 'large'].indexOf(size) >= 0 ? size : 'default';

        return props;
    }

    getInputValue() {
        const { value, field } = this.props;

        if (!value) return '';
        if (!field) return value;

        const {
            text_accessor
        } = field;

        if (text_accessor && typeof text_accessor === 'string' && value && typeof value === 'object') {
            return value[text_accessor] || '';
        }

        return value ? value : '';
    }

    openSelector() {
        this.setState({ open: true });
    }

    handleModalCancel() {
        this.setState({ open: false })
    }

    handleModalOk() {
        if (this.manager) {
            this.manager.doSelect();
        }

    }

    renderSelector() {
        const { context, field, locations } = this.props;
        const { open } = this.state;

        if (open) {
            return (
                <Modal
                    visible
                    cancelText={t("Cancel", "common")}
                    okText={t("Ok", "common")}
                    onCancel={() => this.handleModalCancel()}
                    onOk={() => this.handleModalOk()}
                    width={"80%"}
                    className="edit-form-modal"
                >
                    <EmbeddedManagerSelectField
                        locations={locations}
                        field={field}
                        context={context}
                        ref={ref => this.manager = ref}

                        onRowSelect={(item) => {
                            this.handleItemSelect(item);
                        }}
                    />
                </Modal>
            )
        }

        return null;
    }

    render() {
        const { disabled } = this.props;
        const props = this.getComponentProps();

        const inputValue = this.getInputValue();

        return (
            <>
                <TextInput
                    disabled={disabled}
                    className="selector-input"
                    {...props}
                    addonAfter={
                        <div 
                            onClick={this.openSelector.bind(this)}
                            style={{
                                height: "100%",
                                cursor: "pointer",
                                left: "0px",
                                top: "0px",
                                minWidth: "20px"
                            }}
                        >
                            <EllipsisOutlined />
                        </div>
                    }
                    value={inputValue}
                    onKeyDown={this.handleKeyPress}
                    onDoubleClick={this.openSelector}
                    onChange={this.handleSelectorChange}
                />

                {this.renderSelector()}
            </>
        )
    }
}

EmbededSelectorField.propTypes = {
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

export default EmbededSelectorField;
