/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from "react";
import { connect } from 'react-redux';
import PropTypes from "prop-types";
import blacklist from "blacklist";
import { Checkbox, Logger, translate as t, Table } from 'airc-shell-core';
import isEqual from 'react-fast-compare';

import {
    KEY_RETURN,
    KEY_UP,
    KEY_DOWN
} from 'keycode-js';

import ListTableRowAction from './ListTableRowAction';
import ListTableHeader from './ListTableHeader';
import ListColumnFilter from './ListColumnFilter';
import ListPaginator from './ListPaginator';

import BooleanCell from './cell_types/BooleanCell';
import LocationCell from './cell_types/LocationCell';
import NumberCell from './cell_types/NumberCell';
import PriceCell from './cell_types/PriceCell';
import StringCell from './cell_types/StringCell';
import DateTimeCell from './cell_types/DateTimeCell';

import {
    funcOrString,
    getDynamicValue
} from '../../../classes/helpers';

import {
    SYS_ID_PROP
} from '../../../const/Common';

import {
    filterString,
    filterGroup,
    renderTotalCell,
} from './helpers';

const DefaultVisibleColumns = { [SYS_ID_PROP]: false, "id": false, "Id": false };

class ListTable extends PureComponent {
    constructor(props) {
        super(props);

        this.pageRows = null;

        this.state = {
            loading: false,
            expanded: [],
            columns: [],
            allColumns: [],
            selectedRows: [],
            selectedFlatRows: {},
            showPositionColumn: true,
            columnsVisibility: DefaultVisibleColumns,
            properties: {
                'showPagination': true,
                'showPaginationBottom': true,
                'showPaginationTop': true,
                'showPageSizeOptions': true,
            },
            component: {
                'showActionsColumn': false,
                'allowMultyselect': false,
                'allowSelection': true,
                'showColumnsToggler': true,
                'showDeletedToggler': true,
                'showPositionColumn': true,
                'showHeaderButtons': true,
                'showColumnFilter': false,
                'allowSearch': true,
                'searchBy': 'name'
            }
        };

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handlePageSizeChange = this.handlePageSizeChange.bind(this);
        this.handleRowClick = this.handleRowClick.bind(this);
        this.handleRowDoubleClick = this.handleRowDoubleClick.bind(this);
        this.handleCellSave = this.handleCellSave.bind(this);
        this.handleTableSortedChanged = this.handleTableSortedChanged.bind(this);
        this.handleTableFilteredChange = this.handleTableFilteredChange.bind(this);
        this.handleExpandedChange = this.handleExpandedChange.bind(this);

        this.handleVisibleChange = this.handleVisibleChange.bind(this);
        this.handleShowDeletedChange = this.handleShowDeletedChange.bind(this);

        this.getTrPropsCallback = this.getTrPropsCallback.bind(this);

        this.doFilter = this.doFilter.bind(this);

        this.changeSelected = this.changeSelected.bind(this);
    }

    componentDidMount() {
        const component = this.prepareComponent();
        const properties = this.prepareProps();
        const columns = this.getColumns(component);

        this.setState({
            properties,
            columns,
            component
        });

        document.addEventListener("keydown", this.handleKeyPress);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyPress)
    }

    componentDidUpdate(oldProps) {
        const { component } = this.state;
        const { selectedRows, selectedFlatRows, classifiers } = this.props;
        let newState = {};

        if (!isEqual(selectedRows, oldProps.selectedRows) || !isEqual(selectedFlatRows, oldProps.selectedFlatRows)) {
            newState = {
                selectedRows: selectedRows || [],
                selectedFlatRows: selectedFlatRows || {},
            };
        }

        if (classifiers !== oldProps.classifiers) {
            newState.columns = this.getColumns(component);
        }

        this.setState(newState);
    }

    getCellRenderer(d, opts, isDynamic) {
        const { defaultCurrency } = this.props;
        const { type, value_accessor, currency_accessor, editable, entity, rate, prefix, postfix } = opts;

        const props = {
            cell: d,
            entity,
            editable,
            prop: value_accessor,
            dynamic:
                isDynamic,
            defaultCurrency,
            rate,
            prefix,
            postfix
        };

        if (isDynamic === true) {
            props.value = _.get(d.value, [value_accessor]);
            props.id = _.get(d.value, [SYS_ID_PROP]);
            props.index = _.get(d.value, ["_index"]);

            if (type === "price" && _.isString(currency_accessor)) {
                props.currency = _.get(d.value, [currency_accessor]);
            }
        } else {
            props.value = d.value;
            props.id = _.get(d.original, [SYS_ID_PROP]);
            props.index = null;

            if (type === "price" && _.isString(currency_accessor)) {
                props.currency = _.get(d.original, [currency_accessor]);
            }
        }

        props.onSave = this.handleCellSave;

        switch (type) {
            case 'location':
                return <LocationCell value={d.value} />;

            case 'number':
                return <NumberCell  {...props} />;

            case 'float':
                return <NumberCell {...props} type="float" />;

            case 'boolean':
                return <BooleanCell {...props} />;

            case 'price':
                return <PriceCell {...props} />;

            case 'time':
                return <DateTimeCell {...props} type="time" format="HH:mm" />;

            case 'date':
                return <DateTimeCell {...props} format="DD/MM/YYYY" />;

            case 'datetime':
                return <DateTimeCell {...props} format="DD/MM/YYYY HH:mm" />;

            default:
                return <StringCell {...props} />;
        }
    }

    changeSelected(offset) {
        const { selectedRows } = this.state;
        const { onSelectedChange } = this.props;

        const selectedRowsNew = [];
        const selectedFlatRowsNew = {};

        let lastIndex = 0;
        let nextIndex = 0;

        let rowsLength = _.size(this.pageRows);
        if (rowsLength > 0) {
            if (_.size(selectedRows) > 0) {
                let lastId = _.last(selectedRows);

                lastIndex = _.findIndex(this.pageRows, (o) => o._index === lastId);

                nextIndex = lastIndex + offset;
                if (nextIndex < 0) {
                    nextIndex = 0;
                }

                if (nextIndex >= rowsLength) {
                    nextIndex = rowsLength - 1;
                }
            }

            const row = this.pageRows[nextIndex];
            const rowId = row._index;

            selectedRowsNew.push(rowId);
            selectedFlatRowsNew[rowId] = row._original;
        }

        this.setState({
            selectedRows: selectedRowsNew,
            selectedFlatRows: selectedFlatRowsNew
        });

        if (_.isFunction(onSelectedChange)) {
            onSelectedChange(selectedRowsNew, selectedFlatRowsNew);
        }
    }

    handleKeyPress(event) {
        const { selectedRows, selectedFlatRows } = this.state;
        const { onEnterPress } = this.props;
        const { keyCode } = event;

        if (keyCode === KEY_RETURN && _.isFunction(onEnterPress)) {
            onEnterPress(selectedRows, selectedFlatRows);
        }

        if (keyCode === KEY_UP) {
            this.changeSelected(-1)
        }

        if (keyCode === KEY_DOWN) {
            this.changeSelected(1)
        }
    }

    handleVisibleChange(value, columnId) {
        const { columnsVisibility } = this.state;

        let res = {};

        if (columnsVisibility && typeof columnsVisibility === "object") {
            res = { ...columnsVisibility };
        }

        if (columnId) {
            res[columnId] = !!value;
        }

        this.setState({ columnsVisibility: res });
    }

    handleShowDeletedChange(value) {
        const { onShowDeletedChanged } = this.props;

        let val = !!value;

        if (onShowDeletedChanged && typeof onShowDeletedChanged === 'function') {
            onShowDeletedChanged(val);
        }
    }

    handleRowClick(event, row) {
        const { onRowClick, onSelectedChange } = this.props;

        const { selectedRows, selectedFlatRows, component } = this.state;
        const { allowMultyselect, allowSelection } = component;

        const { index, original } = row;

        event.preventDefault();
        event.stopPropagation();

        if (allowSelection) {
            let selectedRowsNew;
            let selectedFlatRowsNew;

            const rowIndex = index;

            if (allowMultyselect) {
                selectedFlatRowsNew = { ...selectedFlatRows };

                if (selectedRows.indexOf(rowIndex) >= 0) {
                    selectedRowsNew = _.without(selectedRows, rowIndex);
                    selectedFlatRowsNew = delete (selectedFlatRowsNew[rowIndex]);
                } else {
                    selectedRowsNew = [...selectedRows, rowIndex];
                    selectedFlatRowsNew[rowIndex] = original;
                }
            } else {
                if (selectedRows.indexOf(rowIndex) >= 0) {
                    selectedRowsNew = [];
                    selectedFlatRowsNew = {};
                } else {
                    selectedRowsNew = [rowIndex];
                    selectedFlatRowsNew = { [rowIndex]: original };
                }
            }

            if (_.isFunction(onSelectedChange)) {
                onSelectedChange(selectedRowsNew, selectedFlatRowsNew);
            }

            this.setState({
                selectedRows: selectedRowsNew,
                selectedFlatRows: selectedFlatRowsNew
            });
        }

        if (_.isFunction(onRowClick)) {
            onRowClick(event, row);
        }
    }

    handleRowDoubleClick(event, row) {
        const { onDoubleClick } = this.props;

        if (onDoubleClick && typeof onDoubleClick === "function") {
            event.stopPropagation();

            onDoubleClick(event, row);
        }
    }

    handleRowsSelectorChange() {
        const { selectedRows, component } = this.state;
        const { onSelectedChange } = this.props;
        const { pageRows } = this;
        const { allowMultyselect } = component;

        let selectedRowsNew = [];
        let selectedFlatRowsNew = {};

        if (pageRows && allowMultyselect && (!selectedRows || selectedRows.length <= 0)) {
            pageRows.forEach(row => {
                selectedRowsNew.push(row._index);
                selectedFlatRowsNew[row._index] = row._original;
            });
        }

        this.setState({
            selectedRows: selectedRowsNew,
            selectedFlatRows: selectedFlatRowsNew
        });

        if (_.isFunction(onSelectedChange)) {
            onSelectedChange(selectedRowsNew, selectedFlatRowsNew);
        }
    }

    async handleCellSave(row, data) {
        const { entity } = this.props;
        const { _entry } = row.original;
        const { onValueSave } = this.props;
        const { index } = row;

        //TODO: do validation before

        if (_.isFunction(onValueSave)) {
            return onValueSave(entity, data, _entry, index);
        }
    }

    handlePageChange(page) {
        const { onPageChange } = this.props;

        if (onPageChange && typeof onPageChange === "function") {
            onPageChange(page)
        }
    }

    handlePageSizeChange(pageSize, page) {
        const { onPageSizeChange } = this.props;

        if (onPageSizeChange && typeof onPageSizeChange === "function") {
            onPageSizeChange(pageSize, page)
        }
    }

    handleTableSortedChanged(newOrder) {
        const { onSortedChange } = this.props;

        if (onSortedChange && typeof onSortedChange === "function") {
            onSortedChange(newOrder)
        }
    }

    handleTableFilteredChange(filtered, column) {
        const { onFilterChage } = this.props;

        if (onFilterChage && typeof onFilterChage === "function") {
            onFilterChage(filtered, column)
        }
    }

    handleExpandedChange(newExpanded) {
        this.setState({ expanded: newExpanded });
    }

    doFilter(filter, row, column) {
        const { type, filterType, accessor } = column;
        const { value } = filter;

        const rowValue = accessor(row);

        const checkType = type || filterType;

        let res = true;

        switch (checkType) {
            case "location": res = filterGroup(rowValue, value); break;
            default: res = filterString(rowValue, value); break;
        }

        return res;
    }

    prepareDynamicColumns(columnProps) {
        const { classifiers /*, onValueSave, onError*/ } = this.props;

        if (!classifiers || !_.isPlainObject(classifiers) || _.size(classifiers) === 0) {
            return [];
        }

        const {
            classificator,
            text_accessor,
            value_accessor,
            classifier_link,
            accessor,
            entity,
            type,
            defaultValue,
            width
        } = columnProps;

        if (!classificator || !_.isString(classificator)) {
            throw new Error("Dynamic fields should provide \"classificator\" property");
        }

        if (!text_accessor || !_.isString(text_accessor)) {
            throw new Error("Dynamic fields should provide \"text_accessor\" property");
        }

        if (!value_accessor || !_.isString(value_accessor)) {
            throw new Error("Dynamic fields should provide \"value_accessor\" property");
        }

        if (!classifier_link || !_.isString(classifier_link)) {
            throw new Error("Dynamic fields should provide \"classifier_link\" property");
        }

        if (!entity || !_.isString(entity)) {
            throw new Error("Dynamic fields should provide \"entity\" property");
        }

        const columns = {};
        const props = { accessor, value_accessor, classifier_link, defaultValue };

        _.forEach(classifiers[classificator], (c) => {
            const key = c[text_accessor];

            if (!columns[key]) {
                columns[key] = {
                    "id": key,
                    "Header": key,
                    "accessor": (d, isExport) => getDynamicValue(d, key, props, isExport),
                    "type": type || null,
                    "linked": [],
                    "width": width,
                    "Cell": (d) => this.getCellRenderer(d, columnProps, true)
                };
            }

            columns[key]["linked"].push(c.id);
        });

        return _.map(columns, (o) => o);
    }

    prepareColumn(columnProps, component) {
        const {
            accessor,
            header,
            Header,
            type,
            width,
            id,
            totalType,
            Footer,
            filterable,
            toggleable,
            filterType,
            editable,
            propName
        } = columnProps;

        const showTotal = component.showTotal || this.props.showTotal;

        if (
            !accessor ||
            (!header && !Header) ||
            (typeof accessor !== 'string' && typeof accessor !== 'function')
        ) {
            return null;
        }

        const column = {
            "id": typeof accessor === "string" ? accessor : id,
            "Header": funcOrString(header || Header),
            "accessor": accessor,
            "filterMethod": this.doFilter,
            "type": type || null,
            "Filter": (info) => <ListColumnFilter {...info} />
        };

        if (filterable !== false && filterType && typeof filterType === "string") {
            column.filterType = filterType;
        }

        if (totalType && typeof totalType === "string") {
            column.totalType = totalType;
        }

        if (Footer) {
            column.Footer = Footer;
        } else if (showTotal === true && totalType) {
            column.Footer = (info) => {
                const { column, data } = info;

                return column.Cell({ value: renderTotalCell(column, data) });
            }
        }

        if (_.isBoolean(toggleable)) {
            column.toggleable = toggleable;
        }

        if (_.isBoolean(filterable)) {
            column.filterable = filterable;
        }

        if (_.isBoolean(editable)) {
            column.editable = editable;
        }

        column.Cell = (d) => this.getCellRenderer(d, { ...columnProps, value_accessor: propName || id || accessor }, false);

        if (width) {
            column.width = width;
        }

        return column;
    };

    getColumns(component) {
        const { contributions, entity } = this.props;
        const { showPositionColumn, showActionsColumn } = component;

        let columns = [];

        // position column
        if (showPositionColumn) {
            columns.push({
                'Header': () => this.renderRowsSelector(),
                'width': 40,
                'Cell': (props) => this.renderPosition(props),
                'sortable': false,
                'filterable': false,
                'toggleable': false,
                'id': 'row-selector'
            });
        }

        // custom expander
        if (true) {
            columns.push({
                expander: true,
                Header: null,
                width: 20,
                toggleable: false,
                Expander: ({ isExpanded, subRows, ...rest }) => {
                    if (!subRows || subRows.length === 0) {
                        return null;
                    }

                    return (
                        <div style={{ zIndex: 100, position: 'relative' }} className="centered">
                            {isExpanded
                                ? <span>-</span>
                                : <span>+</span>}
                        </div>
                    );
                },
                style: {
                    cursor: "pointer",
                    fontSize: 25,
                    padding: "0",
                    textAlign: "center",
                    userSelect: "none"
                }
            });
        }

        const entityListContributions = contributions.getPointContributions('list', entity);

        if (entityListContributions && entityListContributions.columns) {
            _.each(entityListContributions.columns, (column) => {
                if (_.isPlainObject(column)) {

                    if (column.dynamic === true) {
                        const c = this.prepareDynamicColumns(column, component);

                        if (c && c.length > 0) {
                            columns = _.concat(columns, c);
                        }
                    } else {
                        const c = this.prepareColumn(column, component);

                        if (c) {
                            columns.push(c)
                        }
                    }

                }
            });
        }

        //action column
        if (showActionsColumn) {
            columns.push({
                'id': "actions",
                'Header': t("Actions", "list"),
                'width': 150,
                'Cell': this.renderActions.bind(this),
                'sortable': false,
                'filterable': false,
                'toggleable': false,
            });
        }

        return columns;
    }

    getVisibleColumns() {
        const { columns, columnsVisibility } = this.state;
        const res = [];

        if (columns && _.size(columns) > 0) {
            if (_.isPlainObject(columnsVisibility) && _.size(columnsVisibility) > 0) {
                columns.forEach((column) => {
                    const c = { ...column };

                    if (c.id in columnsVisibility) {
                        c.show = !!columnsVisibility[c.id];
                    }

                    res.push(c);
                });
            } else {
                return columns;
            }
        }

        return res;
    }

    getRowClass(row) {
        const { selectedRows, component } = this.state;
        const { allowSelection } = component;

        let resultClasses = "";

        if (allowSelection !== false) {
            resultClasses += ' -selectable';
        } else {
            return '';
        }

        if (row) {
            const rowIndex = row.index;

            if (selectedRows.indexOf(rowIndex) >= 0) {
                resultClasses += ' -selected';
            }
        }

        return resultClasses;
    }

    prepareComponent() {
        const { component } = this.state;
        const { contributions, entity } = this.props;

        let componentProps = contributions.getPointContributionValue('list', entity, 'component');

        if (!componentProps || !_.isPlainObject(componentProps)) {
            return {}
        }

        return { ...component, ...componentProps };
    }

    prepareProps() {
        const { properties } = this.state;
        const { contributions, entity } = this.props;

        let tableProps = contributions.getPointContributionValue('list', entity, 'table');

        if (!tableProps || !_.isPlainObject(tableProps)) {
            return {}
        }

        const props = { ...properties, ...tableProps };

        return blacklist(props, "data", "pages", "loading", "columns");
    }

    renderRowsSelector() {
        const { selectedRows, component } = this.state;
        const { allowSelection } = component;

        if (allowSelection) {
            return (
                <div className="centered">
                    <Checkbox
                        onChange={(event) => this.handleRowsSelectorChange(event)}
                        checked={selectedRows.length > 0}
                    />
                </div>
            );
        }

        return null;
    }

    renderPosition(row) {
        const { selectedRows } = this.state;
        const { viewIndex, page, pageSize, index } = row;

        if (selectedRows.indexOf(index) >= 0) {
            return (
                <div className="centered">
                    <Checkbox
                        key={`row_${index}`}
                        onChange={(e) => this.handleRowClick(e, row)}
                        checked
                    />
                </div>
            );
        }

        const rowIndex = viewIndex + page * pageSize + 1;

        return <div className="centered">{rowIndex}</div>;
    }

    renderActions(row) {
        const { entity, rowActions } = this.props;

        return rowActions.map((action) => {
            if (_.isPlainObject(action)) {
                return (
                    <ListTableRowAction
                        key={`action_${action.type}`}
                        type={action.type}
                        entity={entity}
                        action={action.action}
                        data={row}
                    />
                );
            }

            return null;
        });
    }

    getTrPropsCallback(state, row) {
        if (!row) return {};

        const { subRows } = row;

        if (subRows && subRows.length > 0) {
            return {}
        };

        return {

            onClick: (e) => this.handleRowClick(e, row),
            onDoubleClick: (e) => this.handleRowDoubleClick(e, row),
            className: this.getRowClass(row),
        };
    }

    searchFilter(value) {
        const { component: { searchBy, allowSearch } } = this.state;

        if (allowSearch && value && searchBy && typeof searchBy === 'string') {
            return [{ id: searchBy, value }];
        }

        return [];
    }

    render() {
        Logger.l('%c Render Table List', 'color: green; font-size: 120%');

        const { data, pages, page, pageSize, manual, order, filter, total, headerActions, search, loading, showDeleted } = this.props;
        const { selectedRows, selectedFlatRows, properties, component, expanded } = this.state;

        const exportFileName = `${this.props.entity}_export`;

        const tableConfig = {
            loading,
            minRows: 5,
            ...properties,
            manual,
            page,
            pageSize,
            sorted: order,
            filtered: filter,
            expanded: expanded,
            subRowsKey: "childs"
        };

        if (manual) {
            tableConfig.pages = pages;
            tableConfig.total = total;
        }

        const cols = this.getVisibleColumns();

        return (
            <div className='untill-base-table'>
                <Table
                    keyField="id"
                    resizable={false}
                    data={data}
                    columns={cols}

                    PaginationComponent={ListPaginator}

                    {...tableConfig}

                    showPagination={component.showPagination}
                    showPaginationTop={component.showPaginationTop}
                    showPaginationBottom={component.showPaginationBottom}

                    onPageChange={this.handlePageChange}
                    onPageSizeChange={this.handlePageSizeChange}
                    onSortedChange={this.handleTableSortedChanged}
                    onFilteredChange={this.handleTableFilteredChange}
                    onExpandedChange={this.handleExpandedChange}

                    getTrProps={this.getTrPropsCallback}
                    defaultFiltered={this.searchFilter(search)}
                    filterable={component.showColumnFilter}
                >
                    {(state, makeTable) => {
                        const { allDecoratedColumns, pageRows } = state;
                        this.pageRows = pageRows;

                        return (
                            <>
                                <ListTableHeader
                                    showDeleted={showDeleted}
                                    columns={allDecoratedColumns}
                                    data={state.data}
                                    rows={selectedRows || []}
                                    flatRows={selectedFlatRows || {}}
                                    component={component}
                                    buttons={headerActions}

                                    showExport={component.showExport}
                                    exportFileName={exportFileName}

                                    onVisibleChange={this.handleVisibleChange}
                                    onDeletedChange={this.handleShowDeletedChange}
                                />

                                <div className='untill-base-table-body'>
                                    {makeTable()}
                                </div>
                            </>
                        );
                    }}
                </Table>
            </div>
        );
    }
}

ListTable.propTypes = {
    contributions: PropTypes.object.isRequired,
    entity: PropTypes.string.isRequired,
    data: PropTypes.array,
    classifiers: PropTypes.object,
    pages: PropTypes.number,
    page: PropTypes.number,
    pageSize: PropTypes.number,
    manual: PropTypes.bool,
    order: PropTypes.array,
    total: PropTypes.number,
    selectedRows: PropTypes.array,
    selectedFlatRows: PropTypes.object,
    onPageChange: PropTypes.func,
    onPageSizeChange: PropTypes.func,
    onEnterPress: PropTypes.func,
    onDoubleClick: PropTypes.func,
    onRowClick: PropTypes.func,
    onSelectedChange: PropTypes.func,
    onSortedChange: PropTypes.func,
    onFilterChage: PropTypes.func,
    onValueSave: PropTypes.func,
    onError: PropTypes.func,
    rowActions: PropTypes.arrayOf(PropTypes.object),
    headerActions: PropTypes.arrayOf(PropTypes.object),
};

const mapStateToProps = (state) => {
    const { contributions, api } = state.context;
    const { defaultCurrency } = state.options;


    return {
        contributions,
        api,
        defaultCurrency
    };
};


export default connect(mapStateToProps, {})(ListTable);