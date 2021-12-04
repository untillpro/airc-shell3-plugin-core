/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import EditableCell from './EditableCell';

import { formatPriceValue } from '../../../../classes/helpers';

class PriceCell extends PureComponent {
    constructor(props) {
        super(props);

        this.format = this.format.bind(this);
        this.prepare = this.prepare.bind(this);
        this.init = this.init.bind(this);
    }

    value(value) {
        return Number(value);
    }

    format(value) {
        const { currency, defaultCurrency } = this.props;
        return formatPriceValue(value, currency || defaultCurrency)
    }

    prepare(value) {
        const { rate } = this.props;

        if (_.isNumber(rate) && rate > 0) {
            return value * rate | 0;
        }

        return value;
    }

    init(value) {
        const { rate } = this.props;
        let val = value;

        if (_.isNumber(rate) && rate > 0) {
            val = value / rate;
        }

        return val;
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
                preparearer={this.prepare}
                initier={this.init}
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
