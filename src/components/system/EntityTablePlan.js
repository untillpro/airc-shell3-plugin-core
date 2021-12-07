/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import { translate as t } from 'airc-shell-core';
import { connect } from 'react-redux';
import { withStackEvents } from 'stack-events';
import { Search } from 'airc-shell-core';
import { HeaderBackButton, TablePlan, LoadingOverlay, LocationSelector, Breadcrumbs } from '../common/';
import { funcOrString } from '../../classes/helpers';

import {
    sendCancelMessage,
    sendNeedEditFormMessage,
    sendNeedRemoveMessage,
    sendNeedReduceMessage,
    setListShowDeleted
} from '../../actions/';

class EntityTablePlan extends Component {
    constructor() {
        super();

        this.handleAddAction = this.handleAddAction.bind(this);
        this.handleEditAction = this.handleEditAction.bind(this);
        this.handleDeleteAction = this.handleDeleteAction.bind(this);
        this.handleReduceAction = this.handleReduceAction.bind(this);
        this.handleBackClick = this.handleBackClick.bind(this);
        this.handleShowDeletedChanged = this.handleShowDeletedChanged.bind(this);
    }

    handleBackClick() {
        this.props.sendCancelMessage();
    }

    handleAddAction() {
        const { locations, entity } = this.props;

        this.props.sendNeedEditFormMessage(null, locations, entity);
    }

    handleEditAction(entry) {
        const { locations, entity } = this.props;

        if (_.isPlainObject(entry)) {
            this.props.sendNeedEditFormMessage([entry], locations, entity);
        }
    }

    handleReduceAction(entry) {
        if (_.isPlainObject(entry)) {
            this.props.sendNeedReduceMessage([entry]);
        }
    }

    handleDeleteAction(entry) {
        if (_.isPlainObject(entry)) {
            this.props.sendNeedRemoveMessage([entry]);
        }
    }

    handleShowDeletedChanged(value) {
        this.props.setListShowDeleted(!!value);
    }

    renderHeader() {
        const { entity, contributions } = this.props;

        if (entity) {
            return funcOrString(contributions.getPointContributionValue('entities', entity, 'name'));
        }

        return t("Table plan", 'list');
    }

    renderPlans() {
        const { locations, locationsOptions, showDeleted, data } = this.props;

        console.log("EntityTablePlan data: ", data);

        let locId = locations[0];

        return <TablePlan
            key={`table_plan_${locId}`}
            location={locId}
            name={locationsOptions[locId]}
            data={data || []}
            showDeleted={showDeleted}
            onAdd={this.handleAddAction}
            onEdit={this.handleEditAction}
            onDelete={this.handleDeleteAction}
            onReduce={this.handleReduceAction}
            onShowDeletedChanged={this.handleShowDeletedChanged}
        />;
    }

    renderLoading() {
        const { loading } = this.props;

        return <LoadingOverlay show={loading} text="Loading..." />;
    }

    render() {
        return (
            <div className='content-container'>
                <div className="content-header">
                    <div className="grid col-2 row-1">
                        <div className="cell">
                            <HeaderBackButton
                                onClick={this.handleBackClick}
                            />
                            <h1>{this.renderHeader()}</h1>
                        </div>

                        <div className="cell align-right">
                            <Search
                                onChange={this.handleSearchChange}
                            />
                        </div>

                        <div className="cell">
                            <LocationSelector />
                        </div>
                    </div>
                </div>

                <Breadcrumbs />

                <div className="_relative">
                    {this.renderPlans()}
                    {this.renderLoading()}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { contributions, api } = state.context;
    const { locations, locationsOptions } = state.locations;
    const { resolvedData, loading, showDeleted } = state.list;

    return {
        api,
        showDeleted,
        loading,
        contributions,
        data: resolvedData,
        locations,
        locationsOptions
    };
};

export default connect(mapStateToProps, {
    sendCancelMessage,
    sendNeedEditFormMessage,
    sendNeedRemoveMessage,
    sendNeedReduceMessage,
    setListShowDeleted,
})(withStackEvents(EntityTablePlan));
