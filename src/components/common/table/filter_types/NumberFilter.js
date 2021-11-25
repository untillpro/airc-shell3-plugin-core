/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class NumberFilter extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            value: null
        };
    }

    componentDidMount() {
        throw new Error('Component NumberFilter not implemented yet.');
    }

    render() {
        return (
            <div> { "NumberFilter" } </div>
        );
    }
}

NumberFilter.propTypes = {
    value: PropTypes.number
};

export default NumberFilter;