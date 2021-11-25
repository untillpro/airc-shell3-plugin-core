/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React from 'react';
import { Spin } from 'airc-shell-core';

const AppLoader = (props) => {
    const { loading } = props;

    return loading === true ? (
        <div
            key="appLoader"
            style={containerStyle}
        >
            <Spin />
        </div>
    ) : (<div>no no no </div>);
}

const containerStyle = {
    position: 'fixed',
    backgroundColor: '#f5f8fa',

    zIndex: 1000000,

    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex'
};

export default AppLoader;