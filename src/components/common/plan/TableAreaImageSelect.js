/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Empty, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const uploadFileAction = "https://badrequest.ru/tests/uploader/write.php"; //TODO: mock

class TableAreaImageSelect extends PureComponent {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.customRequest = this.customRequest.bind(this);

        this.state = { fileList: [] };
    }

    _getError(option, xhr) {
        const msg = `cannot ${option.method} ${option.action} ${xhr.status}'`;
        const err = new Error(msg);

        err.status = xhr.status;
        err.method = option.method;
        err.url = option.action;

        return err;
    }

    _getBody(xhr) {
        const text = xhr.responseText || xhr.response;
        if (!text) {
            return text;
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            return text;
        }
    }

    handleChange(info) {
        const { setImage } = this.props;

        if (info.file.status === 'done') {
            if (_.isFunction(setImage)) {
                if (_.isPlainObject(info.file.response)) {
                    setImage(info.file.response);
                } else {
                    message.error(info.file.response);
                }
            }

            message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
            let errMessage;

            if (info.file.response) {
                errMessage = info.file.response
            } else {
                errMessage = `${info.file.name} upload error;`;
            }

            message.error(`${errMessage}`);
        } else {
            let fileList = [...info.fileList];
            fileList = fileList.slice(-1);

            this.setState({ fileList });
        }
    }

    customRequest(option) {
        const xhr = new XMLHttpRequest();

        if (option.onProgress && xhr.upload) {
            xhr.upload.onprogress = function progress(e) {
                if (e.total > 0) {
                    e.percent = (e.loaded / e.total) * 100;
                }
                option.onProgress(e);
            };
        }

        // eslint-disable-next-line no-undef
        const formData = new FormData();

        if (option.data) {
            Object.keys(option.data).forEach(key => {
                const value = option.data[key];
                // support key-value array data
                if (Array.isArray(value)) {
                    value.forEach(item => {
                        // { list: [ 11, 22 ] }
                        // formData.append('list[]', 11);
                        formData.append(`${key}[]`, item);
                    });
                    return;
                }

                formData.append(key, option.data[key]);
            });
        }

        // eslint-disable-next-line no-undef
        if (option.file instanceof Blob) {
            formData.append(option.filename, option.file, option.file.name);
        } else {
            formData.append(option.filename, option.file);
        }

        xhr.onerror = function error(e) {
            option.onError(e);
        };

        xhr.onload = () => {
            // allow success when 2xx status
            // see https://github.com/react-component/upload/issues/34
            if (xhr.status < 200 || xhr.status >= 300) {
                return option.onError(this._getError(option, xhr), this._getBody(xhr));
            }

            return option.onSuccess(this._getBody(xhr), xhr);
        };

        xhr.open(option.method, uploadFileAction, true);

        // Has to be after `.open()`. See https://github.com/enyo/dropzone/issues/179
        if (option.withCredentials && 'withCredentials' in xhr) {
            xhr.withCredentials = true;
        }

        const headers = option.headers || {};

        // when set headers['X-Requested-With'] = null , can close default XHR header
        // see https://github.com/react-component/upload/issues/33
        if (headers['X-Requested-With'] !== null) {
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }

        Object.keys(headers).forEach(h => {
            if (headers[h] !== null) {
                xhr.setRequestHeader(h, headers[h]);
            }
        });

        xhr.send(formData);

        return {
            abort() {
                xhr.abort();
            },
        };
    }

    render() {
        const props = {
            onChange: this.handleChange,
            customRequest: this.customRequest,
            name: 'file',
            multiple: false,
            fileList: this.state.fileList,
        };

        return (<div className="table-area-image-selector">
            <Empty description="Please select a plan image" />

            <Upload {...props}>
                <Button icon={<UploadOutlined />} className="upload-button">
                    Click to Upload
                </Button>
            </Upload>
        </div>);
    }
}

TableAreaImageSelect.propTypes = {
    context: PropTypes.object.isRequired,
    setImage: PropTypes.func.isRequired,
};

export default TableAreaImageSelect;