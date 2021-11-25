/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumbs as CoreBreadcrumbs } from 'airc-shell-core';
import { sendBreadcrumbSelected } from '../../actions';

class Breadcrumbs extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            breadcrumbs: []
        };

        this.separator = this.separator.bind(this);
        this.handleItemClick = this.handleItemClick.bind(this);
        this.itemBuilder = this.itemBuilder.bind(this);
    }
    
    componentDidMount() {
        const { items, context } = this.props;
        const breadcrumbs = [];

        if (_.isArray(items)) {
            items.forEach(item => {
                let b = item.breadcrumb(context);

                if (_.isPlainObject(b)) {
                    breadcrumbs.push(b);
                }
            });
        }

        this.setState({breadcrumbs});
    }

    separator(item, index, last) {
        if (last) return null;

        return "->";
    }

    handleItemClick(item) {
        if (item.uid) {
            this.props.sendBreadcrumbSelected(item.uid);
        }
    }

    itemBuilder(item) {
        return item.text;
    }

    render() {
        const { breadcrumbs } = this.state;

        return (
            <CoreBreadcrumbs 
                items={breadcrumbs} 
                itemBuilder={this.itemBuilder}
                onClick={this.handleItemClick}
                separator={this.separator}
                lastactive={false}
                showRoot={false}
            />
        );
    }
}

Breadcrumbs.propTypes = {
    context: PropTypes.object.isRequired,
    sendBreadcrumbSelected: PropTypes.func.isRequired,
    items: PropTypes.array,
};

const mapStateToProps = (state) => {
    const context = state.context;
    const { sm } = context;

    const items = sm.getStack();

    return { context, items };
};

export default connect(mapStateToProps, { sendBreadcrumbSelected })(Breadcrumbs);