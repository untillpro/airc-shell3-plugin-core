/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Tip } from 'airc-shell-core';

const TipField = (props) => {
    const { field } = props;

    if (!field) return null;

    const {
        text,
        opened
    } = field;

    return <Tip text={text} opened={opened} />;
}

TipField.propTypes = {
    field: PropTypes.object.isRequired,
};

export default TipField;