/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Popconfirm, InputNumber } from 'antd';
import { Modal, translate as t } from 'airc-shell-core';
import { withStackEvents } from 'stack-events';
import EMEditForm from '../EMEditForm';

import {
    KEY_UP,
    KEY_DOWN,
    KEY_LEFT,
    KEY_RIGHT,
} from 'keycode-js';

import {
    Table,
    TableArea,
    TableAreaList
} from '../../common/plan/';

import { STATE_FIELD_NAME, STATUS_ACTIVE, STATUS_DELETED, SYS_ID_PROP } from '../../../const/Common';

import TableAreaImageSelect from '../../common/plan/TableAreaImageSelect_2';

import {
    PlusOutlined,
    DeleteOutlined,
    BorderlessTableOutlined
} from '@ant-design/icons';

import {
    MIN_PLAN_WIDTH,
    MIN_PLAN_HEIGHT,
    SIZE_INPUT_STEP,
    TABLE_PLAN_NUMBER_ACCESSOR,
    TABLE_PROP_WIDTH_ACCESSOR,
    TABLE_PROP_HEIGHT_ACCESSOR,
    TABLE_PROP_IMAGE_ACCESSOR,
    TABLE_PROP_PREVIEW_ACCESSOR,
} from '../../../const';

import { funcOrString, getContributionProps } from '../../../classes/helpers';

class TablePlanEditor extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            tables: [],
            currentTable: null,
            modal: false,
            showGrid: false,

            width: 0,
            height: 0,
            image: null,

            maxBoundRight: 0,
            maxBoundBottom: 0,

            step: 10,

            formError: null


        };

        this.area = null; //TableArea ref

        this.changeTables = this.changeTables.bind(this);
        this.addTable = this.addTable.bind(this);
        this.editTable = this.editTable.bind(this);
        this.copyTable = this.copyTable.bind(this);
        this.removeTable = this.removeTable.bind(this);
        this.clearImage = this.clearImage.bind(this);
        this.toggleGrid = this.toggleGrid.bind(this);
        this.onTableClick = this.onTableClick.bind(this);
        this.onTableDoubleClick = this.onTableDoubleClick.bind(this);
        this.onTableChange = this.onTableChange.bind(this);
        this.onTableMove = this.onTableMove.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.onImageChange = this.onImageChange.bind(this);
        this.onSizeChange = this.onSizeChange.bind(this);
        this.handleCancel = this.handleCancel.bind(this);

        // stack events

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        //reducer 

        this.onBeforeSubmit = this.onBeforeSubmit.bind(this);

        //memo

        this._reduce = _.reduce;
    }

    componentDidMount() {
        const { field, formContext } = this.props;

        this.field = getContributionProps(
            field,
            [
                'entity',
                TABLE_PLAN_NUMBER_ACCESSOR,
                TABLE_PROP_WIDTH_ACCESSOR,
                TABLE_PROP_HEIGHT_ACCESSOR,
                TABLE_PROP_IMAGE_ACCESSOR,
                TABLE_PROP_PREVIEW_ACCESSOR,
            ],
            funcOrString(field.header),
        );

        this._initData();

        this.props.pushEvents({
            'keydown': this.handleKeyDown,
            'keyup': this.handleKeyUp
        });

        if (formContext && _.isObject(formContext)) {
            formContext.pushValue("submitReducer", this.onBeforeSubmit);
        }
    }

    componentWillUnmount() {
        this.props.popEvents();
    }

    componentDidUpdate(oldProps) {
        //console.log("componentDidUpdate: ", this.props.data);
        
        if (this.props.data !== oldProps.data) {
            this._initData();
        }
    }

    async onBeforeSubmit() {
        if (this.area && _.isString(this.field[TABLE_PROP_PREVIEW_ACCESSOR])) {
            return new Promise((resolve, reject) => {
                return this.area.generatePreview().then((data) => {
                    return this.savePreviewImage(data).then(() => resolve());
                }).catch((e) => {
                    console.error(e);
                    reject(e);
                });
            });
        }

        return null;
    }

    async savePreviewImage(data) {
        const { locations, context, onChange } = this.props;
        const { api } = context;
        const { [TABLE_PROP_PREVIEW_ACCESSOR]: preview_accessor } = this.field;
        const wsid = locations[0];

        if ("blob" in api) {
            return api.blob(wsid, data).then((res) => {
                const { status, response } = res;

                if (status === 200 && _.isFunction(onChange)) {
                    onChange({ [preview_accessor]: response });
                }
            }).catch(e => console.error(e));
        }
    }

    handleKeyDown(event) {
        const { currentTable, step, showGrid } = this.state;
        const { keyCode } = event;

        if (keyCode === KEY_LEFT || keyCode === KEY_RIGHT || keyCode === KEY_UP || keyCode === KEY_DOWN) {
            event.stopPropagation();
            event.preventDefault();

            let delta = showGrid ? step : 1;

            if (currentTable >= 0) {
                switch (keyCode) {
                    case KEY_LEFT: this.moveTable(currentTable, -delta, 0, delta); break;
                    case KEY_RIGHT: this.moveTable(currentTable, delta, 0, delta); break;
                    case KEY_UP: this.moveTable(currentTable, 0, -delta, delta); break;
                    case KEY_DOWN: this.moveTable(currentTable, 0, delta, delta); break;
                    default: break;
                }
            }
        }
    }

    handleKeyUp(event) {
        const { currentTable, tables } = this.state;
        const { keyCode } = event;

        if (keyCode === KEY_LEFT || keyCode === KEY_RIGHT || keyCode === KEY_UP || keyCode === KEY_DOWN) {
            if (currentTable >= 0) {
                const table = tables[currentTable]

                if (table) {
                    this.onTableChange(table, currentTable);
                }
            }
        }
    }

    _initData() {
        const { value, data } = this.props;
        const {
            [TABLE_PROP_WIDTH_ACCESSOR]: width_accessor,
            [TABLE_PROP_HEIGHT_ACCESSOR]: height_accessor,
            [TABLE_PROP_IMAGE_ACCESSOR]: image_accessor
        } = this.field;

        const newState = {};


        if (_.isArray(value) && _.size(value) > 0) {
            //newState.tables = _.sortBy(value, (o) => o.number);

            newState.tables = value;
        }

        if (_.isString(width_accessor) && _.isNumber(data[width_accessor]) && data[width_accessor] > 0) {
            newState.width = data[width_accessor];
        }

        if (_.isString(height_accessor) && _.isNumber(data[height_accessor]) && data[height_accessor] > 0) {
            newState.height = data[height_accessor];
        }

        if (_.isString(image_accessor) && (_.isNumber(data[image_accessor]) || _.isString(data[image_accessor]))) {
            newState.image = data[image_accessor];
        }

        this.setState(newState);
    }

    _getTables() {
        const { value } = this.props;

        return this._reduce(value, (result, table, index) => {
            if (!_.isNil(table)) {
                result.push({ ...table, index });
            }

            return result;
        }, []);
    }

    _getBounds() {
        const { width, height } = this.state;

        return { left: 0, top: 0, right: width, bottom: height }
    }

    _getMinSizes() {
        const tables = this._getTables();

        let minWidth = 0, minHeight = 0;

        if (_.isArray(tables)) {
            tables.forEach(t => {
                if (_.isPlainObject(t)) {
                    const twidth = t.left_c + t.width + 20;
                    const theight = t.top_c + t.height + 20;

                    if (twidth && twidth > minWidth) minWidth = twidth;
                    if (theight && theight > minHeight) minHeight = theight;
                }
            });
        }

        return [minWidth, minHeight];
    }

    _isEditable() {
        const { image } = this.state;

        if (_.isNumber(image) && image > 0) {
            return true;
        }

        return false;
    }

    _getNextFreeNumber(tableData) {
        const { [TABLE_PLAN_NUMBER_ACCESSOR]: number_accessor } = this.field;

        const tables = this._getTables();

        let expected = 1;

        if (_.isPlainObject(tableData) && number_accessor in tableData) {
            expected = parseInt(tableData[number_accessor], 10);
        }

        if (_.isArray(tables)) {
            let tableNumbers = [];

            _.forEach(tables, (item) => {
                if (_.isObject(item) && number_accessor in item) {
                    tableNumbers.push(parseInt(item[number_accessor], 10));
                }
            });

            tableNumbers = _.uniq(tableNumbers);
            tableNumbers = tableNumbers.sort((a, b) => {
                if (a < b) return -1;
                if (a > b) return 1;

                return 0;
            });
            
            expected = _.last(tableNumbers) + 1;

            return expected;
        }

        return _.size(tables);
    }

    _setError(accessor, message) {
        if (_.isNil(accessor)) {
            this.setState({ formError: null });
        } else {
            this.setState({
                formError: {
                    [accessor]: [message]
                }
            });
        }
    }

    _isDuplicateTableNumber(tableNumber) {
        const number_accessor = this.field[TABLE_PLAN_NUMBER_ACCESSOR];

        const tables = this._getTables();

        let index = _.findIndex(tables, (t) => t[number_accessor] === tableNumber);

        if (index < 0) {
            return false;
        }

        return true;
    }

    handleCancel() {
        this.setState({ modal: false });
    }

    changeTables(tables, ops = {}) {
        const { onChange, field } = this.props;
        const { accessor } = field;

        this.setState({ tables, ...ops });

        if (_.isString(accessor) && _.isFunction(onChange)) {
            onChange({ [accessor]: tables });
        }
    }

    addTable() {
        this.setState({ currentTable: null, modal: true });
    }

    editTable(index) {
        const { currentTable } = this.state;
        const tables = this._getTables();

        let tableIndex = currentTable;

        if (_.isNumber(index) && index >= 0) {
            tableIndex = index;
        }

        if (
            !_.isNil(tableIndex) &&
            tableIndex >= 0 &&
            _.isArray(tables) &&
            tableIndex < tables.length
        ) {
            this.setState({ modal: true, currentTable: tableIndex });
        }
    }

    copyTable(index) {
        const tables = this._getTables();
        let tableIndex = null;

        if (_.isNumber(index) && index >= 0) {
            tableIndex = index;
        }

        if (
            !_.isNil(tableIndex) &&
            tableIndex >= 0 &&
            _.isArray(tables) &&
            tableIndex < tables.length
        ) {
            let tableData = { ...tables[tableIndex] };
            tableData.number = this._getNextFreeNumber(tableData);
            tableData.left_c = tableData.left_c + 10;
            tableData.top_c = tableData.top_c + 10;

            tableData[SYS_ID_PROP] = null;

            this.onTableChange(tableData, null);
        }
    }

    removeTable(index) {
        const { currentTable } = this.state;
        const tables = this._getTables();

        let tableIndex = currentTable;

        if (_.isNumber(index) && index >= 0) {
            tableIndex = index;
        }

        if (
            !_.isNil(tableIndex) &&
            tableIndex >= 0 &&
            _.isArray(tables) &&
            tableIndex < tables.length
        ) {
            let table = { ...tables[tableIndex] };
            const newTables = [...tables];

            if (_.isNil(table[SYS_ID_PROP])) {
                table = null;
            } else {
                table[STATE_FIELD_NAME] = table[STATE_FIELD_NAME] !== STATUS_ACTIVE ? STATUS_ACTIVE : STATUS_DELETED;
            }

            newTables[tableIndex] = table;

            this.changeTables(newTables, {
                currentTable: currentTable === tableIndex ? null : currentTable
            });
        }
    }

    moveTable(index, dx, dy, step) {
        const tables = this._getTables();
        const table = tables[index];

        if (table) {
            let newTables = [...tables];

            if (dx !== 0) {
                let t = parseInt(Math.abs(newTables[index].left_c / step));
                newTables[index].left_c = t * step + dx;
            }

            if (dy !== 0) {
                let t = parseInt(Math.abs(newTables[index].top_c / step));
                newTables[index].top_c = t * step + dy;
            }

            this.setState({ tables: newTables });
        }
    }

    clearImage() {
        this.onImageChange(null);
    }

    toggleGrid() {
        this.setState({ showGrid: !this.state.showGrid });
    }

    onTableClick(index) {
        const { currentTable } = this.state;
        const tables = this._getTables();

        if (index >= 0) {
            if (currentTable !== index) {
                this.setState({
                    currentTable: index
                });

                if (this.area) {
                    const table = tables[index];

                    if (table) {
                        this.area.scrollTo([table.left_c, table.top_c, table.left_c + table.width, table.top_c + table.height]);
                    }
                }
            }
        } else {
            this.setState({
                currentTable: null
            });
        }
    }

    onTableMove(left, top, width, height) {
        if (this.area) {
            this.area.scrollTo([left - 10, top - 10, left + width + 10, top + height + 10], true);
        }
    }

    onTableDoubleClick(index) {
        if (index >= 0) {
            this.setState({
                currentTable: index,
                modal: true
            });
        }
    }

    onTableChange(tableData, index, ops = {}) {
        const tables = this._getTables();
        const newTables = [...tables];

        if (index >= 0 && tables[index]) {
            const t = tables[index];

            newTables[index] = { ...t, ...tableData };
        } else {
            newTables.push(tableData);
        }

        this.setState({ tables: newTables, ...ops });
        this.changeTables(newTables, ops);
    }

    onFormSubmit(index, tableData) {
        let number_accessor = this.field[TABLE_PLAN_NUMBER_ACCESSOR];
        let tableNumber = tableData[number_accessor];

        if (this._isDuplicateTableNumber(tableNumber)) {
            this._setError(number_accessor, t("Duplicate table number", "errors"));
        } else {
            this.onTableChange(
                tableData,
                index,
                {
                    modal: false,
                    currentTable: null,
                    formError: null,
                },
            );
        }
    }

    onImageChange(id) {
        const { onChange } = this.props;
        const { [TABLE_PROP_IMAGE_ACCESSOR]: image_accessor } = this.field;

        let img = null;

        if (_.isNumber(id)) {
            img = id;
        }

        this.setState({ image: img });

        if (_.isString(image_accessor) && _.isFunction(onChange)) {
            onChange({ [image_accessor]: img });
        }
    }

    onSizeChange(props) {
        const { onChange } = this.props;
        const { width, height } = props;
        const {
            [TABLE_PROP_WIDTH_ACCESSOR]: width_accessor,
            [TABLE_PROP_HEIGHT_ACCESSOR]: height_accessor,
        } = this.field;

        const newState = {};
        const changedData = {};

        //const [minWidth, minHeight] = this._getMinSizes();

        const minWidth = MIN_PLAN_WIDTH;
        const minHeight = MIN_PLAN_HEIGHT;

        if (_.isNumber(width)) {
            newState.width = parseInt(width, 10);

            if (newState.width < minWidth) {
                newState.width = minWidth;
            }

            if (_.isString(width_accessor)) {
                changedData[width_accessor] = newState.width;
            }
        }

        if (_.isNumber(height)) {
            newState.height = parseInt(height, 10);

            if (newState.height < minHeight) {
                newState.height = minHeight;
            }

            if (_.isString(height_accessor)) {
                changedData[height_accessor] = newState.height;
            }
        }

        if (_.size(newState) > 0) {
            this.setState(newState);
        }

        if (_.size(changedData) > 0 && _.isFunction(onChange)) {
            onChange(changedData);
        }
    }

    renderTables() {
        const { context } = this.props;
        const { currentTable } = this.state;
        const tables = this._getTables();

        if (!_.isArray(tables) || _.size(tables) === 0) return null;

        const bounds = this._getBounds();

        return _.map(tables,
            (t, k) => {
                if (_.isPlainObject(t) && t[STATE_FIELD_NAME] === STATUS_ACTIVE) {
                    return (
                        <Table
                            {...t}
                            context={context}
                            key={`table_${k}`}
                            current={k === currentTable}
                            index={k}
                            onClick={this.onTableClick}
                            onDoubleClick={this.onTableDoubleClick}
                            onChange={this.onTableChange}
                            onMove={this.onTableMove}
                            bounds={bounds}
                        />
                    );
                }
                return null;
            }
        );
    }

    renderModal() {
        const { locations } = this.props;
        const { modal, currentTable: current, formError } = this.state;
        const tables = this._getTables();

        if (modal !== true) return null;

        let data = { number: 999 };

        if (_.isNumber(current) && current >= 0) {
            data = tables[current];
        } else {
            data = { number: this._getNextFreeNumber() };
        }

        let isNew = !(_.isNumber(current) && current >= 0);

        return (
            <Modal
                title={t("Add table", "form")}
                visible
                onCancel={this.handleCancel}
                footer={null}
                size="small"
            >
                {
                    <EMEditForm
                        entity={this.field.entity}
                        isNew={isNew}
                        data={data}
                        onProceed={(newData) => this.onFormSubmit(!isNew ? current : null, newData)}
                        onCancel={this.handleCancel}
                        locations={locations}
                        formErrors={formError}
                    />
                }
            </Modal>
        );
    }

    renderHeader() {
        const { field } = this.props;
        const { header } = field;

        if (header) {
            return <div className="header">{funcOrString(header)}</div>
        }

        return null;
    }

    renderSize() {
        const { width, height } = this.state;

        const changeStateProps = (val, prop) => {
            val = parseInt(val);

            if (val && val > 0) {
                this.setState({ [prop]: val });
                this.onSizeChange({ [prop]: val });
            }
        }

        const disabled = !this._isEditable();

        return (
            <div className="size">
                <label>{t("Size: ", "form")}</label>

                <InputNumber
                    step={SIZE_INPUT_STEP}
                    className="size-input"
                    value={width}
                    disabled={disabled}
                    onChange={disabled ? null : (value) => changeStateProps(value, 'width')}
                />
                <label>X</label>

                <InputNumber
                    step={SIZE_INPUT_STEP}
                    className="size-input"
                    value={height}
                    disabled={disabled}
                    onChange={disabled ? null : (value) => changeStateProps(value, 'height')}
                />
            </div>
        );

    }

    renderNavActions() {
        const { showGrid } = this.state;
        const disabled = !this._isEditable();

        return (
            <div className="actions">
                <Button
                    className="action"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={this.addTable}
                    disabled={disabled}
                />

                <Button
                    className="action"
                    type={showGrid ? "primary" : "default"}
                    icon={<BorderlessTableOutlined />}
                    onClick={this.toggleGrid}
                    disabled={disabled}
                />

                <Popconfirm
                    title={t("Are you sure to delete background image?", "form")}
                    onConfirm={this.clearImage}
                    okText={t("Yes", "common")}
                    cancelText={t("No", "common")}
                    disabled={disabled}
                >
                    <Button
                        className="action"
                        icon={<DeleteOutlined />}
                        disabled={disabled}
                    />
                </Popconfirm>
            </div>
        );
    }

    render() {
        const { context, locations } = this.props;
        const { currentTable, width, height, image, showGrid, step } = this.state;

        const canBeEdited = this._isEditable();

        const tables = this._getTables();

        return (
            <div className="table-plan-editor _bs">
                <div className="table-plan-editor-nav">
                    {this.renderHeader()}

                    <div className="grow" />

                    {this.renderSize()}
                    {this.renderNavActions()}
                </div>

                <div className="table-plan-editor-container">
                    {canBeEdited ? (
                        <>
                            <TableAreaList
                                toggleable={false}
                                onEdit={this.editTable}
                                onCopy={this.copyTable}
                                onAdd={this.addTable}
                                onDelete={this.removeTable}
                                onPress={this.onTableClick}
                                tables={tables}
                                currentTable={currentTable}
                                numberProp={this.field[TABLE_PLAN_NUMBER_ACCESSOR]}
                            />

                            <TableArea
                                locations={locations}
                                grid={showGrid}
                                gridSize={step}
                                width={width}
                                height={height}
                                image={image}
                                onSizeChange={this.onSizeChange}
                                onClick={() => this.onTableClick(null)}
                                ref={(ref) => this.area = ref}
                            >
                                {this.renderTables()}
                            </TableArea>
                        </>
                    ) : (
                        <TableAreaImageSelect
                            context={context}
                            locations={locations}
                            setImage={this.onImageChange}
                        />
                    )}

                </div>

                {this.renderModal()}
            </div>
        );
    }
}

TablePlanEditor.propTypes = {
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

export default withStackEvents(TablePlanEditor);
