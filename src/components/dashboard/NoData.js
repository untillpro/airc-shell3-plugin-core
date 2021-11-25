/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React from 'react';
import { Empty } from 'antd';

class NoData extends React.Component {
    render() {
        return <div className="chart-empty"><Empty /></div>;
    }
}

export default NoData;