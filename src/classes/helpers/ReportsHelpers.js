/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import moment from 'moment';

import {
    TYPE_CHARTS,
    TYPE_REPORTS,
    TYPE_LIST,
    C_LIST_COLUMNS,
    C_REPORT_GENERATOR,
    C_REPORT_EVENT_TYPE,
    C_REPORT_COMPLEX,
    C_REPORT_COMPLEX_TYPE,
    C_REPORT_FIELDS,
    C_CHART_ELEMENTS,
} from '../contributions/Types';

export const isValidReport = (context, reportCode) => {
    const { contributions } = context;

    if (!reportCode || typeof reportCode !== 'string') {
        throw new Error(`wrong report code provided. Expected "string" but received "${typeof reportCode}"`);
    }

    // check for report contribution point
    let reportPoint = contributions.getPoint(TYPE_REPORTS, reportCode);

    if (!reportPoint) {
        throw new Error(`can't find report contribution with id "${reportCode}"`);
    }

    let event_type = reportPoint.getContributuionValue(C_REPORT_EVENT_TYPE, true);

    if (!event_type || _.size(event_type) <= 0) {
        throw new Error(`no event_type prop specified or wrong given for report ${reportCode}.`);
    }

    let isComplex = reportPoint.getContributuionValue(C_REPORT_COMPLEX);

    if (isComplex) {
        let reportTypes = reportPoint.getContributuionValue(C_REPORT_COMPLEX_TYPE, true);

        if (!reportTypes || !_.isArray(reportTypes) || _.size(reportTypes) <= 0) {
            throw new Error(`the ${C_REPORT_COMPLEX_TYPE} prop should be provided for complex reports `);
        }

        try {
            _.forEach(reportTypes, (t) => isValidReport(context, t));
        } catch (e) {
            throw new Error(`${C_REPORT_COMPLEX_TYPE} prop error: ${e.message}`);
        }
    } else {
        // check for data generator function
        let generator = reportPoint.getContributuionValue(C_REPORT_GENERATOR);

        if (!generator || !_.isFunction(generator)) {
            throw new Error(`generator function is null or wrong specified for report "${reportCode}"`);
        }

        // check for list columns defined
        let columns = contributions.getPointContributionValues(TYPE_LIST, reportCode, C_LIST_COLUMNS);

        if (!columns || !_.isArray(columns) || columns.length === 0) {
            throw new Error(`no list columns specified for report "${reportCode}". Expected array of objects.`);
        }
    }

    return true;
}

export const getDatetimePeriods = (contributions, mostUsedPeriods) => {
    let periods = [];
    let allPeriods = {};

    if (contributions) {
        const groups = contributions.getPoints("periods_groups");

        _.forEach(groups, (groupCode) => {
            let groupPoint = contributions.getPoint("periods_groups", groupCode)

            if (!groupPoint) return;

            let g = {
                name: groupPoint.getContributuionValue("name"),
                code: groupCode,
                order: groupPoint.getContributuionValue("order"),
                periods: []
            }

            let p = groupPoint.getContributuionValue("periods", true);

            if (p && _.isArray(p) && p.length > 0) {
                _.forEach(p, (periodCode) => {
                    let periodPoint = contributions.getPoint("periods", periodCode)

                    if (!periodPoint) return;

                    let period = {
                        code: periodCode,
                        name: periodPoint.getContributuionValue("name"),
                        from: periodPoint.getContributuionValue("from"),
                        to: periodPoint.getContributuionValue("to")
                    };

                    allPeriods[periodCode] = period;
                    g.periods.push(period);
                });
            }

            periods.push(g);
        });

    }

    let mostUsedGroup = generateMostUsedPeriods(allPeriods, mostUsedPeriods);

    if (mostUsedGroup) {
        periods.push(mostUsedGroup);
    }

    periods = _.sortBy(periods, (o) => o.order);

    return periods;
}

const generateMostUsedPeriods = (allPeriods, mostUsedPeriods) => {
    let periods = [];
    let group = null;

    if (allPeriods && _.size(allPeriods) > 0 && mostUsedPeriods && _.size(mostUsedPeriods) > 0) {
        let pairs = _.toPairs(mostUsedPeriods)
        let p = _.sortBy(pairs, (o) => o[1]).reverse();

        p.forEach(([code, count]) => {
            if (allPeriods[code]) {
                periods.push(allPeriods[code]);
            }
        });
    }

    if (periods.length > 0) {
        group = {
            code: "most_used",
            name: "Most used",
            order: 0,
            periods
        }
    }

    return group;
}

export const prepareReportFilter = (context, reportType, filter) => {
    const resultFilter = {};

    if (_.isString(reportType) && _.isPlainObject(filter)) {
        const { contributions } = context;

        const filterFields = contributions.getPointContributionValues(TYPE_REPORTS, reportType, C_REPORT_FIELDS);

        _.forEach(filterFields, (field) => {
            const { accessor, value_accessor } = field;

            if (accessor in filter) {
                let val = filter[accessor];

                if (_.isObject(val)) {
                    resultFilter[accessor] = _.get(val, value_accessor);
                } else {
                    resultFilter[accessor] = val;
                }
            }
        });
    }

    return resultFilter;
}

export const getBokkpAccaunt = (item) => {
    if (!item || !_.isPlainObject(item)) return "";

    if (item.pbill_payments_bookp && _.isArray(item.pbill_payments_bookp)) {
        let ppb =  item.pbill_payments_bookp[0];

        if (ppb && ppb.id_bookkeeping && _.isPlainObject(ppb.id_bookkeeping)) {
            return ppb.id_bookkeeping.account;
        }
    } else if (item.id_payments && _.isPlainObject(item.id_payments) && item.id_payments.id_bookkp && _.isPlainObject(item.id_payments.id_bookk)) {
        return item.id_payments.id_bookkp.account;
    }

    return "";
};

export const prepareReportData = (data, elements) => {
    const result = {};

    

    return result;
}

export const getBillTotal = (bill) => {
    let total = 0;

    if (_.isPlainObject(bill) && _.isArray(bill.pbill_payments)) {
        _.forEach(bill.pbill_payments, (payment) => {
            total += payment.price;
        });
    }

    return total;
};

// dashboard helpers 

export const getDashboardElements = (context) => {
    const { contributions  } = context;
    const elements = [{"fields": ["day"]}];

    const points = contributions.getPoints(TYPE_CHARTS);

    _.forEach(points, (pointName) => {
        const element =  contributions.getPointContributionValue(TYPE_CHARTS, pointName, C_CHART_ELEMENTS);
        if (_.isPlainObject(element)) {
            elements.push(element);
        }
    });


    return elements;
};

export const  getDashboardDays = (context, from, to) => {
    const days = [];
    const mFrom = moment(from).startOf('day');
    const mTo = moment(to).startOf('day');

    for (let m = mFrom; m.isBefore(mTo); m.add(1, 'days')) {
        days.push(m.format('YYYYMMDD'));
    };
    
    return days.join(',');
};