/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Stubble from 'stubble4js';
import { translate as t, Button } from 'airc-shell-core';
import DefaultHelpers from '../classes/DefaultHelpers';

import {
    sendError
} from '../../../actions/MessagesActions';
class TicketLayoutPreview extends Component {
    constructor() {
        super();

        this.state = {
            conten: null,
            needRebuild: false
        };

        this.rendered = null;
        this.stubble = new Stubble();

        this.build = this.build.bind(this);
    }

    componentDidMount() {
        let Helpers = {};
        const { helpers, template } = this.props;

        if (!template || typeof template !== 'string') {
            this.sendError(t("Layout's template not specified or wrong given", "errors"));
        } else {
            this.initTemplate(template);
        }

        if (helpers && _.size(helpers) > 0) {
            Helpers = { ...Helpers, ...helpers };
        }

        if (DefaultHelpers && _.size(DefaultHelpers) > 0) {
            Helpers = { ...Helpers, ...DefaultHelpers };
        }

        if (_.size(Helpers) > 0) {
            _.each(Helpers, (helper, name) => {
                this.stubble.registerHelper(name, helper)
            });
        }

        if (template) {
            this.build();
        }
    }

    componentDidUpdate(oldProps) {
        const { settings, template } = this.props;

        if (template !== oldProps.template) {
            this.initTemplate(template);
            this.build();
        } else if (settings !== oldProps.settings) {
            this.setState({ needRebuild: true});
            //this.build();
        }
    }

    initTemplate(template) {
        let tpl = this.perfect(template);
        tpl = this.translate(tpl);

        this.rendered = this.stubble.compile(tpl);
    }

    perfect(tpl) {
        let str = tpl;

        const rexp = /<([a-zA-Z]+)((?:\s+[a-zA-Z]+="[\w|-|=|+|_|*|!|@|#|$|%|^|&|.|,|?|/]+")*)\s*\/>/g;

        str = str.replace(rexp, (a, b, c) => {
            return `<${b} ${c ? c : ''}></${b}>`
        });

        str = str.replace('<rimg', '<img');

        return str;
    }

    translate(tpl) {
        return tpl.replace(/\$\$(.*?)\$\$/gm, (a1, a2) => t(a2, "ticket"));
    }

    build() {
        const { data, settings } = this.props;
        let result = '';

        try {
            result = this.rendered({ ...data, settings });

            this.setState({
                content: result,
                needRebuild: false
            });
        } catch (e) {
            console.error(e);
            //this.props.sendError('Error while rendering ticket', e.toString)
        }
    }

    renderNeedRebuildOverlay() {
        const { needRebuild } = this.state;

        if (!needRebuild) return null;

        return <div className="need-rebuild-overlay">
            <Button onClick={this.build} type="primary" > {t("Refresh preview", "form")} </Button>
        </div>;
    }

    render() {
        const { content } = this.state;
        if (!content) return null;

        return (
            <div className="ticket-area">
                <div className="layout-prreview" dangerouslySetInnerHTML={{ __html: content }} />

                {this.renderNeedRebuildOverlay()}
            </div>
        );
    }
}

TicketLayoutPreview.propTypes = {
    formContext: PropTypes.object,
    locations: PropTypes.arrayOf(PropTypes.number),
    autoFocus: PropTypes.bool,
    entity: PropTypes.string,
    context: PropTypes.object,
    field: PropTypes.object.isRequired,
    disabled: PropTypes.bool,
    showError: PropTypes.bool,
    errors: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.any,
    data: PropTypes.object,
    classifiers: PropTypes.object,
    isNew: PropTypes.bool,
    isCopy: PropTypes.bool,
};

export default connect(null, { sendError })(TicketLayoutPreview);