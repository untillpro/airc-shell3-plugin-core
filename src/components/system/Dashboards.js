/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
    DashboardHeader,
    DashboardBuilder
} from "../dashboard";

import {
    TYPE_CHARTS,
    C_CHART_NAME,
    C_CHART_CODE,
    C_CHART_ORDER,
    C_CHART_GROUP,
    C_CHART_TYPE,
    C_CHART_OPTIONS,
    C_CHART_BUILDER,

    C_CHART_COMMON_TYPE
} from '../../classes/contributions/Types';

import { funcOrString } from '../../classes/helpers';

import { 
    dashboardVisibility, 
    dashboardCustomOrder,
} from '../../selectors';

import {
    sendNeedRefreshDataMessage
} from '../../actions';


class Dashboards extends Component {
    constructor(props) {
        super(props);

        this.state = {
            chartsGroups: {},
            charts: [], 
            refreshTimer: null
        };
    }

    addGroup = () => {
        this.setState({ chartsGroups: { ...this.state.chartsGroups, [_.size(this.state.chartsGroups) + 1]: []},});
    }

    componentDidMount() {
        this._initChartsList();
        this._toggleAutoRefresh();
    }

    componentDidUpdate(oldProps) {
        const { autoRefresh, refreshDelay } = this.props;

        if ((autoRefresh !== oldProps.autoRefresh) || (refreshDelay !== oldProps.refreshDelay)) {
            this._toggleAutoRefresh();
        }
    }

    _toggleAutoRefresh() {
        const { autoRefresh, refreshDelay } = this.props;
        const { refreshTimer } = this.state;

        if (refreshTimer) {
            clearInterval(this.state.refreshTimer);
        }

        if (autoRefresh === true && _.isNumber(refreshDelay) && refreshDelay > 0) {
            const timer = setInterval(() => {
                this.props.sendNeedRefreshDataMessage();
            }, refreshDelay * 1000);

            this.setState({refreshTimer: timer});
        } else {
            this.setState({refreshTimer: null});
        }
    }

    _initChartsList() {
        const { contributions } = this.props;
        const chartPoints = contributions.getPoints(TYPE_CHARTS);

        if (_.isObject(chartPoints) && _.size(chartPoints) > 0) {
            const chartsGroups = {};
            const charts = [];

            _.forEach(chartPoints, (key) => {
                const p = contributions.getPoint(TYPE_CHARTS, key);

                if (!p) return null;

                const chartItem = this.buildChartItem(p);

                if (!_.isNil(chartItem)) {
                    let groupNumber = chartItem[C_CHART_GROUP];

                    if (!_.isArray(chartsGroups[groupNumber])) {
                        chartsGroups[groupNumber] = [];
                    }

                    chartsGroups[groupNumber].push(chartItem);
                    charts.push(chartItem);
                }
            });

            _.forEach(chartsGroups, (group, i) => chartsGroups[i] = _.sortBy(group, (o) => o.order));

            this.setState({ chartsGroups, charts });
        }
    }


    buildChartItem(point) {
        const { customOrder } = this.props;

        if (point.name === C_CHART_COMMON_TYPE) return null;

        let code = point.getContributuionValue(C_CHART_CODE);
        let name = point.getContributuionValue(C_CHART_NAME);
        let order = point.getContributuionValue(C_CHART_ORDER);
        let group = point.getContributuionValue(C_CHART_GROUP);
        let type = point.getContributuionValue(C_CHART_TYPE);
        let builder = point.getContributuionValue(C_CHART_BUILDER);
        let options = point.getContributuionValue(C_CHART_OPTIONS);

        if (_.isNil(name) || (!_.isString(name) && !_.isFunction(name))) {
            console.error(`Wrong "${C_CHART_NAME}" param specified for chart "${code}"`);
            return null;
        } else {
            name = funcOrString(name);
        }

        if (_.isPlainObject(customOrder) && code in customOrder) {
            const custom = customOrder[code];

            order = custom.order || order || 0;
            group = custom.group || group || 0;
        } else {
            order = parseInt(order, 10) || 0;
            group = parseInt(group, 10) || 0;
        }

        if (!_.isString(type)) {
            console.error(`Wrong "${C_CHART_TYPE}" param specified for chart "${code}"`);
        }

        if (!_.isFunction(builder)) {
            console.error(`Wrong "${C_CHART_BUILDER}" param specified for chart "${code}"`);
        }

        if (!_.isPlainObject(options)) {
            options = {};
        }

        return {
            code,
            name,
            order,
            group,
            type,
            builder,
            options,
        };
    }

    render() {
        return (
            <>
                <DashboardHeader charts={this.state.charts} />
                <div className='content-container'>
                    <DashboardBuilder groups={this.state.chartsGroups} />

                    {/*<div className="dashborads-add-group-btn" onClick={this.addGroup}> Add Group </div>*/}
                </div>
            </>
        );
    }
}

const mapStateToProps = (state) => {
    const { contributions } = state.context;
    const { autoRefresh, refreshDelay } = state.dashboards;

    return { 
        contributions, 
        visibility: dashboardVisibility(state), 
        customOrder: dashboardCustomOrder(state),
        autoRefresh, 
        refreshDelay
    };
};

const mapDispatchToProps = {
    sendNeedRefreshDataMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboards);