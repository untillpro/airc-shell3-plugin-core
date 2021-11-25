/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectLocations } from '../../../../selectors';
import { Select } from 'airc-shell-core';

const { Option } = Select;

const LocationFilter = (props) => {
    const { onChange } = props;

    const locations = useSelector(selectLocations)

    const handleChange = (value) => onChange ? onChange(value) : null;

    if (!_.isPlainObject(locations) || _.size(locations) === 0) return null;

    return (
        <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Select location"
            defaultValue={[]}
            onChange={handleChange}
        >
            {_.map(locations, (name, id) => <Option key={`wsid_${id}`} value={id}>{name}</Option>)}
        </Select>
    );
}

export default React.memo(LocationFilter)