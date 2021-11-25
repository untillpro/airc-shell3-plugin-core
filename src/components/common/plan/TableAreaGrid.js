/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

const DEFAULT_STEP_VALUE = 10;
const STROKE_COLOR = "#787878";
const STROKE_GRID_WIDTH = 0.5;

class TableAreaGrid extends PureComponent {
    constructor(props) {
        super(props);
        this.canvas = null;
    }

    componentDidMount() {
        if (this.canvas) {
            this.updateCanvas();
        }
    }

    updateCanvas() {
        const { width, height, size } = this.props;
        const step = size || DEFAULT_STEP_VALUE;
        let ctx = this.canvas.getContext('2d');

        for (var x = STROKE_GRID_WIDTH; x < width; x += step) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }

        for (var y = STROKE_GRID_WIDTH; y < height; y += step) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }

        ctx.lineWidth = STROKE_GRID_WIDTH;
        ctx.strokeStyle = STROKE_COLOR;
        
        ctx.stroke();
    }

    render() {
        const { width, height } = this.props;

        return (
            <div className="table-area-grid">
                <canvas
                    ref={ref => this.canvas = ref}
                    width={width}
                    height={height}
                />
            </div>
        );
    }
}

TableAreaGrid.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    size: PropTypes.number
};

export default TableAreaGrid;