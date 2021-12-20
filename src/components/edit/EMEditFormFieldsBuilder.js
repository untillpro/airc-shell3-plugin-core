/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import EMEditFormFieldsGroup from './EMEditFormFieldsGroup';

class EMEditFormFieldsBuilder extends Component {
    constructor() {
        super();

        this.state = {
            groups: null
        };
    }

    initGroups() {
        const { fields } = this.props;

        const fieldGroups = {
            "default": []
        };

        if (!fields || fields.length <= 0) return null;

        fields.forEach((field) => {
            const f = {...field};

            if (!f.order || !Number(f.order)) f.order = 0;

            if (f.group && typeof f.group === 'string') {
                if (!fieldGroups[f.group]) fieldGroups[f.group] = [];

                fieldGroups[f.group].push(f);
            } else {
                fieldGroups['default'].push(f);
            }
        });

        //this.setState({ groups: fieldGroups });

        return fieldGroups;
    }

    shouldComponentUpdate(nextProps) {
        if (this.props.opened === true || nextProps.opened === true) return true;

        return false;
    }

    // TODO use of context
    buildFieldsGroups() {
        let groups = this.initGroups();
        
        const { 
            formContext,
            embedded, 
            data, 
            classifiers, 
            changedData,
            locations, 
            fieldsErrors, 
            onDataChanged, 
            isNew, 
            isCopy  
        } = this.props;

        let counter = 0;

        return _.map(groups, (fields, group) => {
            return <EMEditFormFieldsGroup 
                formContext={formContext}
                index={counter++}
                key={group}
                locations={locations}
                data={data}
                classifiers={classifiers} // here lies alredy merged data from EMEditForm
                changedData={changedData}
                fieldsErrors={fieldsErrors}
                embedded={embedded}
                onDataChanged={onDataChanged}

                group={group}
                fields={fields}
                
                isNew={isNew}
                isCopy={isCopy}
            />;
        });
    }

    renderFooter() {
        const { footer } = this.props;

        if (footer) {
            if (_.isFunction(footer)) {
                return footer();
            } else if (React.isValidElement(footer)) {
                return footer;
            }
        }

        return null;
    }

    render() {
        const { hasErrors, opened } = this.props;

        return (
            <div 
                className={`page-section-content  ${hasErrors ? 'has-errors' : ''} 
                ${!opened ? 'hidden' : ''}` } 
            >
                <div className="page-section-content-fields">
                    {opened ? this.buildFieldsGroups() : null}
                </div>

                {this.renderFooter()}
            </div>
        );
    }
}

EMEditFormFieldsBuilder.propType = {
    locations: PropTypes.arrayOf(PropTypes.number),
    formContext: PropTypes.object.isRequired,
    key: PropTypes.string,
    hasErrors: PropTypes.object,
    fields: PropTypes.array,
    contributions: PropTypes.object.isRequired,
    opened: PropTypes.bool,
    footer: PropTypes.node,
    embedded: PropTypes.string,
    onDataChanged: PropTypes.func.isRequired,

    data: PropTypes.object,
    classifiers: PropTypes.object,
    changedData: PropTypes.object,
    fieldsErrors: PropTypes.object,

    isNew: PropTypes.bool,
    isCopy: PropTypes.bool,
}

export default EMEditFormFieldsBuilder;