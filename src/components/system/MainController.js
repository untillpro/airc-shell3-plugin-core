/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import isProd from 'is-prod';

import TestLangSelector from '../common/TestLangSelector';
import ViewsGrid from './ViewsGrid';
import ViewRenderer from './ViewRenderer';
import EntityRenderer from './EntityRenderer';
import EntityEditor from './EntityEditor';
import ReportView from './ReportView';
import Dashboards from './Dashboards';

import { toggleLocationSelector } from '../../actions/';

import log from '../../classes/Log';

class MainController extends Component {
    constructor(props) {
        super(props);

        this.state = {
            errorCatched: false,
            error: null
        };
    }

    renderStateComponent() {
        const { step } = this.props;

        log(`%cCurrent step is: ${step}`, 'color: #e83f6f ; font-size: 140%; font-weight: bold;');

        if (step) {
            switch (step) {
                case 'EntityEditStep':
                    // when creating or editing entity item
                    return <EntityEditor />;
                case 'EntityMassEditStep':
                    // when mass editing entity items
                    return <EntityEditor massedit />;
                case 'RenderEntityStep': 
                    // when select an entity manager
                    return <EntityRenderer />;
                case 'RenderViewStep': 
                    // when select a view
                    return <ViewRenderer />;
                case 'ReportViewStep': 
                    // when generate a report
                    return <ReportView />;
                case 'DashboardStep':
                    // when dasboard 
                    return <Dashboards />;
                default: 
                    return <ViewsGrid />;
            }
        }
        
        return <div className="no-step-specified">No state component specified for "{step}" step</div>;
    }

    renderProdComponents() {
        if (!isProd.isDevelopment()) return null;
        
        return (<TestLangSelector />);
    }

    render() {
        const { contributions } = this.props;
        const { errorCatched, error } = this.state;

        if (!contributions) return null;
        
        if (typeof contributions !== 'object') {
            throw new Error('Contibution manager corrupted! Plugin core has critical problems.')
        }

        if (errorCatched) {
            return (
                <div>
                    {error.toString()}
                </div>
            );
        }

        return (
            <div className='page-content'>
                {this.renderStateComponent()}

                {this.renderProdComponents()}

                <div className="plugin-version">
                    {process.env.REACT_APP_NAME}: {process.env.REACT_APP_VERSION}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { contributions } = state.context;
    const { step } = state.plugin;
    
    return { contributions, step };
};

export default connect(mapStateToProps, { toggleLocationSelector })(MainController);
