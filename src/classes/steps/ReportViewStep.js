/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import StateMachineStep from '../StateMachineStep';

import { isValidReport } from '../helpers';
import { MessageNotify } from '../messages';

import { 
    SAGA_FETCH_REPORT
} from '../../sagas/Types';

import { 
    TYPE_REPORTS, C_REPORT_NAME
} from '../contributions/Types';

class ReportViewStep extends StateMachineStep {
    constructor(...args) {
        super(args);

        this.reportType = null;
        this.fromDateTime = null;
        this.toDateTime = null;
        this.filterBy = {};
        this.props = {};
    }

    getName() {
        return 'ReportViewStep';
    }

    MessageInit(msg, context) {
        const { report, filterBy, props, from, to } = msg;

        if (!isValidReport(context, report)) {
            this.error(this.getName() + '.MessageInit() exception: report not specified or wrong given: ' + report);
        }

        this.reportType = report;

        if (filterBy && _.isPlainObject(filterBy)) {
            this.filterBy = filterBy;
        } else {
            this.filterBy = {};
        }

        if (props && _.isPlainObject(props)) {
            this.props = props;
        } else {
            this.props = {};
        }

        if (from && _.isNumber(from)) {
            this.fromDateTime = from;
        }

        if (to && _.isNumber(to)) {
            this.toDateTime = to;
        }

        return this.fetchReportData();
    }

    MessageGenerateReport(msg, context) {
        //const { contributions } = context;
        const { report, filterBy, props, from, to } = msg;

        if (report && typeof report === 'string') {
            this.reportType = report;
        }

        if (filterBy && _.isPlainObject(filterBy)) {
            this.filterBy = filterBy;
        }

        if (props && _.isPlainObject(props)) {
            this.props = props;
        }
        if (from && _.isNumber(from)) {
            this.fromDateTime = from;
        }

        if (to && _.isNumber(to)) {
            this.toDateTime = to;
        }

        return this.fetchReportData();
    }

    MessageDateFilterChanged(msg, context) {
        // TODO 
    }

    fetchReportData(context) {
        return {
            action: {
                type: SAGA_FETCH_REPORT,
                payload: {
                    report: this.reportType,
                    from: this.fromDateTime,
                    to: this.toDateTime,
                    filterBy: this.filterBy || {},
                    props: this.props || {}
                }
            }
        };
    }

    MessageCancel() {
        return {
            pop: true,
            message: new MessageNotify()
        };
    }

    MessageBreadcrumbSelected(msg) {
        const { uid } = msg;

        if (uid !== this.uid) {
            return {
                pop: true,
                message: msg,
            };
        }
    }

    breadcrumb(context) {
        const { contributions } = context;
        let text = this.reportType;

        if (contributions) {
            let name = contributions.getPointContributionValue(TYPE_REPORTS, text, C_REPORT_NAME);

            if (name && typeof name === 'function') {
                text = name();
            } else {
                text = name;
            }
        }

        return {
            "text": text,
            "uid": this.uid
        };
    }
}

export default ReportViewStep;