/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class GroupFilter extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            value: null
        };
    }

    componentDidMount() {
        throw new Error('Component GroupFilter not implemented yet.');
    }

    render() {
        return (
            <div> { "GroupFilter" } </div>
        );
    }
}

GroupFilter.propTypes = {
    value: PropTypes.number
};

export default GroupFilter;