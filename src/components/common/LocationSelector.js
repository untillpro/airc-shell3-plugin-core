/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Modal, Button, Radio, translate as t } from 'airc-shell-core';

import {
    setLocation
} from '../../actions';

class LocationSelector extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            selectedLocation: null,
        };

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.modalSubmit = this.modalSubmit.bind(this);
        this.handleRadioGroupChange = this.handleRadioGroupChange.bind(this);
    }

    openModal() {
        this.setState({
            open: true,
            selectedLocation: this.getCurrentLocation()
        });
    }

    closeModal() {
        this.setState({
            open: false,
        });
    }

    modalSubmit() {
        const currentLocation = this.getCurrentLocation();
        const { selectedLocation } = this.state;

        if (selectedLocation && selectedLocation !== currentLocation) {
            this.setLocation(selectedLocation);
        }

        this.setState({
            open: false
        });
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

    handleRadioGroupChange(event) {
        const loc = Number(event.target.value);

        this.setState({ selectedLocation: loc });
    }

    renderLocations() {
        const { selectedLocation } = this.state;
        const { locationsOptions } = this.props;

        if (_.isNil(locationsOptions) || _.size(locationsOptions) === 0) {
            return (<div className="empty">no location options</div>);
        }

        return (
            <Radio.Group onChange={this.handleRadioGroupChange} value={selectedLocation}>
                {_.map(locationsOptions, (location, id) => {
                    return (
                        <Radio key={`location_${id}`} className="grid-location-selector-radio" value={parseInt(id)}>
                            {location}
                        </Radio>
                    );
                })}

            </Radio.Group>
        );
    }

    renderCurrentLocation() {
        const { locationsOptions } = this.props;
        const current = this.getCurrentLocation();

        if (current) {
            return <span className="v">{t("Location", "common")}: <span className="c">{locationsOptions[current]}</span> </span>;
        }

        return <span className="v">{t("Not selected", "common")}</span>;

    }

    render() {
        const { locations } = this.props;
        const { open } = this.state;

        return (
            <div className="location-selector">
                {_.size(locations) > 1 ? (
                    <>
                        <div className="select-button">
                            <Button onClick={this.openModal}>{t("Change", "common")}</Button>
                        </div>

                        <Modal
                            visible={open}
                            onOk={this.modalSubmit}
                            onCancel={this.closeModal}
                            size="medium"
                        >
                            <div className="location-selector-container">
                                {this.renderLocations()}
                            </div>
                        </Modal>
                    </>



                ) : null}

                <div className="current-location">
                    {this.renderCurrentLocation()}
                </div>


            </div>
        );
    }
}

LocationSelector.propTypes = {
    locations: PropTypes.array,
    locationsOptions: PropTypes.object,
    locationsGroups: PropTypes.array,
    setLocation: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
    const { locations, locationsOptions, locationsGroups } = state.locations;

    return {
        locations,
        locationsOptions,
        locationsGroups
    };
}

const mapDispatchToProps = {
    setLocation
};

export default connect(mapStateToProps, mapDispatchToProps)(LocationSelector);
