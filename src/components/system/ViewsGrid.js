/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStackEvents } from 'stack-events';
import cn from 'classnames';
import { 
    Grid, 
    Card, 
    Message, 
    Logger,
    translate as t
} from 'airc-shell-core';

import {
    KEY_RETURN,
    KEY_LEFT,
    KEY_UP,
    KEY_RIGHT,
    KEY_DOWN,
} from 'keycode-js';

import { funcOrString } from '../../classes/helpers';
import { sendSelectViewMessage } from '../../actions';
import { GridLocationSelector } from '../common'

class ViewsGrid extends Component {
    constructor(props) {
        super(props);

        this.state = {
            views: [],
            selected: null
        }

        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    componentDidMount() {
        this.setState({ views: this.prepareViews() });

        this.props.pushEvents({
            'keydown': this.handleKeyPress
        });
    }

    componentWillUnmount() {
        this.props.popEvents();
    }

    moveCursor(offset) {
        const { views, selected } = this.state;

        if (views && _.size(views) > 0) {
            let index = 0;

            if (_.isNumber(selected) && selected >= 0) {
                index += selected + offset;

                if (index < 0) index = 0;
                if (index >= views.length) index = views.length - 1;
            }

            this.setState({ selected: index });
        }
    }

    selectView(index) {
        const { locations } = this.props;
        const { views } = this.state;

        if (views && _.size(views) > 0 && index >= 0) {
            const o = views[index];

            if (o && o.code && _.isString(o.code)) {
                this.props.sendSelectViewMessage(o.code, locations);
            }
        }
    }

    handleKeyPress(event) {
        const { selected } = this.state;
        const { keyCode } = event;

        switch (keyCode) {
            case KEY_RETURN: this.selectView(selected); break;
            case KEY_UP: this.moveCursor(-4); break;
            case KEY_DOWN: this.moveCursor(4); break;
            case KEY_RIGHT: this.moveCursor(1); break;
            case KEY_LEFT: this.moveCursor(-1); break;
            default: break;
        }
    }

    prepareViews() {
        const { contributions } = this.props;
        const declarations = contributions.getPoints('views');

        let views = [];

        _.each(declarations, (view) => {
            const viewDeclaration = contributions.getPoint('views', view);
            const declare = {};

            declare.name = funcOrString(viewDeclaration.getContributuionValue('name'));
            declare.code = viewDeclaration.getContributuionValue('code');
            declare.description = funcOrString(viewDeclaration.getContributuionValue('description'));
            declare.ico = viewDeclaration.getContributuionValue('ico');
            declare.order = viewDeclaration.getContributuionValue('order');

            if (this.checkDeclaration(declare)) {
                views.push(declare);
            } else {
                Logger.log(viewDeclaration, `View "${view}" declaration malformed`, "ViewsGrid");
            }
        });

        views = _.sortBy(views, (o) => o.order);

        return views;
    }

    checkDeclaration(declaration) {
        if (!declaration ||
            !_.isObject(declaration) ||
            !_.has(declaration, "name") ||
            !_.has(declaration, "code")) {
            return false;
        }

        return true;
    }

    handleViewClick(index) {
        this.selectView(index)
    }

    renderViewsGrid() {
        const { showLocationSelector } = this.props;
        const { views, selected } = this.state;

        if (_.isArray(views) && _.size(views) > 0) {
            return (
                <div className={cn("content-container", { "flex-content row": !!showLocationSelector })}>
                    <GridLocationSelector />

                    <Grid
                        cols={3}
                        gap={32}
                    >
                        {
                            views.map((declarationInfo, index) => {
                                return (
                                    <Card
                                        align='center'
                                        valign='center'
                                        selected={index === selected}
                                        title={declarationInfo.name}
                                        text={declarationInfo.description}
                                        ico={declarationInfo.ico}
                                        key={declarationInfo.name}
                                        onClick={() => this.handleViewClick(index)}
                                    />
                                );
                            })
                        }
                    </Grid>
                </div>
            );
        }

        return null;
    }

    render() {
        const { views } = this.state;

        if (_.size(views) > 0) {
            return this.renderViewsGrid(views);
        }

        return (
            <div>
                <Message type='error' >
                    {t("views_not_specified", "errors")}
                </Message>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { locations } = state.locations;
    const { showLocationSelector } = state.options;
    const { contributions } = state.context;

    return { locations, contributions, showLocationSelector };
};

export default connect(mapStateToProps, { sendSelectViewMessage })(withStackEvents(ViewsGrid));
