/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React from 'react';
import { Area } from '@ant-design/charts';

class AreaChart extends React.Component {
    render() {
        const { data, options } = this.props;

        const config = {
            smooth: true,
            legend: {
              position: 'bottom',
            },
            ...options,
            data
          };
      
          return <Area {...config} />;
    }
}

export default AreaChart;
