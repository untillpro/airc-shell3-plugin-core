/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import cn from 'classnames';
import { formatPriceValue } from '../../../classes/helpers';

const DefaultHeight = 200;

class TotalChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = { total: 0, previous: 0, count: 0 };
    }

    componentDidMount() {
        const { total } = this.props.data;

        this.setState({ total });
    }

    componentDidUpdate(oldProps) {
        const { total } = this.props.data;

        if (oldProps.data.total !== total) {
            this.animateTotal(oldProps.data.total, total);
        }
    }

    animateTotal(oldValue, value) {
        const dif = value - oldValue;
        const step = dif / 10;
        let count = 0;
        let currentValue = oldValue;

        let interval = setInterval(() => {
            currentValue += step;
            count++;

            if (count >= 10) {
                this.setState({ total: value });
                clearInterval(interval);
            } else {
                this.setState({ total: currentValue });
            }
        }, 20);
    }

    renderTotal(total = 0) {
        return <div className="total-value">{formatPriceValue(total, this.props.currency)}</div>;
    }

    renderPrevious(previous = 0) {
        return <div className="total-previous">Last Year: {formatPriceValue(previous, this.props.currency)}</div>;
    }

    renderPercent(total = 0, previous = 0) {
        const d = ((total - previous) / (previous)) * 100;

        return <div className={cn("percent", { "down": d < 0, "up": d > 0 })}>{d.toFixed(2)} %</div>;
    }

    renderCount(count) {
        if (_.isNil(count)) return;

        return <div className="total-previous">Count: {count}</div>
    }

    render() {
        const { options, data } = this.props;
        const { previous, count  } = data;
        const { total} = this.state;
        const { showPercentage, showCount, showPrevious, height } = options || {};

        const chartHeight = (height ? parseInt(height) : DefaultHeight) || DefaultHeight;

        return (
            <div className="total-chart" style={{ minHeight: chartHeight }}>
                {this.renderTotal(total)}

                {showCount ? this.renderCount(count) : null}
                {showPrevious ? this.renderPrevious(previous) : null}
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