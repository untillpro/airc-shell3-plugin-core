/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StackEvents } from 'stack-events';
import { CoreProvider } from 'airc-shell-core';

import {
    StateMachineProvider,
    ErrorBoundary,
    ApiProvider,
    MainController,
    LangProvider
} from './components/';

import { ContributionFactory } from './classes/';
import configureStore from './configureStore';

//styles

import './assets/css/index.scss';

// i18n

import 'moment/locale/ru';
import * as systemLanguages from './.lang';

class PluginCore extends Component {
    shouldComponentUpdate() {
        return false;
    }

    render() {
        const { contributions, persistConfig, firstStep } = this.props;

        let manager = ContributionFactory(contributions);

        const { store, persistor } = configureStore(persistConfig, { "context": { "contributions": manager }});

        return (
            <Provider store={store} >
                <PersistGate
                    loading={null}
                    persistor={persistor}
                >
                    <StackEvents events={["keydown", "keyup"]}>
                        <CoreProvider>
                            <ApiProvider>
                                <StateMachineProvider firstStep={firstStep}>
                                    <ErrorBoundary>
                                        <LangProvider languages={systemLanguages}>
                                            <MainController />
                                        </LangProvider>
                                    </ErrorBoundary>
                                </StateMachineProvider>
                            </ApiProvider>
                        </CoreProvider>
                    </StackEvents>
                </PersistGate>
            </Provider>
        );
    }
}

export default PluginCore;
