/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
    Sections,
    SectionItem,
    Search,
    Empty
} from 'airc-shell-core';

import {
    HeaderBackButton,
    LocationSelector,
    Breadcrumbs,
} from '../common/';

import {
    selectReportType,
    sendCancelMessage,
} from '../../actions/';

import { funcOrString } from '../../classes/helpers';

import ReportDetails from '../report/RDetails';

class ViewReportsList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            reports: [],
            searchStr: null
        };

        this.handleBackPress = this.handleBackPress.bind(this);
        this.onSearchChange = this.onSearchChange.bind(this);
    }

    componentDidMount() {
        this._setReports()
    }

    _prepareReports() {
        const { reports, searchStr } = this.state;
        let result = [];

        if (reports && reports.length > 0) {
            if (searchStr) {
                _.forEach(reports, (r) => {
                    if (r.name && String(r.name.toLowerCase()).search(searchStr.toLowerCase()) !== -1) {
                        result.push(r);
                    }
                });
            } else {
                result = [ ...reports ];
            }
        }

        return result;
    }

    _setReports() {
        const { view, contributions } = this.props;

        let reports = [];
        let items = contributions.getPointContributionValues('views', view, 'reports') || [];

        if (items.length > 0) {
            _.forEach(items, (code) => {
                let point = contributions.getPointContributions('reports', code);

                if (point) {
                    reports.push({
                        "name": funcOrString(contributions.getPointContributionValue('reports', code, 'name')),
                        "code": code,
                        "order": contributions.getPointContributionValue('reports', code, 'order') || 0
                    });
                }
            });
        }

        if (reports.length > 0) {
            reports = _.sortBy(reports, (o) => o.order)
        }

        this.setState({reports});
    }

    onSearchChange(event) {
        this.setState({
            searchStr: event.target.value
        });
    }

    handleReportSelect(reportCode) {
        if (reportCode) {
            this.props.selectReportType(reportCode)
        }
    }
    
    handleBackPress() {
        this.props.sendCancelMessage()
    }
    
    renderHeader() {
        const { searchStr } = this.state;
        const { view, contributions } = this.props;

        let header = funcOrString(contributions.getPointContributionValue('views', view, 'name'));
        
        return (
            <div className="content-header">
                <div className="grid col-2 row-2">
                    <div className="cell">
                        <HeaderBackButton 
                            onClick={() => this.props.sendCancelMessage()}
                        />

                        <h1>{header}</h1>
                    </div>

                    <div className="cell align-right">
                        <Search 
                            defaultValue={searchStr}
                            onChange={this.onSearchChange}
                        />
                    </div>
                    <div className="cell">
                        <LocationSelector />
                    </div>
                </div>
            </div>
        );
    }

    buildReportsList() {
        const { report } = this.props;

        let reports = this._prepareReports();

        if (reports && reports.length > 0) {
            
            return (
                <div className='page-section-navigation'>
                    <Sections
                        vertical
                        data={reports}
                        renderItem={(item, index) => {
                            return <SectionItem
                                key={`tab_${index}`}
                                text={item.name}
                                active={item.code === report}
                                onClick={() => this.handleReportSelect(item.code)}
                            />
                        }}
                    />
                </div>
            );
            
        }

        return (
            <div className='page-section-navigation'>
                <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description={"No reports found"}
                />
            </div>
        ); 
        ;
    }

    buildReportsContent() {
        const { view, report } = this.props;

        if (report) {
            return (
                <ReportDetails 
                    debug={false}
                    report={report} 
                    group={view}
                />
            ); 
        }

        return (
            <div className={`page-section-content`}>
                <Empty description={`Please select a report`} />
            </div>
        );
    }

    renderBody() {
        return (
            <div className="paper nopad">
                <div className={`page-section`}>
                    {this.buildReportsList()}
                    {this.buildReportsContent()}
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className='content-container'>
                {this.renderHeader()}

                <Breadcrumbs />
                
                {this.renderBody()}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { contributions } = state.context;
    const { reportType: report } = state.reports;

    return { report, contributions };
}

const mapDispatchToProps = {
    selectReportType,
    sendCancelMessage,
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewReportsList);