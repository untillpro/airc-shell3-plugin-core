/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import { call, put, all, takeLatest, select } from 'redux-saga/effects'
import { Logger } from 'airc-shell-core';
import i18next from 'i18next';
import lc from 'langcode-info';

import {
    getObject,
    getCollection,
    processEntityData,
    getEntityFilters,
    getEntityRequiredClassifiers,
    checkForEmbededTypes,
    prepareCopyData,
    // prepareReportFilter,
    // prepareReportData,
    getEntityColletionElements,
    getDashboardElements,
    getDashboardDays
} from '../classes/helpers';

import * as Selectors from '../selectors';

import {
    TYPE_LIST,
    TYPE_COLLECTION,
    TYPE_REPORTS,
    C_COLLECTION_ENTITY,
    C_REPORT_EVENT_TYPE,
    C_REPORT_REQUIRED_CLASSIFIERS,
} from '../classes/contributions/Types';

import {
    SET_COLLECTION_LOADING,
    SET_ENTITY_LOADING,
    SET_ENTITY_DATA_PROCESSING,
    LIST_DATA_FETCH_SUCCEEDED,
    SEND_ERROR_MESSAGE,
    ENTITY_DATA_FETCH_SUCCEEDED,
    SEND_CANCEL_MESSAGE,
    SET_PLUGIN_LANGUAGE,
    SET_REPORT_DATA_FETCHING,
    ENTITY_LIST_SET_SHOW_DELETED,
    REPORT_DATA_FETCHING_SUCCESS,
    SEND_LANGUAGE_CHANGED_MESSAGE,
    DASHBOARD_DATA_FETCHING_SUCCESS,
    //SET_DASHBOARD_LOADING,
    NEED_LINK_DEVICE_TOKEN,
    SET_WIZZARD_DEVICE_LINK_TOKEN,
} from '../actions/Types';

import {
    SAGA_FETCH_LIST_DATA,
    SAGA_FETCH_REPORT,
    SAGA_FETCH_DASHBOARD,
    SAGA_PROCESS_DATA,
    SAGA_FETCH_ENTITY_DATA,
    SAGA_PROCESS_ENTITY_DATA,
    SAGA_SET_PLUGIN_LANGUAGE,
    SAGA_SET_LIST_SHOW_DELETED,
} from './Types';

import pretifyData from '../classes/ResponseDataPretifier';

// worker Saga: will be fired on USER_FETCH_REQUESTED actions
function* _fetchListData(action) {
    const entity = action.payload;
    const context = yield select(Selectors.context);
    const list = yield select(Selectors.list);
    const locations = yield select(Selectors.locations);

    const { contributions } = context;
    const { page, pageSize, showDeleted } = list;
    const manual = !!contributions.getPointContributionValue(TYPE_LIST, entity, 'manual');

    let doProps = {
        elements: getEntityColletionElements(context, entity),
        filters: getEntityFilters(context, entity),
    };

    let scheme = contributions.getPointContributionValue(TYPE_COLLECTION, entity, C_COLLECTION_ENTITY) || entity;

    if (manual) {
        doProps = {
            ...doProps,
            page: page + 1,
            page_size: pageSize,
            show_deleted: !!showDeleted,
            //order_by: {} //TODO
        };
    } else {
        doProps["show_deleted"] = true;
    }

    try {
        yield put({ type: SET_COLLECTION_LOADING, payload: true });
        let wsid = locations[0];

        const ops = {
            scheme,
            wsid,
            props: doProps
        };

        let tasks = [];
        let tasksPath = [['resolvedData']];


        tasks.push(call(getCollection, context, ops));

        let required_classifiers = getEntityRequiredClassifiers(context, entity);

        if (_.size(required_classifiers) > 0) {
            for (let c of required_classifiers) {
                tasks.push(call(getCollection, context, { scheme: c, wsid, props: {} }, true))
                tasksPath.push(['classifiers', c]);
            }
        }

        const result = {};
        const data = yield all(tasks);

        for (let i = 0; i < tasksPath.length; i++) {
            _.set(result, tasksPath[i], data[i]['resolvedData']);
        }

        yield put({ type: LIST_DATA_FETCH_SUCCEEDED, payload: result });
    } catch (e) {
        console.error(e);

        yield put({ type: SET_COLLECTION_LOADING, payload: false });
        yield put({ type: SEND_ERROR_MESSAGE, payload: { text: e.message, description: e.message } });
    }
}

function* _processData(action) {
    const { entity, data, entries } = action.payload;
    const context = yield select(Selectors.context);

    try {
        yield call(processEntityData, context, entity, data, entries);
        yield put({ type: SAGA_FETCH_LIST_DATA, payload: entity });
    } catch (e) {
        yield put({ type: SET_COLLECTION_LOADING, payload: false });
        yield put({ type: SEND_ERROR_MESSAGE, payload: { text: e.message, description: e.message } });
    }
}

//TODO: Change 
function* _fetchEntityData(action) {
    const { entity, id, wsid, isCopy } = action.payload;
    const context = yield select(Selectors.context);
    const { contributions } = context;

    //const verifiedEntries = checkEntries(entries);
    let isNew = !id;
    let data = {};
    let classifiers = {};

    try {
        yield put({ type: SET_ENTITY_LOADING, payload: true });

        let scheme = contributions.getPointContributionValue(TYPE_COLLECTION, entity, C_COLLECTION_ENTITY) || entity;

        if (!isNew) {
            const result = yield call(getObject, context, { scheme, wsid, id, props: {} }, true);

            Logger.log(result, 'SAGA.fetchEntityData() fetched data:', "rootSaga.fetchEntityData");

            const { resolvedData } = result;

            if (_.isPlainObject(resolvedData)) {
                data = checkForEmbededTypes(context, entity, resolvedData);
            }
        }

        let required_classifiers = getEntityRequiredClassifiers(context, entity);

        if (_.size(required_classifiers) > 0) {
            for (let c of required_classifiers) {
                let cData = yield call(getCollection, context, { scheme: c, wsid, props: {} }, true);
                classifiers[c] = cData?.resolvedData || null;
            }
        }

        if (isCopy) {
            data = prepareCopyData(data);
        }

        yield put({ type: ENTITY_DATA_FETCH_SUCCEEDED, payload: { data, classifiers, isNew, isCopy } });
    } catch (e) {
        yield put({ type: SET_ENTITY_LOADING, payload: false });
        yield put({ type: SEND_ERROR_MESSAGE, payload: { text: e.message, description: e.message } });
    }
}

function* _processEntityData(action) {
    let { entity, data, entries } = action.payload;
    const context = yield select(Selectors.context);

    if (_.size(data) === 0) {
        yield put({ type: SEND_CANCEL_MESSAGE, payload: { refresh: true } });
    } else {
        try {
            yield put({ type: SET_ENTITY_DATA_PROCESSING, payload: true });
            yield call(processEntityData, context, entity, data, entries);

            yield put({ type: SET_ENTITY_DATA_PROCESSING, payload: false });
            yield put({ type: SEND_CANCEL_MESSAGE, payload: { refresh: true } });
        } catch (e) {
            yield put({ type: SET_ENTITY_LOADING, payload: false });
            yield put({ type: SET_ENTITY_DATA_PROCESSING, payload: false });
            yield put({ type: SEND_ERROR_MESSAGE, payload: { text: e.message, description: e.message } });
        }
    }
}

//TODO - continue with REPORTS
function* _fetchReport(action) {
    const locations = yield select(Selectors.locations);
    const context = yield select(Selectors.context);
    const { contributions, api } = context;
    const { report, from, to, props } = action.payload;
    const elements = [{ "fields": ["offset", "eventTime", "event"] }];

    let data = [];
    let classifiers = {};

    let event_type = contributions.getPointContributionValues(TYPE_REPORTS, report, C_REPORT_EVENT_TYPE);
    let required_classifiers = contributions.getPointContributionValues(TYPE_REPORTS, report, C_REPORT_REQUIRED_CLASSIFIERS);

    let doProps = {
        type: event_type,
        fromDay: from,
        tillDay: to,
    };

    if (_.isPlainObject(props)) {
        doProps = { ...doProps, ...props };
    }

    //doProps["index"] = "air.PbillDates";

    yield put({ type: SET_REPORT_DATA_FETCHING, payload: true });

    try {
        const wsid = locations[0];
        const result = yield call(api.log.bind(api), wsid, doProps);

        if (result && result["result"]) {
            data = pretifyData(elements, result["result"]);
        }

        let tasks = [];
        let tasksPath = [];


        if (_.size(required_classifiers) > 0) {
            for (let c of required_classifiers) {
                tasks.push(call(getCollection, context, { scheme: c, wsid, props: {} }, true))
                tasksPath.push([ c ]);
            }
        }

        const classifiersData = yield all(tasks);

        for (let i = 0; i < tasksPath.length; i++) {
            _.set(classifiers, tasksPath[i], classifiersData[i]['resolvedData']);
        }

        //console.log(REPORT_DATA_FETCHING_SUCCESS, ' ', { data, classifiers });

        yield put({ type: REPORT_DATA_FETCHING_SUCCESS, payload: { data, classifiers } });
    } catch (e) {
        yield put({ type: SET_REPORT_DATA_FETCHING, payload: false });
        yield put({ type: SEND_ERROR_MESSAGE, payload: { text: e.message, description: e.message } });
    }
}

//TODO: Reimplement
function* _fetchDashboard() {
    const locations = yield select(Selectors.locations);
    const api = yield select(Selectors.api);
    const context = yield select(Selectors.context);
    const from = yield select(Selectors.dashboardFromValue);
    const to = yield select(Selectors.dashboardToValue);
    const elements = getDashboardElements(context);

    if (elements.length > 0) {
        const days = getDashboardDays(context, from, to);
        const doProps = { elements, days };

        //yield put({ type: SET_DASHBOARD_LOADING, payload: true });

        try {
            let wsid = locations[0];

            const result = yield call(api.dashboard.bind(api), wsid, doProps);
            let resultData = [];

            if (result && result["result"]) {
                resultData = pretifyData(elements, result["result"]);
            }

            yield put({ type: DASHBOARD_DATA_FETCHING_SUCCESS, payload: resultData });
        } catch (e) {
            //yield put({ type: SET_DASHBOARD_LOADING, payload: false });
            yield put({ type: SEND_ERROR_MESSAGE, payload: { text: e.message, description: e.message } });
        }

    } else {
        yield put({ type: DASHBOARD_DATA_FETCHING_SUCCESS, payload: {} });
    }
}

function* _setPluginLanguage(action) {
    const langCode = action.payload;

    if (_.isString(langCode)) {
        const lang = lc.langByHex(langCode);
        const lex = lang.lex();

        if (_.isString(lex)) {
            if (i18next.languages.indexOf(lex) >= 0) {
                yield call(i18next.changeLanguage.bind(i18next), lex);
                yield put({
                    type: SET_PLUGIN_LANGUAGE,
                    payload: langCode
                });
                yield put({
                    type: SEND_LANGUAGE_CHANGED_MESSAGE,
                    payload: langCode
                });
            } else {
                yield put({
                    type: SEND_ERROR_MESSAGE,
                    payload: {
                        description: `setLanguage error: lang "${lex}" is not presented in current laguages list; allowed languages are: ${i18next.languages}`
                    }
                });
            }
        } else {
            yield put({
                type: SEND_ERROR_MESSAGE,
                payload: {
                    description: `setLanguage error: wrong locale specified: "${lex}"; string expected`
                }
            });
        }
    }
}

function* _setListShowDeleted(action) {
    const entity = yield select(Selectors.entity);
    const contributions = yield select(Selectors.contributions);
    const manual = !!contributions.getPointContributionValue(TYPE_LIST, entity, 'manual');

    yield put({
        type: ENTITY_LIST_SET_SHOW_DELETED,
        payload: !!action.payload
    });

    if (manual) {
        yield put({
            type: SAGA_FETCH_LIST_DATA,
            payload: entity
        });
    }
}

function* _getLinkDeviceToken(action) {
    const data = action.payload;
    const locations = yield select(Selectors.locations);
    const api = yield select(Selectors.api);

    try {
        let wsid = locations[0];

        const result = yield call(api.qr.bind(api), data, wsid);

        yield put({ type: SET_WIZZARD_DEVICE_LINK_TOKEN, payload: result });
    } catch (e) {
        yield put({ type: SEND_ERROR_MESSAGE, payload: { text: e.message, description: e.message } });
    }
}

function* rootSaga() {
    yield takeLatest(SAGA_FETCH_LIST_DATA, _fetchListData);
    yield takeLatest(SAGA_FETCH_REPORT, _fetchReport);
    yield takeLatest(SAGA_FETCH_DASHBOARD, _fetchDashboard);
    yield takeLatest(SAGA_PROCESS_DATA, _processData);
    yield takeLatest(SAGA_FETCH_ENTITY_DATA, _fetchEntityData);
    yield takeLatest(SAGA_PROCESS_ENTITY_DATA, _processEntityData);
    yield takeLatest(SAGA_SET_PLUGIN_LANGUAGE, _setPluginLanguage);
    yield takeLatest(SAGA_SET_LIST_SHOW_DELETED, _setListShowDeleted);
    yield takeLatest(NEED_LINK_DEVICE_TOKEN, _getLinkDeviceToken);
}

export default rootSaga;