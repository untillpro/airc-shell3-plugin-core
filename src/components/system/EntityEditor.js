/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { 
    EMEditForm,
    EMMassEditForm
} from '../../components';

import {
    sendCancelMessage,
    sendNeedProccessMessage,
    sendNeedValidateMessage,
    sendNeedFormNavigation
} from '../../actions/';

class EntityEditor extends Component {
    componentDidMount() {
        const { id } = this.props;

        if (id) {
            this.props.sendNeedFormNavigation(id);
        }
    }

   componentDidUpdate(nextProps) {
        const { id } = this.props;

        if (id !== nextProps.id) {
            this.props.sendNeedFormNavigation(nextProps.id);
        }
    }

    render() {
        const { massedit, data, classifiers, locations, entity, isCopy, isNew, loading } = this.props;

        return (
            <div className='content-container'>
                {massedit ? (
                    <EMMassEditForm 
                        showHeader 
                        data={data}
                        entity={entity}

                        onValidate={() => this.props.sendNeedValidateMessage(data)}
                        onProceed={(data) => this.props.sendNeedProccessMessage(data)}
                    />
                ) : (
                    <EMEditForm 
                        loading={loading}
                        showHeader 
                        showBreadcrumbs
                        data={data}
                        classifiers={classifiers}
                        entity={entity}
                        isCopy={isCopy}
                        isNew={isNew}

                        locations={locations}

                        onValidate={() => this.props.sendNeedValidateMessage(data)}
                        onProceed={(data) => this.props.sendNeedProccessMessage(data)}
                        onCancel={(data) => this.props.sendCancelMessage(data)}
                    />
                )}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { locations } = state.locations;
    const { entity } = state.plugin;
    const { loading, id, data, isCopy, isNew, classifiers } = state.entity

    return { 
        loading,
        isCopy,
        isNew,
        locations,
        entity,
        id,
        data,
        classifiers
    };
};

export default connect(mapStateToProps, {
    sendCancelMessage,
    sendNeedProccessMessage,
    sendNeedValidateMessage,
    sendNeedFormNavigation,
})(EntityEditor);
