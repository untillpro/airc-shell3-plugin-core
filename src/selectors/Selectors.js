/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

export const api = (state) => state.context.api;
export const contributions = (state) => state.context.contributions;
export const context = (state) => state.context;
export const list = (state) => state.list;
export const locations = (state) => state.locations.locations;
export const locationsAll = (state) => Object.keys(state.locations.locationsOptions).map(v => parseInt(v, 10));
export const entity = (state) => state.plugin.entity;

