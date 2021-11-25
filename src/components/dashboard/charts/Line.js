/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React from 'react';
import { Line } from '@ant-design/charts';

class LineChart extends React.Component {
    render() {
        const { data, options } = this.props;

        const config = {
            point: {
                size: 5,
                shape: 'diamond',
            },
            legend: {
                position: 'bottom',
            },
            ...options,
            data,
        };

        return <Line {...config} />;
    }
}

export default LineChart;
