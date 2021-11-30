/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    DoubleLeftOutlined,
    DoubleRightOutlined,
    PlusOutlined,
    CopyOutlined,
    BlockOutlined
} from '@ant-design/icons';

import { Button, Toggler, translate as t } from 'airc-shell-core';
import { HeaderBackButton } from '../common';

import { TYPE_TEXT } from '../../classes/contributions/Types';
import { STATE_FIELD_NAME } from '../../const/Common';


class EMEditFormHeader extends Component {
    constructor() {
        super();

        this.handleBackClick = this.handleBackClick.bind(this);
        this.handleActiveChange = this.handleActiveChange.bind(this);
    }


    handlePrevClick(id) {
        const { onPrevClick } = this.props;

        if (onPrevClick && _.isFunction(onPrevClick)) {
            onPrevClick();
        }
    }

    handleNextClick(id) {
        const { onNextClick } = this.props;

        if (onNextClick && _.isFunction(onNextClick)) {
            onNextClick();
        }
    }

    handleAction(action) {
        const { onAdd, onCopy, onUnify } = this.props;

        switch (action) {
            case 'add': return onAdd && _.isFunction(onAdd) ? onAdd() : null;
            case 'copy': return onCopy && _.isFunction(onCopy) ? onCopy() : null;
            case 'unify': return onUnify && _.isFunction(onUnify) ? onUnify() : null;  //TODO
            default: break;
        }
    }

    handleBackClick() {
        const { onBackClick } = this.props;

        if (onBackClick && typeof onBackClick === 'function') {
            onBackClick()
        }
    }

    handleActiveChange(value) {
        const { onStateChanged } = this.props;

        if (onStateChanged && typeof onStateChanged === 'function') {
            onStateChanged(Number(value))
        }
    }

    _getNewTitle() {
        const { contributions, entity } = this.props;

        const title = contributions.getPointContributionValue(TYPE_TEXT, entity, 'new_entity');

        if (_.isString(title)) {
            return title;
        } else if (_.isFunction(title)) {
            return title();
        }

        return t("new_header", "common");
    }

    _getEditTitle() {
        const { data, contributions, entity } = this.props;

        const title = contributions.getPointContributionValue(TYPE_TEXT, entity, 'edit_entity');

        if (_.isString(title)) {
            return `${title} ${data && data.name ? `: ${data.name}` : ''}`;
        } else if (_.isFunction(title)) {
            return title({ name: data ? data.name : '' });
        }

        return t('edit_header', 'common', { name: data ? data.name : '' });
    }

    _getCopyTitle() {
        const { data, contributions, entity } = this.props;

        const title = contributions.getPointContributionValue(TYPE_TEXT, entity, 'copy_entity');

        if (_.isString(title)) {
            return `${title} ${data && data.name ? `: ${data.name}` : ''}`;
        } else if (_.isFunction(title)) {
            return title({ name: data ? data.name : '' });
        }

        return t("copy_header", 'common', { name: data ? data.name : '' });
    }

    getFormTitle() {
        const { isNew, isCopy } = this.props;

        if (isCopy) {
            return this._getCopyTitle();
        } else if (isNew) {
            return this._getNewTitle();
        }

        return this._getEditTitle();
    }


    renderNavigation() {
        const { id, entityData } = this.props;
        const { prev, next } = entityData ? entityData : {};

        if (id) {
            return (
                <div className="header-navigation">
                    {prev ? (
                        <Button onClick={() => this.handleNavClick(prev)}>
                            <DoubleLeftOutlined />
                            {t("Previous", "form")}
                        </Button>
                    ) : null}

                    {next ? (
                        <Button onClick={() => this.handleNavClick(next)}>
                            {t("Next", "form")}
                            <DoubleRightOutlined />
                        </Button>
                    ) : null}
                </div>
            );
        }

        return null;

    }

    renderLocationsSelector() {
        return (<div className="temp-location-selector-style"></div>); //TODO
    }

    renderActiveToggler() {
        const { data, changedData } = this.props;

        let checked = data ? Boolean(data.state) : false;

        if (STATE_FIELD_NAME in changedData) {
            checked = changedData ? Boolean(changedData[STATE_FIELD_NAME]) : false;
        }

        return (
            <Toggler
                label={t("Is active", "form")}
                right
                onChange={this.handleActiveChange}
                checked={checked}
            />
        )
    }

    renderActions() {
        const { actions } = this.props;

        if (actions && actions.length > 0) {
            return (
                <div className="header-actions">
                    {actions.map((action) => this.renderActionButton(action))}
                </div>
            );
        }

        return null;
    }

    renderActionButton(action) {
        switch (action) {
            case 'add':
                return (
                    <Button
                        icon={<PlusOutlined />}
                        key='header-action-add'
                        onClick={() => this.handleAction(action)}
                    />
                );
            case 'copy':
                return (
                    <Button
                        icon={<CopyOutlined />}
                        key='header-action-copy'
                        onClick={() => this.handleAction(action)}
                    />
                );

            case 'unify':
                return (
                    <Button
                        icon={<BlockOutlined />}
                        key='header-action-unify'
                        onClick={() => this.handleAction(action)}
                    />
                );

            default: return null;
        }
    }

    render() {
        const { showActiveToggler, showNavigation, showLocationSelector, actions } = this.props;

        return (
            <div className="content-header grid col-3 row-2 gap-8">
                <div className="cell align-left span-2">
                    <div className="edit-form-header">
                        <HeaderBackButton
                            onClick={this.handleBackClick}
                        />

                        <h1>{this.getFormTitle()}</h1>

                        {showActiveToggler ? this.renderActiveToggler() : null}
                    </div>
                </div>

                <div className="cell align-right">
                    {showNavigation ? this.renderNavigation() : null}
                </div>

                <div className="cell span-2">
                    {showLocationSelector ? this.renderLocationsSelector() : null}
                </div>

                <div className="cell align-right">
                    {actions ? this.renderActions() : null}
                </div>
            </div>
        );
    }
}

EMEditFormHeader.propTypes = {
    entity: PropTypes.string.isRequired,
    showActiveToggler: PropTypes.bool,
    showNavigation: PropTypes.bool,
    showLocationSelector: PropTypes.bool,
    actions: PropTypes.array,
    data: PropTypes.object,
    isNew: PropTypes.bool,
    isCopy: PropTypes.bool,
    changedData: PropTypes.object,
    onStateChanged: PropTypes.func,
    onBackClick: PropTypes.func,
    onPrevClick: PropTypes.func,
    onNextClick: PropTypes.func,
    onAdd: PropTypes.func,
    onCopy: PropTypes.func,
    onUnify: PropTypes.func,
};

const mapStateToProps = (state) => {
    const { contributions } = state.context;

    return { contributions };
}

export default connect(mapStateToProps, {})(EMEditFormHeader);
