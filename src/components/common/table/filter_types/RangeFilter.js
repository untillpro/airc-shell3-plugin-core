/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class RangeFilter extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            value: null
        };
    }

    componentDidMount() {
        throw new Error('Component RangeFilter not implemented yet.');
    }

    render() {
        return (
            <div> { "RangeFilter" } </div>
        );
    }
}

RangeFilter.propTypes = {
    value: PropTypes.number
};

export default RangeFilter;