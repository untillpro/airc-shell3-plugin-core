/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate as t } from 'airc-shell-core';
import { Logger, Radio, Checkbox } from 'airc-shell-core';

import {
    setLocation
} from '../../actions';

class GridLocationSelector extends PureComponent {
    constructor(props) {
        super(props);

        this.handleRadioGroupChange = this.handleRadioGroupChange.bind(this);
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    }

    handleRadioGroupChange(event) {
        const { onChange } = this.props;
        const loc = Number(event.target.value);

        this.setLocation(loc)

        if (onChange && typeof onChange === 'function') {
            onChange(loc);
        }
    }

    handleCheckboxChange(loc) {
        const { onChange } = this.props;

        this.setLocation(loc)

        if (onChange && typeof onChange === 'function') {
            onChange(loc);
        }
    }

    setLocation(location) {
        if (location) {
            if (_.isArray(location)) {
                this.props.setLocation(location)
            } else if (_.isNumber(location)) {
                this.props.setLocation([location])
            } else {
                throw new Error(`Location should be an array of integers or a single integer`);
            }
        } else {
            throw new Error(`Wrong location number is given: ${location}`);
        }
    }

    getCurrentLocation() {
        const { locations: selectedLocations } = this.props;

        if (selectedLocations && _.isArray(selectedLocations) && selectedLocations.length > 0) {
            return selectedLocations[0];
        } else if (_.isNumber(selectedLocations) && selectedLocations > 0) {
            return selectedLocations;
        }

        return null;
    }

    renderLocationsSingle() {
        const { locationsOptions } = this.props;

        return (
            <Radio.Group onChange={this.handleRadioGroupChange} value={this.getCurrentLocation()}>
                {_.map(locationsOptions, (location, id) => {
                    return (
                        <Radio key={`location_${id}`} className="grid-location-selector-radio" value={parseInt(id)}>
                            {location}
                        </Radio>
                    );
                })}

            </Radio.Group>
        )
    }

    renderLocationsMulty() {
        const { locationsOptions, locations } = this.props;

        return (
            <Checkbox.Group onChange={this.handleCheckboxChange} value={locations}>
                {
                    _.map(locationsOptions, (location, key) => {
                        let id = parseInt(key);

                        return (
                            <div key={`location_${key}`}>
                                <Checkbox value={id}>
                                    {location}
                                </Checkbox>
                            </div>
                        );
                    })
                }

            </Checkbox.Group >
        );
    }

    renderLocationsGroups() {
        // TODO in far far future
        return null;
    }

    renderLocations() {
        const { allowMultyLocations } = this.props;

        return allowMultyLocations ? this.renderLocationsMulty() : this.renderLocationsSingle();
    }

    renderHeader() {
        return (
            <div className="grid-location-selector-header">
                {t("Location", "common")}
            </div>
        );
    }

    render() {
        const { showLocationSelector, locationsOptions } = this.props;

        if (showLocationSelector === true && _.isObject(locationsOptions) && _.size(locationsOptions) > 1) {
            Logger.log(locationsOptions, 'Available locations: ');

            return (
                <div className="grid-location-selector">
                    {this.renderHeader()}
                    {this.renderLocations()}
                    {this.renderLocationsGroups()}
                </div>
            );
        }

        return null;
    }
}

GridLocationSelector.propTypes = {
    onChange: PropTypes.func,
    currentLanguage: PropTypes.string,
    showLocationSelector: PropTypes.bool,
    allowMultyLocations: PropTypes.bool,
    locations: PropTypes.array.isRequired,
    locationGroups: PropTypes.array,
    locationsOptions: PropTypes.object,
};

const mapStateToProps = (state) => {
    const { showLocationSelector, allowMultyLocations, currentLanguage } = state.options;
    const { locations, locationGroups, locationsOptions } = state.locations;

    return {
        currentLanguage,
        showLocationSelector,
        allowMultyLocations,
        locations,
        locationGroups,
        locationsOptions
    };
};

export default connect(mapStateToProps, { setLocation })(GridLocationSelector);
