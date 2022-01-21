/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Empty, translate as t } from 'airc-shell-core';
import TablePlanCard from './TablePlanCard';

import EmptyImage from '../../../assets/images/empty/no-free-tables.png';

import { STATE_FIELD_NAME } from '../../../const/Common';

class TablePlanGrid extends PureComponent {
    render() {
        const { data, onEdit, onDelete, onReduce, onAdd } = this.props;

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

        const ops = { onEdit, onDelete, onReduce };

        return (
            <div className="table-plan-grid">
                {_.map(data, (d, index) => <TablePlanCard key={`table_card_${d.id || index}_${d[STATE_FIELD_NAME]}`} data={d} {...ops} />)}
            </div>
        );
    }
}

TablePlanGrid.propTypes = {
    data: PropTypes.array,
    onAdd: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onReduce: PropTypes.func.isRequired
};

export default TablePlanGrid;