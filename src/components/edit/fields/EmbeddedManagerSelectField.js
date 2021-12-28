/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import PropTypes from 'prop-types';
import EmbeddedManagerField from './EmbeddedManagerField';

import {
    getCollection,
    processEntityData
} from '../../../classes/helpers';

import { STATE_FIELD_NAME, STATUS_DELETED } from '../../../const/Common';

class EmbeddedManagerSelectField extends EmbeddedManagerField {
    initData() {
        this.setState({headerActions: this.prepareHeaderActions()});
        
        this.fetchListData().then((data) => this.setState({ ...this.buildManagerData(data) }));
    }

    handleRowDoubleClick(e ,row) {
        const { onRowSelect } = this.props;

        if (onRowSelect && typeof onRowSelect === 'function') {
            onRowSelect(row.original);
        } else {
            this.actionEdit(row.index);
        }
    } 

    actionRemove(rowIndex = null) {
        const { selectedRows, data } = this.state;

        let index = parseInt(rowIndex);

        if (!index && selectedRows && selectedRows.length > 0) {
            index = selectedRows[0];
        }

        if (index >= 0 && data[index]) {
            const newData = { ...data };
            newData[index][STATE_FIELD_NAME] = STATUS_DELETED;
            this.setState({ data: newData });
        }
    }

    onEditFormProceed(index = null, newData) {
        const { context, locations } = this.props;
        const { entity } = this;
        const { data } = this.state;

        let id = null;

        const i = parseInt(index);

        let resultData = [ ...data ];

        if (i >= 0 && data[i].id) id = Number(data[i].id);

        if (newData && _.size(newData) > 0) {
            const entries = locations.map((wsid) => {
                return id;
            });

            processEntityData(context, entity, newData, entries)
                .then(() => {
                    return this.fetchListData()
                })
                .then((data) => {
                    this.setState({
                        data: this.buildManagerData(data),
                        edit: false,
                        copy: false,
                        entityData: null
                    });
                });
        }

        if (resultData !== data) {
            this.handleChange(resultData);
        }
    }

    doSelect() {
        const { onRowSelect } = this.props;
        const { selectedRows, data } = this.state;

        if (onRowSelect && typeof onRowSelect === 'function') {
            if (selectedRows && selectedRows.length > 0) {
                const index = parseInt(selectedRows[0]);

                if (index >= 0) {
                    const row = data[index];

                    if (row) {
                        onRowSelect(row);
                    }
                }
            } 
        } else {
            throw new Error('EmbeddedManagerSelectField.doSelect() exception: "onRowSelect" prop not specified or wrong given');
        }
    }

    async fetchListData() {
        const { context, locations } = this.props;
        const { entity } = this;

        if (!entity) return;

        this.startLoading();

        return getCollection(context, { scheme: entity, wsid: locations[0], props: {}}, true)
            .then(({ resolvedData }) => {
                this.stopLoading();

                return resolvedData;
            })
            .catch((e) => {
                this.stopLoading();
                throw new Error(e);
            });
    }
}

EmbeddedManagerSelectField.propTypes = {
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

export default EmbeddedManagerSelectField;