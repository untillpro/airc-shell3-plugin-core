/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate as t } from 'airc-shell-core';
import EMEditFormFieldsBuilder from '../edit/EMEditFormFieldsBuilder';

import {
    sendDoGenerateReport,
    selectFilterPeriod,
    setDatetimeFilter
} from '../../actions/';

import {
    locationWorkStartTime
} from '../../selectors/Selectors';

import { DateTimeFilter, Button } from 'airc-shell-core';
import { getDatetimePeriods, makeValidator } from '../../classes/helpers/';

class ReportDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            reportFields: [],
            propsFields: [],
            fieldsErrors: [],
            periods: [],
            maxMostUsed: 10,
            reportFilter: {},
            reportProps: {}
        };

        this.handleDateTimeChange = this.handleDateTimeChange.bind(this);
        this.handlePeriodSelected = this.handlePeriodSelected.bind(this);
        this.handleReportFilterChange = this.handleReportFilterChange.bind(this);
        this.handleReportPropsChange = this.handleReportPropsChange.bind(this);
        this.doGenerate = this.doGenerate.bind(this);
        this.doValidate = this.doValidate.bind(this);
    }

    _init() {
        const { contributions, mostUsedPeriods, filterBy, reportProps } = this.props;

        let fields = this.initFields();
        let periods = getDatetimePeriods(contributions, mostUsedPeriods);

        this.setState({
            ...fields,
            periods,
            reportFilter: filterBy || {},
            reportProps: reportProps || {}
        });
    }

    componentDidMount() {
        this._init();
    }

    componentDidUpdate(prevProps) {
        if (this.props.report !== prevProps.report) {
            this._init();
        }
    }

    initFields() {
        const { report, group, contributions } = this.props;

        let reportFields = [];
        let propsFields = [];

        if (contributions) {
            //report fields
            let reportPoint = contributions.getPoint("reports", report);

            if (reportPoint) {
                let fields = reportPoint.getContributuionValue("fields", true);

                if (fields && fields.length > 0) {
                    reportFields = fields;
                }
            }

            //group fields
            let groupPoint = contributions.getPoint("views", group);

            if (groupPoint) {
                let fields = groupPoint.getContributuionValue("fields", true);

                if (fields && fields.length > 0) {
                    propsFields = fields;
                }
            }
        }

        return {
            reportFields,
            propsFields
        };
    }

    doValidate() {
        const { reportFields, propsFields, reportFilter, reportProps } = this.state;
        const validator = makeValidator();
        const fieldsErrors = {};

        let validated = true;

        if (reportFields && reportFields.length > 0) {
            reportFields.forEach((field) => {
                const errors = validator.validate(field, reportFilter, null);

                if (errors && errors.length > 0) {
                    fieldsErrors[field.accessor] = errors;

                    validated = false;
                }
            });
        }

        if (propsFields && propsFields.length > 0) {
            propsFields.forEach((field) => {
                const errors = validator.validate(field, reportProps, null);

                if (errors && errors.length > 0) {
                    fieldsErrors[field.accessor] = errors;

                    validated = false;
                }
            });
        }

        this.setState({ fieldsErrors });

        return validated;
    }

    doGenerate() {
        const { reportFilter, reportProps } = this.state;
        const { report, fromDateTime, toDateTime } = this.props;

        if (this.doValidate()) {
            this.props.sendDoGenerateReport(report, fromDateTime, toDateTime, reportFilter, reportProps)
        }
    }

    handlePeriodSelected(period) {
        if (period && period.code) {
            this.props.selectFilterPeriod(period.code)
        }
    }

    handleDateTimeChange(values) {
        this.props.setDatetimeFilter(values)
    }

    handleReportFilterChange(newChangedData) {
        this.setState({ reportFilter: newChangedData });
    }

    handleReportPropsChange(newChangedData) {
        this.setState({ reportProps: newChangedData });
    }

    renderDateTimeFilter() {
        const { fieldsErrors, periods } = this.state;
        const { fromDateTime, toDateTime, workingHoursFrom, workingHoursTo } = this.props;

        let isError = _.indexOf(fieldsErrors, "datetime") >= 0;

        return (
            <div className="page-section-content-fields-group">
                <div className="page-section-field span-6">
                    <DateTimeFilter
                        showCustom
                        periods={periods}

                        error={isError}
                        from={fromDateTime}
                        to={toDateTime}
                        fromTime={workingHoursFrom}
                        toTime={workingHoursTo}

                        onTabChange={null}
                        onChange={this.handleDateTimeChange}
                        onPeriodSelected={this.handlePeriodSelected}

                        customTitle={t("Custom", "form")}

                        nowLabel={t("now", "form")}

                        fromLabel={t("From", "form")}
                        toLabel={t("To", "form")}

                        emptymessage={t("No periods found", "errors")}
                        errorMessage={t("Please select datetime range", "errors")}
                    />
                </div>
            </div>
        );
    }

    renderReportFilters() {
        const { locations } = this.props;
        const { reportFields, reportFilter, fieldsErrors } = this.state;

        if (reportFields && reportFields.length > 0) {
            return (
                <EMEditFormFieldsBuilder
                    formContext={{}}
                    locations={locations}
                    fields={reportFields}
                    fieldsErrors={fieldsErrors}
                    opened={true}

                    onDataChanged={this.handleReportFilterChange}

                    data={reportFilter}
                    changedData={reportFilter}
                />
            );
        }

        return null;
    }

    renderRenderReportParams() {
        const { locations } = this.props;
        const { propsFields, reportProps } = this.state;

        if (propsFields && propsFields.length > 0) {
            return (
                <EMEditFormFieldsBuilder
                    formContext={{}}
                    locations={locations}
                    fields={propsFields}
                    opened={true}

                    onDataChanged={this.handleReportPropsChange}

                    data={reportProps}
                    changedData={reportProps}
                />
            );
        }

        return null;
    }

    renderButtons() {
        return (
            <div className="page-section-content-buttons">
                <Button type="primary" onClick={this.doGenerate}> {t("Generate Report", "form")} </Button>
            </div>
        );
    }

    renderDebugInfo() {
        const { debug, fromDateTime, toDateTime, workingHoursFrom, workingHoursTo } = this.props;

        if (debug !== true) return null;

        return <div className="page-section-content debug-section">
            From date: {fromDateTime} <br />
            To date: {toDateTime} <br />
            WH from: {workingHoursFrom} <br />
            WH to: {workingHoursTo} <br />
        </div>;
    }

    render() {
        return (
            <div className="page-section-content">
                {this.renderDateTimeFilter()}
                {this.renderReportFilters()}
                {this.renderRenderReportParams()}
                {this.renderDebugInfo()}
                {this.renderButtons()}
            </div>
        );
    }
}

ReportDetails.propTypes = {
    locations: PropTypes.array,
    contributions: PropTypes.object,
    fromDateTime: PropTypes.number,
    toDateTime: PropTypes.number,
    workingHoursFrom: PropTypes.string,
    workingHoursTo: PropTypes.string,
    filterBy: PropTypes.object,
    reportProps: PropTypes.object,
    mostUsedPeriods: PropTypes.object,
    debug: PropTypes.bool,
    report: PropTypes.string,
    group: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
    const { contributions } = state.context;
    const { locations } = state.locations;
    const workingStartTime = locationWorkStartTime(state);

    console.log("workingStartTime: ", workingStartTime);

    const {
        fromDateTime,
        toDateTime,
        filterBy,
        props: reportProps,
        mostUsedPeriods } = state.reports;

    return {
        locations,
        contributions,
        fromDateTime,
        toDateTime,
        workingHoursFrom: workingStartTime,
        workingHoursTo: workingStartTime,
        filterBy,
        reportProps,
        mostUsedPeriods,
    };
}

const mapDispatchToProps = {
    sendDoGenerateReport,
    selectFilterPeriod,
    setDatetimeFilter
}

export default connect(mapStateToProps, mapDispatchToProps)(ReportDetails);