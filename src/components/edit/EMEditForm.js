/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { confirmAlert } from 'react-confirm-alert';
import cn from 'classnames';
import { withStackEvents } from 'stack-events';
import {
    KEY_RETURN,
    KEY_ESCAPE
} from 'keycode-js';

import EMEditFormHeader from './EMEditFormHeader';
import EMEditFormFieldsBuilder from './EMEditFormFieldsBuilder';

import {
    Context,
    Button,
    Sections,
    SectionItem,
    ConfirmModal,
    translate as t
} from 'airc-shell-core';

import {
    makeValidator,
    mergeDeep,
    funcOrString
} from '../../classes/helpers';

import {
    TYPE_FORMS,
    C_FORMS_DEFAULT,
    C_FORMS_EMBEDDED_TYPE,
    C_FORMS_SECTIONS
} from '../../classes/contributions/Types';

import { STATE_FIELD_NAME, SYS_ID_PROP, STATUS_ACTIVE, STATUS_DELETED } from '../../const/Common';

import {
    sendNeedEditFormMessage,
    sendNeedCopyFormMessage,
    sendError
} from '../../actions/';

import { LoadingOverlay, Breadcrumbs } from '../common/';

import log from '../../classes/Log';

class EMEditForm extends Component {
    constructor() {
        super();

        this.state = {
            changedData: {},
            section: 0,
            sections: [],
            sectionsErrors: {},
            fieldsErrors: {},
            component: {}
        };

        this.doProceed = this.doProceed.bind(this);
        this.doValidate = this.doValidate.bind(this);

        this.handleDataChanged = this.handleDataChanged.bind(this);
        this.handleStateChanged = this.handleStateChanged.bind(this);
        this.hadleKeyPress = this.hadleKeyPress.bind(this);
        this.handleNavClick = this.handleNavClick.bind(this);
        this.handleBackClick = this.handleBackClick.bind(this);
        this.handleAddAction = this.handleAddAction.bind(this);
        this.handleCopyAction = this.handleCopyAction.bind(this);
        this.handleUnifyAction = this.handleUnifyAction.bind(this);

        this.formContext = new Context();
    }

    componentDidMount() {
        const { isNew, entity, onCancel } = this.props;
        let result = this.prepareProps();

        const sections = this.getSections(entity)

        if (sections && sections.length > 0) {
            result.sections = sections;
        } else {
            this.props.sendError(`No available sections declared for '${entity}' entity.`);

            if (onCancel && typeof onCancel === 'function') {
                onCancel(null);
            }

            return null;
        }

        if (isNew) {
            result.changedData = this.setDefaultValues(sections);
        }

        this.setState(result);
        this.props.pushEvents({ 'keydown': this.hadleKeyPress });
    }

    componentWillUnmount() {
        this.props.popEvents();
    }

    hadleKeyPress(event) {
        const { keyCode } = event;

        switch (keyCode) {
            case KEY_RETURN: this.doProceed(); return;
            case KEY_ESCAPE: this.handleBackClick(); return;
            default: return;
        }
    }

    handleNavClick(id) {
        const { locations } = this.props;

        if (id) {
            this.performWithCheckChanges(() => {
                this.props.sendNeedEditFormMessage(id, locations);
            });
        };
    }

    handleBackClick() {
        const { onCancel } = this.props;

        if (onCancel && typeof onCancel === 'function') {
            this.performWithCheckChanges(() => onCancel());
        }
    }

    handleAddAction() {
        const { locations } = this.props;

        this.performWithCheckChanges(() => {
            this.props.sendNeedEditFormMessage(null, locations);
        });
    }

    handleCopyAction() {
        const { locations } = this.props;
        const { _entry } = this.props.data;

        if (!_entry || !_.isObject(_entry)) return;

        this.performWithCheckChanges(() => {
            this.props.sendNeedCopyFormMessage([_entry], locations);
        });
    }

    handleUnifyAction() {
        //TODO
        this.props.sendError('not implemented yet!');
        return;

        //this.props.sendNeedUnifyFormMessage();
    }

    setDefaultValues(sections) {
        const { contributions, entity, data } = this.props;
        let changedData = { [STATE_FIELD_NAME]: STATUS_ACTIVE };

        const defaultValues = contributions.getPointContributionValue(TYPE_FORMS, entity, C_FORMS_DEFAULT);

        if (_.isPlainObject(defaultValues)) {
            changedData = { ...changedData, ...defaultValues };
        }

        if (_.isArray(sections)) {
            _.forEach(sections, (section) => {
                if (section && section.fields && _.isArray(section.fields)) {
                    _.forEach(section.fields, (field) => {
                        if (field &&
                            field.accessor &&
                            typeof field.accessor === 'string' &&
                            field.value !== undefined) {

                            if (_.isFunction(field.value)) {
                                changedData[field.accessor] = field.value();
                            } else {
                                changedData[field.accessor] = field.value;
                            }
                        }
                    });
                }
            });
        }

        if (_.isPlainObject(data) && _.size(data) > 0) {
            for (const key in data) {
                if (!_.isNil(data[key])) {
                    changedData[key] = data[key];
                }
            }
        }

        return changedData;
    }

    performWithCheckChanges(toPerform) {
        const { changedData } = this.state;

        if (_.size(changedData) > 0) {
            this.confirmFormClose(toPerform);
        } else {
            if (toPerform && typeof toPerform === 'function') toPerform();
        }
    }

    confirmFormClose(onConfirm) {
        confirmAlert({
            customUI: ({ onClose }) => <ConfirmModal
                onClose={onClose}
                header={t("Confirm form close", "form.confirm_modal")}
                text={t("Leaving this page will cause all unsaved changes to be lost", "form.confirm_modal")}
                confirmText={t("Discard changes and leave", "form.confirm_modal")}
                onConfirm={() => {
                    if (onConfirm && typeof onConfirm === 'function') {
                        onConfirm();
                    }

                    onClose();
                }}
                rejectText={t("Return to editing", "form.confirm_modal")}
                onReject={onClose}
            />
        });
    }

    doValidate() {
        const { onValidate } = this.props;
        const { changedData } = this.state;

        if (onValidate && typeof onValidate === 'function') {
            if (this.validateFields()) {
                const resultData = { ...changedData };

                onValidate(resultData);
            }
        } else {
            throw new Error(`"onValidate" event not specified`);
        }
    }

    doProceed() {
        const { onProceed, onCancel } = this.props;
        const { changedData } = this.state;

        if (_.size(changedData) > 0) {
            if (onProceed && typeof onProceed === 'function') {
                if (this.validateFields()) {
                    const submitReducers = this.formContext.getValue("submitReducer");
                    if (_.isArray(submitReducers)) {
                        const promises = [];
                        submitReducers.forEach(f => promises.push(f()));

                        Promise.all(promises).then(() => {
                            const resultData = this.getProceedData();

                            log("%c doProceed: result data: ", "color: red; font-size: 30px;");
                            log(resultData);

                            onProceed(resultData);
                        }).catch((err) => {
                            this.props.sendError(err);
                        });
                    } else {
                        const resultData = this.getProceedData();

                        log("%c doProceed: result data: ", "color: red; font-size: 30px;");
                        log(resultData);

                        onProceed(resultData);
                    }
                }
            } else {
                throw new Error(`"onProceed" handler not specified`);
            }
        } else {
            if (onCancel && typeof onCancel === 'function') {
                onCancel(null);
            } else {
                throw new Error(`"onCancel" handler not specified`);
            }
        }
    }

    getProceedData() {
        const { contributions, entity, data, isCopy } = this.props;
        const { changedData } = this.state;

        let resultData = {};

        if (isCopy) {
            resultData = { ...data, ...changedData };
        } else {
            resultData = { ...changedData }
        }

        if (resultData && _.isObject(resultData) && _.size(resultData) > 0) {
            _.forEach(resultData, (value, key) => {
                if (key.indexOf("__") === 0) {
                    delete resultData[key];
                }
            });
        }

        if (data) {
            const cc = contributions.getPointContributions("forms", entity);

            const embedded_types = _.get(cc, [C_FORMS_EMBEDDED_TYPE]);

            if (embedded_types && embedded_types.length > 0) {
                _.each(embedded_types, (eType) => {
                    if (_.isPlainObject(data[eType]) && resultData[eType]) {
                        resultData[eType][SYS_ID_PROP] = data[eType][SYS_ID_PROP];
                    }
                });
            }
        }

        return resultData;
    }

    validateFields() {
        const { sections, changedData } = this.state;
        const { data } = this.props;

        const resultData = mergeDeep(data || {}, changedData || {});

        const fieldsErrors = {};
        const sectionsErrors = {};
        const validator = makeValidator();

        let validated = true;

        sections.forEach((section, index) => {
            if (section && section.fields && section.fields.length > 0) {
                section.fields.forEach((field) => {
                    const errors = validator.validate(field, resultData, section.embedded);

                    if (errors && errors.length > 0) {
                        fieldsErrors[field.accessor] = errors;
                        sectionsErrors[index] = true;
                        validated = false;
                    }
                });
            }
        });

        this.setState({
            sectionsErrors,
            fieldsErrors
        });

        return validated;
    }

    prepareProps() {
        const { contributions, entity } = this.props;
        const entityListContributions = contributions.getPointContributions('forms', entity);
        let componentProps = {};

        if (entityListContributions) {
            _.each(entityListContributions, (contribution, type) => {
                switch (type) {
                    case 'component':
                        componentProps = { ...componentProps, ...contribution[0] };
                        break;

                    default:
                        break;
                }
            });
        }

        return {
            component: componentProps,
        };
    }

    getSections(entity, embeded = false) {
        const { contributions } = this.props;
        let sections = [];

        if (contributions && entity) {
            const point = contributions.getPointContributions('forms', entity);

            if (point && point[C_FORMS_SECTIONS]) {
                _.each(point[C_FORMS_SECTIONS], (sectionName) => {
                    const conts = contributions.getPointContributions('sections', sectionName);

                    if (conts) {
                        if (embeded) conts.embedded = entity;
                        sections.push(conts);
                    }
                });
            }

            if (point && point[C_FORMS_EMBEDDED_TYPE] && point[C_FORMS_EMBEDDED_TYPE].length > 0) {
                _.each(point[C_FORMS_EMBEDDED_TYPE], (eType) => {
                    const sects = this.getSections(eType, true);

                    if (sects && sects.length > 0) {
                        sections = [...sections, ...sects];
                    }
                });
            }
        }

        return sections;
    }

    handleSectionSelect(index) {
        let i = parseInt(index, 10);

        if (i < 0) {
            i = 0;
        }

        this.setState({ section: i });
    }

    handleStateChanged(state) {
        const { changedData } = this.state;

        this.setState({
            changedData: {
                ...changedData,
                [STATE_FIELD_NAME]: state === STATUS_ACTIVE ? STATUS_ACTIVE : STATUS_DELETED,
            }
        });
    }

    handleDataChanged(newChangedData) {
        log("EMEditForm.handleDataChanged() ", newChangedData);
        this.setState({ changedData: newChangedData });
    }

    loadingOverlay() {
        const { loading } = this.props;

        return <LoadingOverlay show={loading} text="Loading..." />;
    }

    buildSections() {
        const { sections, section, component, sectionsErrors } = this.state;

        if (sections && sections.length > 1) {
            return (
                <div className='page-section-navigation'>
                    <Sections
                        vertical={!component.vertical}
                        data={sections}
                        renderItem={(item, index) => {
                            return <SectionItem
                                error={sectionsErrors ? sectionsErrors[index] : false}
                                key={`tab_${index}`}
                                text={funcOrString(item.name)}
                                active={index === section}
                                onClick={() => this.handleSectionSelect(index)}
                            />
                        }}
                    />
                </div>
            );
        }

        return null;
    }

    buildSectionContent() {
        const { sections, section, sectionsErrors, changedData, fieldsErrors } = this.state;
        const { data, classifiers, entity, contributions, isNew, isCopy, locations } = this.props;

        let mergedData = mergeDeep({}, data, changedData);

        //log("EMEditForm data", data);
        //log("EMEditForm changedData", changedData);
        //log("EMEditForm mergedData", mergedData);

        if (sections && sections.length > 0) {
            return sections.map((sec, i) => {
                return (
                    <EMEditFormFieldsBuilder
                        formContext={this.formContext}

                        key={`${entity}_section_${i}`}
                        hasErrors={sectionsErrors[section]}
                        fields={sec.fields}
                        contributions={contributions}
                        opened={section === i}
                        footer={() => this.renderButtons()}
                        embedded={sec.embedded}
                        onDataChanged={this.handleDataChanged}

                        locations={locations}
                        data={mergedData}
                        classifiers={classifiers}
                        changedData={changedData}
                        fieldsErrors={fieldsErrors}

                        isNew={isNew}
                        isCopy={isCopy}
                    />
                );

            });
        }

        return null;
    }

    buildForm() {
        const { component } = this.state;

        return (
            <div className={cn('page-section', { 'vertical': component.vertical })}>
                {this.buildSections()}
                {this.buildSectionContent()}
                {this.loadingOverlay()}
            </div>
        );
    }

    renderButtons() {
        const { hideButtons, loading } = this.props;
        const { allowValidate } = this.state.component;

        if (hideButtons) return null;

        return (
            <div className="page-section-content-buttons">
                {allowValidate === true ? (
                    <Button
                        onClick={this.doValidate}
                    >
                        {t("Validate", "common")}
                    </Button>
                ) : null}

                <Button
                    loading={loading}
                    type="primary"
                    onClick={this.doProceed}
                >
                    {t("Proceed", "common")}
                </Button>
            </div>
        );
    }

    render() {
        const { changedData, component } = this.state;
        const { data, showHeader, showBreadcrumbs, isCopy, isNew, entity } = this.props;
        const { showActiveToggler, showNavigation, showLocationSelector, actions } = component;

        return (
            <Fragment>
                {showHeader === true ? (
                    <EMEditFormHeader
                        entity={entity}
                        onStateChanged={this.handleStateChanged}
                        showActiveToggler={!!showActiveToggler}
                        showNavigation={!!showNavigation}
                        showLocationSelector={!!showLocationSelector}
                        actions={actions}
                        data={data}
                        isNew={isNew}
                        isCopy={isCopy}
                        changedData={changedData}
                        onBackClick={this.handleBackClick}
                        onPrevClick={this.handleNavClick}
                        onNextClick={this.handleNavClick}
                        onAdd={this.handleAddAction}
                        onCopy={this.handleCopyAction}
                        onUnify={this.handleAddAction}
                    />
                ) : null}

                {showBreadcrumbs === true ? (<Breadcrumbs />) : null}

                <div className='paper nopad'>
                    {this.buildForm()}
                </div>
            </Fragment>
        );
    }
}

EMEditForm.propTypes = {
    entity: PropTypes.string.isRequired,
    locations: PropTypes.arrayOf(PropTypes.number).isRequired,
    contributions: PropTypes.object.isRequired,
    sendNeedEditFormMessage: PropTypes.func.isRequired,
    sendNeedCopyFormMessage: PropTypes.func.isRequired,
    sendError: PropTypes.func.isRequired,
    onProceed: PropTypes.func,
    onCancel: PropTypes.func,
    onValidate: PropTypes.func,

    data: PropTypes.object,
    classifiers: PropTypes.object,

    loading: PropTypes.bool,
    isCopy: PropTypes.bool,
    isNew: PropTypes.bool,
    showHeader: PropTypes.bool,
    showBreadcrumbs: PropTypes.bool,
};

const mapStateToProps = (state) => {
    const { locations } = state.locations;
    const { contributions } = state.context;

    return { locations, contributions };
}

const mapDispatchToProps = {
    sendNeedEditFormMessage,
    sendNeedCopyFormMessage,
    sendError
}
export default connect(mapStateToProps, mapDispatchToProps)(withStackEvents(EMEditForm));
