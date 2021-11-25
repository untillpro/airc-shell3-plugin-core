/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

class HeaderBackButton extends Component {
    handleClick() {
        const { onClick } = this.props;

        if (onClick && typeof onClick === 'function') {
            onClick();
        }
    }

    render() {
        return (
            <div 
                className='content-header-back' 
                onClick={this.handleClick.bind(this)}
            >
                <i className='icon-arrow-left' />
            </div>
        );
    }
}

HeaderBackButton.propTypes = {
    onClick: PropTypes.func.isRequired,
};

export default HeaderBackButton;