/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
    Button,
    Message
} from 'airc-shell-core';

import {
    sendCancelMessage
} from '../../actions/';

class ErrorBoundary extends Component {
    constructor() {
        super();

        this.state = {
            hasError: false,
            error: null,
            errorStep: null
        };

        this.dropError = this.dropError.bind(this);
    }

    setError(error, info) {
        const { step } = this.props;

        this.setState({
            hasError: true,
            error,
            info,
            errorStep: step
        });
    }

    dropError() {
        this.setState({
            errorStep: null,
            hasError: false,
            error: null
        });
    }

    componentDidUpdate() {
        const { step } = this.props;
        const { errorStep } = this.state;

        if (step !== errorStep) {
            //this.dropError();
        }
    }

    componentDidCatch(error, info) {
        const { api } = this.props;
        
        this.setError(error, info);

        this.props.sendCancelMessage();

        if (api) {
            api.sendError(error.toString());
        }
    }

    renderError() {
        const { error } = this.state;

        return (
            <Message
                header={"Air Shell Exception"}
                footer={
                    <Button  onClick={this.dropError} > Ok </Button>
                }

                footerAlign="right"
            >
                <div className="error-text">
                    {error.toString()}
                </div>
            </Message>
        );
    }

    render() {
        const { hasError } = this.state;

        if (hasError) {
            return this.renderError();
        } 

        return this.props.children;
    }

}

const mapStateToProps = (state) => {
    const { api } = state.context;
    const { step } = state.plugin;
    
    return { step, api };
};

export default connect(mapStateToProps, {
    sendCancelMessage
})(ErrorBoundary);