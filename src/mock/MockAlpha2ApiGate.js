/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import axios from 'axios';
import qs from 'qs';

import { Logger } from 'airc-shell-core';
import { message } from 'antd';
import { ResponseBuilder, CUDBuilder, ResponseErrorBuilder } from './utils';
//import TablePlanData from './data/table_plan.json';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOjI1NTM2LCJEZXZpY2VJRCI6MSwiZXhwIjoxNTc3NTE5MDQzfQ.dXnbwFUtjcue8_LXNpir3lltj0qoDUarbZ1BDkj5Zno';
const uploadFileAction = "https://badrequest.ru/tests/uploader/write.php";

const FUNC_COLLECTION_NAME = 'q.air.collection';
const FUNC_CDOC_NAME = 'q.air.cdoc';
const FUNC_CUD_NAME = 'c.sys.CUD';

class MockAlpha2ApiGate {
    constructor(callback) {
        this.name = "MockAlpha2ApiGate";
        this.host = 'https://alpha.dev.untill.ru/api';
        //this.host = 'https://rc.dev.untill.ru/api';

        if (callback && typeof callback === 'function') {
            callback();
        }
    }

    async do(application, wsid, func, params, method = 'get') {
        this.print('this.do call: ', application, wsid, func, params, method);

        let data = {};

        if (params) {
            if (typeof params === 'string') {
                try {
                    const parsedData = JSON.parse(params);

                    if (parsedData) {
                        data = { ...data, ...parsedData };
                    }
                } catch (e) {
                    console.error('Wrong params format in api.invoke() method: json string or object expected', params)
                }

            } else if (typeof params === 'object') {
                data = { ...data, ...params };
            }
        }

        return new Promise(async (resolve, reject) => {
            const m = method ? method.toLowerCase() : 'post';
            const config = this._addAuthHeader({});

            //let url = URLToolkit.buildAbsoluteURL(this.host, application, wsid, func);
            let url = `${this.host}/${application}/${wsid}/${func}`;

            if (m === 'get') {
                config.params = data;
                config.paramsSerializer = params => {
                    return qs.stringify(params, { arrayFormat: 'repeat' })
                }
            } else {
                config.data = data;
            }

            config.method = m;
            config.validateStatus = () => true;

            try {
                let resp = await axios(url, config);
                resolve(new ResponseBuilder(resp));
            } catch (e) {
                //resolve(new ResponseErrorBuilder(e));
                reject(e);
            }
        }).catch(e => {
            throw new ResponseErrorBuilder(e);
        });
    }

    async sendError(text) {
        message.error(text.toString());
    }

    async sendSuccess(text) {
        message.success(text.toString());
    }

    async sendWarning(text) {
        message.warning(text.toString());
    }

    async sendInfo(text) {
        message.info(text.toString());
    }

    async sendLocations(locations) {
        this.print('+++ Mock call of api.sendLocations() with locations: ', locations);
    };

    /**
     * url example: POST http://127.0.0.1:8822/api/airs-bp/1/c.sys.CUD
     * 
     * 
     * @param {object[]} operations 
     * @param {int} wsid 
     * @returns Promise
     */
    async conf(operations, wsid) {
        this.print('+++ conf method call:', operations, wsid);

        const params = {};

        let location = this._checkWSID(wsid);

        if (operations) {
            let builder = new CUDBuilder();
            params['cuds'] = builder.build(operations);
        } else {
            throw new Error('Wrong "operations" prop: expected an array of objects, received' + operations);
        }

        const response = await this.do("airs-bp", location, FUNC_CUD_NAME, params, "post");

        if (response.isError()) {
            throw new Error(response.getErrorMessage());
        }

        return response;
    }

    //
    async object(wsid, id) {
        const params = {
            "args": { id },
            "elements": [
                {
                    "fields": [
                        "result"
                    ]
                }
            ]
        };

        return this.do("airs-bp", wsid, FUNC_CDOC_NAME, params, "post").then((response) => {
            Logger.log(response, '+++ api.object result');

            if (response.isError()) {
                throw new Error(response.getErrorMessage());
            }

            let result = {};

            try {
                let jsonData = response.getData().result[0][0][0][0];
                Logger.log(jsonData, "jsonData");
                result = JSON.parse(jsonData);

                Logger.log(result, "result: ");
            } catch (e) {
                Logger.error(e);
                result = {};
            }

            Logger.log(result, '+++ resultData');

            return result;
        }).catch((e) => {
            Logger.error(e);
            throw e;
        });
    }

    //{application}/{wsid}/{function}
    //Mock api call for /collection/ function
    async collection(scheme, wsid, props = {}) {
        const { elements, filters, orderBy, start_from, count } = props;

        this.print("Api.Collection func call: ", scheme, wsid, props);

        let location = this._checkWSID(wsid);

        let params = {
            'args': {
                'schema': scheme
            },
            'elements': elements || null,
            'filters': filters || null,
            'orderBy': orderBy || null,
            'startFrom': start_from || null,
            'count': count || null,
            //'orderBy': ['']
        }

        return this.do("airs-bp", location, FUNC_COLLECTION_NAME, params, "post").then((response) => {
            Logger.log(response, '+++ api.collection result');

            if (response.isError()) {
                throw new Error(response.getErrorMessage());
            }

            Logger.log(response.getData(), '+++ resultData');

            return response.getData();
        }).catch((e) => {
            console.error(e);
            throw e;
        });
    }

    async sync(entries) {
        Logger.log({ token, entries }, 'sync method call:',);

        return {};
    }

    async log(wsids, props) {
        Logger.log({ wsids, props }, 'log call with props: ');

        const { from, to, type, from_offset, to_offset, show, filterBy, required_classifiers } = props;

        const params = {};
        let location = null;

        if (wsids && _.isArray(wsids)) {
            location = parseInt(wsids[0], 10);
            params["WSIDs"] = wsids;
        } else {
            throw new Error('api.log() call error: workspace IDs not specified or wrong given: ' + wsids);
        }

        if (_.isNumber(from) && from >= 0) {
            params['FromDateTime'] = parseInt(from);
        }

        if (_.isNumber(to) && to > 0) {
            params['ToDateTime'] = parseInt(to);
        }

        if (!_.isNil(type)) {
            if (_.isString(type)) {
                params['Type'] = [type];
            } else if (_.isArray(type)) {
                params['Type'] = type;
            }
        }

        if (from_offset) {
            params['FromOffset'] = parseInt(from_offset);
        } else {
            params['FromOffset'] = 0;
        }

        if (to_offset && to_offset > 0) {
            params['ToOffset'] = parseInt(to_offset);
        }

        if (filterBy) {
            if (_.isPlainObject(filterBy)) {
                params['FilterBy'] = JSON.stringify(filterBy);
            } else if (_.isString(filterBy)) {
                params['FilterBy'] = filterBy;
            }
        }

        if (required_classifiers && _.isArray(required_classifiers)) {
            params['RequiredClassifiers'] = required_classifiers;
        }

        params['Show'] = !!show;

        const path = `${location}/log`;

        return this.do(`airs-bp`, path, params, 'post').then((response) => {
            Logger.log(response, '+++ api.log result');

            if (response.isError()) {
                throw new Error(response.getErrorMessage());
            }

            Logger.log(response.getData(), '+++ resultData');

            return response.getData();
        });
    }

    async blob(option) {
        const method = 'post';
        const options = { ...option, method, action: uploadFileAction };
        
        /*
        if (option.onProgress && xhr.upload) {
            xhr.upload.onprogress = function progress(e) {
                if (e.total > 0) {
                    e.percent = (e.loaded / e.total) * 100;
                }
                option.onProgress(e);
            };
        }
        */

        const formData = new FormData();

        if (options.file instanceof Blob) {
            formData.append(options.filename, options.file, options.file.name);
        } else {
            formData.append(options.filename, options.file);
        }

        const that = this;

        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();

            xhr.open(method, options.action, true);

            if (options.withCredentials && 'withCredentials' in xhr) {
                xhr.withCredentials = true;
            }

            const headers = options.headers || {};

            if (headers['X-Requested-With'] !== null) {
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            }

            Object.keys(headers).forEach(h => {
                if (headers[h] !== null) {
                    xhr.setRequestHeader(h, headers[h]);
                }
            });

            xhr.onload = function () {
                const data = {
                    response: that._getBody(xhr),
                    status: this.status,
                    statusText: xhr.statusText,
                };

                if (this.status >= 200 && this.status < 300) {
                    resolve(data);
                } else {
                    reject(that._getError(options, xhr));
                }
            };

            xhr.onerror = function () {
                reject(that._getError(options, xhr));
            };

            xhr.send(formData);
        });
    }

    // ----- private methods -----

    _checkWSID(wsid) {
        if (_.isNumber(wsid) && wsid > 0) {
            return wsid;
        } else {
            throw new Error('Wrong "WSID" given: an integer expected; received ', wsid);
        }
    }

    _addAuthHeader(conf) {
        conf.headers = {
            'Authorization': `Bearer ${token}`
        };

        return conf;
    }

    _getError(option, xhr) {
        const msg = `cannot ${option.method} ${option.action} ${xhr.status}'`;
        const err = new Error(msg);

        err.status = xhr.status;
        err.method = option.method;
        err.url = option.action;

        return {
            response: this._getBody(xhr),
            status: xhr.status,
            statusText: xhr.statusText,
            message: msg,
            method: option.method,
            url: option.action,
        };
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

    print(label, ...args) {
        Logger.log(label, args);
    }
}

export default MockAlpha2ApiGate;
