/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React from 'react';
import { Pie } from '@ant-design/charts';

class PieChart extends React.Component {
    render() {
        const { data, options } = this.props;

        const config = {
            radius: 0.9,
            legend: {
                position: 'bottom',
            },
            ...options,
            data,
        };

        return <Pie {...config} />;
    }
}

export default PieChart;