/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class DateTimeFilter extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            value: null
        };
    }

    componentDidMount() {
        throw new Error('Component DateTimeFilter not implemented yet.');
    }

    render() {
        return (
            <div> { "DateTimeFilter" } </div>
        );
    }
}

DateTimeFilter.propTypes = {
    value: PropTypes.number
};

export default DateTimeFilter;