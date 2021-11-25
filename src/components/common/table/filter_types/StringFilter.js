/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React from "react";
import { Input } from "airc-shell-core";

const StringFilter = (props) => {
    const { onChange } = props;

    return (
        <Input 
            onChange={(e) => onChange(e.target.value)} 
            allowClear={true}
        />
    );
};

export default StringFilter