/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import axios from 'axios';
import qs from 'qs';
import SSE from '../classes/sse';

import { message } from 'antd';
import { Logger, ResponseBuilder, CUDBuilder, ResponseErrorBuilder, getProjectionHandler } from 'airc-shell-core';
import pretifyData from '../classes/ResponseDataPretifier';
//import TablePlanData from './data/table_plan.json';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBcHBRTmFtZSI6InVudGlsbC9haXJzLWJwIiwiRHVyYXRpb24iOjg2NDAwMDAwMDAwMDAwLCJMb2dpbiI6InR0NiIsIkxvZ2luQ2x1c3RlcklEIjoxLCJQcm9maWxlV1NJRCI6MTQwNzM3NDg4NDg2NDYzLCJTdWJqZWN0S2luZCI6MSwiYXVkIjoicGF5bG9hZHMuUHJpbmNpcGFsUGF5bG9hZCIsImV4cCI6MTY1NTg4NjYyNiwiaWF0IjoxNjU1ODAwMjI2fQ.7NYohyMcqjWQTQEyyL2ADc8ARDT4zREIl2Kjgs3BbVI';

const initPayload = {
    "options": {
        "defaultLanguage": {
            "name": "English",
            "code": "en-EN",
            "locale": "en",
            "hex": "0000"
        },
        "currentLanguage": {
            "name": "English",
            "code": "en-EN",
            "locale": "en",
            "hex": "0000"
        },
        "locations": [
            140737488486463
        ],
        "locationsList": [
            {
                "id": 140737488486462,
                "descriptor": {
                    "sys.ID": 65539,
                    "WorkStartTime": "2022-06-21T07:00:00.000Z",
                    "DefaultCurrency": 5000000058,
                    "NextCourseTicketLayout": 5000001365,
                    "TransferTicketLayout": 5000001466,
                    "DisplayName": "TT6-1 Place"
                }
            },
            {
                "id": 140737488486463,
                "descriptor": {
                    "sys.ID": 65539,
                    "WorkStartTime": "2022-06-21T07:00:00.000Z",
                    "DefaultCurrency": 5000000058,
                    "NextCourseTicketLayout": 5000001365,
                    "TransferTicketLayout": 5000001466,
                    "DisplayName": "TT6-2 place"
                }
            }
        ]
    }
};

const FUNC_COLLECTION_NAME = '/q.sys.Collection';
const FUNC_CDOC_NAME = '/q.sys.Cdoc';
const FUNC_CUD_NAME = '/c.sys.CUD';
const FUNC_DASHBOARD_NAME = '/q.air.Dashboard';
const FUNC_JOURNAL_NAME = '/q.sys.Journal';
const FUNC_DEVICE_TOKEN_NAME = '/q.air.IssueLinkDeviceToken';
const FUNC_TRANSACTION_HISTORY = '/q.air.TransactionHistory';

class MockAlphaApiGate {
    constructor(callback, init) {
        this.name = "MockAlphaApiGate";
        this.host = 'https://alpha2.dev.untill.ru/';
        //this.host = 'https://rc2.dev.untill.ru/api';

        if (callback && typeof callback === 'function') {
            callback();
        }

        if (init && typeof init === 'function') {
            init(initPayload);
        }

        this.subscriptions = {}; // Array: SSE
    }

    async do(application, wsid, tail, params, method = 'get') {
        this.print('this.do call: ', application, wsid, tail, params, method);

        let data = {};

        if (params) {
            if (params instanceof FormData) {
                data = params;
            } else if (typeof params === 'string') {

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

            let url = `${this.host}${application}/${wsid}${tail}`;

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

    async qr(args, wsid) {
        this.print('+++ qr method call:', args, wsid);
        const elements = [{ "fields": ["deviceToken", "durationMs"] }];
        const params = { args, elements };

        let location = this._checkWSID(wsid);

        //return { "result": [[[[`mockLinkDeviceToken.${JSON.stringify(data)}.${wsid}.${Math.random(0, 1)}`, 60000]]]] };

        const response = await this.do("api/untill/airs-bp", location, FUNC_DEVICE_TOKEN_NAME, params, "post");

        if (response.isError()) {
            throw new Error(response.getErrorMessage());
        }

        let result = {};

        const data = response.getData();

        if (data && data["result"]) {
            const resultData = pretifyData(elements, data["result"]);

            if (_.isArray(resultData) && _.size(resultData) > 0) {
                result = { wsid, ...resultData[0] };
            }
        }

        return result;
    }

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

        const response = await this.do("api/untill/airs-bp", location, FUNC_CUD_NAME, params, "post");

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

        return this.do("api/untill/airs-bp", wsid, FUNC_CDOC_NAME, params, "post").then((response) => {
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

        return this.do("api/untill/airs-bp", location, FUNC_COLLECTION_NAME, params, "post").then((response) => {
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

    async log(wsid, props) {
        //console.log('log method call:', token, props);
        const { fromDay, tillDay, type, index } = props;
        const elements = [{ "fields": ["offset", "eventTime", "event"] }];
        const args = {};

        let location = this._checkWSID(wsid);

        if (_.isNumber(fromDay) && fromDay >= 0) {
            args['fromDay'] = parseInt(fromDay);
        }

        if (_.isNumber(tillDay) && tillDay > 0) {
            args['tillDay'] = parseInt(tillDay);
        }

        if (!_.isNil(type)) {
            if (_.isString(type)) {
                args['eventTypes'] = type;
            } else if (_.isArray(type)) {
                args['eventTypes'] = type.join(',');
            }
        }

        if (_.isString(index) && index.length > 0) {
            args["index"] = index;
        }

        return this.do("api/untill/airs-bp", location, FUNC_JOURNAL_NAME, { args, elements }, "post").then((response) => {
            Logger.log(response, '+++ api.collection result');

            if (response.isError()) {
                throw new Error(response.getErrorMessage());
            }

            Logger.log(response.getData(), '+++ resultData');

            let result = response.getData();

            if (result && result["result"]) {
                return pretifyData(elements, result["result"]);
            }

            return result;
        }).catch((e) => {
            console.error(e);
            throw e;
        });
    }

    async th(wsid, props) {
        const { bills, events } = props;
        const elements = [{ "fields": ["offset", "eventTime", "event"] }];
        const args = {
            "billIDs": _.isArray(bills) ? bills.join(",") : String(bills),
            "eventTypes": _.isArray(events) ? events.join(",") : String(events)
        };

        let location = this._checkWSID(wsid);

        return this.do("api/untill/airs-bp", location, FUNC_TRANSACTION_HISTORY, { args, elements }, "post").then((response) => {
            if (response.isError()) {
                throw new Error(response.getErrorMessage());
            }

            let result = response.getData();

            if (result && result["result"]) {
                return pretifyData(elements, result["result"]);
            }

            return [response.getData()];
        }).catch((e) => {
            console.error(e);
            throw e;
        });
    }

    async dashboard(wsid, props) {
        const { elements, days } = props;

        this.print("Api.dashboard func call: ", wsid, props);

        let location = this._checkWSID(wsid);

        let params = {
            'args': {
                'days': days
            },
            'elements': elements || [],
            'orderBy': [
                {
                    "field": "day"
                }
            ]
        }

        return this.do("api/untill/airs-bp", location, FUNC_DASHBOARD_NAME, params, "post").then((response) => {
            Logger.log(response, '+++ api.dashboard result');

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



    async blob(wsid, file) {
        let location = this._checkWSID(wsid);

        var formData = new FormData();
        formData.append(file.name, file, file.name);

        return this.do('blob/untill/airs-bp', location, ``, formData, "post")
            .then((response) => {
                if (response.isError()) {
                    throw new Error(response.getErrorMessage());
                }

                return ({
                    response: response.getData(),
                    status: response.getStatus(),
                });
            }).catch((e) => {
                throw e;
            });
    }

    // subscribe to projection
    async subscribe(projectionKey, handlerName) {
        /** ProjectionKey: 
         * {
                "App": "untill/airs-bp", 
                "Projection": projectionKey, 
                "WS": wsid
            }
         */

        let payload = {
            "SubjectLogin": 'mock subject', //mocked. should be passed 
            "ProjectionKey": [
                projectionKey
            ]
        }

        // const options = {
        //     headers: {
        //         'Authorization': `Bearer ${token}`,
        //          'Content-Type': 'application/json',
        //     },
        //     method: "GET",
        // }

        const key = JSON.stringify(projectionKey);
        const source = new SSE(`${this.host}n10n/channel?payload=${JSON.stringify(payload)}`);
        const handler = getProjectionHandler(handlerName);

        if (handler && typeof handler === "function") {
            source.addEventListener(key, function (e) {
                handler(JSON.parse(e.data), e.type);
            });
        }

        this.subscriptions[key] = source;
        source.stream();
    }

    // unsubscribe from projection  
    // projectionKey: object
    async unsubscribe(projectionKey) {
        const key = JSON.stringify(projectionKey);

        if (this.subscriptions[key]) {
            this.subscriptions[key].close();
            delete this.subscriptions[key];
        }
    }

    async exec(wsid, instructions) {
        if (_.isArray(instructions)) {
            let promises = [];

            instructions.forEach((inst) => {
                if (!_.isPlainObject(inst)) {
                    return;
                }

                const { method, props } = inst;

                if (_.isNil(method) || !_.isString(method)) {
                    throw new Error('Api.exec() exception: wrong instruction "method" specified. The not null string expected;');
                }

                if (!_.isFunction(this[method])) {
                    throw new Error(`Api.exec() exception: the method "${method}" is not exist in api`);
                }

                promises.push(this[method](wsid, props || {}));
            });

            return Promise.all(promises);
        }

        return [];
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

export default MockAlphaApiGate;
