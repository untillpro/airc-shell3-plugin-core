/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import EditableCell from './EditableCell';

import { formatNumber } from '../../../../classes/helpers';

class NumberCell extends PureComponent {
    constructor(props) {
        super(props);

        this.format = this.format.bind(this);
        this.value = this.value.bind(this);
    }

    format(value) {
        const { type } = this.props;

        if (type === 'float' || type === 'double') {
            return formatNumber(value, 2, ".", " ");
        }

        return formatNumber(value, 0, ".", " ");
    }

    value(value) {
        const { type } = this.props;

        if (type === 'float' || type === 'double') {
            return parseFloat(value);
        }

        return parseInt(value, 10);
    }

    render() {
        return <EditableCell 
            {...this.props} 
            formatter={this.format} 
            type="number" 
            preparearer={this.value}
        />;
    }
}

NumberCell.propTypes = {
    type: PropTypes.string,
};

export default NumberCell