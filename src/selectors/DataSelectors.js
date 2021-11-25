/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import { createSelector } from 'reselect';
import _ from 'lodash';

const getShowDeleted = (state) => state.list.showDeleted;
const getData = (state) => state.list.resolvedData;

export const selectListData = createSelector(
    [getShowDeleted, getData],
    (showDeleted, data) => {
        if (_.isArray(data)) {
            if (showDeleted) {
                return data;
            }

            return _.filter(data, (o) => o.state === 1);
        }

        return [];
    }
)
