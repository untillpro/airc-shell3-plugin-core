/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { translate as t, Icon, IconButton, NoImage, getBlobPath } from 'airc-shell-core';
import * as Icons from 'airc-shell-core/const/Icons';

import { STATE_FIELD_NAME } from '../../../const/Common';

class TablePlanCard extends PureComponent {
    constructor(props) {
        super(props);

        this.handleEditAction = this.handleEditAction.bind(this);
        this.handleHideAction = this.handleHideAction.bind(this);
        this.handleToggleAction = this.handleToggleAction.bind(this);
    }

    _tablesCount() {
        const { data } = this.props;
        const tables = data["air_table_plan_item"];

        return tables ? _.size(tables) : 0;
    }

    handleEditAction() {
        const { onEdit } = this.props;
        const { _entry } = this.props?.data;

        if (_.isFunction(onEdit) && _.isPlainObject(_entry)) {
            onEdit(_entry);
        } else {
            throw new Error('onEdit handler not implemented');
        }
    }

    handleHideAction() {
        const { onHide } = this.props;
        const { _entry } = this.props?.data;

        if (_.isFunction(onHide) && _.isPlainObject(_entry)) {
            onHide(_entry);
        } else {
            throw new Error('onHide handler not implemented');
        }
    }

    handleToggleAction() {
        const { onDelete, onReduce } = this.props;
        const { _entry, [STATE_FIELD_NAME]: state } = this.props.data;


        if (!_.isPlainObject(_entry)) {
            throw new Error('TablePlanCard data wrong "_entry" specified: ', _entry);
        }

        if (state === 1) {
            if (_.isFunction(onDelete)) {
                onDelete(_entry);
            } else {
                throw new Error('onDelete callback not specified');
            }
        } else {
            if (_.isFunction(onReduce)) {
                onReduce(_entry);
            } else {
                throw new Error('onReduce callback not specified');
            }
        }
    }

    renderInfo() {
        const { name, [STATE_FIELD_NAME]: state } = this.props.data;
        const tablesCount = this._tablesCount();

        return (
            <div className="info">
                <div className="tables">
                    {t("{{count}} tables", "form", { count: tablesCount })}
                </div>

                <div className="title">
                    {name}
                </div>

                <div className="buttons">
                    <IconButton
                        onClick={this.handleEditAction}
                        icon={<Icon icon={Icons.ICON_EDIT} />}
                        size="small"
                        ghost
                    />

                    <div className="grow" />

                    <IconButton
                        onClick={this.handleToggleAction}
                        icon={<Icon icon={state !== 1 ? Icons.ICON_EYE_SOLID : Icons.ICON_HIDE} />}
                        size="small"
                        ghost
                    />

                    {/*
                        <IconButton 
                            onClick={this.handleToggleAction}
                            icon={<Icon icon={Icons.ICON_DELETE_SOLID} />} 
                            size="small" 
                            ghost 
                        />
                    */}

                </div>
            </div>
        );
    }

    renderImage() {
        const { image, preview } = this.props?.data;

        if (_.isNumber(image)) {
            const url = getBlobPath(preview || image);
            const styles = { backgroundImage: `url(${url})` };

            return (
                <div
                    className="image"
                    style={styles}
                    onClick={this.handleEditAction}
                />
            );
        }

        return (
            <div className="image" onClick={this.handleEditAction} >
                <NoImage />
            </div>
        );
    }

    render() {
        if (!_.isPlainObject(this.props.data) || _.isEmpty(this.props.data)) {
            console.error('No data was passed to TablePlanCard component')
        }

        const { [STATE_FIELD_NAME]: state } = this.props.data;

        return (
            <div className={cn("table-plan-card", { "not-active": state !== 1 })}>
                {this.renderImage()}
                {this.renderInfo()}
            </div>
        );
    }
}

TablePlanCard.propTypes = {
    data: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    onReduce: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default TablePlanCard;