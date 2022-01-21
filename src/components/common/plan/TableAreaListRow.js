/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Popconfirm } from 'antd';
import { Icon, translate as t } from 'airc-shell-core';
import * as Icons from 'airc-shell-core/const/Icons';
import cn from 'classnames';

import { STATE_FIELD_NAME, STATUS_ACTIVE } from '../../../const/Common';

class TableAreaListRow extends PureComponent {
    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleCopy = this.handleCopy.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        const { onPress, index } = this.props;

        if (_.isFunction(onPress)) {
            onPress(index);
        }
    }

    handleEdit(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        const { onEdit, index } = this.props;

        if (_.isFunction(onEdit)) {
            onEdit(index);
        }
    }

    handleCopy(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        const { onCopy, index } = this.props;

        if (_.isFunction(onCopy)) {
            onCopy(index);
        }
    }

    handleDelete(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        const { onDelete, index } = this.props;

        if (_.isFunction(onDelete)) {
            onDelete(index);
        }
    }

    renderIcon() {
        const { form } = this.props;

        return (
            <div className="form-ico">
                <Icon icon={form === 3 ? Icons.ICON_CIRCLE : Icons.ICON_SQUARE} />
            </div>
        );
    }

    renderLabel() {
        const { number } = this.props;

        return <div className="label">{t("Table #{{number}}", "form", { number })}</div>
    }

    renderActions(isNew, isHidden) {
        return (
            <div className="actions">
                <div className="action" onClick={this.handleEdit}>
                    <Icon icon={Icons.ICON_EDIT} />
                </div>

                <div className="action" onClick={this.handleCopy}>
                    <Icon icon={Icons.ICON_COPY} />
                </div>

                {isNew ? (
                    <Popconfirm
                        title={t("Are you sure to delete this table?", "form")}
                        onConfirm={this.handleDelete}
                        okText={t("Yes", "common")}
                        cancelText={t("No", "common")}
                    >
                        <div className="action">
                            <Icon icon={Icons.ICON_DELETE_SOLID} />
                        </div>
                    </Popconfirm>
                ) : (
                    <div className="action" onClick={this.handleDelete}>
                        <Icon icon={!isHidden ? Icons.ICON_HIDE : Icons.ICON_EYE_SOLID} />
                    </div>
                )}
            </div>
        );
    }

    render() {
        const { id, current, error } = this.props;
        const state = this.props[STATE_FIELD_NAME];

        let isNew = !(_.isNumber(id) && id > 0);
        let isHidden = state !== STATUS_ACTIVE;

        return (
            <div
                className={cn("table-area-list-row", { 'is-new': isNew, 'is-hidden': isHidden, 'is-current': current, 'is-error': error })}
                onClick={this.handleClick}
            >
                {this.renderIcon()}
                {this.renderLabel()}
                {this.renderActions(isNew, isHidden)}
            </div>
        );
    }
};

TableAreaListRow.propTypes = {
    index: PropTypes.number.isRequired,
    onEdit: PropTypes.func.isRequired,
    onCopy: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default TableAreaListRow;