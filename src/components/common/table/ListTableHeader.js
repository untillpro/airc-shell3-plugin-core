/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate as t, Toggler, Button } from 'airc-shell-core';
import { Menu, Dropdown } from 'antd';
import moment from 'moment';

import {
    PlusOutlined,
    DeleteOutlined,
    ReloadOutlined,
    CopyOutlined
} from '@ant-design/icons';

import ListColumnsToggler from './ListColumnsToggler';
import ListExportCsvLink from './ListExportCsvLink';
import ListExportXlsxLink from './ListExportXlsxLink';

class ListTableHeader extends Component {
    constructor(props) {
        super(props);

        this.handleShowDeletedChange = this.handleShowDeletedChange.bind(this);
        this.handleColumnsVisibleChange = this.handleColumnsVisibleChange.bind(this);
    }

    handleShowDeletedChange(value) {
        const { onDeletedChange } = this.props;

        if (onDeletedChange && typeof onDeletedChange === "function") {
            onDeletedChange(value);
        }
    }

    handleColumnsVisibleChange(value, columnId) {
        const { onVisibleChange } = this.props;

        if (onVisibleChange && typeof onVisibleChange === "function") {
            onVisibleChange(value, columnId);
        }
    }

    _getIcon(icon) {
        if (icon && typeof icon === "string") {
            switch (icon) {
                case "plus": return <PlusOutlined />;
                case "delete": return <DeleteOutlined />;
                case "reload": return <ReloadOutlined />;
                case "copy": return <CopyOutlined />;
                default: return null;
            }
        }

        return null;
    }

    renderExport() {
        const { columns, data, exportFileName, loading, showExport } = this.props;

        if (showExport !== true) return null;

        const fileName = `${exportFileName}_${moment().format('YYYYMMDD-Hms')}`;
        
        const menu = (
            <Menu>
                <Menu.Item>
                    <ListExportXlsxLink
                        text={t('Export XLSX', 'form')}
                        data={data}
                        columns={columns}
                        filename={fileName}
                    />
                </Menu.Item>
                <Menu.Item>
                    <ListExportCsvLink
                        text={t('Export CSV', 'form')}
                        data={data}
                        columns={columns}
                        filename={fileName}
                    />
                </Menu.Item>
            </Menu>
        );

        return (
            <Dropdown overlay={menu} placement="bottomRight" disabled={loading}>
                <Button>Export</Button>
            </Dropdown>
        );
    }

    renderHeaderButtons() {
        const { component: { showHeaderButtons }, exportFileName } = this.props;
        const { rows, buttons } = this.props;

        if (showHeaderButtons === false) return null;

        const result = [];

        if (_.isArray(buttons)) {
            buttons.forEach((btn) => {
                const { buttonType, icon, type, key, text, disabled, onClick, title } = btn;
    
                switch (buttonType) {
                    case "icon":
                        result.push(
                            <Button
                                title={title}
                                icon={this._getIcon(icon || 'none')}
                                key={key}
                                disabled={typeof disabled === "function" ? disabled(rows) : disabled}
                                onClick={() => onClick(rows)}
                            />
                        );
                        break;
                    default:
                        result.push(
                            <Button
                                title={title}
                                type={type || 'primary'}
                                key={key}
                                text={text}
                                disabled={typeof disabled === "function" ? disabled(rows) : disabled}
                                onClick={() => onClick(rows)}
                            > {text} </Button>
                        );
                }
    
            });
        }
        

        if (exportFileName) {
            result.push(this.renderExport());
        }

        return (
            <div className='untill-base-table-header-actions'>
                {result}
            </div>
        );
    }

    renderHeaderTogglers() {
        const {
            columns,
            component: { showDeletedToggler, showColumnsToggler },
            showDeleted
        } = this.props;

        return (
            <div className='untill-base-table-header-togglers'>
                {
                    showDeletedToggler ? (
                        <Toggler
                            label={t("Show deleted", "list")}
                            right
                            onChange={this.handleShowDeletedChange}
                            checked={showDeleted}
                        />
                    ) : null
                }
                {
                    showColumnsToggler ? (
                        <ListColumnsToggler
                            columns={columns}
                            label={t("Hide columns", "list")}
                            onChange={this.handleColumnsVisibleChange}
                        />
                    ) : null
                }
            </div>
        );
    }

    render() {
        return (
            <div className='untill-base-table-header header-actions'>
                {this.renderHeaderTogglers()}
                {this.renderHeaderButtons()}
            </div>
        );
    }
}

ListTableHeader.propTypes = {
    component: PropTypes.object,
    rows: PropTypes.array,
    flatRows: PropTypes.object,
    showDeleted: PropTypes.bool,
    toggleDeletedRowsView: PropTypes.func,
    sendNeedEditFormMessage: PropTypes.func,
    sendNeedRemoveMessage: PropTypes.func,
    sendNeedRefreshDataMessage: PropTypes.func
};

export default ListTableHeader;
