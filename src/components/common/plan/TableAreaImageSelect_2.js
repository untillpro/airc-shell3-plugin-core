/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Empty, message } from 'antd';

const saveFile = async (context, file, onSuccess, onError) => {
    const { api } = context;

    if (file && file instanceof File && "blob" in api) {
        const options = {
            filename: "file",
            file: file,
        };

        api.blob(options)
            .then((resp) => {
                if (onSuccess && typeof onSuccess === 'function') {
                    onSuccess(resp);
                }

                return resp;

            }).catch((err) => {
                if (onError && typeof onError === 'function') {
                    onError(err)
                }

                return err;
            });
    }
};

class TableAreaImageSelect extends PureComponent {
    constructor(props) {
        super(props);

        this.onSuccess = this.onSuccess.bind(this);
        this.onError = this.onError.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
    }

    handleFileChange(fileData) {
        const { context } = this.props;

        let file = null;

        if (fileData && fileData.target && fileData.target.files) {
            file = fileData.target.files[0];

            saveFile(context, file, this.onSuccess, this.onError);
        }


    }

    onSuccess(data) {
        const { setImage } = this.props;
        const { response, status } = data;

        if (status === 200) {
            setImage(response);
        } else {
            message.error(`Something go wrong`, data);
        }
    }

    onError(error) {
        message.error(error);
    }

    render() {
        return (<div className="table-area-image-selector">
            <Empty description="Please select a plan image" />

            <label className="upload-picture-button">
                <input type="file" name="bg" required onChange={this.handleFileChange} />
                Select image
            </label>
        </div>);
    }
}

TableAreaImageSelect.propTypes = {
    context: PropTypes.object.isRequired,
    setImage: PropTypes.func.isRequired,
};

export default TableAreaImageSelect;