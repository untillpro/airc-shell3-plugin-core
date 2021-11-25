/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

class ImageSetSelectorElement extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            visible: false
        };

        this._onLoad = this._onLoad.bind(this);
    }

    _onLoad() {
        this.setState({ visible: true });
    }

    render() {
        const { src, current, contain, cover, onClick, onDoubleClick } = this.props;

        return (
            <div 
                className={cn('grid-element', '--preloader-bg-32-32-gray', { current, contain, cover })} 
                onClick={onClick}
                onDoubleClick={onDoubleClick}
            >
                <div 
                    className="image"
                    style={{ 
                        display: this.state.visible ? 'block' : 'none',
                        backgroundImage: 'url(' + src + ')' 
                    }}
                >
                    <img src={src} onLoad={this._onLoad} alt="" />
                </div>
            </div>
        );
    }
}

ImageSetSelectorElement.propTypes = {
    formContext: PropTypes.object,
    locations: PropTypes.arrayOf(PropTypes.number),
    autoFocus: PropTypes.bool,
    entity: PropTypes.string,
    context: PropTypes.object,
    field: PropTypes.object.isRequired,
    disabled: PropTypes.bool,
    showError: PropTypes.bool,
    errors: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.any,
    data: PropTypes.object,
    classifiers: PropTypes.object,
    isNew: PropTypes.bool,
    isCopy: PropTypes.bool,
};

export default ImageSetSelectorElement;