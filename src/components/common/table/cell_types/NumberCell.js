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

    format(value) {
        const { type, prefix, postfix } = this.props;

        if (type === 'float' || type === 'double') {
            return `${prefix ?? ''}${formatNumber(value, 2, ".", " ")}${postfix ?? ''}`;
        }

        return `${prefix ?? ''}${formatNumber(value, 0, ".", " ")}${postfix ?? ''}`;
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
        const { disabled } = this.props;

        return <EditableCell
            {...this.props}
            formatter={this.format}
            type="number"
            preparearer={this.prepare}
            initier={this.init}
            disabled={disabled}
        />;
    }
}

NumberCell.propTypes = {
    type: PropTypes.string,
};

export default NumberCell