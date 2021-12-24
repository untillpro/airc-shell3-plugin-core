/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import { createStore, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga'
import rootReducer from './reducers';

import rootSaga from './sagas/Root'

const persistConfigDefauult = {
    key: 'plugin',
    storage,
    blacklist: [
        'plugin',
        'list',
        'machine',
        'context',
        'collection',
        'entity',
        'report',
        'dashboards'
    ]
};

const loggerMiddleware = createLogger()

const configureStore = (persistConfig, initState = {}) => {
    let config = { ...persistConfigDefauult };

    if (persistConfig && typeof persistConfig === 'object') {
        config = { ...config, ...persistConfig };
    }
    const sagaMiddleware = createSagaMiddleware()
    const persistedReducer = persistReducer(config, rootReducer);

    let middleware = [sagaMiddleware];

    if (process.env.NODE_ENV !== 'production') {
        middleware.push(loggerMiddleware);
    }

    const store = createStore(
        persistedReducer,
        initState,
        applyMiddleware(...middleware)
    );

    const persistor = persistStore(store);

    sagaMiddleware.run(rootSaga);

    return { store, persistor };
};

export default configureStore;
