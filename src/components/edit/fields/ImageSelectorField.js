/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ImageSelector, Tip, translate as t  } from 'airc-shell-core';

import {
    sendError
} from '../../../actions/MessagesActions';

import { getFileSize } from '../../../classes/helpers';

class ImageSelecotrField extends Component {
    handleChange(value = null) {
        const { onChange, field } = this.props;
        const { accessor } = field;

        if (onChange && typeof onChange === 'function' ) {
            onChange({[accessor]: value});
        }
    }

    renderTip() {
        const { maxImageSize } = this.props;

        if (maxImageSize && typeof maxImageSize === 'number' && maxImageSize > 0) {
            const size = getFileSize(maxImageSize);
            
            return <Tip text={t("Max image size: {{size}}", "form", {size: size.formated})} />
        }
    }

    render() {
        const { value, field, disabled, maxImageSize } = this.props;

        if (!field) return null;

        const size = getFileSize(maxImageSize);

        return (
            <Fragment>
                <ImageSelector 
                    disabled={disabled}
                    value={value}
                    maxImageSize={maxImageSize}
                    onChange={(event) => this.handleChange(event)}  
                    onError={(error) => {
                        this.props.sendError(error)
                    }}
                    dictionary={{
                        "Save": t("Save", "common"),
                        "Ok": t("Ok", "common"),
                        "Edit image": t("Edit image", "form"),
                        "Select image": t("Select image", "form"),
                        "Select an image": t("Select an image", "form"),
                        "Image max size exceeded.": t("Image max size exceeded. Available max image size {{size}}", "form", { size }),
                        "Delete image?": t("Delete image?", "form"),
                        "Are you sure delete image?": t("Are you sure delete image?", "form"),
                        "Upload image file:": t("Upload image file:", "form"),
                        "Width (px):": t("Width (px):", "form"),
                        "Height (px):": t("Height (px)", "form"),
                        "Yes": t("Yes", "common"),
                        "No": t("No", "common"),
                        
                    }}
                />

                {this.renderTip()}
            </Fragment>
        );
    }
}

ImageSelecotrField.propTypes = {
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

const mapStateToProps = (state) => {
    const { maxUploadImageSize } = state.options;

    return {
        maxImageSize: maxUploadImageSize
    }
};

export default connect(mapStateToProps, {sendError})(ImageSelecotrField);