/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import Axios from 'axios';
import { message } from 'antd';
import { SProtBuilder } from 'airc-shell-core';
import DepartmentData from './data/department_data.json';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOjI1NTM2LCJEZXZpY2VJRCI6MSwiZXhwIjoxNTc3NTE5MDQzfQ.dXnbwFUtjcue8_LXNpir3lltj0qoDUarbZ1BDkj5Zno';

class MockApiGate {
    constructor() {
        //this.host = 'http://semw10.local:8000/api';
        //this.host = 'http://kvvw10:8822/api';
        //this.host = 'https://hetzner.air.untill.ru/api';
        //this.host = 'https://air-test.untill.ru/api';
        this.host = 'https://air-alpha.untill.ru/api';
    }


    async do(queueId, resource, params, method = 'get') {
        const m = method ? method.toLowerCase() : 'get';

        const config = {}
        config.headers = {
            'Authorization': `Bearer ${token}`
        };

        if (Axios[m]) {
            let prom = null;

            switch (m) {
                case 'delete': 
                case 'head': 
                case 'options': 
                case 'get': prom =  Axios[m](`${this.host}/${queueId}/${resource}`, params); break;
                
                case 'post':
                case 'put':
                case 'patch': prom =  Axios[m](`${this.host}/${queueId}/${resource}`, params, config); break;

                default: break;
            }
         
            if (prom) {
                return prom.then((e) => {
                    if (e.data && e.status === 200) {
                        return e.data;
                    } else {
                        throw new Error(e.data.Data);
                    }
                });
            }
        }
        
        throw new Error(`method "${m}" not alowed at Axios`);
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

    async conf(operations, wsids, timestamp, offset) {
        //todo
        console.log('Conf method call:', token, operations, wsids, timestamp, offset);

        return {};
    }
    
    async collection(type, wsids, props) {
        const { entries, page, page_size, show_deleted } = props;
        
        let response = {
            "sections": [],
            "status": 200,
        }
        let resultData = {};

        if (type === "department") {
            console.log('DepartmentData', DepartmentData);
            response = DepartmentData;
        } else if (type === "void_reasons") {
            response["status"] = 501;
            response["errorDescription"] = "Void reasons scheme not implemented yet.";
        }

        //todo
        console.log('collection method call:', type, wsids, entries, page, page_size, show_deleted);

        if (response && response["sections"] && _.isArray(response["sections"])) {
            console.log("Response: ", response);
            const builder = new SProtBuilder();
            resultData = builder.build(response["sections"]);

            console.log("Collections build result: ", resultData);
        }

        return resultData;
    }

    async sync(entries) {
        //todo
        console.log('sync method call:', token, entries);

        return {};
    }

    async log(wsids, props) {
        //todo
        console.log('log method call:', token, props);

        return {};
    }
}

export default MockApiGate;
