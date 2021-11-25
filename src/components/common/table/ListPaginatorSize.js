/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate as t } from 'airc-shell-core';

class ListPaginatorSize extends Component {
    constructor(props) {
        super(props);

        this.state = {
            size: null
        };

        this.name = `paggination_${parseInt(Math.random() * 100)}`;
    }

    componentDidMount() {
        this.setState({size: this.props.size});
    }

    componentDidUpdate(oldProps) {
        if (oldProps.size !== this.props.size) {
            this.setState({size: this.props.size});
        }
    }
    
    handleChange(event) {
        const { onChange } = this.props;

        if (onChange && typeof onChange === 'function') {
            const size = parseInt(event.target.value, 10);
            
            onChange(size);
        }
    }

    render() {  
        const { size } = this.state;
        const { options } = this.props;

        if (options && options.length > 1) {
            return (
                <div className='-pageSize' key={`${this.name}_${size}`}>
                    {t("Items per page", "list")}

                    <select 
                        onChange={(event) => this.handleChange(event)} 
                        defaultValue={size}
                    >
                        {
                            options.map((option) => {
                                return (
                                    <option 
                                        key={`size_${option}`}
                                        value={option}
                                    >{option}</option>
                                );
                            })
                        }

                    </select>
                </div>
            );
        }
        
        return null;
    }
}

ListPaginatorSize.propTypes = {
    options: PropTypes.array,
    size: PropTypes.number,
    onChange: PropTypes.func
};

export default ListPaginatorSize;
