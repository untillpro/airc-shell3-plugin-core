/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';

import EMList from './EntityList';
import EMTablePlan from './EntityTablePlan';

import {
    TYPE_ENTITIES,
    C_ENTITY_TYPE
} from '../../classes/contributions/Types';

import {
    sendCancelMessage
} from '../../actions/';

class EntityRenderer extends Component {
    render() {
        const { contributions, entity } = this.props;
        const entityType = contributions.getPointContributionValue(TYPE_ENTITIES, entity, C_ENTITY_TYPE);

        try {
            switch (entityType) {
                case 'table_plan': return <EMTablePlan entity={entity} />;
                default: return <EMList entity={entity} />;
            }
        } catch (e) {
            this.props.sendCancelMessage();
        }

        return null;
    }
}

const mapStateToProps = (state) => {
    const { contributions } = state.context;
    const { entity } = state.plugin;

    return { contributions, entity };
};

export default connect(mapStateToProps, { sendCancelMessage })(EntityRenderer);
