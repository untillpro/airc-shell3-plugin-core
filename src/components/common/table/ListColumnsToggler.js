/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    EyeOutlined,
    EyeInvisibleOutlined,
} from '@ant-design/icons';

import { Button, Popover, Toggler, Empty } from 'airc-shell-core';


class ListColumnsToggler extends Component {
    constructor(props) {
        super(props);

        this.state = {
            opened: false
        };
    }

    handleChange(columnId, value) {
        const { onChange } = this.props;

        if (onChange && typeof onChange === "function") {
            onChange(value, columnId);
        } else {
            throw new Error("onChanged callback is not defined");
        }
    }

    handleClick() {
        this.setState({ opened: !this.state.opened });
    }

    renderColumnList() {
        const { columns } = this.props;

        if (columns) {

            return (
                <ul>
                    {
                        _.map(columns, (column) => {
                            const { Header, id, show, toggleable } = column;
                            
                            if (toggleable === false) return null;

                            const value = show;

                            return (
                                <li key={`${id}_key`}>
                                    <Toggler
                                        id={`${id}_column`}
                                        label={Header}
                                        checked={value}
                                        onChange={this.handleChange.bind(this, id)}
                                    />
                                </li>
                            );
                        })
                    }
                </ul>
            );
        } else {
            return <Empty />;
        }
    }

    hasHiddenColumns() {
        const { columns } = this.props;

        let hasHidden = false;

        if (columns) {
            _.each(columns, (column) => {
                if (column.show === false) {
                    hasHidden = true;
                    return false;
                }
            })
        }

        return hasHidden;
    }

    render() {
        const { label } = this.props;

        const content = this.renderColumnList();
        const hasHiddenColumns = this.hasHiddenColumns();

        return (
            <div className='bo-table-columns-toggler' >
                <Popover placement="bottom" content={content} trigger="click">
                    <Button
                        type="link"
                        style={hasHiddenColumns ? {} : { color: "#000" }}
                        icon={hasHiddenColumns ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    >
                        {label}
                    </Button>
                </Popover>
            </div>
        );
    }
}

ListColumnsToggler.propTypes = {
    label: PropTypes.string,
    columns: PropTypes.arrayOf(PropTypes.object),
    onChange: PropTypes.func
};

export default ListColumnsToggler;
