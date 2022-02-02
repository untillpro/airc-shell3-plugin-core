/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Button, translate as t } from 'airc-shell-core';
import EmbeddedManagerField from './EmbeddedManagerField';

import { SYS_ID_PROP } from '../../../const/Common';

import {
    getEntityFields,
    getParentForeignKey
} from '../../../classes/helpers';

/**
 * All API communications are realized in-component not in state machine cause of BO Reducer State intersections. 
 * 
 * To avoid this intersections it will be neccesary to create adittional state field specail to this component that in my opinion will be overkill.
 * */

class EmbeddedManagerPredefinedField extends EmbeddedManagerField {
    initData() {
        console.log("EmbeddedManagerPredefinedField.initData: ", this.props.value);
        const { value } = this.props;

        this.setState({ headerActions: this.prepareHeaderActions() });

        this.setState({
            data: _.map(value, (o) => o) || [],
            dep_data: this.buildPredefinedData() || []
        });

    }

    prepareHeaderAction(actionType) {
        const { disabled } = this.props;

        if (!actionType || typeof actionType != "string") return null;

        switch (actionType) {
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

    buildPredefinedData() {
        const result = [];
        const { context, field, classifiers } = this.props;
        const { contributions } = context;
        const { entity, depended_entity } = field;

        if (classifiers && classifiers[depended_entity]) {
            const data = classifiers[depended_entity];
            const defaultObject = {};

            const fields = getEntityFields(entity, contributions);

            if (fields) {
                _.each(fields, (field, key) => {
                    defaultObject[field.accessor] = field.value !== undefined ? field.value : null;
                });

                let fk = getParentForeignKey(entity, depended_entity)

                _.each(data, (val) => {
                    result.push(
                        {
                            ...defaultObject,
                            [fk]: val
                        }
                    );
                });
            }
        }

        return result;
    }

    onEditFormProceed(index = null, newData) {
        const { data } = this.state;
        const listData = this.getData();

        const rowData = listData[index];

        const newState = {
            edit: false,
            copy: false,
            entityData: null
        };

        let resultData = [];

        if (rowData && newData && _.size(newData) > 0) {

            const resultRowData = { ...rowData, ...newData };

            if (resultRowData[SYS_ID_PROP] && resultRowData[SYS_ID_PROP] > 0) {
                _.each(data, (row) => {
                    if (row[SYS_ID_PROP] === resultRowData[SYS_ID_PROP]) {
                        resultData.push({ ...row, ...resultRowData });
                    } else {
                        resultData.push(row);
                    }
                });
            } else {
                resultData[index] = resultRowData;
            }
        }

        if (resultData !== data) {
            this.handleChange(resultData);
        }

        this.setState(newState);
    }

    getData() {
        const { data, dep_data } = this.state;
        const { field } = this.props;
        const { entity, depended_entity } = field;

        console.log("data, dep_data: ", data, dep_data);
        if (!data || data.length <= 0) return dep_data;

        let fk = getParentForeignKey(entity, depended_entity);
        const resData = [...dep_data];

        console.log("fk: ", fk);
        _.each(data, (obj) => {
            const k = [fk, SYS_ID_PROP];
            const id = _.get(obj, [fk, SYS_ID_PROP]);

            const i = _.findIndex(resData, (o) => {
                const oid = _.get(o, k);

                return oid === id;
            });

            if (i >= 0) {
                resData[i] = obj;
            }
        });

        console.log("resData: ", resData);

        return resData;
    }

    renderHeaderActions() {
        const { selectedRows: rows } = this.state;

        return (
            <div className="header-actions">
                <Button type='primary' key='header-action-edit' text='Advanced settings' disabled={rows.length !== 1} onClick={() => this.actionEdit()} />
            </div>
        );
    }
}

EmbeddedManagerPredefinedField.propTypes = {
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


export default EmbeddedManagerPredefinedField;