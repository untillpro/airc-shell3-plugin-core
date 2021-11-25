/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { getBlobPath, nodeToPicture } from 'airc-shell-core';

import TableAreaGrid from './TableAreaGrid';

class TableArea extends PureComponent {
    constructor(props) {
        super(props);

        this.area = null;

        this._onImageLoad = this._onImageLoad.bind(this);
        this._onScroll = this._onScroll.bind(this);
        this._initRef = this._initRef.bind(this);

        this._constraints = [0, 0];
        this._container = null;

        this.areaRef = null;
    }

    async generatePreview() {
        const maxSize = 300;

        if (this.areaRef) {
            this.areaRef.classList.add("hide-controlls");

            return nodeToPicture(this.areaRef, maxSize, maxSize).catch(() => {
                this.areaRef.classList.remove("hide-controlls");
            });
        }

        return null;
    }

    scrollTo(constraints, insta = false) {
        const [x, y, X, Y] = this._constraints;
        const [x0, y0, x1, y1] = constraints;
        const delta = insta ? 0 : 20;

        let top = y;
        let left = x;

        if (top > y0) {
            top = y0 - delta;
        }

        if (left > x0) {
            left = x0 - delta;
        }

        if (y1 > Y) {
            top = y + (y1 - Y) + delta;
        }

        if (x1 > X) {
            left = x + (x1 - X) + delta;
        }

        if (this._container) {
            this._container.scrollTo({
                top: top,
                left: left,
                behavior: insta ? 'auto' : 'smooth'
            });
        }
    }

    _initRef(ref) {
        if (ref) {
            const { clientWidth, clientHeight } = ref;

            this._constraints = [0, 0, clientWidth, clientHeight];
            this._container = ref;
        }
    }

    _onScroll(event) {
        const { scrollLeft: x, scrollTop: y, clientWidth: w, clientHeight: h } = event.target;

        this._constraints = [x, y, x + w, y + h];
    }

    _onImageLoad(event) {
        if (_.isNumber(this.props.width) &&
            _.isNumber(this.props.height) &&
            this.props.width > 0 && this.props.height > 0
        ) {
            return;
        }

        const { naturalWidth: width, naturalHeight: height } = event.target;

        const { onSizeChange } = this.props;

        if (_.isFunction(onSizeChange)) {
            onSizeChange({ width, height });
        }
    }

    renderImage() {
        const { image, width, height } = this.props;

        let url = null;

        if (_.isString(image)) {
            url = image;
        } else if (_.isNumber(image)) {
            url = getBlobPath(image);
        }

        if (url) {
            return (
                <img
                    onLoad={this._onImageLoad}
                    src={url}
                    width={width}
                    height={height}
                    draggable={false}
                    alt=""
                    crossorigin={"anonymous"}
                />
            );
        }

        return null;
    }

    renderGrid() {
        const { grid, width, height, gridSize } = this.props;

        return grid ? <TableAreaGrid width={width} height={height} size={gridSize} /> : null;
    }

    render() {
        const { width, height, onClick } = this.props;

        let styles = {
            width,
            height
        };

        return (
            <div
                className="table-area"
                onClick={onClick}
            >
                <div className="table-area-plan-container" onScroll={this._onScroll} ref={this._initRef} >
                    <div className="cc">
                        <div className="table-area-plan"
                            style={styles}
                            ref={ref => this.areaRef = ref}
                        >
                            {this.renderImage()}
                            {this.props.children}
                        </div>
                        
                        {this.renderGrid()}
                    </div>
                </div>
            </div>
        );
    }
}

TableArea.propTypes = {
    children: PropTypes.node,
    width: PropTypes.number,
    height: PropTypes.number,
    image: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    grid: PropTypes.bool,
    gridSize: PropTypes.number,
};

export default TableArea;