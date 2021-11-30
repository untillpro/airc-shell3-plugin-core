/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

export default class ResponseErrorBuilder {
    constructor(error) {
        this._data = null;
        this._status = -1;
        this._error = error.toString();
    }

    isError() {
        return true;
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