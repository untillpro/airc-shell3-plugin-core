/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import moment from 'moment';
import { LOCATION_WORK_START_TIME_PROP } from '../const/Common';

export const api = (state) => state.context.api;
export const contributions = (state) => state.context.contributions;
export const context = (state) => state.context;
export const list = (state) => state.list;
export const locations = (state) => state.locations.locations;
export const locationsAll = (state) => Object.keys(state.locations.locationsOptions).map(v => parseInt(v, 10));
export const entity = (state) => state.plugin.entity;

export const locationWorkStartTime = (state) => {
    const { locationData } = state.locations;
    let descriptor = null;

    if (_.isPlainObject(locationData)) {
        descriptor = locationData.descriptor;
    }

    if (_.isPlainObject(descriptor)) {
        return String(descriptor[LOCATION_WORK_START_TIME_PROP]).toString();
    }

    return moment("2022-04-27T06:00:00.000Z");;
};
