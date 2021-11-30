/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import _ from 'lodash';
import { SProtBuilder } from 'airc-shell-core';

export default class ResponseBuilder {
    constructor(response) {

        if (typeof response !== 'object') {
            throw new TypeError('You must pass an object as a response parameter');
        }

        this._response = response;
        this._data = this._buildData();
        this._status = this._buildStatus();
        this._error = this._buildError();
    }

    _buildData() {
        try {
            let data = this._response.data;

            if (typeof data === 'object') {
                if (data && data["sections"] && _.isArray(data["sections"])) {
                    const builder = new SProtBuilder();
                    data = builder.build(data["sections"]);
                }
            } else if (typeof data === 'string') {
                data = JSON.parse(data);
            }

            return data;
        } catch (e) {
            return null;
        }
    }

    _buildStatus() {
        if (this._response && this._response.status) {
            return parseInt(this._response.status, 10);
        }

        if (this._data && "statusCode" in this._data) {
            return parseInt(this._data["statusCode"], 10);
        }

        return -1;
    }

    _buildError() {
        if (this._response && this._response.status !== 200) {
            return String(this._response.data);
        }

        if (this._data && "statusCode" in this._data) {
            return String(this._data["errorDescription"]);
        }

        return null;
    }


    isError() {
        if (this._status !== 200) {
            return true;
        }

        return false;
    }

    getStatus() {
        return this._status;
    }

    getData() {
        return this._data;
    }

    getErrorMessage() {
        return this._error;
    }
}