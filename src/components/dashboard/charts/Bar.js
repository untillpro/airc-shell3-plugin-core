/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React from 'react';
import { Bar } from '@ant-design/charts';

const barStyle = {
    fillOpacity: 0.5,
    strokeOpacity: 1,
    //stroke: 'black',
    //lineWidth: 1,
    //lineDash: [4, 5],
    //strokeOpacity: 0.7,
    //shadowColor: 'black',
    shadowBlur: 10,
    //shadowOffsetX: 5,
    //shadowOffsetY: 5,
    //cursor: 'pointer'
};

class BarChart extends React.Component {
    render() {
        const { data, options } = this.props;

        const config = {
            legend: {
                position: 'bottom',
            },
            barStyle: barStyle,
            ...options,
            data,
        };

        return <Bar {...config} />;
    }
}

export default BarChart;