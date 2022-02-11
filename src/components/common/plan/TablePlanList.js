/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Empty, translate as t } from 'airc-shell-core';
import TablePlanRow from './TablePlanRow';

import EmptyImage from '../../../assets/images/empty/no-free-tables.png';

class TablePlanList extends PureComponent {
    render() {
        const { location, data, onEdit, onDelete, onReduce, onAdd } = this.props;

        if (_.isEmpty(data)) {
            return (
                <Empty
                    className="empty-block-gray"
                    image={EmptyImage}
                    imageStyle={{
                        height: 60,
                    }}
                    description={t("No tables available")}
                >
                    <Button onClick={onAdd} type="primary">{t("Add new table", "list")}</Button>
                </Empty>
            );
        }

        const ops = { location, onEdit, onDelete, onReduce };

        return (
            <div className="table-plan-list">
                {_.map(data, (d) => <TablePlanRow data={d} {...ops} />)}
            </div>
        );
    }
}

TablePlanList.propTypes = {
    location: PropTypes.number,
    data: PropTypes.object,
    onAdd: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onReduce: PropTypes.func.isRequired
};


export default TablePlanList;