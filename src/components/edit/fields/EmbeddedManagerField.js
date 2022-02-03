/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import EMEditForm from '../EMEditForm';
import { Modal, translate as t } from 'airc-shell-core';

import { reduce } from '../../../classes/helpers';
import { STATE_FIELD_NAME, SYS_ID_PROP, STATUS_ACTIVE, STATUS_DELETED } from '../../../const/Common';
import { ListTable } from '../../common';
import isEqual from 'react-fast-compare'
//import log from '../../../classes/Log';

/**
 * All API communications are realized in-component not in state machine cause of BO Reducer State intersections. 
 * 
 * To avoid this intersections it will be neccesary to create adittional state field specail to this component that in my opinion will be overkill.
 * */
const DEFAULT_MINIMUM_ROWS = 5;

class EmbeddedManagerField extends PureComponent {
    constructor() {
        super();

        this.state = {
            loading: false,
            current: null,
            data: [],
            dataLength: null,
            entityData: {},
            edit: false,
            copy: false,
            selectedRows: [],
            component: {},
            changedData: {},
            showDeleted: false,
            rowActions: [], // reserved
            headerActions: []
        };

        this.entity = null;

        this.handleRowDoubleClick = this.handleRowDoubleClick.bind(this);
        this.handleSelectedRowsChange = this.handleSelectedRowsChange.bind(this);
        this.handleShowDeletedChange = this.handleShowDeletedChange.bind(this);
        this.handleValueSave = this.handleValueSave.bind(this);
        this.handleEnterPress = this.handleEnterPress.bind(this);
    }

    componentDidMount() {
        const { field } = this.props;

        if (!field) throw new Error('EmbeddedManagerField exception: "field" prop not specified', field);

        const { entity } = field;

        if (!entity || typeof entity !== 'string') {
            throw new Error('EmbeddedManagerField exception: contribution prop "entity" is not defined or wrong given. String expected.', entity);
        }

        this.entity = entity;

        this.initData()
    }

    componentDidUpdate(oldProps, oldState) {
        const { value } = this.props;

        if (
            !isEqual(value, oldProps.value) ||
            !isEqual(this.state.showDeleted, oldState.showDeleted)
        ) {
            this.setState({ ...this.buildManagerData(value) });
        }
    }

    async initData() {
        const { value } = this.props;

        const headerActions = this.prepareHeaderActions();
        const rowActions = this.prepareRowActions();

        this.setState({
            ...this.buildManagerData(value),
            headerActions,
            rowActions
        });
    }

    buildManagerData(sourceData) {
        const { showDeleted } = this.state;
        const res = [];

        if (sourceData && typeof sourceData === 'object') {
            _.forEach(sourceData, (row, index) => {
                if (row && (showDeleted || row[STATE_FIELD_NAME] === STATUS_ACTIVE)) {
                    const newRow = { ...row };
                    newRow._index = index;
                    res.push(newRow);
                }
            });
        }

        return {
            data: res,
            dataLength: _.size(sourceData)
        };
    }

    //actions

    actionEdit(rowIndex = null) {
        const { selectedRows } = this.state;
        const data = this.getData();

        let index = parseInt(rowIndex);

        if (_.isNaN(index) && selectedRows && selectedRows.length > 0) {
            index = parseInt(selectedRows[0]);
        }

        if (index >= 0) {
            const entityData = { ...data[index] };

            if (entityData) {
                this.setState({
                    edit: true,
                    entityData,
                    current: index
                });
            }
        }
    }

    actionCopy(rowIndex = null) {
        const { selectedRows } = this.state;
        const data = this.getData();
        let index = parseInt(rowIndex);

        if (_.isNaN(index) && selectedRows && selectedRows.length > 0) {
            index = parseInt(selectedRows[0]);
        }

        if (index >= 0) {
            const entityData = data[index];

            if (entityData) {
                const d = reduce(
                    entityData,
                    (r, v, k) => {
                        if (k === SYS_ID_PROP) return;
                        else r[k] = v;
                    },
                    (v, k) => typeof v === 'object' && String(k).indexOf('id_') !== 0
                );

                if (d) {
                    this.setState({
                        copy: true,
                        edit: true,
                        entityData: d,
                        current: null
                    })
                }
            }
        }
    }

    actionToggle(rowIndex = null) {
        const { selectedRows } = this.state;
        const data = this.getData();
        
        let index = parseInt(rowIndex);

        if (_.isNaN(index) && selectedRows && selectedRows.length > 0) {
            index = parseInt(selectedRows[0]);
        }

        if (index >= 0) {
            const flatRow = data[index];

            if (_.isNumber(flatRow[SYS_ID_PROP])) {
                if (flatRow && _.isObject(flatRow)) {
                    this.onEditFormProceed(index, { [STATE_FIELD_NAME]: flatRow[STATE_FIELD_NAME] === STATUS_DELETED ? STATUS_ACTIVE : STATUS_DELETED });
                } else {
                    this.onEditFormProceed(index, { [STATE_FIELD_NAME]: STATUS_DELETED });
                }
            } else {
                this.onEditFormProceed(index, null);
            }

            

            this.setState({ selectedRows: [] });
        }
    }

    actionAdd() {
        this.setState({
            edit: true,
            selectedRows: [],
            entityData: {}
        });
    }

    // value is array
    handleChange(value) {
        const { onChange, field } = this.props;
        const { accessor } = field;
        
        if (onChange && typeof onChange === 'function') {
            onChange({ [accessor]: value });
        }
    }

    handleHeaderAction(action) {
        const { disabled } = this.props;

        if (disabled) return;

        switch (action) {
            case 'add': this.actionAdd(); break;
            case 'edit': this.actionEdit(); break;
            case 'copy': this.actionCopy(); break;
            case 'remove': this.actionToggle(); break;
            default: break;
        }
    }

    handleEnterPress() {
        this.actionEdit()
    }

    handleRowDoubleClick(e, row) {
        this.actionEdit(row.index);
    }

    handleSelectedRowsChange(rows, flatRows) {
        this.setState({ selectedRows: rows });
    }

    handleShowDeletedChange(val) {
        this.setState({ showDeleted: val });
    }

    async handleValueSave(entity, data, entry, rowIndex) {
        const { data: innerData } = this.state;


        let res = [];

        res[rowIndex] = { 
            [SYS_ID_PROP]: innerData[rowIndex] ? innerData[rowIndex][SYS_ID_PROP] : null, 
            ...data 
        };
        
        this.handleChange(res);
    }

    handleAction(row, type) {
        const { index } = row;

        switch (type) {
            case 'edit':
                this.actionEdit(index);
                break;

            case 'copy':
                this.actionCopy(index);
                break;

            case 'remove':
                this.actionToggle(index);
                break;

            default: break;
        }

        return false;
    }

    prepareHeaderActions() {
        const { context } = this.props;
        const { contributions } = context;

        if (!contributions) return [];

        const res = [];
        const component = contributions.getPointContributionValue('list', this.entity, 'component');

        if (_.isPlainObject(component)) {
            const actions = component.actions;

            if (_.isArray(actions)) {
                _.forEach(actions, (type) => {
                    const r = this.prepareHeaderAction(type);

                    if (r) {
                        res.push(r);
                    }
                });
            }
        }

        return res;
    }

    prepareHeaderAction(actionType) {
        const { disabled } = this.props;

        if (!actionType || typeof actionType != "string") return null;

        switch (actionType) {
            case 'add':
                return {
                    buttonType: "icon",
                    icon: 'plus',
                    key: 'header-action-add',
                    disabled: disabled,
                    onClick: (rows) => this.handleHeaderAction(actionType, rows)
                };

            case 'remove':
                return {
                    buttonType: "icon",
                    icon: 'delete',
                    key: 'header-action-remove',
                    disabled: disabled ? disabled : (rows) => !rows.length,
                    onClick: (rows) => this.handleHeaderAction(actionType, rows)
                };

            case 'copy':
                return {
                    buttonType: "icon",
                    icon: 'copy',
                    key: 'header-action-copy',
                    disabled: disabled ? disabled : (rows) => !rows.length,
                    onClick: (rows) => this.handleHeaderAction(actionType, rows)
                };

            case 'edit':
                return {
                    buttonType: "simple",
                    type: 'primary',
                    key: 'header-action-edit',
                    text: t("Edit item", "list"),
                    disabled: disabled ? disabled : (rows) => rows.length !== 1,
                    onClick: (rows) => this.handleHeaderAction(actionType, rows)
                };

            default: return null;
        }
    }

    prepareRowActions() {
        const { context } = this.props;
        const { contributions } = context;

        if (!contributions) return [];

        const res = [];
        const actions = contributions.getPointContributionValues('list', this.entity, 'actions')

        if (actions && _.isArray(actions) && actions.length > 0) {
            _.forEach(actions, (type) => {
                res.push({
                    type,
                    action: (data) => this.handleAction(data, type)
                })
            });
        }

        return res;
    }

    onEditFormProceed(index = null, newData) {
        const { value } = this.props;
        const { data, dataLength } = this.state;

        const newState = {
            edit: false,
            copy: false,
            entityData: null,
            current: null
        };

        let i = parseInt(index);

        if (i >= 0 && i < _.size(data)) {
            const row = data[index];
            i = row._index;
        } else {
            i = null;
        }

        let resultData = [];

        if (!_.isNil(newData) && _.size(newData) > 0) {
            if (!_.isNil(i) && i >= 0) {
                resultData[i] = { [SYS_ID_PROP]: value[i][SYS_ID_PROP], ...newData };
            } else {
                resultData[dataLength] = { ...newData };
            }
        } else {
            resultData[i] = null;
        }

        this.handleChange(resultData);
        this.setState(newState);
    }

    onEditFormCancel() {
        this.setState({
            edit: false,
            copy: false,
            entityData: {}
        });
    }

    startLoading() {
        this.setState({ loading: true });
    }

    stopLoading() {
        this.setState({ loading: false });
    }

    renderEditModal() {
        const { locations, classifiers } = this.props;
        const { edit, copy, entityData, current } = this.state;

        if (edit) {
            let isNew = !(_.isNumber(current) && current >= 0);

            return (
                <Modal
                    visible
                    footer={null}
                    onCancel={this.onEditFormCancel.bind(this)}
                    size="medium"
                >
                    <EMEditForm
                        classifiers={classifiers}
                        entity={this.entity}
                        isCopy={copy}
                        isNew={isNew}
                        data={entityData}
                        onProceed={(newData) => this.onEditFormProceed(!copy ? current : null, newData)}
                        onCancel={this.onEditFormCancel.bind(this)}
                        locations={locations}
                    />
                </Modal>
            );
        }

        return null;
    }

    getData() {
        const { data } = this.state;

        return data;
    }

    render() {
        const { disabled, classifiers } = this.props;
        const { loading, properties, rowActions, headerActions, showDeleted, selectedRows } = this.state;

        if (!this.entity) return null;

        const tableConfig = {
            disabled,
            minRows: DEFAULT_MINIMUM_ROWS,
            ...properties,
            className: disabled ? "disabled-table" : null
        };

        return (
            <div className="embedded-manager-field">
                <ListTable
                    loading={loading}
                    entity={this.entity}
                    data={this.getData()}
                    classifiers={classifiers}
                    manual={false}
                    showDeleted={showDeleted}

                    {...tableConfig}

                    selectedRows={selectedRows}
                    onEnterPress={this.handleEnterPress}
                    onDoubleClick={this.handleRowDoubleClick}
                    onSelectedChange={this.handleSelectedRowsChange}
                    onShowDeletedChanged={this.handleShowDeletedChange}
                    onValueSave={this.handleValueSave}
                    rowActions={rowActions}
                    headerActions={headerActions}
                />

                {this.renderEditModal()}
            </div>
        );
    }
}

EmbeddedManagerField.propTypes = {
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

export default EmbeddedManagerField;