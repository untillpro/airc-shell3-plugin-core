/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import { combineReducers } from 'redux';

import PluginReducer from './PluginReducer';
import StateMachineReducer from './StateMachineReducer';
import MessagesReducer from './MessagesReducer';
import AppOptions from './AppOptions';
import ReportsReducer from './ReportsReducer';
import ContextReducer from './ContextReducer';
import LocationsReducer from './LocationsReducer';
import ListReducer from './ListReducer';
import EntityReducer from './EntityReducer';
import DashboardsReducer from './DashboardsReducer';
import WizzardReducer from './WizzardReducer';

export default combineReducers({
    context: ContextReducer,
    plugin: PluginReducer,
    machine: StateMachineReducer,
    messages: MessagesReducer,
    options: AppOptions,
    reports: ReportsReducer,
    locations: LocationsReducer,
    dashboards: DashboardsReducer,
    list: ListReducer,
    entity: EntityReducer,
    wizzard: WizzardReducer,
});
