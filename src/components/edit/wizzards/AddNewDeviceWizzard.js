import _ from 'lodash';
import React from 'react';
import QRCode from 'qrcode.react';

import {
    Alert,
    Empty,
    Collapse,
    Form,
    Radio,
    Select,
    InputNumber,
    Spin
} from 'antd';

import {
    registerProjectionHandler,
    unregisterProjectionHandler
} from 'airc-shell-core';

import { 
    requestLinkDeviceToken, 
    sendNeedRefreshDataMessage, 
    sendCancelMessage, 
    clearToken, } from '../../../actions';

import { 
    STATE_FIELD_NAME, 
    STATUS_ACTIVE, 
    SYS_ID_PROP, 
    TICKET_TYPE_PROP, 
    TICKET_BILL_TYPE,
    DEFAULT_DEVICE_TOKEN_TTL
 } from '../../../const/';


const { Panel } = Collapse;
const { Option } = Select;
const RequiredFields = ['salesMode', 'billPrinter', 'billTicket', 'tableNumber'];

class AddNewDeviceWizzard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isInit: false,
            data: {},
            printers: [],
            tickets: [],
            salesAreas: [],
            formValues: {}
        };

        this._onFormLayoutChange = this._onFormLayoutChange.bind(this);
        this.timer = null;
    }

    componentDidMount() {
        const { api, classifiers, dispatch } = this.props;
        let printers = [];
        let tickets = [];
        let salesAreas = [];
        let formValues = {
            salesMode: 1,
            tableNumber: 1
        };

        if (classifiers["untill.printers"]) {
            printers = _.reduce(classifiers["untill.printers"], (result, value) => {
                if (value[STATE_FIELD_NAME] === STATUS_ACTIVE) {
                    result.push(value);
                }

                return result;
            }, []);

        }

        if (classifiers["untill.tickets"]) {
            tickets = _.reduce(classifiers["untill.tickets"], (result, value) => {
                if (value[STATE_FIELD_NAME] === STATUS_ACTIVE) {
                    result.push(value);
                }

                return result;
            }, []);
        }

        if (classifiers["untill.sales_area"]) {
            salesAreas = _.reduce(classifiers["untill.sales_area"], (result, value) => {
                if (value[STATE_FIELD_NAME] === STATUS_ACTIVE) {
                    result.push(value);
                }

                return result;
            }, []);
        }

        formValues.billPrinter = this._getDefaultValue(printers);
        formValues.salesArea = this._getDefaultValue(salesAreas);
        formValues.billTicket = this._getDefaultValue(tickets, TICKET_BILL_TYPE, TICKET_TYPE_PROP);

        this.setState({
            printers,
            tickets,
            salesAreas,
            formValues,
            isInit: true
        });

        registerProjectionHandler('airDeviceWizzardHandler', () => {
            console.log("airDeviceWizzardHandler");
            dispatch(sendCancelMessage);
            //dispatch(sendNeedRefreshDataMessage);
        });

        api.subscribe(this._key(this.props), "airDeviceWizzardHandler");
    }

    componentDidUpdate(oldProps, oldState) {
        const { dispatch, state } = this.props;
        const { deviceLinkToken, deviceTokenTtl } = state;


        if (!_.isEqual(this.state.formValues, oldState.formValues) && this._checkFields(this.state.formValues)) {
            dispatch(requestLinkDeviceToken(this.state.formValues));
        }

        if (deviceLinkToken !== oldProps.state.deviceLinkToken) {
            if (this.timer != null) {
                clearTimeout(this.timer);
            }

            console.log("deviceTokenTtl:", deviceTokenTtl);

            this.timer = setTimeout(() => {
                dispatch(requestLinkDeviceToken(this.state.formValues));
            }, deviceTokenTtl || DEFAULT_DEVICE_TOKEN_TTL);
        }
    }

    componentWillUnmount() {
        const { dispatch, api } = this.props;

        api.unsubscribe(this._key(this.props));
        unregisterProjectionHandler('airDeviceWizzardHandler');

        dispatch(clearToken());

        clearTimeout(this.timer);
    }

    _key(props) {
        return {
            "App": "untill/airs-bp",
            "Projection": "ComputersDeviceProfileWSIDIdx",
            "WS": props.location
        };
    }

    _checkFields(values) {
        for (let field of RequiredFields) {
            if (_.isNil(values[field])) {
                return false;
            }
        }

        return true;
    }

    _onFormLayoutChange(values) {
        this.setState({
            formValues: { ...this.state.formValues, ...values }
        });
    }

    _getDefaultValue(values, type, typeProp = TICKET_TYPE_PROP) {
        if (_.isArray(values) && _.size(values) > 0) {
            if (_.isNil(type)) {
                return values[0][SYS_ID_PROP];
            }

            let index = _.findIndex(values, (t) => t[typeProp] === type);
            if (index >= 0) {
                return values[index][SYS_ID_PROP];
            }
        }

        return null;
    }

    _getOptions(values, key) {
        let ops = [];

        _.forEach(values, (val) => {
            let id = val[SYS_ID_PROP];
            ops.push(<Option key={`${key}${id}`} value={id}>{val['name']}</Option>);
        });

        return ops;

    }

    _ticketsByType(type) {
        const { tickets } = this.state;

        const res = [];

        _.forEach(tickets, (ticket) => {
            if (_.isNil(type) || ticket[TICKET_TYPE_PROP] === type) {
                res.push(ticket);
            }
        });

        return res;
    }

    renderQRCode() {
        const { state, location } = this.props;
        const { deviceLinkToken } = state;

        if (deviceLinkToken) {
            let data = JSON.stringify({"wsid": location, "token": deviceLinkToken});

            return <div className="qr-code"><QRCode value={data} size={400} /></div>;
        }

        return <Empty description={"No token to display QR-code"} />;
    }

    checkIsLinkAvailable() {
        const { printers, salesAreas } = this.state;
        const errors = [];

        if (printers.length === 0) {
            errors.push([
                "No printers defined",
                "There is no active printers defined in the current location. Please, add atleast one printer before adding Device"
            ]);

        }

        if (salesAreas.length === 0) {
            errors.push([
                "No sales areas defined",
                "There is no active sales areas defined in the current location. Please, add atleast one sales area before adding Device"
            ]);
        }

        if (this._ticketsByType(TICKET_BILL_TYPE).length === 0) {
            errors.push([
                "No bill tickets defined",
                "There is no bill tickets defined in the current location. Please, add atleast one bill ticket before adding Device"
            ]);
        }

        return errors.map((err) => (
            <Alert
                message={err[0]}
                description={err[1]}
                type="error"
                showIcon
            />
        ));
    }

    render() {
        const { isInit, formValues, printers, salesAreas } = this.state;
        const { salesMode } = formValues;

        if (!isInit) {
            return (<div className="plugin-wizzard-container">
                <div className="loading">
                    <Spin />
                </div>
            </div>);
        }

        const errors = this.checkIsLinkAvailable();
        const tickets = this._ticketsByType(TICKET_BILL_TYPE);

        const printerOptions = this._getOptions(printers, "printer_");
        const ticketOptions = this._getOptions(tickets, "ticket_");
        const salesAreaOptions = this._getOptions(salesAreas, "sales_area_");

        return (
            <div className="plugin-wizzard-container">
                <div className="plugin-wizzard-header">
                    New Device

                    <div className="sub-header">
                        Please scan QR-code below with your device
                    </div>
                </div>

                {errors.length > 0 ? errors : (
                    <div className="_row">
                        <div className="plugin-wizzard-qr-code-container">
                            {this.renderQRCode()}
                        </div>

                        <div className="plugin-wizzard-form-container">
                            <Form
                                labelCol={{ span: 4 }}
                                wrapperCol={{ span: 10 }}
                                layout="vertical"
                                initialValues={formValues}
                                onValuesChange={this._onFormLayoutChange}
                            >
                                <Form.Item label="Sales kind" name="salesMode" normalize={(value) => parseInt(value, 10)}>
                                    <Radio.Group>
                                        <Radio.Button value={1}>Table overview</Radio.Button>
                                        <Radio.Button value={2}>Direct sales</Radio.Button>
                                    </Radio.Group>
                                </Form.Item>

                                <Form.Item
                                    label="Table number"
                                    name="tableNumber"
                                    rules={[{ required: true }]}
                                >
                                    <InputNumber />
                                </Form.Item>

                                {salesMode === 2 ? (
                                    <Form.Item
                                        label={"Sales area"}
                                        name="salesArea"
                                        rules={[{ required: true }]}
                                    >
                                        <Select placeholder="Select printer" disabled={salesAreaOptions.length <= 1}>
                                            {salesAreaOptions}
                                        </Select>
                                    </Form.Item>
                                ) : null}


                                <Collapse bordered={false} className="plugin-wizzard-collapse">
                                    <Panel header="Advanced settings" key="1">


                                        <Form.Item
                                            label={"Bill printer"}
                                            name="billPrinter"
                                            rules={[{ required: true }]}
                                        >
                                            <Select placeholder="Select printer" disabled={printerOptions.length <= 1}>
                                                {printerOptions}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            label={"Bill ticket"}
                                            name="billTicket"
                                            rules={[{ required: true }]}
                                        >
                                            <Select placeholder="Select ticket layout" disabled={ticketOptions.length <= 1}>
                                                {ticketOptions}
                                            </Select>
                                        </Form.Item>
                                    </Panel>
                                </Collapse>
                            </Form>
                        </div >
                    </div>
                )}
            </div >
        );
    }
}

export default AddNewDeviceWizzard;