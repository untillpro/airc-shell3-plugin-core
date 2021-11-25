/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class SelectFilter extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            value: null
        };
    }

    componentDidMount() {
        throw new Error('Component SelectFilter not implemented yet.');
    }

    render() {
        return (
            <div> { "SelectFilter" } </div>
        );
    }
}

SelectFilter.propTypes = {
    value: PropTypes.number
};

export default SelectFilter;