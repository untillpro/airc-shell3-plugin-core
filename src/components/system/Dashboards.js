/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { 
    registerProjectionHandler,
    unregisterProjectionHandler
} from 'airc-shell-core';

import {
    DashboardHeader,
    DashboardBuilder,
    DashboardNotifier
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
        const { api } = this.props;

        registerProjectionHandler('airDashboard', (event) => {
            this.props.sendNeedRefreshDataMessage();
        });

        const key = this._key(this.props);

        api.subscribe(key, "airDashboard");

        window.addEventListener('beforeunload', () => {
            api.unsubscribe(key);
        });

        this.initChartsList();
    }

    componentDidUpdate(oldProps) {
        const { api } = this.props;

        if (this.props.location !== oldProps.location) {
            const key = this._key(oldProps);

            api.subscribe(key, "airDashboard");
        }
    }

    componentWillUnmount() {
        const { api } = this.props;
        const key = this._key(this.props);

        //console.log("Dashboards.componentWillUnmount : unsubscribe projection: ", key);

        api.unsubscribe(key);
        unregisterProjectionHandler('airDashboard');
    }

    _key(props) {
        return {
            "App": "untill/airs-bp", 
            "Projection": "air.Dashboard",
            "WS": props.location
        };
    }

    initChartsList() {
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
                    <DashboardNotifier />
                    <DashboardBuilder groups={this.state.chartsGroups} />

                    {/*<div className="dashborads-add-group-btn" onClick={this.addGroup}> Add Group </div>*/}
                </div>
            </>
        );
    }
}

const mapStateToProps = (state) => {
    const { locations } = state.locations;
    const { contributions, api } = state.context;

    return { 
        location: _.isArray(locations) ? locations[0] : locations,
        api,
        contributions, 
        visibility: dashboardVisibility(state), 
        customOrder: dashboardCustomOrder(state)
    };
};

const mapDispatchToProps = {
    sendNeedRefreshDataMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboards);