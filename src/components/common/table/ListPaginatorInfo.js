/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import { translate as t } from 'airc-shell-core';
import PropTypes from 'prop-types';

class ListPaginatorInfo extends Component {
    render() {
        const { page: p, pageSize: s, total } = this.props;

        if (total <= 0) {
            return null;
        }
        
        const from = p * s + 1;
        const to  = (p + 1) * s;
        
        return (
            <div>
                {t("{{from}} - {{to}} out of {{total}} items", "list", {from, to: to < total ? to : total, total})} 
            </div>
        );
    }
}

ListPaginatorInfo.propTypes = {
    page: PropTypes.number,
    pageSize: PropTypes.number,
    total: PropTypes.number
};

export default ListPaginatorInfo;
