/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Empty, message } from 'antd';

class TableAreaImageSelect extends PureComponent {
    constructor(props) {
        super(props);

        this.onSuccess = this.onSuccess.bind(this);
        this.onError = this.onError.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
    }

    handleFileChange(fileData) {
        const { context, locations } = this.props;
        const { api } = context;

        let file = null;

        if (fileData && fileData.target && fileData.target.files) {
            file = fileData.target.files[0];

            if (file && file instanceof File && "blob" in api) {
                let wsid = locations[0];

                api.blob(wsid, file)
                    .then((resp) => {
                        this.onSuccess(resp);
                        return resp;

                    }).catch((err) => {
                        console.error(err);
                        this.onError(err)
                        return err;
                    });
            }
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
    locations: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default TableAreaImageSelect;