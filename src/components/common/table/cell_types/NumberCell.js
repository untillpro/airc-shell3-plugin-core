/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import EditableCell from './EditableCell';

import { formatNumber } from '../../../../classes/helpers';

class NumberCell extends PureComponent {
    constructor(props) {
        super(props);

        this.format = this.format.bind(this);
        this.prepare = this.prepare.bind(this);
        this.init = this.init.bind(this);
    }

    componentDidMount() {
        console.log('numberCell: ', this.props);
    }

    format(value) {
        const { type } = this.props;

        if (type === 'float' || type === 'double') {
            return formatNumber(value, 2, ".", " ");
        }

        return formatNumber(value, 0, ".", " ");
    }

    init(value) {
        const { rate } = this.props;
        let val = value;

        if (_.isNumber(rate) && rate > 0) {
            val = val / rate;
        }

        return val;
    }

    prepare(value) {
        const { type, rate } = this.props;

        let val = value;

        if (_.isNumber(rate) && rate > 0) {
            val = val * rate | 0;
        }

        if (type === 'float' || type === 'double') {
            return parseFloat(val);
        }

        return parseInt(val, 10);
    }

    render() {
        return <EditableCell
            {...this.props}
            formatter={this.format}
            type="number"
            preparearer={this.prepare}
            initier={this.init}
        />;
    }
}

NumberCell.propTypes = {
    type: PropTypes.string,
};

export default NumberCell