/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Message, Grid, Card } from 'airc-shell-core';
import { withStackEvents } from 'stack-events';

import {
    KEY_ESCAPE,
    KEY_RETURN,
    KEY_LEFT,
    KEY_UP,
    KEY_RIGHT,
    KEY_DOWN,
} from 'keycode-js';

import {
    isValidEntity,
    funcOrString
} from '../../classes/helpers';

import {
    TYPE_VIEWS,
    TYPE_ENTITIES,
    C_VIEW_NAME,
    C_ENTITY_NAME,
    C_ENTITY_DESCRIPTION,
    C_ENTITY_ICO,
    C_ENTITY_ORDER
} from '../../classes/contributions/Types';

import {
    HeaderBackButton,
    LocationSelector,
    Breadcrumbs
} from '../common/';

import {
    sendSelectEntityMessage,
    sendCancelMessage,
} from '../../actions/';

class ViewEntityGrid extends Component {
    constructor() {
        super();

        this.state = {
            entities: [],
            selected: null
        }

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleBackClick = this.handleBackClick.bind(this);
    }

    componentDidMount() {
        this.setState({
            entities: this.prepareEntities()
        });

        this.props.pushEvents({
            "keydown": this.handleKeyPress
        });
    }

    componentDidUpdate(oldProps) {
        if (oldProps.view !== this.props.view) {
            this.setState({
                entities: this.prepareEntities()
            });
        }
    }

    componentWillUnmount() {
        this.props.popEvents();
    }

    prepareEntities() {
        const { view, context } = this.props;
        const { contributions } = context;
        const viewPoint = contributions.getPointContributions(TYPE_VIEWS, view);
        const entities = viewPoint.managers;

        let declarations = [];

        _.each(entities, (entityName) => {
            const cp = contributions.getPoint(TYPE_ENTITIES, entityName);

            if (cp) {
                declarations.push({
                    "name": funcOrString(cp.getContributuionValue(C_ENTITY_NAME)),
                    "code": entityName,
                    "description": funcOrString(cp.getContributuionValue(C_ENTITY_DESCRIPTION)),
                    "ico": cp.getContributuionValue(C_ENTITY_ICO),
                    "order": cp.getContributuionValue(C_ENTITY_ORDER)
                });
            }
        });

        if (declarations.length > 0) {
            declarations = _.sortBy(declarations, (o) => o.order);
        }

        return declarations;
    }

    handleBackClick() {
        this.props.sendCancelMessage()
    }

    handleKeyPress(event) {
        const { selected } = this.state;
        const { keyCode } = event;

        switch (keyCode) {
            case KEY_ESCAPE: this.handleBackClick(); break;
            case KEY_RETURN: this.selectEntity(selected); break;
            case KEY_UP: this.moveCursor(-4); break;
            case KEY_DOWN: this.moveCursor(4); break;
            case KEY_RIGHT: this.moveCursor(1); break;
            case KEY_LEFT: this.moveCursor(-1); break;
            default: break;
        }
    }

    moveCursor(offset) {
        const { entities, selected } = this.state;

        if (entities && _.size(entities) > 0) {
            let index = 0;

            if (_.isNumber(selected) && selected >= 0) {
                index += selected + offset;

                if (index < 0) index = 0;
                if (index >= entities.length) index = entities.length - 1;
            }

            this.setState({ selected: index });
        }
    }

    selectEntity(index) {
        const { locations, context } = this.props;
        const { entities } = this.state;

        if (entities && _.size(entities) > 0 && index >= 0) {
            const e = entities[index];

            if (e && isValidEntity(context, e.code)) {
                this.props.sendSelectEntityMessage(e.code, locations);
            }
        }
    }

    renderHeader() {
        const { view, context } = this.props;
        const { contributions } = context;
        let header = funcOrString(contributions.getPointContributionValue(TYPE_VIEWS, view, C_VIEW_NAME));

        return (
            <div className="content-header">
                <div className="grid col-1 row-2">
                    <div className="cell">
                        <HeaderBackButton onClick={this.handleBackClick} />

                        <h1>{header}</h1>
                    </div>

                    <div className="cell">
                        <LocationSelector />
                    </div>
                </div>
            </div>
        );
    }

    renderEntitiesGrid() {
        const { entities, selected } = this.state;


        return (
            <div className='content-container'>
                {this.renderHeader()}

                <Breadcrumbs />

                <Grid
                    cols={4}
                    gap={24}
                >
                    {
                        entities.map((e, index) => {
                            return (
                                <Card
                                    selected={index === selected}
                                    type='small'
                                    align='center'
                                    valign='center'
                                    title={e.name}
                                    text={e.description}
                                    ico={e.ico}
                                    key={e.name}
                                    onClick={this.selectEntity.bind(this, index)}
                                />
                            );
                        })
                    }
                </Grid>
            </div>
        );
    }

    render() {
        const { entities } = this.state;

        if (entities && entities.length > 0) {
            return this.renderEntitiesGrid(entities);
        }

        return (
            <Message type='error' >
                <p>
                    * TODO Write error text *
                </p>
            </Message>
        );
    }
}

const mapStateToProps = (state) => {
    const { locations } = state.locations;
    const context = state.context;
    const { view } = state.plugin;

    return { locations, view, context };
};

export default connect(mapStateToProps, {
    sendSelectEntityMessage,
    sendCancelMessage
})(withStackEvents(ViewEntityGrid));
