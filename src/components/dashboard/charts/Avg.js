/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React from 'react';
import { connect } from 'react-redux';
import { formatPriceValue } from '../../../classes/helpers';

class AvgChart extends React.Component {
    renderTotal(val) {
        return (
            <div className="total-value">{formatPriceValue(val, this.props.currency)}</div>
        );
    }

    renderVal(val, label) {
        return (
            <div className="val">{label} {formatPriceValue(val, this.props.currency)}</div>
        );
    }

    render() {
        const { total, min, max, mid } = this.props.data;

        return (
            <div className="total-chart">
                {this.renderTotal(total)}

                <div className="avg-values">
                    {this.renderVal(min, "Min")}
                    {this.renderVal(mid, "Mid")}
                    {this.renderVal(max, "Max")}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { defaultCurrency } = state.options;

    return {
        currency: defaultCurrency
    };
};


export default connect(mapStateToProps, null)(AvgChart);
