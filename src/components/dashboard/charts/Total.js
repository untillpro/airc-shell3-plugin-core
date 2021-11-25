/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React from 'react';
import { connect } from 'react-redux';
import cn from 'classnames';
import { formatPriceValue } from '../../../classes/helpers';

const DefaultHeight = 200;

class TotalChart extends React.Component {
    renderTotal(total = 0) {
        return <div className="total-value">{formatPriceValue(total, this.props.currency)}</div>;
    }

    renderPrevious(previous = 0) {
        return <div className="total-previous">Last Year: {formatPriceValue(previous, this.props.currency)}</div>;
    }

    renderPercent(total = 0, previous = 0) {
        const d = ((total - previous) / (previous)) * 100;
        
        return <div className={cn("percent", {"down": d < 0, "up": d > 0})}>{d.toFixed(2)} %</div>;
    }

    render() {
        const { data, options } = this.props;
        const { total, previous } = data;
        const { showPercentage, height } = options || {};

        const chartHeight = (height ? parseInt(height) : DefaultHeight) || DefaultHeight;

        return (
            <div className="total-chart" style={{minHeight: chartHeight}}>
                {this.renderTotal(total)}
                {this.renderPrevious(previous)}
                {showPercentage ? this.renderPercent(total, previous) : null}
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


export default connect(mapStateToProps, null)(TotalChart);