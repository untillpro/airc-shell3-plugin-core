/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React from 'react';
import { DragDropContainer, DropTarget } from 'react-drag-drop-container';
import {
    Area,
    Avg,
    Bar,
    Column,
    Line,
    Pie,
    Total
} from './charts';

import NoData from './NoData';

class ChartBuilder extends React.Component {
    handleDrop = (e) => {
        e.stopPropagation();
        this.props.swap(e.dragData.index, this.props.index, e.dragData);
        e.containerElem.style.visibility = "hidden";
    };

    deleteMe = () => {
        this.props.kill(this.props.chart.uid);
    };

    getChartComponent() {
        const { type } = this.props.chart;
        const t = String(type).toLocaleLowerCase();

        switch (t) {
            case "area": return Area;
            case "avg": return Avg;
            case "bar": return Bar;
            case "column": return Column;
            case "line": return Line;
            case "pie": return Pie;
            case "total": return Total;
            default: return null;
        }
    }

    render() {
        const { chart, data, hidden } = this.props;
        const { name, options } = chart;

        if (hidden) return null;

        let ChartComponent;

        if (_.isObject(data) && _.size(data) > 0) {
            ChartComponent = this.getChartComponent();
        } else {
            ChartComponent = NoData;
        }

        const dragElem = <div className="custom-drag-element">{name}</div>;

        if (ChartComponent) {
            return (
                <div className="chart">
                    <DragDropContainer
                        targetKey="chart"
                        dragData={chart}
                        onDrop={this.deleteMe}
                        dragHandleClassName="_grabber"
                        customDragElement={dragElem}
                    >
                        <DropTarget
                            onHit={this.handleDrop}
                            targetKey="chart"
                        >
                            <div className="chart-container">
                                <div className="chart-header">
                                    <span className="_grabber">•</span>
                                    <span className="_title" >{name}</span>
                                    <span className="_grow"></span>
                                </div>

                                <ChartComponent
                                    data={data}
                                    options={options}
                                />
                            </div>
                        </DropTarget>
                    </DragDropContainer>
                </div>
            );
        }

        return null;
    }
}

export default ChartBuilder;