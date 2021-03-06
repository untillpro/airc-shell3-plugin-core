/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
export const PRICE_VALUE_RATE = 10000;

export const SCREEN_GROUP_TYPES = {
    0: "PC view",
    1: "HHT view",
    2: "OMAN view"
};

export const STATUS_ACTIVE = true;
export const STATUS_DELETED = false;

//export const STATE_FIELD_NAME = 'sys.Status';
export const STATE_FIELD_NAME = 'sys.IsActive';
export const SYS_ID_PROP = "sys.ID";
export const SYS_PARENT_ID = 'sys.ParentID';
export const SYS_QNAME = 'sys.QName';
export const SYS_ERROR = 'sys.Error';

export const ORDERS_QNAME = 'air.Orders';
export const PBILL_QNAME = 'air.Pbill';
export const BILLS_QNAME = 'untill.bill';
export const CUD_QNAME = 'sys.CUD';

export const API_ARGUMENTS_FIELD = 'args';
export const API_CUDS_FIELD = 'cuds';

// location descriptor fields

export const LOCATION_WORK_START_TIME_PROP = 'WorkStartTime';
export const LOCATION_DEFAULT_CURRENCY_PROP = 'DefaultCurrency';
export const LOCATION_NEXT_COURSE_TICKET_LAYOUT_PROP = 'NextCourseTicketLayout';
export const LOCATION_TRANSFER_TICKET_LAYOUT_PROP = 'TransferTicketLayout';
export const LOCATION_DISPLAY_NAME_PROP = 'DisplayName';