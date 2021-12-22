/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import { ResponseDataPretifier } from 'airc-shell-core';

const pretifyData = (fields, responseData) => {
    const builder = new ResponseDataPretifier();
    builder.prepare(fields);
    return builder.build(responseData);
};

export default pretifyData;