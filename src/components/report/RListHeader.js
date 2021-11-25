/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate as t } from 'airc-shell-core';
import { connect } from 'react-redux';
import { Button, DateTimeFilterModal } from 'airc-shell-core';
import {
    ReloadOutlined
} from '@ant-design/icons';

import { getDatetimePeriods } from '../../classes/helpers';
import { sendDoGenerateReport } from '../../actions';

class RListHeader extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            periods: []
        };

        this.handleDateFilterChange = this.handleDateFilterChange.bind(this);
        this.handleRefreshPressed = this.handleRefreshPressed.bind(this);
    }

    componentDidMount() {
        const { contributions, mostUsedPeriods } = this.props;
        let periods = getDatetimePeriods(contributions, mostUsedPeriods);

        this.setState({ periods });
    }

    handleRefreshPressed() {
        this.props.sendDoGenerateReport();
    }

    handleDateFilterChange(values) {
        let from, to = null;

        if (values && _.isArray(values)) {
            from = values[0] || null;
            to = values[1] || null;
        }

        this.props.sendDoGenerateReport(null, from, to);
    }

    renderFilter() {
        const { periods } = this.state;
        const { fromDateTime, toDateTime, workingHoursFrom, workingHoursTo } = this.props;

        return (
            <div className='untill-base-table-header-togglers'>
                <DateTimeFilterModal
                    showCustom
                    periods={periods}

                    from={fromDateTime}
                    to={toDateTime}
                    fromTime={workingHoursFrom}
                    toTime={workingHoursTo}

                    format="DD/MM/YYYY HH:mm"

                    onChange={this.handleDateFilterChange}

                    customTitle={t("Custom", "form")}
                    nowLabel={t("now", "form")}

                    fromLabel={t("From", "form")}
                    toLabel={t("To", "form")}

                    emptymessage={t("No periods found", "errors")}
                    errorMessage={t("Please select datetime range", "errors")}
                />
            </div>
        );
    }

    renderActions() {
        const { loading } = this.props;

        return (
            <div className='untill-base-table-header-actions'>
                <Button
                    disabled={loading}
                    icon={<ReloadOutlined />}
                    key='header-action-add'
                    onClick={this.handleRefreshPressed}
                />
            </div>
        );
    }

    render() {
        return (
            <div className='untill-base-table-header header-actions'>
                {this.renderFilter()}
                {this.renderActions()}
            </div>
        );
    }
}

RListHeader.propTypes = {
    contributions: PropTypes.object.isRequired,
    fromDateTime: PropTypes.object,
    toDateTime: PropTypes.object,
    workingHoursFrom: PropTypes.object,
    workingHoursTo: PropTypes.object,
    mostUsedPeriods: PropTypes.array,
};

const mapStateToProps = (state) => {
    const { contributions } = state.context;
    const {
        fromDateTime,
        toDateTime,
        workingHoursFrom,
        workingHoursTo,
        mostUsedPeriods
    } = state.reports;


    return {
        contributions,
        fromDateTime,
        toDateTime,
        workingHoursFrom,
        workingHoursTo,
        mostUsedPeriods
    };
};

export default connect(mapStateToProps, {
    sendDoGenerateReport
})(RListHeader);
