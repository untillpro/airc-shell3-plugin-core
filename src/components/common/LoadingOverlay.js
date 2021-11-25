/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

class LoadingOverlay extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      show: false
    };
  }

  componentDidMount() {
    if (this.props.show) {
      this.setState({ show: true });
    }
  }

  componentDidUpdate() {
    if (this.props.show !== this.state.show) {
      if (this.props.show === true) {
        this.setState({ show: true});
      } else {
        this.setState({ show: false});
      }
    }
  }

  render() {
    return (
      <div className={cn('loading-overlay', {'_active': this.state.show})}>
        <div>{this.props.text}</div>
      </div>
    );
  }
};

LoadingOverlay.propTypes = {
  show: PropTypes.bool,
};


export default LoadingOverlay;