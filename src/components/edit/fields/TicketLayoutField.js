/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Message, Select, Button, Empty, translate as t } from 'airc-shell-core';
import EMEditFormFieldsBuilder from '../EMEditFormFieldsBuilder';
import TicketLayoutPreview from './TicketLayoutPreview';
//import TicketLayoutMLEditor from './TicketLayoutMLEditor';

import {
    sendError
} from '../../../actions/';

import {
    funcOrString
} from "../../../classes/helpers";

import {
    TYPE_LAYOUTS,
    C_LAYOUTS_NAME,
    C_LAYOUTS_TEMPLATE,
    C_LAYOUTS_TEMPLATE_DATA
} from "../../../classes/contributions/Types";

import buffer from 'buffer';

const Buffer = buffer.Buffer;

class TicketLayoutField extends Component {
    constructor() {
        super();

        this.prefix = 'airc'; // 4 byte blob prefix - indicates that created ticket template is unTill Ait ticket template, not other unTill.

        this.state = {
            error: null,
            changedData: {},

            layouts: [],
            selectedLayout: null,

            layoutSettings: [],
            layoutTemplate: [],
            layoutHelpers: [],
            layoutDictionary: {},
            layoutData: {},
        };

        this.onDataChanged = this.onDataChanged.bind(this);
    }

    componentDidMount() {
        const { prefix } = this.props;

        if (prefix && typeof prefix === 'string') {
            this.prefix = prefix;
        }

        try {
            this.init();
        } catch (e) {
            this.setState({
                error: e.toString()
            });
        }
    }

    componentDidUpdate() {
        this.handleChange();
    }

    init() {
        const { context, value } = this.props;
        const { contributions } = context;

        let selectedLayout = null;
        let layoutTemplate = null;
        let layoutSettings = null;
        let layoutHelpers = null;
        let layoutDictionary = null;
        let layoutData = {};
        let changedData = null;
        let templateChanged = false;

        const layouts = {};

        if (!contributions)
            throw new Error('Contributions property not specified');

        const points = contributions.getPoints(TYPE_LAYOUTS);

        if (points.length > 0) {
            _.each(points, (code) => {
                const layoutName = funcOrString(contributions.getPointContributionValue(TYPE_LAYOUTS, code, C_LAYOUTS_NAME));

                if (layoutName) {
                    layouts[code] = layoutName;
                }
            });
        }

        if (value) {
            const buffer = new Buffer(value, 'base64');

            if (this.checkBlobPrefix(buffer)) {
                const data = this.parseBlobData(buffer);

                if (data.settings && typeof data.settings === 'object') {
                    changedData = data.settings;
                }

                if (data.template && typeof data.template === 'string') {
                    layoutTemplate = data.template;
                }

                if (data.dictionary && typeof data.dictionary === 'object') {
                    layoutDictionary = data.dictionary;
                }

                if (data.code && typeof data.code === 'string') {
                    selectedLayout = data.code;
                }

                if (selectedLayout && layoutTemplate) {
                    templateChanged = this.compareTemplates(selectedLayout, layoutTemplate);
                }
            }
        }

        if (_.size(layouts) <= 0) {
            throw new Error('No ticket layouts specified!');
        } else {
            if (selectedLayout) {
                layoutHelpers = this.getHelpers(selectedLayout);
                layoutSettings = this.getSettings(selectedLayout);
                layoutData = this.getData(selectedLayout);
            }

            this.setState({
                layouts,
                changedData,
                selectedLayout,
                layoutTemplate,
                layoutSettings,
                layoutHelpers,
                layoutDictionary,
                layoutData,
                templateChanged
            });
        }
    }

    checkBlobPrefix(buffer) {
        if (!buffer) return false;

        const tplPrefix = buffer.slice(0, 4).toString();

        if (tplPrefix !== 'airc') {
            throw new Error('Selected template is not proper unTill Air ticket template');
        }

        return true;
    }

    parseBlobData(buffer) {
        let obj = {};

        if (!buffer) return {};

        const json = buffer.slice(4).toString();

        try {
            obj = JSON.parse(json);
        } catch (e) {
            throw new Error(e);
        }

        return obj;
    }

    compareTemplates(code, template) {
        const { context } = this.props;
        const { contributions } = context;

        const tpl = contributions.getPointContributionValue(TYPE_LAYOUTS, code, C_LAYOUTS_TEMPLATE);

        if (tpl && template && tpl !== template) {
            return true;
        }

        return false;
    }

    onDataChanged(newChangedData) {
        this.setState({ changedData: newChangedData })
    }

    handleChange() {
        const { changedData, layoutTemplate, selectedLayout } = this.state;
        const { onChange, field } = this.props;
        const { accessor } = field;

        if (onChange && typeof onChange === 'function') {
            const result = {
                settings: changedData,
                template: layoutTemplate,
                code: selectedLayout
            };

            const value = 'airc' + JSON.stringify(result);
            const buffer = new Buffer(value);

            onChange({ [accessor]: buffer.toString('base64') });
        }
    }

    getTemplate(code) {
        const { context } = this.props;
        const { contributions } = context;

        const template = contributions.getPointContributionValue(TYPE_LAYOUTS, code, C_LAYOUTS_TEMPLATE);

        return template;
    }

    getSettings(code) {
        const { context } = this.props;
        const { contributions } = context;

        let settings = [];

        const layoutPoint = contributions.getPointContributions(TYPE_LAYOUTS, code);
        settings = layoutPoint.settings || [];

        return settings;
    }

    getHelpers(code) {
        // const { context } = this.props;
        // const { contributions } = context;

        // const helpers = {};

        // const helpersPoint = contributions.getPointContributions(TYPE_HELPERS, code);

        // if (_.size(helpersPoint) > 0) {
        //     _.each(helpersPoint, (helper, name) => helpers[name] = helper);
        // }

        return {};
    }

    getDefaultValues(settings) {
        const values = {};

        if (_.size(settings) > 0) {
            _.each(settings, (obj) => {
                if (obj.value && obj.accessor) {
                    values[obj.accessor] = obj.value;
                }
            });
        }

        return values;
    }

    getData(code) {
        const { context } = this.props;
        const { contributions } = context;

        return contributions.getPointContributionValue(TYPE_LAYOUTS, code, C_LAYOUTS_TEMPLATE_DATA) || {};
    }

    selectLayout(code) {
        const { layouts } = this.state;

        let defaultValues = {};

        if (!code) return;

        if (!layouts[code]) this.props.sendError(t("Selected layout not presented in available ticket layouts", "errors"));

        const template = this.getTemplate(code);
        const settings = this.getSettings(code);
        const helpers = this.getHelpers(code);
        const data = this.getData(code);

        if (settings && settings.length > 0) {
            defaultValues = this.getDefaultValues(settings)
        }

        if (!template || typeof template !== 'string') {
            this.props.sendError(t("Layout's template not specified or wrong given", "errors"));
        } else {
            this.setState({
                selectedLayout: code,
                layoutTemplate: template,
                layoutSettings: settings,
                layoutHelpers: helpers,
                layoutData: data,
                changedData: defaultValues
            });
        }
    }

    refreshTemplate() {
        const { selectedLayout: code } = this.state;

        if (!code) return;

        const template = this.getTemplate(code);

        if (template) {
            this.setState({
                layoutTemplate: template,
                templateChanged: false
            });
        }
    }

    renderChangedMessage() {
        const { templateChanged } = this.state;

        if (!templateChanged) return null;

        return (
            <Message
                type="warning"
                header={t("Template has changed", "form")}
                footer={<Button onClick={this.refreshTemplate.bind(this)}>{t("Refresh template", "form")}</Button>}
            >
                {t("The current version of the template is different from that used in this ticket", "form")}
            </Message>
        );
    }

    renderLayoutDetails() {
        const {
            layoutSettings,
            layoutTemplate,
            layoutHelpers,
            layoutData,
            selectedLayout,
            changedData } = this.state;

        if (!selectedLayout)
            return (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<span>{t("Please select layout", "form")}</span>}
                />
            );

        return (
            <Fragment>
                {this.renderChangedMessage()}

                <div className="ticket-layout-selector-field-body">
                    <div className="ticket-layout-selector-field-settings">
                        <EMEditFormFieldsBuilder
                            fields={layoutSettings}
                            opened={true}
                            onDataChanged={this.onDataChanged}
                            data={changedData}
                            changedData={changedData}
                        />
                    </div>

                    <div className="ticket-layout-selector-field-preview">
                        {/*
                        
                        <TicketLayoutMLEditor 
                            template={layoutTemplate} 
                            dictionary={layoutDictionary} 
                        />
                        
                        */}


                        <TicketLayoutPreview
                            template={layoutTemplate}
                            settings={{ ...changedData }}
                            helpers={layoutHelpers}
                            data={layoutData}
                        />
                    </div>
                </div>
            </Fragment>
        );
    }

    render() {
        const { error, layouts, selectedLayout } = this.state;
        const { disabled, loading } = this.props;

        if (error) {
            return (
                <Message type='error'>
                    {error}
                </Message>
            );
        }

        if (layouts.length <= 0) return null;
        
        return (
            <div className="ticket-layout-selector-field" >
                <Select
                    disabled={disabled}
                    value={selectedLayout}
                    loading={loading}
                    onChange={(code) => this.selectLayout(code)}

                >
                    {_.map(layouts, (text, code) => {
                        return (
                            <Select.Option
                                key={`value_${code}`}
                                value={code}
                            >
                                {text}
                            </Select.Option>
                        )
                    })}
                </Select>

                {this.renderLayoutDetails()}
            </div>
        );
    }
}

TicketLayoutField.propTypes = {
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

export default connect(null, { sendError })(TicketLayoutField);
