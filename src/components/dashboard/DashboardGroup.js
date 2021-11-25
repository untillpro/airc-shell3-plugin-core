/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import shortid from 'shortid';
import { DropTarget } from 'react-drag-drop-container';
import ChartBuilder from './ChartBuilder';
import { dashboardFrom, dashboardTo } from '../../selectors';
import { setChartOrder  } from '../../actions/';

class DashboardGroup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            items: [],
            chartsData: {},
        };
    }

    componentDidMount() {
        if (_.isArray(this.props.items)) {
            const items = [];

            this.props.items.forEach(chart => {
                items.push({
                    ...chart,
                    uid: shortid.generate()
                });
            });

            this.setState({ items });
        }
    }

    componentDidUpdate(oldProps, oldState) {
        if (oldProps.data !== this.props.data || oldState.items !== this.state.items) {
            this._initChartsData();
        }
    }

    _initChartsData() {
        const { options } = this.props;

        if (_.isPlainObject(this.props.data) || _.isArray(this.state.items)) {
            const chartsData = {};

            _.forEach(this.state.items, (item) => {
                chartsData[item.code] = item.builder(this.props.data, options);
            });

            this.setState({ chartsData });
        } else {
            this.setState({ chartsData: {} })
        }
    }

    handleDrop = (e) => {
        let items = this.state.items.slice();
        items.push({
            ...e.dragData,
            uid: shortid.generate(),
        });

        this.setState({ items });

        e.containerElem.style.visibility = "hidden";
    };

    swap = (fromIndex, toIndex, dragData) => {
        let items = this.state.items.slice();

        let swapOrder = dragData.order;

        if (items.length > 0) {
            if (items[toIndex]) {
                swapOrder = items[toIndex].order - 1;
            } else {
                swapOrder = _.last(items).order + 1;
            }
        }

        const item = {
            ...dragData,
            uid: shortid.generate(),
        };

        items.splice(toIndex, 0, item);

        this.setState({ items });

        if (_.isFunction(this.props.setChartOrder)) {
            this.props.setChartOrder(dragData.code, { 
                group: this.props.index, 
                order: swapOrder
            });
        }
    };

    kill = (uid) => {
        let items = this.state.items.slice();

        const index = items.findIndex((item) => {
            return item.uid === uid
        });

        if (index !== -1) {
            items.splice(index, 1);
        }

        this.setState({ items });
    };

    renderAddBlock() {
        return (
            <DropTarget
                onHit={this.handleDrop}
                targetKey="chart"
                dropData={{ name: this.props.name }}
            >
                <div className="add-more">+</div>
            </DropTarget>
        );
    }

    render() {
        const { index, visibility } = this.props;
        const { items, chartsData } = this.state;

        if (!_.isArray(items) || _.size(items) === 0) {
            return this.renderAddBlock();
        }

        return (
            <div 
                key={`group_${index}_${_.size(items)}`}
                className="group"
            >
                <DropTarget
                    onHit={this.handleDrop}
                    targetKey="chart"
                    dropData={{ name: this.props.name }}
                >
                    {_.map(items, (item, index) =>
                        <ChartBuilder
                            hidden={visibility[item.code] === false}
                            chart={item}
                            data={chartsData[item.code]}
                            key={item.uid}
                            index={index}
                            kill={this.kill}
                            swap={this.swap}
                        />
                    )}
                </DropTarget>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { locationsOptions } = state.locations;

    return {
        options: {
            locations: locationsOptions, 
            from: dashboardFrom(state), 
            to: dashboardTo(state)
        }
    }
};

export default connect(mapStateToProps, { setChartOrder })(DashboardGroup);