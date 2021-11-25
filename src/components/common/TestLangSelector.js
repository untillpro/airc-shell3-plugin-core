/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import lc from 'langcode-info';
import { Select } from 'antd';
import { setLanguage } from '../../actions/';

const { Option } = Select;

const MOCK_LANG = {
    "enEN": "0000",
    "ruRU": "0419",
    "nlNL": "0413"
};

class TestLangSelector extends PureComponent {
    constructor() {
        super();

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(code) {
        if (MOCK_LANG[code]) {
            this.props.setLanguage(MOCK_LANG[code]);
        }
    }

    render() {
        const { currentLanguage } = this.props;

        return (<div className="test-lang-selector" >
            <Select defaultValue={currentLanguage}
                onChange={this.handleChange}
                style={
                    { width: "100%" }
                }
            >
                {_.map(MOCK_LANG, (hex, lex) => {
                    return (
                        <Option key={`opt_${lex}`}
                            value={lex} > {lc.langByHex(hex).name()}
                        </Option>
                    );
                })}
            </Select >
        </div >
        );
    }
}

TestLangSelector.propTypes = {
    currentLanguage: PropTypes.string,
    setLanguage: PropTypes.func.isRequired
};

const mapStateToPtops = (state) => {
    const { currentLanguage } = state.options;

    return { currentLanguage };
};

const mapDispatchToProps = { setLanguage };


export default connect(mapStateToPtops, mapDispatchToProps)(TestLangSelector);