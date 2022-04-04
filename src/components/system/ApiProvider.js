/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import { Component } from 'react';
import { connect } from 'react-redux';
import isProd from 'is-prod';

import {
    apiInitDone,
    initPlugin,
    setContext,
    setLanguage,
    sendData,
    sendSelectViewMessage
} from '../../actions/';

import { UShellAPIGate, getProjectionHandler } from 'airc-shell-core';
import MockAlphaApiGate from '../../mock/MockAlphaApiGate';
import AppLoader from './AppLoader';

class ApiProvider extends Component {
    componentDidMount() {
        const API = {
            selectView: (view) => this._selectView(view),
            setLanguage: (lang) => this._setLanguage(lang),
            init: (payload) => this._init(payload),
            sendEvent: (handlerName, payload, type) => this._handleEvent(handlerName, payload, type)
        };

        let apiGate = null;

        if (isProd.isProduction()) {
            apiGate = new UShellAPIGate(API, '', this.props.apiInitDone);
        } else {
            apiGate = new MockAlphaApiGate(this.props.apiInitDone);
        }

        this.props.setContext("api", apiGate);
    }

    componentDidUpdate(oldProps) {
        const { info, error, warning, success, locations } = this.props;

        if (info !== oldProps.info) this.sendMessage(info, 'info');
        if (success !== oldProps.success) this.sendMessage(success, 'success');
        if (error !== oldProps.error) this.sendMessage(error, 'error');
        if (warning !== oldProps.warning) this.sendMessage(warning, 'warning');
        if (locations !== oldProps.locations) this.sendLocations(locations)
    }

    sendMessage(message, type) {
        const { api } = this.props;

        if (!message) return null;

        const { text = '', description = '' } = message;

        switch (type) {
            case 'success': api.sendSuccess(text, description); break;
            case 'warning': api.sendWarning(text, description); break;
            case 'error': api.sendError(text, description); break;

            default: api.sendInfo(text, description);
        }
    }

    sendLocations(locations) {
        const { api } = this.props;

        api.sendLocations(locations);
    }

    _handleEvent(handlerName, payload, type) {
        const handler = getProjectionHandler(handlerName);

        if (handler && typeof handler === "function") {
            handler(payload, type);
        }
    }

    _init(payload) {
        this.props.initPlugin(payload);
    }

    _setLanguage(lang) {
        this.props.setLanguage(lang)
    }

    _selectView(view) {
        const { locations } = this.props;
        
        this.props.sendSelectViewMessage(view, locations); 
    }

    render() {
        const { apiInitialized } = this.props;

        return apiInitialized === true ? this.props.children : <AppLoader loading={true} />;
    }
}

const mapStateToProps = (state) => {
    const { apiInitialized } = state.plugin;
    const { api } = state.context;
    const { info, error, warning, success } = state.messages;
    const { locations } = state.locations;

    return { 
        apiInitialized, 
        api, 
        info, 
        error, 
        warning, 
        success, 
        locations, 
    };
};

export default connect(mapStateToProps, { 
    apiInitDone,
    initPlugin,
    setLanguage,
    setContext,
    sendData, 
    sendSelectViewMessage
})(ApiProvider);
