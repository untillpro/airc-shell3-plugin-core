/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import { translate as t } from 'airc-shell-core';
import { connect } from 'react-redux';
import { withStackEvents } from 'stack-events';

import {
    KEY_ESCAPE,
    KEY_RETURN
} from 'keycode-js';

import { Search } from 'airc-shell-core';
import { HeaderBackButton, ListTable, LocationSelector, Breadcrumbs } from '../common/';
import { funcOrString } from '../../classes/helpers';
import { STATE_FIELD_NAME } from '../../const/Common';

import {
    setColumnsVisibility,
    sendCancelMessage,
    sendNeedFetchListDataMessage,

    listProccessData,
    setListPage,
    setListPageSize,
    setListFilter,
    setListOrder,
    setListShowDeleted,

    sendNeedProcessMessage,
    sendNeedEditFormMessage,
    sendNeedCopyFormMessage,
    sendNeedUnifyFormMessage,
    sendNeedRemoveMessage,
    sendNeedReduceMessage,
    sendNeedRefreshDataMessage
} from '../../actions/';

import {
    selectListData
} from '../../selectors';

class EMList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            selected: [],
            selectedRows: [],
            selectedFlatRows: {},
            search: "",
            searchBy: ["name", "hq_id"]
        };

        this.handleBackClick = this.handleBackClick.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleEnterPress = this.handleEnterPress.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handlePageSizeChange = this.handlePageSizeChange.bind(this);
        this.handleRowDoubleClick = this.handleRowDoubleClick.bind(this);
        this.handleRowClick = this.handleRowClick.bind(this);
        this.handleSelectedRowsChange = this.handleSelectedRowsChange.bind(this);
        this.handleTableSortedChanged = this.handleTableSortedChanged.bind(this);
        this.handleTableFilteredChange = this.handleTableFilteredChange.bind(this);
        this.handleShowDeletedChanged = this.handleShowDeletedChanged.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleError = this.handleError.bind(this);
    }

    componentDidMount() {
        const rowActions = this.prepareRowActions();
        const headerActions = this.prepareHeaderActions();

        this.setState({
            rowActions,
            headerActions
        });

        this.props.pushEvents({
            "keydown": this.handleKeyPress
        });
    }

    componentWillUnmount() {
        this.props.popEvents();
    }

    prepareRowActions() {
        const { contributions, entity } = this.props;

        if (!contributions) return [];

        const res = [];
        const actions = contributions.getPointContributionValues('list', entity, 'actions')

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

    prepareHeaderActions() {
        const { contributions, entity } = this.props;

        if (!contributions) return [];

        const res = [];
        const component = contributions.getPointContributionValue('list', entity, 'component');

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
        if (!actionType || typeof actionType != "string") return null;

        switch (actionType) {
            case 'add':
                return {
                    buttonType: "icon",
                    icon: 'plus',
                    key: 'header-action-add',
                    onClick: (rows) => this.handleHeaderAction(actionType, rows)
                };

            case 'remove':
                return {
                    buttonType: "icon",
                    icon: 'delete',
                    key: 'header-action-remove',
                    disabled: (rows) => !rows.length,
                    onClick: (rows) => this.handleHeaderAction(actionType, rows)
                };

            case 'refresh':
                return {
                    buttonType: "icon",
                    icon: 'reload',
                    key: 'header-action-refresh',
                    onClick: (rows) => this.handleHeaderAction(actionType, rows)
                };

            case 'edit':
                return {
                    buttonType: "simple",
                    type: 'primary',
                    key: 'header-action-edit',
                    text: t("Edit item", "list"),
                    disabled: (rows) => rows.length !== 1,
                    onClick: (rows) => this.handleHeaderAction(actionType, rows)
                };

            case 'massedit':
                return {
                    buttonType: "simple",
                    type: 'primary',
                    key: 'header-action-massedit',
                    text: t("Mass edit", "list"),
                    hidden: (rows) => (!rows || rows.length <= 0),
                    disabled: (rows) => rows.length <= 1,
                    onClick: (rows) => this.handleHeaderAction(actionType, rows)
                };

            default: return null;
        }
    }

    handleKeyPress(event) {
        const { keyCode } = event;

        switch (keyCode) {
            case KEY_ESCAPE: this.handleBackClick(); return;
            case KEY_RETURN: this.handleEnterPress(); return;
            default: break;
        }
    }

    handleBackClick() {
        this.props.sendCancelMessage();
    }

    handleEnterPress() {
        const { locations, entity } = this.props;
        const { selected } = this.state;

        this.props.sendNeedEditFormMessage(selected, locations, entity);
    }

    handleShowDeletedChanged(value) {
        this.props.setListShowDeleted(!!value);
    }

    handleHeaderAction(action) {
        const { locations, entity } = this.props;
        const { selected } = this.state;

        switch (action) {
            case 'add':
                this.props.sendNeedEditFormMessage(null, locations, entity);
                break;
            case 'edit':
                this.props.sendNeedEditFormMessage(selected, locations, entity);
                break;
            case 'refresh':
                this.props.sendNeedRefreshDataMessage();
                break;
            case 'massedit':
                this.props.sendNeedMassEditFormMessage(selected, locations, entity);
                break;
            case 'remove':
                if (selected && selected.length > 0) {
                    this.props.sendNeedRemoveMessage(selected);
                }

                this.setState({ selected: [], selectedRows: [], selectedFlatRows: {} });

                break;
            default: break;
        }
    }

    handleAction(row, type) {
        const { locations, entity } = this.props;
        if (!row || !row.original) return;

        const { _entry: e, [STATE_FIELD_NAME]: state } = row.original;

        if (!e) {
            throw new Error("no _entry record provided for row ", row)
        }

        switch (type) {
            case 'edit':
                this.props.sendNeedEditFormMessage([e], locations, entity);
                break;

            case 'copy':
                this.props.sendNeedCopyFormMessage([e], locations, entity);
                break;

            case 'unify':
                this.props.sendNeedUnifyFormMessage([e], locations, entity);
                break;

            case 'remove':
                if (state === 1) {
                    this.props.sendNeedRemoveMessage([e]);
                } else {
                    this.props.sendNeedReduceMessage([e]);
                }

                break;

            default: break;
        }

        return false;
    }

    handleRowClick(event, row) {
        return null;
    }

    handleRowDoubleClick(event, row) {
        const { locations, entity } = this.props;
        event.stopPropagation();

        let entry = null;
        const { original } = row;

        if (original && original._entry) entry = original._entry;

        if (_.isPlainObject(entry)) this.props.sendNeedEditFormMessage([entry], locations, entity);
    }

    handleSelectedRowsChange(selectedRows, selectedFlatRows) {
        const selected = [];

        if (selectedRows.length > 0) {
            _.forEach(selectedFlatRows, (row) => row._entry ? selected.push(row._entry) : null);
        }

        this.setState({ selected, selectedRows, selectedFlatRows });
    }

    handlePageChange(page) {
        //TODO CHECK
        const { manual } = this.props;

        this.props.setListPage(page);

        if (manual) this.setState({ loading: true });
    }

    handlePageSizeChange(pageSize, page) {
        //TODO CHECK
        const { manual } = this.props;

        this.props.setListPageSize(pageSize);

        if (manual) this.setState({ loading: true });
    }

    handleTableSortedChanged(newOrder) {
        //TODO CHECK
        const { manual } = this.props;

        this.props.setListOrder(newOrder);

        if (manual) this.setState({ loading: true });
    }

    handleTableFilteredChange(newFilter) {
        //TODO FOR MANUAL MODE
        return null;
    }

    async handleSave(entity, data, entry) {
        return this.props.listProccessData(entity, [entry], data); // TODO change to saga
    }

    handleError(error) {
        const { api } = this.props;
        if (error && api && _.isFunction(api.sendError)) {
            api.sendError(error);
        }
    }

    handleSearchChange(value) {
        this.setState({ search: value || "" });
    }

    renderHeader() {
        const { entity, contributions } = this.props;

        if (entity) {
            return funcOrString(contributions.getPointContributionValue('entities', entity, 'name'));
        }

        return '<Noname>'; //todo default name.
    }

    render() {
        const {
            loading,
            entity,
            data,
            classifiers,
            pages,
            page,
            pageSize,
            manual,
            order,
            total,
            showDeleted
        } = this.props;

        const {
            rowActions,
            headerActions,
            search,
            selectedRows,
            selectedFlatRows,
            //searchBy 
        } = this.state;

        return (
            <div className='content-container'>
                <div className="content-header">
                    <div className="grid col-2 row-2">
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
                <ListTable
                    loading={loading}
                    entity={entity}
                    data={data}
                    classifiers={classifiers}
                    pages={pages}
                    page={page}
                    pageSize={pageSize}
                    manual={manual}
                    order={order}
                    total={total}
                    showDeleted={showDeleted}
                    selectedRows={selectedRows || []}
                    selectedFlatRows={selectedFlatRows || {}}
                    onPageChange={this.handlePageChange}
                    onPageSizeChange={this.handlePageSizeChange}
                    onDoubleClick={this.handleRowDoubleClick}
                    onRowClick={this.handleRowClick}
                    onSelectedChange={this.handleSelectedRowsChange}
                    onSortedChange={this.handleTableSortedChanged}
                    onFilterChage={this.handleTableFilteredChange}
                    onShowDeletedChanged={this.handleShowDeletedChanged}
                    onValueSave={this.handleSave}
                    onError={this.handleError}
                    rowActions={rowActions}
                    headerActions={headerActions}
                    search={search}
                />
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { entity } = state.plugin;
    const { locations } = state.locations;
    const { contributions, api } = state.context;

    const {
        loading,
        classifiers,
        showDeleted,
        pages,
        page,
        manual,
        pageSize,
        order,
        total,
        columnsVisibility
    } = state.list;

    return {
        api,
        entity,
        locations,
        classifiers,
        contributions,
        loading,
        total,
        data: selectListData(state),
        order: order || [],
        pages: pages || -1,
        page: page || 0,
        pageSize: pageSize || 20,
        manual: manual || false,
        showDeleted: !!showDeleted,
        columnsVisibility
    };
};

export default connect(mapStateToProps, {
    sendNeedEditFormMessage,
    sendNeedFetchListDataMessage,
    setColumnsVisibility,
    sendCancelMessage,
    setListPage,
    setListPageSize,
    setListFilter,
    setListOrder,
    setListShowDeleted,
    listProccessData,
    sendNeedProcessMessage,
    sendNeedCopyFormMessage,
    sendNeedUnifyFormMessage,
    sendNeedRemoveMessage,
    sendNeedReduceMessage,
    sendNeedRefreshDataMessage
})(withStackEvents(EMList));
