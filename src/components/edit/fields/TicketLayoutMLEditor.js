/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Button } from 'airc-shell-core';

import { LANGUAGES } from '../../../const';

class TicketLayoutMLEditor extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            placeholders: [],
            dictionary: {},
            languages: [],
        };
    }

    componentDidMount() {
        const { template, dictionary } = this.props;

        this.setState({
            placeholders: this._collectTemplatePlaceholders(template),
            dictionary: dictionary,
            languages: this._collectUsedLanguages(dictionary),
        });
    }

    _collectTemplatePlaceholders() {
        return [];
    }

    _openEditor() {
        return false;
    }

    _close

    render() {
        return (
            <div className={cn("ticket-dictionary-editor")}>
                <Button />
            </div>
        );
    }
}

TicketLayoutMLEditor.propTypes = {
    onChange: PropTypes.func.isRequired,
    template: PropTypes.string.isRequired,
    dictionary: PropTypes.objectOf(PropTypes.objectOf())
};

export default TicketLayoutMLEditor;