/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import { createSelector } from 'reselect';
import _ from 'lodash';
import { STATE_FIELD_NAME } from '../const/Common';


const getShowDeleted = (state) => state.list.showDeleted;
const getData = (state) => state.list.resolvedData;

export const selectListData = createSelector(
    [getShowDeleted, getData],
    (showDeleted, data) => {
        if (_.isArray(data)) {
            if (showDeleted) {
                return data;
            }

            return _.filter(data, (o) => o[STATE_FIELD_NAME] === 1);
        }

        return [];
    }
)
