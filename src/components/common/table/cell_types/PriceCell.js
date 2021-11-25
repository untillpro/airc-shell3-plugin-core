/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import EditableCell from './EditableCell';

import { formatPriceValue } from '../../../../classes/helpers';

class PriceCell extends PureComponent {
    constructor(props) {
        super(props);

        this.format = this.format.bind(this);
    }

    value(value) {
        return Number(value);
    }

    format(value) {
        const { currency, defaultCurrency } = this.props;
        return formatPriceValue(value, currency || defaultCurrency)
    }

    render() {
        const { value } = this.props;

        if (value === undefined || value === null) {
            return " - ";
        }

        return (
            <EditableCell 
                {...this.props} 
                formatter={this.format} 
                preparearer={this.value}
                type="number" 
            />
        );
    }
}

PriceCell.propTypes = {
    value: PropTypes.number,
    currency: PropTypes.object, 
    defaultCurrency: PropTypes.object
};

export default PriceCell;
