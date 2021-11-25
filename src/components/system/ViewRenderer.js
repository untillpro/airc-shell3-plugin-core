/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';

import ViewEntityGrid from './ViewEntityGrid';
import ViewReportsList from './ViewReportsList';

import {
    sendCancelMessage
} from '../../actions/';

class ViewRenderer extends Component {
    render() {
        const { view, contributions } = this.props;

        if (view) {
            const viewPoint = contributions.getPoint('views', view);
            const type = viewPoint.getContributuionValue('type');

            switch(type) {
                case 'grid': return <ViewEntityGrid view={view}/>;
                case 'reports': return <ViewReportsList view={view} />;
                default: throw new Error(`Unsupported type "${view}" of view ${type}`);
            }
        }

        this.props.sendCancelMessage();
        
        return null;
    }
}

const mapStateToProps = (state) => {
    const { view } = state.plugin;
    const { contributions } = state.context;

    return { view, contributions };
};

export default connect(mapStateToProps, { sendCancelMessage })(ViewRenderer);
