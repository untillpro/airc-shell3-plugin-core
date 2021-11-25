/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Header from './TablePlanHeader';
import List from './TablePlanList';
import Grid from './TablePlanGrid';

const VIEW_TYPE_GRID = 'grid';
const VIEW_TYPE_LIST = 'list';

class TablePlan extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            type: this._getViewType()
        };

        this.handleAddAction = this.handleAddAction.bind(this);
        this.handleViewTypeChange = this.handleViewTypeChange.bind(this);
        this.handleEditAction = this.handleEditAction.bind(this);
        this.handleReduceAction = this.handleReduceAction.bind(this);
        this.handleDeleteAction = this.handleDeleteAction.bind(this);
        this.handleShowDeletedChange = this.handleShowDeletedChange.bind(this);
    }

    _getViewType() {
        const { location } = this.props;
        let key = `table_view_type_${location}`;
        let type = localStorage.getItem(key);
        
        return type === VIEW_TYPE_LIST ? type : VIEW_TYPE_GRID
    }

    handleShowDeletedChange(value) {
        const { onShowDeletedChanged } = this.props;

        let val = !!value;

        this.setState({ showDeleted: !!val });

        if (onShowDeletedChanged && typeof onShowDeletedChanged === 'function') {
            onShowDeletedChanged(val);
        }
    }

    handleAddAction() {
        const { onAdd } = this.props;

        if (_.isFunction(onAdd)) {
            onAdd();
        }
    }

    handleViewTypeChange() {
        const { location } = this.props;
        const { type } = this.state;
        const newType = type === VIEW_TYPE_GRID ? VIEW_TYPE_LIST : VIEW_TYPE_GRID;
        const key = `table_view_type_${location}`;

        localStorage.setItem(key, newType);

        this.setState({
            type: newType
        })
    }

    handleEditAction(entity) {
        const { onEdit } = this.props;

        if (_.isFunction(onEdit)) {
            onEdit(entity);
        }
    }

    handleReduceAction(entity) {
        const { onReduce } = this.props;

        if (_.isFunction(onReduce)) {
            onReduce(entity);
        }
    }

    handleDeleteAction(entity) {
        const { onDelete } = this.props;

        if (_.isFunction(onDelete)) {
            onDelete(entity);
        }
    }

    render() {
        const { type } = this.state;
        const { name, data, location, showDeleted } = this.props;

        const props = {
            location,
            data,
            onEdit: this.handleEditAction,
            onAdd: this.handleAddAction,
            onDelete: this.handleDeleteAction,
            onReduce: this.handleReduceAction
        };

        return (
            <div className="table-plan">
                <div className="table-plan-container">
                    <Header 
                        location={location}
                        key={`table_plan_header_${location}`}
                        name={name} 
                        view={type}
                        showDeleted={showDeleted}
                        onViewChange={this.handleViewTypeChange}
                        onDeletedChange={this.handleShowDeletedChange}
                        onAdd={this.handleAddAction}
                    />
                    {type === VIEW_TYPE_LIST ? <List {...props} /> : <Grid {...props} />}
                </div>
            </div>
        );
    }
}

TablePlan.propTypes = {
    name: PropTypes.string.isRequired,
    data: PropTypes.object,
    onAdd: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onReduce: PropTypes.func.isRequired
};

export default TablePlan;