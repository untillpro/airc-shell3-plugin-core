/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import isProd from 'is-prod';

const Log = (...args) => {
    if (isProd.isDevelopment()) 
        console.log(...args);
};

export default Log;
