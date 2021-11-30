/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ListTable } from '../common/';

import {
    TYPE_REPORTS,
    C_REPORT_NAME,
    C_REPORT_GENERATOR
} from '../../classes/contributions/Types';

class RListTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            reportData: []
        }
    }

    componentDidMount() {
        this.buildTableData();
    }

    componentDidUpdate(oldProps) {
        if (oldProps.data !== this.props.data) {
            this.buildTableData();
        }
    }

    buildTableData() {
        const { data, contributions, report, reportProps } = this.props;

        let reportData = null;
        let generator = null;

        if (data && _.size(data) > 0) {
            generator = contributions.getPointContributionValue(TYPE_REPORTS, report, C_REPORT_GENERATOR);

            if (generator && _.isFunction(generator)) {
                reportData = generator(data, reportProps);
            }
        }

        if (!reportData || !_.isArray(reportData)) {
            reportData = [];
        }

        this.setState({
            reportData
        });
    }

    renderTableTitle() {
        const { report, showTitle, contributions } = this.props;

        if (showTitle === true) {
            const title = contributions.getPointContributionValue(TYPE_REPORTS, report, C_REPORT_NAME);

            if (title && _.isString(title)) {
                return (<div className="untill-base-table-title">{title}</div>);
            }
        }

        return null;
    }

    render() {
        const { reportData } = this.state;
        const { report, loading, showTotal } = this.props;

        return (
            <>
                {this.renderTableTitle()}
                <ListTable
                    entity={report}
                    loading={loading}
                    data={reportData}
                    showTotal={showTotal}

                    manual={false}
                    rowActions={[]}
                    headerActions={[]}

                />
            </>
        )
    }
}

RListTable.propTypes = {
    showTitle: PropTypes.bool,
    showTotal: PropTypes.bool,
    loading: PropTypes.bool,
    reportProps: PropTypes.object,
    contributions: PropTypes.object.isRequired,
    report: PropTypes.string.isRequired,
    data: PropTypes.array,
};

export default RListTable;
