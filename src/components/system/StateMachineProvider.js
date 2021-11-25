/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import { Component } from 'react';
import { connect } from 'react-redux';

import StateMachine from '../../classes/StateMachine';
//import * as Messages from 'classes/StateMachine/messages';
import { RootStep } from '../../classes/steps/';

import {
    dispatch,
    setContext,
    sendStateMachineResult
} from '../../actions/';

class StateMachineProvider extends Component {
    constructor(props) {
        const { firstStep } = props;

        super(props);
        
        //state machine initializing
        this.stateMachine = new StateMachine(props.dispatch);

        // root state of state machine is added manually
        this.stateMachine.add(new RootStep(firstStep));
    }

    componentDidMount() {
        this.props.setContext("sm", this.stateMachine);
    }

    shouldComponentUpdate(nextProps) {
        //checks whether message in next props are other message than message in current props
        if (this.props.message !== nextProps.message) return true;

        return false;
    }
    
    _sendMessage() {
        const { context, message, isGlobal, shouldPop } = this.props;
        const { api } = context;
        /**
         * if message was specified then send it to state machine
         */

        if (message) {
            let method = null;

            if (isGlobal) {
                method = this.stateMachine.sendGlobalMessage.bind(this.stateMachine);
            } else {
                method = this.stateMachine.sendMessage.bind(this.stateMachine);
            }

            let data = method(message, context, shouldPop);

            this.props.sendStateMachineResult(
                this.stateMachine.getCurrenStepName(),
                data
            );

            if (data.error) {
                api.sendError(data.error);
            }
        }
    }

    render() {
        this._sendMessage();
        
        return this.props.children;
    }
}

const mapStateToProps = (state) => {
    const { message, isGlobal, shouldPop } = state.machine;

    return { 
        context: state.context,
        message, 
        isGlobal, 
        shouldPop 
    };
};

const mapDispatchToProps = {
    setContext,
    sendStateMachineResult,
    dispatch
};

export default connect(mapStateToProps, mapDispatchToProps)(StateMachineProvider);
