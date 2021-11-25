/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { IconButton } from 'airc-shell-core';

import {
    ICON_ADD,
    ICON_EDIT,
    ICON_UNIFY,
    ICON_DUPLICATE,
    ICON_DEACTIVATE
} from '../../../const/Icons';

class ListTableRowAction extends PureComponent {
    handleAction(event) {
        event.preventDefault();
        event.stopPropagation();

        const { entity, data, action } = this.props;

        if (action && typeof action === "function") {
            action(data, entity);
        }

        return false;
    }

    getIcon() {
        const { type, data  } = this.props;
        const { state } = data.original;

        switch (type) {
            case 'edit': return ICON_EDIT;
            case 'copy': return ICON_DUPLICATE;
            case 'unify': return ICON_UNIFY;
            case 'remove':
                if (state !== 1) {
                    return ICON_ADD;
                }

                return ICON_DEACTIVATE;

            default: return null;
        }
    }

    getTitle() {
        const { type, data } = this.props;
        const { state } = data.original;

        switch (type) {
            case 'edit': return 'Edit';
            case 'copy': return 'Duplicate';
            case 'unify': return 'Unify';
            case 'remove':
                if (state === 1) return 'Remove';
                return 'Restore';

            default: return null;
        }
    }

    render() {
        const { type } = this.props;

        return (
            <IconButton
                icon={this.getIcon(type)}
                title={this.getTitle(type)}
                onClick={(event) => this.handleAction(event)}
            />
        );

    }
}

ListTableRowAction.propTypes = {
    type: PropTypes.string.isRequired,
    entity: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    action: PropTypes.func.isRequired
};

export default ListTableRowAction;
