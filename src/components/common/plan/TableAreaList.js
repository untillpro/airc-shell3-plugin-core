/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { translate as t, Button, Empty, Toggler } from 'airc-shell-core';

import TableAreaListRow from './TableAreaListRow';

import {
    PlusOutlined
} from '@ant-design/icons';

class TableAreaList extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            closed: this._isClosed(),
            showHidden: false
        };

        this.handleListToggle = this.handleListToggle.bind(this);
        this.handleHiddenChage = this.handleHiddenChage.bind(this);
    }

    _isClosed() {
        return !!localStorage.getItem('table_list_closed');
    }

    handleListToggle() {
        const { closed } = this.state;

        this.setState({ closed: !closed });
        localStorage.setItem('table_list_closed', !closed);
    }

    handleHiddenChage() {
        const { showHidden } = this.state;

        this.setState({ showHidden: !showHidden });
    }

    renderToggler() {
        const { toggleable } = this.props;
        const { closed } = this.state;

        if (!toggleable) return null;

        return (
            <div className="table-area-list-toggler" onClick={this.handleListToggle}>
                {closed ? 'Open' : 'Close'}
            </div>
        );
    }

    renderHeader() {
        const { showHidden } = this.state;
        const { tables } = this.props;

        const totalCount = showHidden ? tables.length || 0 : _.reduce(tables, (count, t) => count += t && t.state === 1 ? 1 : 0, 0)

        return (
            <div className="table-area-list-header">
                <Toggler
                    label={t("Show removed", "form")}
                    left
                    onChange={this.handleHiddenChage}
                    checked={showHidden}
                />

                <div className="total">Tables: {totalCount}</div>
            </div>
        );
    }

    renderList() {
        const { showHidden } = this.state;
        const { tables, onEdit, onCopy, onDelete, onPress, currentTable } = this.props;

        if (!_.isArray(tables) || _.size(tables) === 0) {
            return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
        }

        //const tablesSorted = _.sortBy(tables, (o) => o.number);
        let tablesSorted = tables;

        return _.map(tablesSorted, (table, index) => {

            if (_.isNil(table) || (!showHidden && table.state !== 1)) return null;

            return <TableAreaListRow
                key={`table_${index}_${table.number}_${table.id}_${table.state}`}
                current={currentTable === index}
                {...table}
                index={index}
                onEdit={onEdit}
                onCopy={onCopy}
                onDelete={onDelete}
                onPress={onPress}
            />;
        }
        
            
        );
    }

    renderAddButton() {
        const { onAdd } = this.props;

        return (
            <div className="table-area-list-button">
                <Button
                    onClick={onAdd}
                    icon={<PlusOutlined />}
                    type="primary"
                    block
                >
                    {t("Add table", "form")}
                </Button>
            </div>
        );

    }

    render() {
        const { toggleable } = this.props;
        const { closed } = this.state;

        return (
            <div className={cn("table-area-list", { "__is_hidden": closed && toggleable })}>
                {this.renderToggler()}
                {this.renderHeader()}

                <div className="table-area-list-container">
                    {this.renderList()}
                </div>

                {this.renderAddButton()}
            </div>
        );
    }
}

TableAreaList.propTypes = {
    tables: PropTypes.arrayOf(PropTypes.object),
    onAdd: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onCopy: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onPress: PropTypes.func.isRequired,
};

export default TableAreaList;